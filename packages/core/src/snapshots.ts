import fs from 'node:fs/promises';
import { createHash, randomUUID } from 'node:crypto';
import path from 'node:path';
import type { SnapshotManifest, ParseResult } from './domain.ts';
import type { OutputArtifact } from './outputs.ts';
import { DEFAULT_MAX_FILE_BYTES } from './input.ts';

export interface StoredManifest extends SnapshotManifest {
  format: 'hindsight.snapshot';
  parseStatus: ParseResult['status'];
  eventCount: number;
  artifacts: { name: string; sha256: string; sizeBytes: number }[];
}
export class SnapshotError extends Error {
  readonly code: 'output_unavailable' | 'unsafe_output' | 'snapshot_exists' | 'invalid_snapshot' | 'artifact_too_large';
  constructor(code: SnapshotError['code']) { super(code); this.code = code; this.name = 'SnapshotError'; }
}
const safeId = (id: string) => /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,99}$/.test(id);
const artifactNames = new Set(['activity.csv', 'creators.csv', 'summary-anonymous.json', 'summary-detailed.json',
  'parse-report.txt', 'quarantine.log', 'observations.jsonl', 'side-tables.json', 'diagnostics.json']);
export function inside(root: string, target: string): boolean {
  const relative = path.relative(root, target);
  return relative === '' || relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
}
async function prospective(directory: string): Promise<string> {
  try { return await fs.realpath(directory); }
  catch (error) {
    if (!error || typeof error !== 'object' || !('code' in error) || error.code !== 'ENOENT') throw error;
    const parent = path.dirname(directory); if (parent === directory) throw error;
    return path.join(await prospective(parent), path.basename(directory));
  }
}
async function exists(file: string): Promise<boolean> {
  try { await fs.lstat(file); return true; }
  catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') return false;
    throw error;
  }
}

export async function publishSnapshot(options: {
  outputDirectory: string; sourceDirectory: string; forbiddenDirectories?: string[];
  manifest: Omit<StoredManifest, 'artifacts'>; artifacts: OutputArtifact[];
}): Promise<string> {
  const { snapshotId } = options.manifest;
  if (!safeId(snapshotId) || options.artifacts.length !== artifactNames.size
    || new Set(options.artifacts.map(value => value.name)).size !== artifactNames.size
    || options.artifacts.some(value => !artifactNames.has(value.name))) throw new SnapshotError('invalid_snapshot');
  let stage: string | undefined, lock: string | undefined, root: string | undefined;
  try {
    const source = await fs.realpath(options.sourceDirectory);
    root = await prospective(path.resolve(options.outputDirectory));
    const final = path.join(root, snapshotId);
    const forbidden = [source, ...(await Promise.all((options.forbiddenDirectories ?? []).map(value => fs.realpath(value))))];
    if (forbidden.some(value => inside(value, root!) || inside(value, final))) throw new SnapshotError('unsafe_output');
    await fs.mkdir(root, { recursive: true });
    if (await fs.realpath(root) !== root) throw new SnapshotError('unsafe_output');
    const lockPath = path.join(root, `.${snapshotId}.lock`);
    try { await fs.mkdir(lockPath); lock = lockPath; }
    catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'EEXIST') throw new SnapshotError('snapshot_exists');
      throw error;
    }
    if (await exists(final)) throw new SnapshotError('snapshot_exists');
    stage = await fs.mkdtemp(path.join(root, '.hindsight-stage-'));
    const artifacts: StoredManifest['artifacts'] = [];
    for (const artifact of options.artifacts) {
      const handle = await fs.open(path.join(stage, artifact.name), 'wx', 0o600);
      const hash = createHash('sha256'); let sizeBytes = 0;
      try {
        for (const chunk of artifact.chunks) {
          const bytes = Buffer.from(chunk); sizeBytes += bytes.length;
          if (sizeBytes > DEFAULT_MAX_FILE_BYTES) throw new SnapshotError('artifact_too_large');
          hash.update(bytes); await handle.writeFile(bytes);
        }
        await handle.sync();
      } finally { await handle.close(); }
      artifacts.push({ name: artifact.name, sha256: hash.digest('hex'), sizeBytes });
    }
    const manifest = await fs.open(path.join(stage, 'manifest.json'), 'wx', 0o600);
    try { await manifest.writeFile(JSON.stringify({ ...options.manifest, artifacts }, null, 2) + '\n'); await manifest.sync(); }
    finally { await manifest.close(); }
    // The lock serialises cooperating writers for this ID. All files appear
    // together on rename; source/output trees must not be replaced concurrently.
    if (await exists(final)) throw new SnapshotError('snapshot_exists');
    await fs.rename(stage, final); stage = undefined;
    return final;
  } catch (error) {
    if (error instanceof SnapshotError) throw error;
    throw new SnapshotError('output_unavailable');
  } finally {
    // Delete only directories created by this operation, verified within the
    // resolved output root. Never recursively delete a source or final snapshot.
    if (stage && root && path.dirname(stage) === root && path.basename(stage).startsWith('.hindsight-stage-')) {
      await fs.rm(stage, { recursive: true, force: true }).catch(() => {});
    }
    if (lock && root && path.dirname(lock) === root) await fs.rmdir(lock).catch(() => {});
  }
}

export async function verifySnapshot(directory: string): Promise<StoredManifest> {
  try {
    const root = await fs.realpath(directory);
    async function bounded(name: string): Promise<Buffer> {
      const file = path.join(root, name), stat = await fs.lstat(file);
      if (!stat.isFile() || stat.isSymbolicLink() || stat.size > DEFAULT_MAX_FILE_BYTES) throw new SnapshotError('invalid_snapshot');
      const handle = await fs.open(file, 'r');
      try {
        const chunks: Buffer[] = []; let size = 0;
        for await (const chunk of handle.createReadStream({ autoClose: false })) {
          size += chunk.length; if (size > DEFAULT_MAX_FILE_BYTES) throw new SnapshotError('invalid_snapshot');
          chunks.push(chunk);
        }
        return Buffer.concat(chunks);
      } finally { await handle.close(); }
    }
    const manifest = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(await bounded('manifest.json'))) as StoredManifest;
    if (manifest.format !== 'hindsight.snapshot' || manifest.schemaVersion !== 1 || !safeId(manifest.snapshotId)
      || !Array.isArray(manifest.artifacts) || manifest.artifacts.length !== artifactNames.size
      || new Set(manifest.artifacts.map(value => value.name)).size !== artifactNames.size) throw new SnapshotError('invalid_snapshot');
    for (const artifact of manifest.artifacts) {
      if (!artifactNames.has(artifact.name)) throw new SnapshotError('invalid_snapshot');
      const bytes = await bounded(artifact.name);
      if (bytes.length !== artifact.sizeBytes || createHash('sha256').update(bytes).digest('hex') !== artifact.sha256) throw new SnapshotError('invalid_snapshot');
    }
    return manifest;
  } catch { throw new SnapshotError('invalid_snapshot'); }
}

export function newSnapshotId(): string { return `instagram-${randomUUID()}`; }
