import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import type { ParserInput, ParseResult } from '../src/domain.ts';
import { instagramParser } from '../src/parsers/instagram.ts';
import { canonicalInstagramPostUrl } from '../src/parsers/instagram-url.ts';
import { repairInstagramString, repairInstagramValues } from '../src/parsers/instagram-encoding.ts';

const fixture = JSON.parse(readFileSync(new URL('./fixtures/instagram.synthetic.json', import.meta.url), 'utf8'));
const savedFile = 'saved/saved_posts.json';
const likedFile = 'likes/liked_posts.json';
const collectionFile = 'saved/saved_collections.json';
const makeFiles = () => structuredClone(fixture.files);
function reader(files: Record<string, unknown>, calls: string[] = []): ParserInput {
  return { async readJson(file) {
    calls.push(file);
    return Object.hasOwn(files, file) ? { status: 'ok', value: files[file] }
      : { status: 'missing', code: 'missing_file' };
  } };
}
const table = (result: ParseResult, name: string) => result.sideTables.find(value => value.name === `instagram.${name}`)!.rows;
const mojibake = (text: string) => Buffer.from(text, 'utf8').toString('latin1');

test('synthetic parsed events, placements and joins reproduce independent golden expectations', async () => {
  const files = makeFiles();
  const before = JSON.stringify(files);
  const calls: string[] = [];
  const result = await instagramParser.parse(reader(files, calls));
  const saved = result.events.filter(value => value.activity.event_type === 'saved');
  const placements = table(result, 'placements');
  assert.equal(saved.length, fixture.expected.saved);
  assert.equal(result.events.length - saved.length, fixture.expected.liked);
  assert.equal(table(result, 'collections').length, fixture.expected.collections);
  assert.equal(table(result, 'collections').filter(value => value.mediaChildCount === 0).length, fixture.expected.emptyCollections);
  assert.equal(placements.length, fixture.expected.placements);
  const memberships = new Map<string, Set<string>>();
  for (const placement of placements) {
    const key = String(placement.postKey);
    const group = memberships.get(key) ?? new Set<string>();
    group.add(String(placement.collectionId)); memberships.set(key, group);
  }
  assert.equal(memberships.size, fixture.expected.uniqueCollectionPosts);
  assert.equal([...memberships.values()].filter(value => value.size > 1).length, fixture.expected.multipleCollections);
  assert.equal(placements.filter(value => value.joinStatus === 'unmatched_placement').length, fixture.expected.unmatchedUnique);
  assert.equal(placements.find(value => value.joinStatus === 'unmatched_placement')!.savedObservationId, null);
  assert.equal(saved[0].activity.timestamp, '2024-01-01T00:00:00.000Z');
  assert.equal(saved[1].activity.title, null);
  assert.ok(result.events.every(value => value.activity.duration_sec === null));
  assert.equal(result.status, 'partial'); // Explicit unmatched placement.
  assert.deepEqual(calls, [savedFile, likedFile, collectionFile]); // No comment data read.
  assert.equal(JSON.stringify(files), before); // Parser never mutates supplied JSON.
  assert.notEqual(saved[0].eventKey, result.events.find(value => value.activity.event_type === 'liked')!.eventKey);
});

test('repairs captions, creator names, usernames, hashtags and collection names exactly once', async () => {
  const files = makeFiles();
  const row = files[savedFile][0];
  const owner = row.label_values.find((value: { title?: string }) => value.title === 'Owner');
  owner.dict[0].dict.find((value: { label?: string }) => value.label === 'Username').value = mojibake('synthetic_é');
  const result = await instagramParser.parse(reader(files));
  assert.equal(result.events[0].activity.title, 'Synthetic café 🌱 — 日本語');
  assert.equal(result.events[0].activity.creator, 'Synthetic Créator 🌱');
  assert.equal(result.events[0].activity.creator_id, 'synthetic_é');
  assert.deepEqual(table(result, 'post_extras')[0].hashtags, ['café']);
  assert.equal(table(result, 'collections')[0].collection_name, 'Synthetic café 🌱');
  assert.equal(result.diagnostics.filter(value => value.code === 'invalid_encoding').length, 0);
});

