import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import type { EventRecord, DataValue } from '../src/domain.ts';
import type { InstagramSideTableBundle } from '../src/instagram-side-tables.ts';
import { exploreInstagram, timeProfile, weeklyActivity, lowRuns, sessionize } from '../src/exploration.ts';
import { aggregateExploration, renderExploration } from '../src/exploration-report.ts';
import { explorationCommand, readExplorationSnapshot } from '../src/exploration-command.ts';
import { ingestInstagram } from '../src/ingest.ts';

function event(id: string, timestamp: string, type: 'saved' | 'liked' = 'saved', creator: string | null = 'PRIVATE_ACCOUNT_CANARY'): EventRecord {
  return { observationId: id, eventKey: null, activity: { platform: 'instagram', timestamp, event_type: type, title: 'PRIVATE_CAPTION_CANARY', creator, creator_id: creator, url: `https://www.instagram.com/p/${id}/`, duration_sec: null, source_file: 'synthetic.json', raw_id: id } };
}
function bundle(events: EventRecord[], collections: Record<string, DataValue>[] = [], placements: Record<string, DataValue>[] = []): InstagramSideTableBundle {
  return { format: 'hindsight.instagram-side-tables', schemaVersion: 1, snapshotId: 'synthetic', platform: 'instagram', sensitivity: 'personal', contentTrust: 'untrusted-third-party', tables: [
    { name: 'instagram.post_extras', schemaVersion: 1, rows: events.map(e => ({ observationId: e.observationId, postKey: e.activity.url, post_type: 'p', hashtags: ['PRIVATE_TAG_CANARY', 'PRIVATE_TAG_CANARY'] })) },
    { name: 'instagram.collections', schemaVersion: 1, rows: collections },
    { name: 'instagram.placements', schemaVersion: 1, rows: placements },
  ] };
}
const analyze = (events: EventRecord[], b = bundle(events)) => exploreInstagram(events, b, { exportDate: '2026-08-30', knownMonth: '2021-11' });

test('Brisbane conversion crosses UTC day and year; weekday and hour counts conserve events', () => {
  const events = [event('one', '2021-12-31T14:30:00.000Z'), event('two', '2022-01-03T00:00:00.000Z')];
  const p = timeProfile(events);
  assert.equal(p.hours[0], 1); assert.equal(p.hours[10], 1);
  assert.equal(p.weekdaysMondayFirst[5], 1); assert.equal(p.weekdaysMondayFirst[0], 1);
  assert.equal(p.weekday09to15, 1);
  const data = analyze(events);
  assert.deepEqual(data.localTimeByYear.map(y => y.year), [2022]);
  assert.deepEqual(data.years.map(y => y.events), [1, 1]);
});

test('Known-month cuts use Brisbane boundaries and retain the entire uncertain month', () => {
  const rows = [event('a', '2021-10-31T13:59:59.000Z'), event('b', '2021-10-31T14:00:00.000Z'), event('c', '2021-11-30T13:59:59.000Z'), event('d', '2021-11-30T14:00:00.000Z')];
  const d = analyze(rows);
  assert.deepEqual(d.segments.slice(0, 3).map(s => s.channels.combined.events), [1, 2, 1]);
});

test('Session gap equality, chaining, ties and period-crossing are explicit', () => {
  const rows = [event('a', '2025-12-31T13:50:00.000Z'), event('b', '2025-12-31T14:20:00.000Z'), event('c', '2025-12-31T14:20:00.000Z'), event('d', '2025-12-31T14:50:01.000Z')];
  assert.deepEqual(sessionize(rows, 30).map(s => s.events), [3, 1]);
  assert.equal(sessionize(rows, 60).length, 1); assert.equal(sessionize(rows, 15).length, 3);
  const r = analyze(rows).sessions.find(s => s.channel === 'combined' && s.gapMinutes === 30)!;
  assert.deepEqual(r.months.map(m => [m.period, m.sessions, m.events]), [['2025-12', 1, 3], ['2026-01', 1, 1]]);
  assert.equal(r.months.reduce((n, m) => n + m.events, 0), 4);
  const carry = analyze(rows.slice(0, 3)).sessions.find(s => s.channel === 'combined' && s.gapMinutes === 30)!;
  assert.equal(carry.months.find(m => m.period === '2026-01')!.sessions, 0);
});

