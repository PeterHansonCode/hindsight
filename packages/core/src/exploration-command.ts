import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { verifySnapshot, inside } from './snapshots.ts';
import type { EventRecord } from './domain.ts';
import { validateInstagramSideTableBundle } from './instagram-side-tables.ts';
import { DEFAULT_MAX_FILE_BYTES } from './input.ts';
import { exploreInstagram } from './exploration.ts';
import { aggregateExploration, renderExploration } from './exploration-report.ts';

export async function readExplorationSnapshot(directory: string) {
  const manifest = await verifySnapshot(directory);
  if (manifest.platform !== 'instagram' || manifest.schemaVersion !== 1 || !['complete', 'partial', 'empty', 'failed'].includes(manifest.parseStatus)
    || !['not_run', 'no_op', 'completed'].includes(manifest.quarantine?.status)
    || manifest.exportDate !== null && (typeof manifest.exportDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(manifest.exportDate) || !Number.isFinite(Date.parse(manifest.exportDate)) || new Date(manifest.exportDate).toISOString().slice(0, 10) !== manifest.exportDate)) throw new Error('Invalid snapshot.');
  async function read(name: string) {
    const artifact = manifest.artifacts.find(a => a.name === name)!;
    const file = path.join(directory, name), stat = await fs.lstat(file);
    if (!stat.isFile() || stat.isSymbolicLink() || stat.size > DEFAULT_MAX_FILE_BYTES) throw new Error('Invalid artifact.');
    const handle = await fs.open(file, 'r'); let size = 0; const chunks: Buffer[] = [];
    try { for await (const chunk of handle.createReadStream({ autoClose: false })) { size += chunk.length; if (size > DEFAULT_MAX_FILE_BYTES) throw new Error('Artifact too large.'); chunks.push(chunk); } }
    finally { await handle.close(); }
    const bytes = Buffer.concat(chunks);
    if (size !== artifact.sizeBytes || createHash('sha256').update(bytes).digest('hex') !== artifact.sha256) throw new Error('Changed artifact.');
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  }
  const values: unknown[] = (await read('observations.jsonl')).split('\n').filter(line => line.trim()).map(line => JSON.parse(line));
  for (const value of values) {
    if (!value || typeof value !== 'object') throw new Error('Invalid observation.');
    const e = value as EventRecord, a = e.activity;
    if (typeof e.observationId !== 'string' || !a || a.platform !== 'instagram' || !['saved', 'liked'].includes(a.event_type)
      || typeof a.timestamp !== 'string' || !Number.isFinite(Date.parse(a.timestamp)) || new Date(a.timestamp).toISOString() !== a.timestamp
      || !['creator', 'creator_id', 'title', 'url', 'raw_id'].every(k => { const v = a[k as keyof typeof a]; return v === null || typeof v === 'string'; })) throw new Error('Invalid observation.');
  }
  const events = values as EventRecord[];
  if (events.length !== manifest.eventCount) throw new Error('Invalid count.');
  const bundle: unknown = JSON.parse(await read('side-tables.json'));
  validateInstagramSideTableBundle(bundle, events);
  if (bundle.snapshotId !== manifest.snapshotId) throw new Error('Mismatched snapshot.');
  const diagnostics = JSON.parse(await read('diagnostics.json')) as { diagnostics?: { code?: unknown }[] };
  if (!Array.isArray(diagnostics.diagnostics)) throw new Error('Invalid diagnostic coverage.');
  const knownCodes = new Set(['missing_file', 'rejected_file', 'invalid_json', 'invalid_shape', 'invalid_row', 'invalid_encoding', 'unsupported_file', 'invalid_url', 'unmatched_placement', 'ambiguous_join', 'duplicate_caption', 'empty_file', 'file_too_large']);
  const counts = new Map<string, number>();
  for (const row of diagnostics.diagnostics) { if (!knownCodes.has(String(row.code))) throw new Error('Invalid diagnostic.'); const code = String(row.code); counts.set(code, (counts.get(code) ?? 0) + 1); }
  return { manifest, events, bundle, coverage: { parseStatus: manifest.parseStatus, quarantineStatus: manifest.quarantine.status, diagnosticCounts: [...counts].map(([code, count]) => ({ code, count })) } };
}
async function prospective(directory: string): Promise<string> {
  try { return await fs.realpath(directory); } catch (e) {
    if (!e || typeof e !== 'object' || !('code' in e) || e.code !== 'ENOENT') throw e;
    const parent = path.dirname(directory); if (parent === directory) throw e;
    return path.join(await prospective(parent), path.basename(directory));
  }
}
export async function explorationCommand(args: string[], options: { forbiddenDirectories?: string[]; stdout?: (s: string) => void; stderr?: (s: string) => void } = {}) {
  const out = options.stdout ?? console.log, err = options.stderr ?? console.error;
  const flags = new Map<string, string>();
  for (let i = 0; i < args.length; i += 2) {
    if (!['--snapshot', '--output', '--known-month', '--source-root'].includes(args[i]) || !args[i + 1] || args[i + 1].startsWith('--') || flags.has(args[i])) { err('Use --snapshot <retained snapshot> --output <new output directory> [--known-month YYYY-MM] [--source-root <protected export directory>].'); return 2; }
    flags.set(args[i], args[i + 1]);
  }
  if (!flags.has('--snapshot') || !flags.has('--output') || flags.has('--known-month') && !/^\d{4}-(0[1-9]|1[0-2])$/.test(flags.get('--known-month')!)) { err('Supply a retained --snapshot, a new --output directory, and an optional valid --known-month YYYY-MM.'); return 2; }
  try {
    const source = await fs.realpath(flags.get('--snapshot')!);
    const { manifest, events, bundle, coverage } = await readExplorationSnapshot(source);
    const data = exploreInstagram(events, bundle, { exportDate: manifest.exportDate, knownMonth: flags.get('--known-month'), coverage });
    const destination = await prospective(path.resolve(flags.get('--output')!));
    const forbidden = [source, ...await Promise.all([...(options.forbiddenDirectories ?? []), ...(flags.has('--source-root') ? [flags.get('--source-root')!] : [])].map(p => fs.realpath(p)))];
    if (forbidden.some(p => inside(p, destination))) { err('Choose a new output directory outside the snapshot, source exports and repository.'); return 1; }
    await fs.mkdir(path.dirname(destination), { recursive: true });
    // Require a fresh directory; never replace an existing report or snapshot.
    await fs.mkdir(destination);
    if (await fs.realpath(destination) !== destination) throw new Error('Output changed.');
    const outputs = {
      'exploration-personal.json': JSON.stringify(data, null, 2) + '\n',
      'exploration-aggregate.json': JSON.stringify(aggregateExploration(data), null, 2) + '\n',
      'exploration-personal.md': renderExploration(data, true),
      'exploration-aggregate.md': renderExploration(data),
      'provenance.json': JSON.stringify({ snapshotId: manifest.snapshotId, exportDate: manifest.exportDate, observationSha256: manifest.artifacts.find(a => a.name === 'observations.jsonl')!.sha256, parseStatus: manifest.parseStatus, quarantine: manifest.quarantine, options: { knownMonth: flags.get('--known-month') ?? null } }, null, 2) + '\n',
    };
    for (const [name, text] of Object.entries(outputs)) await fs.writeFile(path.join(destination, name), text, { flag: 'wx', mode: 0o600 });
    out(`Exploration written: ${events.length} observations, ${data.filing.unfiledObservations} saves without a matched folder placement. Named detail is personal and remains outside the repository.`);
    return 0;
  } catch { err('Exploration could not finish. Check snapshot integrity and choose an accessible new output directory. Sources were not changed; an incomplete output directory may remain.'); return 1; }
}
