import assert from 'node:assert/strict';
import test from 'node:test';
import type { EventRecord } from '../src/domain.ts';
import { creatorLifecycles, lifecycleCounts, localCalendar, DAY } from '../src/lifecycles.ts';

function event(id: string, timestamp: string, creator: string | null = 'SYNTHETIC', type: 'saved' | 'liked' = 'saved'): EventRecord {
  return { observationId: id, eventKey: null, activity: { platform: 'instagram', timestamp, creator_id: creator, creator, title: 'CAPTION_CANARY', url: 'https://example.invalid/PRIVATE_URL', raw_id: id, duration_sec: null, source_file: 'synthetic', event_type: type } };
}
const run = (events: EventRecord[], asOf = '2026-08-30T23:59:59.999Z') => creatorLifecycles(events, { channel: 'combined', snapshotRefs: ['synthetic'], asOf });

test('Lifecycle singleton policy is channel-specific; unknown identities are not a creator', () => {
  const events = [event('1', '2026-01-01T00:00:00.000Z'), event('2', '2026-01-01T00:01:00.000Z', 'SYNTHETIC', 'liked'), event('3', '2026-01-01T00:02:00.000Z', null)];
  const combined = run(events); assert.equal(combined.rows.length, 1); assert.equal(combined.rows[0].distinctDays, 1); assert.equal(combined.rows[0].distinctSessions, 1); assert.equal(combined.unknownObservations, 1);
  const saved = creatorLifecycles(events, { channel: 'saved', snapshotRefs: ['synthetic'], asOf: combined.config.asOf });
  assert.equal(saved.rows.length, 0); assert.equal(saved.singletonCreators, 1);
  assert.equal(run([]).knownCreators, 0);
});
test('Lifecycle calendar-month gap is strict, end-of-month clamped, and Brisbane months cross UTC dates', () => {
  const c = localCalendar();
  assert.equal(new Date(c.addMonths(Date.parse('2024-02-29T00:00:00.000Z'), 12)).toISOString(), '2025-02-28T00:00:00.000Z');
  const d = run([event('1', '2024-02-29T00:00:00.000Z'), event('2', '2025-02-28T00:00:00.000Z'), event('3', '2026-02-28T00:00:00.001Z')]);
  assert.deepEqual(d.rows[0].newContactEpisodes, ['2024-02-29T00:00:00.000Z', '2026-02-28T00:00:00.001Z']);
  assert.equal(c.day(Date.parse('2026-01-31T14:00:00.000Z')), '2026-02-01');
});
test('Lifecycle six-month band stays explicit; left coverage and unfinished month are disclosed', () => {
  const events = Array.from({ length: 6 }, (_, i) => event(String(i), `2026-0${i + 1}-10T00:00:00.000Z`));
  const r = run(events).rows[0]; assert.equal(r.activeMonthsByWindow.at(-1)?.band, 'exactly 6'); assert.equal(r.activeMonthsByWindow[0].lowerBound, true); assert.equal(r.activeMonthsByWindow.at(-1)?.partial, true);
});
test('Lifecycle elapsed follow-up boundaries and right censoring do not manufacture negative evidence', () => {
  const first = Date.parse('2026-01-01T00:00:00.000Z');
  const r = run([0, 7, 14, 30, 37, 90, 97].map((n, i) => event(String(i), new Date(first + n * DAY).toISOString())), new Date(first + 96 * DAY).toISOString()).rows[0];
  assert.equal(r.anotherRecord7to30DaysLater.observations, 3);
  assert.deepEqual(r.followUpWindows.map(w => w.observations), [1, 1, 1]); assert.equal(r.followUpWindows[2].status, 'not yet observable');
});
test('Peak chooses earliest equal active-day window and includes tied endpoint records; audience excludes exact 28-day edge', () => {
  const r = run([event('a', '2026-01-01T00:00:00.000Z'), event('b', '2026-01-01T00:00:00.000Z'), event('c', '2026-03-01T00:00:00.000Z')], '2026-03-29T00:00:00.000Z');
  assert.equal(r.rows[0].peakWindow.endInclusive, '2026-01-01T00:00:00.000Z'); assert.equal(r.rows[0].peakWindow.observations, 2); assert.equal(r.creatorsRecordedLast28Days, 0);
});
test('Sessions are channel-wide, so other creators can connect a chain; recurrence ranking precedes raw count', () => {
  const events = [event('1', '2026-01-01T00:00:00.000Z', 'A'), event('2', '2026-01-01T01:00:00.000Z', 'B'), event('3', '2026-01-01T02:00:00.000Z', 'A'), event('4', '2026-02-01T00:00:00.000Z', 'B')];
  const d = run(events); assert.equal(d.rows[0].creatorRef.creatorId, 'B'); assert.equal(d.rows[1].distinctSessions, 1);
  const anonymous = JSON.stringify(lifecycleCounts(d)); for (const canary of ['SYNTHETIC', 'CAPTION_CANARY', 'example.invalid', 'creatorId', 'creatorRef']) assert.ok(!anonymous.includes(canary));
});
