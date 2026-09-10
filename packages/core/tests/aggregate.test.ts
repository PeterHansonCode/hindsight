import assert from 'node:assert/strict';
import test from 'node:test';
import { aggregate, utcWeek } from '../src/aggregate.ts';
import type { Activity, EventRecord } from '../src/domain.ts';

function event(observationId: string, changes: Partial<Activity> = {}): EventRecord {
  return { observationId, eventKey: null, activity: {
    platform: 'instagram', timestamp: '2024-01-07T23:59:59.000Z', event_type: 'saved', title: null,
    creator: 'Same display name', creator_id: 'creator-a', url: null, duration_sec: null,
    source_file: 'synthetic.json', raw_id: null, ...changes,
  } };
}

test('creator aggregation uses platform and ID, not display name; missing identities are counted separately', () => {
  const events = [
    event('later', { timestamp: '2024-01-08T00:00:00.000Z', creator: 'New display name' }),
    event('earlier'), event('other-person', { creator_id: 'creator-b' }),
    event('other-platform', { platform: 'youtube' }),
    event('unknown-1', { creator_id: null }), event('unknown-2', { creator_id: null }),
  ];
  const result = aggregate(events);
  assert.equal(result.anonymous.event_count, 6);
  assert.equal(result.anonymous.known_creator_count, 3);
  assert.equal(result.anonymous.events_without_creator_id, 2);
  assert.deepEqual(result.anonymous.creator_frequency_distribution, [
    { event_count: 1, creator_count: 2 }, { event_count: 2, creator_count: 1 },
  ]);
  assert.deepEqual(result.anonymous.events_by_platform, { instagram: 5, youtube: 1 });
  const recurring = result.creators.find(row => row.platform === 'instagram' && row.creator_id === 'creator-a')!;
  assert.equal(recurring.creator, 'New display name'); assert.equal(recurring.event_count, 2);
  assert.equal(recurring.first_seen, '2024-01-07T23:59:59.000Z'); assert.equal(recurring.last_seen, '2024-01-08T00:00:00.000Z');
  assert.deepEqual(recurring.events_by_week, [
    { week_start: '2024-01-01', event_count: 1 }, { week_start: '2024-01-08', event_count: 1 },
  ]);
  assert.equal(result.ordered.at(-1)!.observationId, 'later');
  assert.equal(events[0].observationId, 'later'); // Does not mutate caller ordering.
});

test('UTC weekly bins cross year boundaries without locale-dependent parsing', () => {
  assert.equal(utcWeek('2023-01-01T23:59:59.000Z'), '2022-12-26');
  assert.equal(utcWeek('2023-01-02T00:00:00.000Z'), '2023-01-02');
  const result = aggregate([event('new', { timestamp: '2024-01-01T00:00:00.000Z' }), event('old', { timestamp: '2023-12-31T23:59:59.000Z' })]);
  assert.deepEqual(result.anonymous.events_by_year, { '2023': 1, '2024': 1 });
  assert.deepEqual(result.anonymous.events_by_month, { '2023-12': 1, '2024-01': 1 });
  assert.equal(Object.values(result.anonymous.events_by_week).reduce((a, b) => a + b, 0), 2);
});
