import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { importCommand } from '../src/import-command.ts';
import { verifySnapshot } from '../src/snapshots.ts';
import { validateInstagramSideTableBundle } from '../src/instagram-side-tables.ts';
import type { EventRecord } from '../src/domain.ts';

const script = fileURLToPath(new URL('../../../scripts/import-instagram.ts', import.meta.url));
const saved = 'saved/saved_posts.json';
const liked = 'likes/liked_posts.json';
const collections = 'saved/saved_collections.json';
const comments = 'likes/liked_comments.json';
const fixturePath = new URL('./fixtures/instagram.synthetic.json', import.meta.url);
async function setup(t: { after(fn: () => Promise<void>): void }) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'hindsight-import-'));
  t.after(async () => {
    const target = path.resolve(root);
    assert.equal(path.dirname(target), path.resolve(os.tmpdir()));
    assert.ok(path.basename(target).startsWith('hindsight-import-'));
    await fs.rm(target, { recursive: true, force: true });
  });
  const input = path.join(root, 'input'), output = path.join(root, 'output');
  const fixture = JSON.parse(await fs.readFile(fixturePath, 'utf8'));
  for (const [relative, value] of Object.entries(fixture.files)) {
    const file = path.join(input, relative);
    await fs.mkdir(path.dirname(file), { recursive: true }); await fs.writeFile(file, JSON.stringify(value));
  }
  return { root, input, output, fixture, destination: path.join(output, 'synthetic') };
}
function run(input: string, output: string, id = 'synthetic') {
  const result = spawnSync(process.execPath, [script, '--input', input, '--output', output, '--snapshot-id', id], { encoding: 'utf8' });
  assert.ifError(result.error);
  assert.ok(!/\n\s+at |node:internal|Error:|PRIVATE_CANARY/.test(result.stdout + result.stderr), result.stdout + result.stderr);
  return result;
}
async function absent(file: string) { await assert.rejects(fs.stat(file), { code: 'ENOENT' }); }

// Independent CSV reader: assertions inspect parsed cells in the written files,
// including embedded CR/LF and escaped quotes, rather than the serializer helper.
function readCsv(text: string): string[][] {
  const rows: string[][] = []; let row: string[] = [], cell = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (quoted && text[i + 1] === '"') { cell += '"'; i++; } else quoted = !quoted;
    } else if (!quoted && char === ',') { row.push(cell); cell = ''; }
    else if (!quoted && char === '\r' && text[i + 1] === '\n') {
      row.push(cell); rows.push(row); row = []; cell = ''; i++;
    } else cell += char;
  }
  assert.equal(quoted, false); assert.equal(cell, ''); assert.equal(row.length, 0);
  return rows;
}

test('CSV formula injection: written CSV neutralises = + - @ tab and carriage return; JSONL is lossless', async t => {
  const env = await setup(t);
  const values: string[] = [...env.fixture.adversarialText.slice(0, 6), '\tplain text', '\rplain text', '  =2+2', 'Quoted, "text"\r\nsecond line'];
  const rows = values.map((value, index) => {
    const row = structuredClone(env.fixture.files[saved][0]);
    row.fbid = `synthetic-${index}`; row.timestamp += index;
    row.label_values.find((field: { label?: string }) => field.label === 'Caption').value = value;
    const owner = row.label_values.find((field: { title?: string }) => field.title === 'Owner').dict[0].dict;
    owner.find((field: { label?: string }) => field.label === 'Name').value = value;
    owner.find((field: { label?: string }) => field.label === 'Username').value = `synthetic-${index}`;
    return row;
  });
  await fs.writeFile(path.join(env.input, saved), JSON.stringify(rows));
  await fs.writeFile(path.join(env.input, liked), '[]'); await fs.writeFile(path.join(env.input, collections), '[]');
  const result = run(env.input, env.output); assert.equal(result.status, 0, result.stderr);
  const activity = readCsv(await fs.readFile(path.join(env.destination, 'activity.csv'), 'utf8'));
  const creatorRows = readCsv(await fs.readFile(path.join(env.destination, 'creators.csv'), 'utf8'));
  assert.equal(activity.length, values.length + 1);
  for (let index = 0; index < values.length; index++) {
    const expected = index < values.length - 1 ? `'${values[index]}` : values[index];
    assert.equal(activity[index + 1][3], expected);
    assert.ok(creatorRows.slice(1).some(row => row[0] === expected));
  }
  const internal: EventRecord[] = (await fs.readFile(path.join(env.destination, 'observations.jsonl'), 'utf8')).trim().split('\n').map(line => JSON.parse(line));
  assert.deepEqual(internal.map(row => row.activity.title), values);
});

