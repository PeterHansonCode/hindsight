import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { instagramParser, createInstagramSideTableBundle, validateInstagramSideTableBundle,
  readInstagramSideTables, writeInstagramSideTables, SideTableError, placementStatusMessage } from '../src/index.ts';
import type { InstagramSideTableBundle, ParseResult } from '../src/index.ts';

const savedFile = 'saved/saved_posts.json';
async function parse(ambiguous = false): Promise<ParseResult> {
  const fixture = JSON.parse(await readFile(new URL('./fixtures/instagram.synthetic.json', import.meta.url), 'utf8'));
  if (ambiguous) fixture.files[savedFile].push(structuredClone(fixture.files[savedFile][0]));
  return instagramParser.parse({ async readJson(file) {
    return { status: 'ok', value: fixture.files[file] };
  } });
}
async function environment(t: { after(fn: () => Promise<void>): void }) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'hindsight-side-tables-'));
  t.after(async () => {
    const resolved = path.resolve(root);
    assert.equal(path.dirname(resolved), path.resolve(os.tmpdir()));
    assert.ok(path.basename(resolved).startsWith('hindsight-side-tables-'));
    await rm(resolved, { recursive: true, force: true });
  });
  const source = path.join(root, 'source');
  await mkdir(source);
  await writeFile(path.join(source, 'canary.json'), '{"synthetic":true}');
  return { root, source, directory: path.join(root, 'side-tables') };
}
const table = (bundle: InstagramSideTableBundle, name: string) => bundle.tables.find(value => value.name === `instagram.${name}`)!.rows;
const fails = (code: SideTableError['code']) => (error: unknown) => error instanceof SideTableError && error.code === code;

test('side-table persistence round-trips captions, empty collections and unmatched metadata losslessly', async t => {
  const env = await environment(t);
  const result = await parse();
  const bundle = createInstagramSideTableBundle('snapshot-a', result);
  const canary = await readFile(path.join(env.source, 'canary.json'));
  const written = await writeInstagramSideTables({ ...env, sourceDirectory: env.source, bundle, observations: result.events });
  assert.equal(written.status, 'created');
  const loaded = await readInstagramSideTables(env.directory, 'snapshot-a', result.events);
  assert.deepEqual(loaded, bundle);
  const missing = table(loaded, 'placements').find(value => value.joinStatus === 'unmatched_placement')!;
  assert.equal(missing.savedObservationId, null);
  assert.equal(missing.savedAt, null);
  assert.equal(missing.title, 'Synthetic café 🌱 — 日本語');
  assert.equal(missing.creator_id, 'synthetic_creator');
  assert.deepEqual(missing.candidateObservationIds, []);
  assert.equal(table(loaded, 'collections').filter(value => value.mediaChildCount === 0).length, 1);
  assert.equal(result.events.length, 3); // Memberships cannot add activity.
  assert.equal(loaded.contentTrust, 'untrusted-third-party');
  assert.equal(loaded.sensitivity, 'personal');
  assert.deepEqual(await readFile(path.join(env.source, 'canary.json')), canary);
  assert.deepEqual(await readdir(env.directory), ['snapshot-a.instagram-side-tables.json']);
});

test('ambiguous matches retain all candidates with no selected timestamp across persistence', async t => {
  const env = await environment(t), result = await parse(true);
  const bundle = createInstagramSideTableBundle('snapshot-a', result);
  await writeInstagramSideTables({ ...env, sourceDirectory: env.source, bundle, observations: result.events });
  const loaded = await readInstagramSideTables(env.directory, 'snapshot-a', result.events);
  const ambiguous = table(loaded, 'placements').filter(value => value.joinStatus === 'ambiguous_join');
  assert.equal(ambiguous.length, 2);
  for (const placement of ambiguous) {
    assert.equal(placement.savedAt, null); assert.equal(placement.savedObservationId, null);
    assert.deepEqual(placement.candidateObservationIds, [`${savedFile}:1`, `${savedFile}:3`]);
  }
});

test('concurrent identical writes are idempotent; conflicting writes cannot replace committed bytes', async t => {
  const env = await environment(t), result = await parse();
  const bundle = createInstagramSideTableBundle('snapshot-a', result);
  const options = { ...env, sourceDirectory: env.source, bundle, observations: result.events };
  const writes = await Promise.all([writeInstagramSideTables(options), writeInstagramSideTables(options)]);
  assert.deepEqual(writes.map(value => value.status).sort(), ['already_exists', 'created']);
  const before = await readFile(writes[0].file);
  const changed = structuredClone(bundle);
  table(changed, 'collections')[0].collection_name = 'Different synthetic collection';
  await assert.rejects(writeInstagramSideTables({ ...options, bundle: changed }), fails('conflict'));
  assert.deepEqual(await readFile(writes[0].file), before);
  assert.equal((await readdir(env.directory)).length, 1);
});