test('Every four-week zero run is dated without including endpoint weeks or nonzero activity', () => {
  const rows = [event('a', '2021-01-04T12:00:00.000Z'), event('b', '2021-02-08T12:00:00.000Z')];
  const zero = lowRuns(weeklyActivity(rows), 'combined', 0);
  assert.deepEqual(zero, [{ start: '2021-01-11', endInclusive: '2021-02-07', weeks: 4, events: 0, emptyWeeks: 4, maximumPerWeek: 0 }]);
  rows.push(event('c', '2021-01-20T12:00:00.000Z'));
  assert.equal(lowRuns(weeklyActivity(rows), 'combined', 0).length, 0);
  assert.equal(lowRuns(weeklyActivity(rows), 'combined', 4)[0].events, 1);
  const misaligned = analyze([event('x', '2021-01-06T12:00:00.000Z'), event('y', '2021-02-03T12:00:00.000Z')]);
  assert.equal(misaligned.gaps.combined.zero.length, 0);
  assert.equal(misaligned.exactGaps.combined[0].elapsedDays, 28);
});

test('Backlog excludes unmatched placement identities; overlaps and lag bounds deduplicate per folder', () => {
  const rows = [event('a', '2025-01-01T00:00:00.000Z'), event('b', '2025-08-01T00:00:00.000Z')];
  const collections = [1, 2].map(i => ({ collectionId: `folder-${i}`, collection_name: 'PRIVATE_FOLDER_CANARY', createdAt: '2025-04-01T00:00:00.000Z', updatedAt: null }));
  const place = (folder: number, post: string, matched: boolean) => ({ collectionId: `folder-${folder}`, placementId: `${folder}-${post}`, postKey: post, savedObservationId: matched ? 'a' : null, savedAt: matched ? rows[0].activity.timestamp : null, joinStatus: matched ? 'matched' : 'unmatched_placement' });
  const b = bundle(rows, collections, [place(1, 'post-a', true), place(1, 'post-a', true), place(2, 'post-a', true), place(1, 'missing', false)]);
  const d = analyze(rows, b);
  assert.equal(d.filing.unfiledObservations, 1); assert.equal(d.filing.uniquePlacementPosts, 2);
  assert.equal(d.filing.overlap[0].sharedPosts, 1); assert.equal(d.filing.postsInMultipleFolders, 1);
  assert.equal(d.filing.collections[0].datedPairs, 1); assert.equal(d.filing.collections[0].savedAtLeast90DaysBefore, 1);
  assert.equal(d.filing.uniqueSavedPredatingAtLeastOneFolder, 1);
  assert.equal(d.filing.unfiledAgeBins.reduce((n, b) => n + b.count, 0), 1);
  b.tables[2].rows.push({ ...place(1, 'invalid', false), postKey: null, joinStatus: 'invalid_url' });
  const invalid = analyze(rows, b).filing.collections[0];
  assert.equal(invalid.uniquePosts, 2); assert.equal(invalid.unidentifiedPlacements, 1);
});

test('Hashtag presence, URL-format coverage and once/twice denominators remain distinct', () => {
  const rows = [event('a', '2020-01-01T00:00:00.000Z'), event('b', '2020-01-02T00:00:00.000Z', 'liked'), event('c', '2021-01-01T00:00:00.000Z'), event('d', '2021-02-01T00:00:00.000Z', 'liked', null)];
  const b = bundle(rows); b.tables[0].rows[3].hashtags = []; b.tables[0].rows[3].post_type = null;
  const d = analyze(rows, b);
  assert.equal(d.years[0].channels.combined.hashtags[0].count, 2);
  assert.equal(d.years[0].channels.combined.rawHashtagTokens, 4);
  assert.equal(d.years[0].channels.combined.globalOnceOrTwiceEvents, 0);
  assert.equal(d.years[0].channels.combined.withinPeriodOnceOrTwiceEvents, 2);
  assert.equal(d.years[1].channels.combined.unknownCreatorEvents, 1);
  assert.equal(d.years[1].channels.combined.hashtagCoverage, .5);
  assert.equal(d.years[1].channels.combined.formats.unknown, 1);
});

