import { lstat, open, realpath } from 'node:fs/promises';
import path from 'node:path';
import type { ParserInput, ReadResult } from './domain.ts';

export const DEFAULT_MAX_FILE_BYTES = 32 * 1024 * 1024;

function safeRelative(value: string): boolean {
  return value.length > 0 && !value.includes('\\') && !value.includes(':')
    && !value.includes('\0') && !path.isAbsolute(value)
    && value.split('/').every(part => part !== '' && part !== '.' && part !== '..'
      && !/[. ]$/.test(part));
}

function within(root: string, target: string): boolean {
  const relative = path.relative(root, target);
  return relative !== '' && relative !== '..' && !relative.startsWith(`..${path.sep}`)
    && !path.isAbsolute(relative);
}

// This is a read-only capability, not an OS sandbox. Callers must not allow a
// hostile process to replace directory entries concurrently with ingestion.
export function createInputReader(
  inputPath: string,
  declaredFiles: readonly string[],
  options: { maxFileBytes?: number } = {},
): ParserInput {
  const maxBytes = options.maxFileBytes ?? DEFAULT_MAX_FILE_BYTES;
  if (!Number.isSafeInteger(maxBytes) || maxBytes < 1 || maxBytes > DEFAULT_MAX_FILE_BYTES) {
    throw new RangeError('File limit must be between 1 byte and 32 MiB.');
  }
  const allowed = new Set(declaredFiles);
  const suppliedRoot = path.resolve(inputPath);
  return {
    async readJson(relativePath): Promise<ReadResult> {
      if (!safeRelative(relativePath) || !allowed.has(relativePath)) {
        return { status: 'rejected', code: 'rejected_file' };
      }
      let bytes: Buffer;
      try {
        const root = await realpath(suppliedRoot);
        if (!(await lstat(root)).isDirectory()) return { status: 'rejected', code: 'rejected_file' };
        let target = root;
        // Reject all descendant symlinks/junctions, even links pointing inside.
        // This narrower policy is easy to explain and avoids implicit traversal.
        for (const part of relativePath.split('/')) {
          target = path.join(target, part);
          if ((await lstat(target)).isSymbolicLink()) return { status: 'rejected', code: 'rejected_file' };
        }
        const resolved = await realpath(target);
        if (!within(root, resolved)) return { status: 'rejected', code: 'rejected_file' };
        const handle = await open(resolved, 'r');
        try {
          const stat = await handle.stat();
          if (!stat.isFile() || stat.size > maxBytes || await realpath(target) !== resolved) {
            return { status: 'rejected', code: 'rejected_file' };
          }
          const chunks: Buffer[] = [];
          let size = 0;
          while (true) {
            // Read at most one byte beyond the limit, including if a file grows
            // after stat. The limit applies to bytes actually read.
            const chunk = Buffer.allocUnsafe(Math.min(64 * 1024, maxBytes - size + 1));
            const { bytesRead } = await handle.read(chunk, 0, chunk.length, null);
            if (bytesRead === 0) break;
            size += bytesRead;
            if (size > maxBytes) return { status: 'rejected', code: 'rejected_file' };
            chunks.push(chunk.subarray(0, bytesRead));
          }
          bytes = Buffer.concat(chunks, size);
        } finally {
          await handle.close();
        }
      } catch (error) {
        const code = error && typeof error === 'object' && 'code' in error ? error.code : null;
        return code === 'ENOENT'
          ? { status: 'missing', code: 'missing_file' }
          : { status: 'rejected', code: 'rejected_file' };
      }
      let text: string;
      try {
        text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
      } catch {
        return { status: 'rejected', code: 'invalid_encoding' };
      }
      try {
        return { status: 'ok', value: JSON.parse(text) as unknown };
      } catch {
        // JSON engine messages can include source content; never expose them.
        return { status: 'rejected', code: 'invalid_json' };
      }
    },
  };
}