for (const text of ['ASCII', 'It’s a café 🌱', '日本語 Русский', '🌱', '\uFEFFleading BOM']) {
  test(`strict byte repair round-trips synthetic text ${JSON.stringify(text)}`, () => {
    assert.deepEqual(repairInstagramString(mojibake(text)), { value: text, unexpected: false });
  });
}

test('unexpected Unicode and invalid byte sequences are preserved and reported', async () => {
  for (const text of ['already 🌱', '\u00c3(', 'café']) {
    assert.deepEqual(repairInstagramString(text), { value: text, unexpected: true });
  }
  const files = makeFiles();
  files[savedFile][0].label_values.find((value: { label?: string }) => value.label === 'Caption').value = 'already 🌱';
  const result = await instagramParser.parse(reader(files));
  assert.equal(result.events[0].activity.title, 'already 🌱');
  assert.ok(result.diagnostics.some(value => value.code === 'invalid_encoding' && value.row === 1));
});

test('nested repair does not treat __proto__ as an assignment and bounds nesting', () => {
  const repaired = repairInstagramValues(JSON.parse('{"__proto__":{"polluted":"yes"}}')).value as object;
  assert.equal(Object.getPrototypeOf(repaired), Object.prototype);
  assert.equal(Object.hasOwn(repaired, '__proto__'), true);
  let deep: unknown = 'leaf';
  for (let index = 0; index < 66; index++) deep = [deep];
  assert.throws(() => repairInstagramValues(deep), /depth/);
});

for (const [index, example] of fixture.urlCases.entries()) {
  test(`URL contract case ${index + 1}`, () => {
    assert.equal(canonicalInstagramPostUrl(example.url)?.key ?? null, example.key);
  });
}
test('rejects URL normalisation tricks; shortcode is case-sensitive', () => {
  for (const url of ['https://instagram.com/a/../p/Code/', 'https://instagram.com/p/Code\\',
    'https://instagram.com/p/%43ode/', ' https://instagram.com/p/Code/',
    'https://instagram.com/p/Code/\n', 'https://instagram.com/p//']) {
    assert.equal(canonicalInstagramPostUrl(url), null);
  }
  assert.notEqual(canonicalInstagramPostUrl('https://instagram.com/p/Code')!.key,
    canonicalInstagramPostUrl('https://instagram.com/p/code')!.key);
});

test('fallback event identity and collection join use shortcode across path types and tracking', async () => {
  const files = makeFiles();
  delete files[savedFile][0].fbid;
  files[savedFile][0].label_values[0].value = 'https://instagram.com/p/SyntheticA?tracking=yes';
  const result = await instagramParser.parse(reader(files));
  assert.equal(result.events[0].eventKey, JSON.stringify(['instagram', 'saved', 'post', 'instagram:post:SyntheticA']));
  const matches = table(result, 'placements').filter(value => value.postKey === 'instagram:post:SyntheticA');
  assert.ok(matches.every(value => value.savedObservationId === result.events[0].observationId));
});

test('ambiguous saved matches preserve placements without selecting a candidate', async () => {
  const files = makeFiles();
  files[savedFile].push(structuredClone(files[savedFile][0]));
  const result = await instagramParser.parse(reader(files));
  const ambiguous = table(result, 'placements').filter(value => value.postKey === 'instagram:post:SyntheticA');
  assert.equal(ambiguous.length, 2);
  assert.ok(ambiguous.every(value => value.joinStatus === 'ambiguous_join' && value.savedObservationId === null));
  assert.equal(new Set(result.events.map(value => value.observationId)).size, result.events.length);
});

test('duplicate captions preserve first value and all variants without dropping events', async () => {
  const files = makeFiles();
  files[savedFile][0].label_values.push({ label: 'Caption', value: 'different synthetic caption' });
  const result = await instagramParser.parse(reader(files));
  assert.equal(result.events.length, 3);
  assert.equal(result.events[0].activity.title, 'Synthetic café 🌱 — 日本語');
  assert.deepEqual(table(result, 'post_extras')[0].captionValues, ['Synthetic café 🌱 — 日本語', 'different synthetic caption']);
  assert.ok(result.diagnostics.some(value => value.code === 'duplicate_caption' && value.severity === 'info'));
});