test('both summary files and CSVs are created, without captions or URLs in summaries', async t => {
  const env = await setup(t), result = run(env.input, env.output);
  assert.equal(result.status, 0, result.stderr);
  const anonymousText = await fs.readFile(path.join(env.destination, 'summary-anonymous.json'), 'utf8');
  const detailedText = await fs.readFile(path.join(env.destination, 'summary-detailed.json'), 'utf8');
  const anonymous = JSON.parse(anonymousText), detailed = JSON.parse(detailedText);
  assert.equal(anonymous.event_count, 3); assert.equal(anonymous.sensitivity, 'low disclosure');
  assert.deepEqual(anonymous.creator_frequency_distribution, [{ event_count: 3, creator_count: 1 }]);
  assert.equal(detailed.sensitivity, 'personal'); assert.match(detailed.warning, /interests, beliefs and affiliations/);
  assert.equal(detailed.creators[0].creator_id, 'synthetic_creator');
  for (const text of [anonymousText, detailedText]) {
    assert.ok(!text.includes('Synthetic café')); assert.ok(!text.includes('https://')); assert.ok(!text.includes('safe to share'));
  }
  for (const text of ['synthetic_creator', 'Synthetic Créator', 'SyntheticA', 'creator_id', 'source_file', 'snapshotId']) assert.ok(!anonymousText.includes(text));
  const csv = readCsv(await fs.readFile(path.join(env.destination, 'activity.csv'), 'utf8'));
  assert.equal(csv.length, 4); assert.equal(csv[0].length, 10);
  assert.deepEqual(csv.slice(1).map(row => row[1]), [...csv.slice(1).map(row => row[1])].sort());
  const manifest = await verifySnapshot(env.destination);
  assert.equal(manifest.eventCount, 3); assert.equal(manifest.exportDate, null);
  assert.equal(manifest.artifacts.length, 9);
  const events: EventRecord[] = (await fs.readFile(path.join(env.destination, 'observations.jsonl'), 'utf8')).trim().split('\n').map(line => JSON.parse(line));
  const sideTables: unknown = JSON.parse(await fs.readFile(path.join(env.destination, 'side-tables.json'), 'utf8'));
  validateInstagramSideTableBundle(sideTables, events);
  for (const source of manifest.sources) {
    const bytes = await fs.readFile(path.join(env.input, source.relativePath));
    assert.equal(source.sha256, createHash('sha256').update(bytes).digest('hex'));
    assert.equal(source.sizeBytes, bytes.length);
  }
  const report = await fs.readFile(path.join(env.destination, 'parse-report.txt'), 'utf8');
  assert.match(report, /1 items had no caption\. These items were kept/);
  assert.ok(!report.includes('unmatched_placement')); assert.match(report, /unmatched in this snapshot/);
  assert.match(await fs.readFile(path.join(env.destination, 'quarantine.log'), 'utf8'), /Quarantine did not run/);
});

test('missing input folder produces a clear message and nonzero process exit', async t => {
  const env = await setup(t), result = run(path.join(env.root, 'missing'), env.output);
  assert.equal(result.status, 1); assert.match(result.stderr, /input folder was not found/); await absent(env.output);
});

for (const file of [saved, liked, collections, comments]) {
  test(`one of four files missing: ${file} still succeeds with available activity`, async t => {
    const env = await setup(t); await fs.unlink(path.join(env.input, file));
    const result = run(env.input, env.output); assert.equal(result.status, 0, result.stderr);
    await verifySnapshot(env.destination);
    assert.match(result.stdout, file === comments ? /Liked comments are not included/ : /file was not found/);
  });
}