test('Aggregate exploration and written Markdown omit source identities, captions and literal tags', () => {
  const rows = [event('a', '2025-01-01T00:00:00.000Z'), event('b', '2025-02-01T00:00:00.000Z')];
  const b = bundle(rows, [{ collectionId: 'PRIVATE_FOLDER_ID', collection_name: 'PRIVATE_FOLDER_CANARY', createdAt: '2025-03-01T00:00:00.000Z' }]);
  const decode = (s: string) => s.replace(/&#(\d+);/g, (_, n: string) => String.fromCharCode(Number(n)));
  const d = analyze(rows, b), text = JSON.stringify(aggregateExploration(d)) + decode(renderExploration(d));
  for (const sentinel of ['PRIVATE_ACCOUNT_CANARY', 'PRIVATE_CAPTION_CANARY', 'PRIVATE_TAG_CANARY', 'PRIVATE_FOLDER_CANARY', 'PRIVATE_FOLDER_ID', 'https://www.instagram.com']) assert.equal(text.includes(sentinel), false, sentinel);
  assert.ok(decode(renderExploration(d, true)).includes('PRIVATE_ACCOUNT_CANARY'));
  b.tables[0].rows[0].hashtags = ['<img src=x onerror=alert(1)>'];
  assert.equal(renderExploration(analyze(rows, b), true).includes('<img'), false);
});

test('Empty data and zero-count calendar periods remain explicit without fabricated eras', () => {
  const empty = analyze([]);
  assert.equal(empty.totals.events, 0); assert.equal(empty.sessions[0].sessionCount, 0);
  assert.equal(empty.filing.unfiledAgeDays.median, null);
  const rows = [event('a', '2024-01-01T00:00:00.000Z'), event('b', '2024-04-01T00:00:00.000Z')], d = analyze(rows);
  assert.deepEqual(d.months.map(m => m.events), [1, 0, 0, 1]); assert.equal(d.months[1].saveShare, null);
  assert.equal(d.quarters.reduce((n, q) => n + q.events, 0), 2);
  assert.equal(d.transition.firstSaveMajorityMonth, '2024-01'); assert.equal(d.transition.finalSaveMajorityRunStart, '2024-04');
});

test('Exploration command reads retained artifacts only, protects existing files, and rejects checksum corruption plainly', async t => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'hindsight-exploration-'));
  t.after(async () => { const target = path.resolve(root); assert.equal(path.dirname(target), path.resolve(os.tmpdir())); assert.ok(path.basename(target).startsWith('hindsight-exploration-')); await fs.rm(target, { recursive: true, force: true }); });
  const input = path.join(root, 'input'), fixture = JSON.parse(await fs.readFile(new URL('./fixtures/instagram.synthetic.json', import.meta.url), 'utf8'));
  for (const [name, value] of Object.entries(fixture.files)) { const f = path.join(input, name); await fs.mkdir(path.dirname(f), { recursive: true }); await fs.writeFile(f, JSON.stringify(value)); }
  const imported = await ingestInstagram({ input, output: path.join(root, 'snapshots'), snapshotId: 'synthetic', exportDate: '2026-08-30' });
  // Renaming the synthetic input makes the original source path unavailable.
  const relocated = path.join(root, 'unavailable-input');
  assert.equal(path.dirname(path.resolve(input)), path.resolve(root)); assert.equal(path.dirname(path.resolve(relocated)), path.resolve(root));
  await fs.rename(input, relocated);
  const logs: string[] = [], opts = { stdout: (s: string) => logs.push(s), stderr: (s: string) => logs.push(s) };
  const output = path.join(root, 'report');
  assert.equal(await explorationCommand(['--snapshot', imported.directory, '--output', output], opts), 0);
  const result = JSON.parse(await fs.readFile(path.join(output, 'exploration-personal.json'), 'utf8'));
  assert.equal(result.totals.events, 3);
  const retained = await readExplorationSnapshot(imported.directory); assert.equal(retained.events.length, 3);
  assert.equal(await explorationCommand(['--snapshot', imported.directory, '--output', output], opts), 1);
  assert.equal(await explorationCommand(['--snapshot', imported.directory, '--output', path.join(imported.directory, 'forbidden')], opts), 1);
  assert.equal(await explorationCommand(['--snapshot', imported.directory, '--output', path.join(relocated, 'forbidden'), '--source-root', relocated], opts), 1);
  await fs.appendFile(path.join(imported.directory, 'observations.jsonl'), 'corrupt');
  assert.equal(await explorationCommand(['--snapshot', imported.directory, '--output', path.join(root, 'corrupt-report')], opts), 1);
  assert.equal(logs.some(s => /\n\s+at |Error:|node:internal/.test(s)), false);
});