test('absent and None update values use timestamp_value; collection date never creates an event', async () => {
  const result = await instagramParser.parse(reader(makeFiles()));
  const collections = table(result, 'collections');
  assert.equal(collections[0].updateValueState, 'absent');
  assert.equal(collections[1].updateValueState, 'None');
  assert.equal(collections[0].updatedAt, '2024-01-02T00:00:00.000Z');
  assert.equal(collections[1].updatedAt, collections[0].updatedAt);
  assert.equal(result.events.length, 3);
});

test('missing folders and malformed independent files retain valid events', async () => {
  const files = makeFiles();
  delete files[likedFile]; files[collectionFile] = { unexpected: [] };
  const result = await instagramParser.parse(reader(files));
  assert.equal(result.events.length, 2);
  assert.equal(result.status, 'partial');
  assert.ok(result.diagnostics.some(value => value.code === 'missing_file'));
  assert.ok(result.diagnostics.some(value => value.code === 'invalid_shape'));
});

test('all absent input fails explicitly; supported empty arrays return empty', async () => {
  assert.equal((await instagramParser.parse(reader({}))).status, 'failed');
  assert.equal((await instagramParser.parse(reader({ [savedFile]: [], [likedFile]: [], [collectionFile]: [] }))).status, 'empty');
});

test('invalid timestamps, numeric IDs and malformed rows are skipped without content in diagnostics', async () => {
  const files = makeFiles();
  for (const value of ['1', null, -1, 0.5, 1e30]) {
    files[savedFile].push({ ...structuredClone(files[savedFile][0]), timestamp: value });
  }
  files[savedFile].push({ ...structuredClone(files[savedFile][0]), fbid: 123 });
  files[savedFile].push(null, { timestamp: 1, label_values: 'SECRET_SOURCE_TEXT' });
  const result = await instagramParser.parse(reader(files));
  assert.equal(result.events.length, 3);
  assert.equal(result.diagnostics.filter(value => value.code === 'invalid_row').length, 8);
  assert.ok(!JSON.stringify(result.diagnostics).includes('SECRET_SOURCE_TEXT'));
  assert.ok(result.diagnostics.every(value => Object.keys(value).every(key => ['sourceFile', 'code', 'row', 'severity'].includes(key))));
});

test('malformed collections cannot masquerade as empty collections', async () => {
  const files = makeFiles();
  files[collectionFile][0].label_values = [];
  const result = await instagramParser.parse(reader(files));
  assert.equal(table(result, 'collections').length, 2);
  assert.equal(table(result, 'collections').filter(value => value.mediaChildCount === 0).length, 1);
  assert.ok(result.diagnostics.some(value => value.code === 'invalid_row'));
});

test('hostile captions remain inert lossless data, never diagnostic text', async () => {
  const files = makeFiles();
  const payload = fixture.adversarialText.join('\n');
  files[savedFile][0].label_values.find((value: { label?: string }) => value.label === 'Caption').value = payload;
  const result = await instagramParser.parse(reader(files));
  assert.equal(result.events[0].activity.title, payload);
  assert.ok(!JSON.stringify(result.diagnostics).includes(payload));
  // Spreadsheet formula injection is handled later at CSV serialization, not
  // by corrupting the authoritative caption during parsing.
});

test('one malformed Media child preserves valid sibling placements', async () => {
  const files = makeFiles();
  files[collectionFile][0].label_values.find((value: { title?: string }) => value.title === 'Media').dict.push(null);
  const result = await instagramParser.parse(reader(files));
  assert.equal(table(result, 'collections').length, 3);
  assert.equal(table(result, 'placements').length, 5);
  assert.equal(table(result, 'placements').filter(value => value.joinStatus === 'matched').length, 3);
  assert.equal(table(result, 'placements').filter(value => value.joinStatus === 'invalid_url').length, 1);
});
