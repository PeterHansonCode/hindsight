import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { createInputReader } from '../src/input.ts';

async function temporary(t: { after(fn: () => Promise<void>): void }): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), 'hindsight-tests-'));
  t.after(async () => {
    // Resolve the explicit generated target before any recursive cleanup.
    const resolved = path.resolve(root);
    assert.equal(path.dirname(resolved), path.resolve(os.tmpdir()));
    assert.ok(path.basename(resolved).startsWith('hindsight-tests-'));
    await rm(resolved, { recursive: true, force: true });
  });
  return root;
}

test('reader returns unknown JSON without modifying source bytes', async t => {
  const root = await temporary(t);
  const file = path.join(root, 'source.json');
  const bytes = Buffer.from('{"synthetic":"café"}\n');
  await writeFile(file, bytes);
  const result = await createInputReader(root, ['source.json']).readJson('source.json');
  assert.deepEqual(result, { status: 'ok', value: { synthetic: 'café' } });
  const hash = (value: Buffer) => createHash('sha256').update(value).digest('hex');
  assert.equal(hash(await readFile(file)), hash(bytes));
});

test('reader rejects traversal, Windows aliases, absolute paths and undeclared files', async t => {
  const root = await temporary(t);
  await writeFile(path.join(root, 'private.json'), '{}');
  const hostile = ['../private.json', '/private.json', 'C:/private.json',
    'dir\\private.json', 'dir/../private.json', './private.json', 'dir//private.json',
    'private.json:stream', 'dir./private.json', 'dir /private.json', 'bad\0.json'];
  const input = createInputReader(root, hostile);
  for (const candidate of hostile) {
    assert.deepEqual(await input.readJson(candidate), { status: 'rejected', code: 'rejected_file' });
  }
  assert.deepEqual(await input.readJson('private.json'), { status: 'rejected', code: 'rejected_file' });
});

test('bounded reader accepts exact byte limit and rejects one byte over', async t => {
  const root = await temporary(t);
  await writeFile(path.join(root, 'exact.json'), '{}');
  await writeFile(path.join(root, 'over.json'), '{} ');
  const input = createInputReader(root, ['exact.json', 'over.json'], { maxFileBytes: 2 });
  assert.equal((await input.readJson('exact.json')).status, 'ok');
  assert.deepEqual(await input.readJson('over.json'), { status: 'rejected', code: 'file_too_large' });
  assert.throws(() => createInputReader(root, [], { maxFileBytes: 0 }), RangeError);
});

test('missing, directory, invalid JSON and invalid UTF-8 have content-free failures', async t => {
  const root = await temporary(t);
  await mkdir(path.join(root, 'directory.json'));
  await writeFile(path.join(root, 'malformed.json'), '{"PRIVATE_CANARY":');
  await writeFile(path.join(root, 'encoding.json'), Buffer.from([0xc3, 0x28]));
  const input = createInputReader(root, ['missing.json', 'directory.json', 'malformed.json', 'encoding.json']);
  assert.deepEqual(await input.readJson('missing.json'), { status: 'missing', code: 'missing_file' });
  assert.deepEqual(await input.readJson('directory.json'), { status: 'rejected', code: 'rejected_file' });
  assert.deepEqual(await input.readJson('malformed.json'), { status: 'rejected', code: 'invalid_json' });
  assert.deepEqual(await input.readJson('encoding.json'), { status: 'rejected', code: 'invalid_encoding' });
});

test('reader rejects an escaping directory junction or symlink', async t => {
  const root = await temporary(t);
  const source = path.join(root, 'source');
  const outside = path.join(root, 'outside');
  await mkdir(source); await mkdir(outside);
  await writeFile(path.join(outside, 'private.json'), '{}');
  await symlink(outside, path.join(source, 'linked'), process.platform === 'win32' ? 'junction' : 'dir');
  const result = await createInputReader(source, ['linked/private.json']).readJson('linked/private.json');
  assert.deepEqual(result, { status: 'rejected', code: 'rejected_file' });
});

test('verifier emits every comparison and exits nonzero on mismatches', async t => {
  const root = await temporary(t);
  const fixture = JSON.parse(await readFile(new URL('./fixtures/instagram.synthetic.json', import.meta.url), 'utf8'));
  for (const [relative, value] of Object.entries(fixture.files)) {
    const destination = path.join(root, relative);
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, JSON.stringify(value));
  }
  const script = fileURLToPath(new URL('../../../scripts/verify-instagram.ts', import.meta.url));
  const result = spawnSync(process.execPath, [script, '--input', root], { encoding: 'utf8' });
  assert.equal(result.status, 1, result.stderr);
  const lines = result.stdout.split(/\r?\n/).filter(line => /\s(PASS|FAIL)$/.test(line));
  assert.equal(lines.length, 20, result.stdout);
  assert.match(result.stdout, /Saved events\s+2\s+4809\s+FAIL/);
  assert.match(result.stdout, /Acceptance: FAIL/);
  assert.ok(!result.stdout.includes('Synthetic Créator'));
  assert.ok(!result.stdout.includes(root));
});

test('verifier requires an explicit input path', () => {
  const script = fileURLToPath(new URL('../../../scripts/verify-instagram.ts', import.meta.url));
  const result = spawnSync(process.execPath, [script], { encoding: 'utf8' });
  assert.equal(result.status, 2, result.stderr);
  assert.match(result.stderr, /Usage:/);
});
