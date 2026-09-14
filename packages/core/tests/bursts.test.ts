import assert from 'node:assert/strict';
import test from 'node:test';
import type { EventRecord } from '../src/domain.ts';
import type { InstagramSideTableBundle } from '../src/instagram-side-tables.ts';
import { DAY } from '../src/lifecycles.ts';
import { fitRateSpan, detectBursts, folderRateLanes, folderBurstGrid, burstGridCounts, burstSensitivity, burstSensitivityCounts, type RateWeek } from '../src/bursts.ts';

function weeks(counts: number[], totals = counts.map(() => 100)): RateWeek[] {
  const start = Date.parse('2026-01-05');
  return counts.map((n, i) => ({ week: new Date(start + i * 7 * DAY).toISOString().slice(0, 10), numerator: n, denominator: totals[i], total: totals[i], filed: totals[i], status: 'assessed', timestamps: Array.from({ length: n }, (_, j) => start + i * 7 * DAY + (j % 2) * DAY) }));
}
test('Kleinberg dynamic programme agrees with exhaustive independent enumeration on short series', () => {
  for (const counts of [[1, 1, 8, 1], [0, 0, 5, 5], [3, 1, 0, 0], [0, 1, 0, 0]]) for (const s of [1.5, 2, 3]) for (const gamma of [0.5, 1, 2]) {
    const rows = weeks(counts, counts.map(() => 10)), fit = fitRateSpan(rows, { s, gamma }); let best = Infinity;
    function enumerate(path: number[]) {
      if (path.length < rows.length) { for (let j = 0; j < fit.probabilities.length; j++) enumerate([...path, j]); return; }
      let cost = 0;
      for (let t = 0; t < rows.length; t++) { const p = fit.probabilities[path[t]], r = rows[t].numerator, n = rows[t].denominator; cost += -(r * Math.log(p) + (n - r) * Math.log(1 - p)) + gamma * Math.max(0, path[t] - (path[t - 1] ?? 0)) * Math.log(rows.length); }
      best = Math.min(best, cost);
    }
    enumerate([]); assert.ok(Math.abs(fit.cost - best) < 1e-10, `${counts} s=${s} gamma=${gamma}`);
  }
});
test('Constant share with changing volume, all-zero and all-one baselines do not produce bursts', () => {
  assert.deepEqual(fitRateSpan(weeks([1, 10, 100, 1], [10, 100, 1000, 10]), { s: 2, gamma: 1 }).states, [0, 0, 0, 0]);
  assert.equal(detectBursts(weeks([0, 0, 0]), { s: 2, gamma: 1 }).qualifiedBars.length, 0);
  assert.equal(fitRateSpan(weeks([3, 3], [3, 3]), { s: 2, gamma: 1 }).identifiable, false);
});
test('Singleton and one-date candidates are retained but excluded by the fixed two-date support rule', () => {
  const single = detectBursts(weeks([0, 0, 0, 1, 0, 0, 0, 0, 0, 0]), { s: 2, gamma: 0.01 });
  assert.ok(single.candidates.length > 0); assert.equal(single.qualifiedBars.length, 0);
  const rows = weeks([0, 0, 0, 20, 0, 0, 0, 0]); rows[3].timestamps = Array(20).fill(rows[3].timestamps[0]);
  const oneDate = detectBursts(rows, { s: 2, gamma: 1 }); assert.ok(oneDate.candidates.length > 0); assert.equal(oneDate.qualifiedBars.length, 0);
});
test('Zero exposure splits spans and overlapping streams retain separate nested intervals', () => {
  const a = weeks([0, 0, 30, 30, 0, 0, 0, 30, 30, 0, 0]), b = weeks([0, 0, 0, 30, 30, 0, 0, 0, 0, 0, 0]);
  a[5].denominator = 0; a[5].total = 0;
  const aa = detectBursts(a, { s: 2, gamma: 1 }), bb = detectBursts(b, { s: 2, gamma: 1 });
  assert.equal(aa.fits.length, 2); assert.equal(aa.unassessedWeeks[0].reason, 'zero exposure');
  assert.ok(aa.qualifiedBars.length > 0 && bb.qualifiedBars.length > 0);
  assert.ok(aa.qualifiedBars.every(bar => !(bar.startWeek <= a[5].week && bar.endWeek >= a[5].week)));
  assert.ok(aa.qualifiedBars.some(x => bb.qualifiedBars.some(y => x.startWeek <= y.endWeek && y.startWeek <= x.endWeek)));
});
function event(id: string, timestamp: string): EventRecord { return { observationId: id, eventKey: null, activity: { platform: 'instagram', event_type: 'saved', timestamp, creator_id: 'PRIVATE_CREATOR_CANARY', creator: 'PRIVATE_NAME_CANARY', title: 'PRIVATE_CAPTION_CANARY', url: 'https://example.invalid/PRIVATE_URL', raw_id: id, source_file: 'synthetic', duration_sec: null } }; }
test('Folder lanes deduplicate placements, preserve exclusions and exclude late creation and right endpoint weeks', () => {
  const events = [event('a', '2026-01-06T00:00:00.000Z'), event('b', '2026-01-13T00:00:00.000Z'), event('c', '2026-01-20T00:00:00.000Z'), event('d', '2026-01-27T00:00:00.000Z'), event('e', '2026-02-03T00:00:00.000Z')];
  const bundle: InstagramSideTableBundle = { format: 'hindsight.instagram-side-tables', schemaVersion: 1, snapshotId: 'synthetic', sensitivity: 'personal', contentTrust: 'untrusted-third-party', platform: 'instagram', tables: [
    { name: 'instagram.collections', schemaVersion: 1, rows: [{ collectionId: 'PRIVATE_ID_CANARY', collection_name: 'PRIVATE_FOLDER_CANARY', createdAt: '2026-01-14T00:00:00.000Z' }] },
    { name: 'instagram.placements', schemaVersion: 1, rows: [...['a', 'b', 'c', 'c', 'e'].map(savedObservationId => ({ collectionId: 'PRIVATE_ID_CANARY', savedObservationId, joinStatus: 'matched' })), { collectionId: 'PRIVATE_ID_CANARY', savedObservationId: null, joinStatus: 'unmatched_placement' }] },
  ] };
  const options = { startDate: '2026-01-05', exportDate: '2026-02-08' };
  const lane = folderRateLanes(events, bundle, { ...options, denominator: 'all-saves' })[0];
  assert.equal(lane.descriptive.distinctMatchedObservations, 4); assert.equal(lane.descriptive.observationsBeforeCreation, 2); assert.equal(lane.descriptive.excludedPlacementsWithoutMatchedObservation, 1);
  assert.deepEqual(lane.weeks.map(w => w.status), ['before creation week', 'creation week', 'assessed', 'assessed', 'endpoint week: export time unknown']);
  assert.equal(lane.weeks[2].numerator, 1);
  const filed = folderRateLanes(events, bundle, { ...options, denominator: 'filed-saves' })[0]; assert.equal(filed.weeks[3].status, 'zero exposure');
  const grid = folderBurstGrid(events, bundle, options); assert.equal(grid.runs.length, 18); assert.equal(new Set(grid.runs.map(r => `${r.denominator}/${r.s}/${r.gamma}`)).size, 18);
  const anonymous = JSON.stringify(burstGridCounts(grid)); for (const term of ['PRIVATE_', 'example.invalid', 'collectionRef', 'creator']) assert.ok(!anonymous.includes(term));
  assert.deepEqual(burstSensitivity(grid), []); assert.equal(burstSensitivityCounts([])[0].primaryOuterBars, 0);
});
test('Boundary sensitivity retains disappearances and shifts rather than promoting another configuration', () => {
  const rows = weeks([0, 0, 30, 30, 0, 0, 0, 0]);
  const lane = { collectionRef: { snapshotId: 'synthetic', collectionId: 'PRIVATE_ID_CANARY', name: 'PRIVATE_FOLDER_CANARY' }, createdAt: null, denominator: 'all-saves' as const, descriptive: { distinctMatchedObservations: 60, excludedPlacementsWithoutMatchedObservation: 0, observationsBeforeCreation: 0, observationsOutsideWindow: 0, unassessedWindowObservations: 0 }, weeks: rows, detection: detectBursts(rows, { s: 2, gamma: 1 }) };
  assert.ok(lane.detection.qualifiedBars.length > 0);
  const emptyLane = { ...lane, detection: { ...lane.detection, qualifiedBars: [] } };
  const grid = { sensitivity: 'personal', warning: '', options: { startDate: '', exportDate: '' }, primary: { denominator: 'all-saves', s: 2, gamma: 1 }, runs: [
    { denominator: 'all-saves' as const, s: 2, gamma: 1, elapsedMilliseconds: 0, lanes: [lane] },
    { denominator: 'all-saves' as const, s: 2, gamma: 2, elapsedMilliseconds: 0, lanes: [emptyLane] },
  ] };
  const comparisons = burstSensitivity(grid); assert.equal(comparisons[0].comparisons[0].exact, true); assert.equal(comparisons[0].comparisons[1].bestOverlap, null);
  assert.ok(!JSON.stringify(burstSensitivityCounts(comparisons)).includes('PRIVATE_'));
});
