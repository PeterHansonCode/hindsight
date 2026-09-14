import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { ingestInstagram } from '../src/ingest.ts';
import { stepSixCommand } from '../src/step-six-command.ts';
import { readExplorationSnapshot } from '../src/exploration-command.ts';
import { writeAnalysisOutput } from '../src/analysis-output.ts';

test('Step 6 command uses retained data only, writes all 18 runs, keeps anonymous files identity-free and protects outputs', async t => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'hindsight-step-six-'));
  t.after(async () => { const resolved = path.resolve(root); assert.equal(path.dirname(resolved), path.resolve(os.tmpdir())); assert.ok(path.basename(resolved).startsWith('hindsight-step-six-')); await fs.rm(resolved, { recursive: true, force: true }); });
  const input = path.join(root, 'input'), fixture = JSON.parse(await fs.readFile(new URL('./fixtures/instagram.synthetic.json', import.meta.url), 'utf8'));
  for (const [name, value] of Object.entries(fixture.files)) { const f = path.join(input, name); await fs.mkdir(path.dirname(f), { recursive: true }); await fs.writeFile(f, JSON.stringify(value)); }
  const imported = await ingestInstagram({ input, output: path.join(root, 'snapshots'), snapshotId: 'synthetic', exportDate: '2026-08-30' });
  const hiddenInput = path.join(root, 'unavailable-input'); assert.equal(path.dirname(path.resolve(input)), root); assert.equal(path.dirname(path.resolve(hiddenInput)), root); await fs.rename(input, hiddenInput);
  const output = path.join(root, 'report'), logs: string[] = [], errors: string[] = [], io = { stdout: (s: string) => logs.push(s), stderr: (s: string) => errors.push(s) };
  const args = ['--snapshot', imported.directory, '--output', output, '--stage', 'all'];
  assert.equal(await stepSixCommand(args, io), 0);
  const retained = await readExplorationSnapshot(imported.directory), filenames = await fs.readdir(output);
  assert.equal(filenames.filter(f => /^burst-run-\d+-personal.json$/.test(f)).length, 18);
  const aggregateFiles = filenames.filter(f => f.endsWith('-aggregate.json') || f === 'session-fits.json' || f.endsWith('.svg'));
  const anonymous = (await Promise.all(aggregateFiles.map(f => fs.readFile(path.join(output, f), 'utf8')))).join('\n');
  const forbidden = [...retained.events.flatMap(e => [e.activity.creator, e.activity.creator_id, e.activity.title, e.activity.url]), ...retained.bundle.tables.find(t => t.name === 'instagram.collections')!.rows.flatMap(r => [r.collectionId, r.collection_name])].filter((v): v is string => typeof v === 'string' && v.length > 3);
  for (const value of forbidden) assert.equal(anonymous.includes(value), false, 'No source identity/content in anonymous output');
  const lifecycle = JSON.parse(await fs.readFile(path.join(output, 'lifecycles-combined-personal.json'), 'utf8')); assert.equal(lifecycle.observations, 3); assert.equal(lifecycle.config.sessionSeconds, 3600); assert.ok(lifecycle.config.sessionBasis.includes('fallback'));
  assert.equal(await stepSixCommand(args, io), 1);
  assert.equal(await stepSixCommand(['--snapshot', imported.directory, '--output', path.join(imported.directory, 'forbidden')], io), 1);
  assert.equal(await stepSixCommand(['--snapshot', imported.directory, '--output', path.join(hiddenInput, 'forbidden'), '--source-root', hiddenInput], io), 1);
  await assert.rejects(writeAnalysisOutput(path.join(root, 'bad-name'), [], { '../escape.json': '{}' }));
  const blocked = path.join(root, 'file-not-directory'); await fs.writeFile(blocked, 'unchanged');
  assert.equal(await stepSixCommand(['--snapshot', imported.directory, '--output', path.join(blocked, 'report')], io), 1);
  assert.equal(await stepSixCommand(['--snapshot', 'missing-snapshot', '--output', path.join(root, 'missing')], io), 1);
  await fs.appendFile(path.join(imported.directory, 'observations.jsonl'), 'corrupt');
  assert.equal(await stepSixCommand(['--snapshot', imported.directory, '--output', path.join(root, 'corrupt')], io), 1);
  assert.equal(errors.some(s => /\n\s+at |Error:|node:internal/.test(s)), false);
});