test('different snapshot IDs coexist even when their local observation IDs coincide', async t => {
  const env = await environment(t), result = await parse();
  for (const id of ['snapshot-a', 'snapshot-b']) {
    await writeInstagramSideTables({ ...env, sourceDirectory: env.source,
      bundle: createInstagramSideTableBundle(id, result), observations: result.events });
  }
  assert.equal((await readdir(env.directory)).length, 2);
  const a = await readInstagramSideTables(env.directory, 'snapshot-a', result.events);
  const b = await readInstagramSideTables(env.directory, 'snapshot-b', result.events);
  assert.notEqual(a.snapshotId, b.snapshotId);
  assert.deepEqual(a.tables, b.tables);
});

test('source containment is rejected before directory creation, including through a junction', async t => {
  const env = await environment(t), result = await parse();
  const bundle = createInstagramSideTableBundle('snapshot-a', result);
  const options = { sourceDirectory: env.source, bundle, observations: result.events };
  await assert.rejects(writeInstagramSideTables({ ...options, directory: path.join(env.source, 'must-not-exist') }), fails('unsafe_destination'));
  const alias = path.join(env.root, 'alias');
  await symlink(env.source, alias, process.platform === 'win32' ? 'junction' : 'dir');
  await assert.rejects(writeInstagramSideTables({ ...options, directory: path.join(alias, 'must-not-exist') }), fails('unsafe_destination'));
  assert.deepEqual(await readdir(env.source), ['canary.json']);
});

test('invalid snapshot identifiers cannot select filesystem paths', async () => {
  const result = await parse();
  for (const id of ['../source', 'x/y', 'x\\y', '.', 'x:stream', '', 'x'.repeat(101)]) {
    assert.throws(() => createInstagramSideTableBundle(id, result), fails('invalid_bundle'));
  }
});

test('broken references, altered join classification and invented unmatched dates fail validation', async () => {
  const result = await parse();
  const original = createInstagramSideTableBundle('snapshot-a', result);
  const changes: ((bundle: InstagramSideTableBundle) => void)[] = [
    bundle => { table(bundle, 'placements')[0].collectionId = 'unknown'; },
    bundle => { table(bundle, 'placements')[0].savedObservationId = 'unknown'; },
    bundle => { table(bundle, 'placements')[0].candidateObservationIds = []; },
    bundle => { table(bundle, 'placements')[0].joinStatus = 'unmatched_placement'; },
    bundle => { table(bundle, 'placements').find(value => value.joinStatus === 'unmatched_placement')!.savedAt = '2024-01-01T00:00:00.000Z'; },
    bundle => { table(bundle, 'collections')[0].mediaChildCount = 999; },
    bundle => { table(bundle, 'post_extras').pop(); },
    bundle => { bundle.tables[0].schemaVersion = 99; },
  ];
  for (const change of changes) {
    const broken = structuredClone(original); change(broken);
    assert.throws(() => validateInstagramSideTableBundle(broken, result.events), fails('invalid_bundle'));
  }
});

test('corrupt stored data is rejected on read; published data is never repaired silently', async t => {
  const env = await environment(t), result = await parse();
  await mkdir(env.directory);
  await writeFile(path.join(env.directory, 'snapshot-a.instagram-side-tables.json'), '{"PRIVATE_CANARY":');
  await assert.rejects(readInstagramSideTables(env.directory, 'snapshot-a', result.events), fails('io_error'));
  const bundle = createInstagramSideTableBundle('snapshot-a', result);
  bundle.schemaVersion = 99 as 1;
  await writeFile(path.join(env.directory, 'snapshot-a.instagram-side-tables.json'), JSON.stringify(bundle));
  await assert.rejects(readInstagramSideTables(env.directory, 'snapshot-a', result.events), fails('invalid_bundle'));
});

test('unsupported destination fails cleanly without altering source data', async t => {
  const env = await environment(t), result = await parse();
  await writeFile(env.directory, 'synthetic file, not a directory');
  await assert.rejects(writeInstagramSideTables({ ...env, sourceDirectory: env.source,
    bundle: createInstagramSideTableBundle('snapshot-a', result), observations: result.events }), fails('io_error'));
  assert.deepEqual(await readdir(env.source), ['canary.json']);
});

test('unmatched copy states absence only', () => {
  assert.equal(placementStatusMessage('unmatched_placement'), 'Unmatched in this snapshot.');
});
