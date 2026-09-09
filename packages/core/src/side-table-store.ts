import { link, lstat, mkdir, open, realpath, unlink } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { createInputReader, DEFAULT_MAX_FILE_BYTES } from './input.ts';
import type { EventRecord } from './domain.ts';
import { SideTableError, validSnapshotId, validateInstagramSideTableBundle } from './instagram-side-tables.ts';
import type { InstagramSideTableBundle } from './instagram-side-tables.ts';

const filename = (id: string) => `${id}.instagram-side-tables.json`;
function inside(root: string, target: string): boolean {
  const relative = path.relative(root, target);
  return relative === '' || relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
}

// Resolve through the nearest existing ancestor BEFORE mkdir, so an output
// spelled through a junction cannot create directories inside a source export.
async function prospectiveRealpath(directory: string): Promise<string> {
  try { return await realpath(directory); }
  catch (error) {
    if (!error || typeof error !== 'object' || !('code' in error) || error.code !== 'ENOENT') throw error;
    const parent = path.dirname(directory);
    if (parent === directory) throw error;
    return path.join(await prospectiveRealpath(parent), path.basename(directory));
  }
}

export async function readInstagramSideTables(
  directory: string, snapshotId: string, observations: readonly EventRecord[],
): Promise<InstagramSideTableBundle> {
  if (!validSnapshotId(snapshotId)) throw new SideTableError('invalid_bundle');
  const name = filename(snapshotId);
  const read = await createInputReader(directory, [name]).readJson(name);
  if (read.status !== 'ok') throw new SideTableError('io_error');
  validateInstagramSideTableBundle(read.value, observations);
  if (read.value.snapshotId !== snapshotId) throw new SideTableError('invalid_bundle');
  return read.value;
}

export async function writeInstagramSideTables(options: {
  directory: string;
  sourceDirectory: string;
  bundle: InstagramSideTableBundle;
  observations: readonly EventRecord[];
}): Promise<{ status: 'created' | 'already_exists'; file: string }> {
  validateInstagramSideTableBundle(options.bundle, options.observations);
  const text = JSON.stringify(options.bundle) + '\n';
  // This buffered side-table artifact is deliberately limited too; the future
  // incremental store must consume side_row emissions rather than raise this.
  if (Buffer.byteLength(text) > DEFAULT_MAX_FILE_BYTES) throw new SideTableError('invalid_bundle');
  let temporary: string | undefined;
  try {
    const source = await realpath(options.sourceDirectory);
    const directory = await prospectiveRealpath(path.resolve(options.directory));
    if (inside(source, directory)) throw new SideTableError('unsafe_destination');
    await mkdir(directory, { recursive: true });
    const confirmedDirectory = await realpath(directory);
    if (inside(source, confirmedDirectory) || confirmedDirectory !== directory) throw new SideTableError('unsafe_destination');
    const target = path.join(directory, filename(options.bundle.snapshotId));
    const candidate = path.join(directory, `.hindsight-${randomUUID()}.tmp`);
    const handle = await open(candidate, 'wx', 0o600);
    temporary = candidate; // Cleanup only a file this operation created.
    try {
      await handle.writeFile(text, 'utf8');
      await handle.sync();
    } finally { await handle.close(); }
    try {
      // Same-filesystem link publishes a complete file WITHOUT replacing an
      // existing target. rename would overwrite an existing file on POSIX.
      await link(temporary, target);
      return { status: 'created', file: target };
    } catch (error) {
      if (!error || typeof error !== 'object' || !('code' in error) || error.code !== 'EEXIST') throw error;
      const stat = await lstat(target);
      if (!stat.isFile() || stat.isSymbolicLink()) throw new SideTableError('conflict');
      const existing = await readInstagramSideTables(directory, options.bundle.snapshotId, options.observations);
      if (JSON.stringify(existing) + '\n' !== text) throw new SideTableError('conflict');
      return { status: 'already_exists', file: target };
    }
  } catch (error) {
    if (error instanceof SideTableError) throw error;
    throw new SideTableError('io_error');
  } finally {
    if (temporary) await unlink(temporary).catch(() => { /* An interrupted cleanup can leave only an unpublished .tmp file. */ });
  }
}