const damaged = [
  { name: 'truncated JSON', text: '[{"PRIVATE_CANARY":', message: /incomplete or is not valid JSON/ },
  { name: 'malformed JSON', text: 'PRIVATE_CANARY not json', message: /incomplete or is not valid JSON/ },
  { name: 'zero-byte file', text: '', message: /empty \(zero bytes\)/ },
  { name: 'wrong JSON shape', text: '{"unexpected":[]}', message: /unexpected format/ },
  { name: 'file over the size limit', text: null, message: /exceeds the 32 MiB/ },
];
for (const scenario of damaged) {
  for (const partial of [true, false]) {
    test(`${scenario.name}: ${partial ? 'usable files produce an explained partial success' : 'no usable events produces nonzero exit'}`, async t => {
      const env = await setup(t);
      const file = path.join(env.input, saved);
      if (scenario.text === null) { await fs.writeFile(file, ''); await fs.truncate(file, 32 * 1024 * 1024 + 1); }
      else await fs.writeFile(file, scenario.text);
      if (!partial) { await fs.unlink(path.join(env.input, liked)); await fs.unlink(path.join(env.input, collections)); }
      const result = run(env.input, env.output);
      assert.equal(result.status, partial ? 0 : 1, result.stdout + result.stderr);
      assert.match(result.stdout, scenario.message);
      if (partial) {
        const manifest = await verifySnapshot(env.destination); assert.equal(manifest.eventCount, 1); assert.equal(manifest.parseStatus, 'partial');
      } else await absent(env.output);
    });
  }
}

test('empty but valid export succeeds with zero counts and header-only CSVs', async t => {
  const env = await setup(t);
  for (const file of [saved, liked, collections]) await fs.writeFile(path.join(env.input, file), '[]');
  const result = run(env.input, env.output); assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /contains no saved or liked activity/);
  assert.equal((await verifySnapshot(env.destination)).eventCount, 0);
  for (const file of ['activity.csv', 'creators.csv']) assert.equal(readCsv(await fs.readFile(path.join(env.destination, file), 'utf8')).length, 1);
  const summary = JSON.parse(await fs.readFile(path.join(env.destination, 'summary-anonymous.json'), 'utf8'));
  assert.equal(summary.first_observed, null); assert.equal(summary.last_observed, null);
  assert.deepEqual(summary.creator_frequency_distribution, []);
});

test('output directory not writable: injected filesystem EACCES produces a clear message and nonzero exit', async t => {
  const env = await setup(t), stdout: string[] = [], stderr: string[] = [];
  const original = fs.mkdir;
  t.mock.method(fs, 'mkdir', async (...args: Parameters<typeof fs.mkdir>) => {
    if (String(args[0]) === env.output) throw Object.assign(new Error('PRIVATE_CANARY'), { code: 'EACCES' });
    return original(...args);
  });
  const status = await importCommand(['--input', env.input, '--output', env.output], { stdout: text => stdout.push(text), stderr: text => stderr.push(text) });
  assert.equal(status, 1); assert.match(stderr.join('\n'), /output folder could not be written/);
  assert.ok(!stderr.join().includes('PRIVATE_CANARY')); await absent(env.output);
});

test('write failure mid-snapshot publishes nothing and preserves an earlier complete snapshot', async t => {
  const env = await setup(t); assert.equal(run(env.input, env.output, 'earlier').status, 0);
  const original = fs.open;
  t.mock.method(fs, 'open', async (...args: Parameters<typeof fs.open>) => {
    if (String(args[0]).endsWith(`${path.sep}creators.csv`)) throw Object.assign(new Error('PRIVATE_CANARY'), { code: 'ENOSPC' });
    return original(...args);
  });
  const errors: string[] = [];
  const status = await importCommand(['--input', env.input, '--output', env.output, '--snapshot-id', 'later'], { stdout() {}, stderr: text => errors.push(text) });
  assert.equal(status, 1); assert.match(errors.join(), /available space/);
  assert.deepEqual(await fs.readdir(env.output), ['earlier']);
  await verifySnapshot(path.join(env.output, 'earlier'));
});

test('snapshot IDs coexist; a repeated explicit ID cannot overwrite output', async t => {
  const env = await setup(t);
  assert.equal(run(env.input, env.output, 'first').status, 0);
  assert.equal(run(env.input, env.output, 'second').status, 0);
  const prior = await fs.readFile(path.join(env.output, 'first', 'manifest.json'));
  const repeat = run(env.input, env.output, 'first'); assert.equal(repeat.status, 1);
  assert.match(repeat.stderr, /already exists/); assert.deepEqual(await fs.readFile(path.join(env.output, 'first', 'manifest.json')), prior);
  assert.deepEqual((await fs.readdir(env.output)).sort(), ['first', 'second']);
});

test('output inside source is rejected without creating files; altered snapshot fails integrity check', async t => {
  const env = await setup(t), before = await fs.readdir(env.input);
  assert.equal(run(env.input, env.input).status, 1); assert.deepEqual(await fs.readdir(env.input), before);
  assert.equal(run(env.input, env.output).status, 0);
  await fs.appendFile(path.join(env.destination, 'activity.csv'), 'tampered');
  await assert.rejects(verifySnapshot(env.destination), /invalid_snapshot/);
});
