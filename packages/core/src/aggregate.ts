import type { EventRecord, Platform } from './domain.ts';

export interface CreatorAggregate {
  platform: Platform;
  creator_id: string;
  creator: string | null;
  event_count: number;
  first_seen: string;
  last_seen: string;
  events_by_week: { week_start: string; event_count: number }[];
}

export function utcWeek(timestamp: string): string {
  const date = new Date(timestamp);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 6) % 7);
  return date.toISOString().slice(0, 10);
}

const compare = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0;
export function sortEvents(events: readonly EventRecord[]): EventRecord[] {
  return [...events].sort((a, b) => compare(a.activity.timestamp, b.activity.timestamp)
    || compare(a.activity.platform, b.activity.platform)
    || compare(a.activity.event_type, b.activity.event_type)
    || compare(a.observationId, b.observationId));
}

export function aggregate(events: readonly EventRecord[]) {
  const ordered = sortEvents(events);
  const groups = new Map<string, CreatorAggregate>();
  const weeks = new Map<string, Map<string, number>>();
  const byPlatform = new Map<string, number>(), byType = new Map<string, number>();
  const byYear = new Map<string, number>(), byMonth = new Map<string, number>(), byWeek = new Map<string, number>();
  let unknownCreators = 0;
  const add = (map: Map<string, number>, key: string) => map.set(key, (map.get(key) ?? 0) + 1);
  for (const { activity: row } of ordered) {
    add(byPlatform, row.platform); add(byType, row.event_type);
    add(byYear, row.timestamp.slice(0, 4)); add(byMonth, row.timestamp.slice(0, 7));
    const week = utcWeek(row.timestamp); add(byWeek, week);
    if (row.creator_id === null) { unknownCreators++; continue; }
    // Display names are not identity. Even __proto__ is an ordinary Map key.
    const key = JSON.stringify([row.platform, row.creator_id]);
    let creator = groups.get(key);
    if (!creator) {
      creator = { platform: row.platform, creator_id: row.creator_id, creator: row.creator,
        event_count: 0, first_seen: row.timestamp, last_seen: row.timestamp, events_by_week: [] };
      groups.set(key, creator); weeks.set(key, new Map());
    }
    creator.event_count++; creator.last_seen = row.timestamp;
    if (row.creator !== null) creator.creator = row.creator;
    add(weeks.get(key)!, week);
  }
  for (const [key, creator] of groups) {
    creator.events_by_week = [...weeks.get(key)!].sort(([a], [b]) => compare(a, b))
      .map(([week_start, event_count]) => ({ week_start, event_count }));
  }
  const creators = [...groups.values()].sort((a, b) => b.event_count - a.event_count
    || compare(a.platform, b.platform) || compare(a.creator_id, b.creator_id));
  const histogram = new Map<number, number>();
  for (const creator of creators) histogram.set(creator.event_count, (histogram.get(creator.event_count) ?? 0) + 1);
  const counts = (map: Map<string, number>) => Object.fromEntries([...map].sort(([a], [b]) => compare(a, b)));
  // Allowlist aggregate fields; never derive anonymous data by stripping fields
  // from a document that already contains personal strings.
  const base = {
    schema_version: 1,
    scope: 'One retained export snapshot; not a complete account history.',
    timezone: 'UTC', event_count: ordered.length,
    first_observed: ordered[0]?.activity.timestamp ?? null,
    last_observed: ordered.at(-1)?.activity.timestamp ?? null,
    events_by_platform: counts(byPlatform), events_by_type: counts(byType),
    events_by_year: counts(byYear), events_by_month: counts(byMonth), events_by_week: counts(byWeek),
    known_creator_count: creators.length, events_without_creator_id: unknownCreators,
    creator_frequency_distribution: [...histogram].sort(([a], [b]) => a - b)
      .map(([event_count, creator_count]) => ({ event_count, creator_count })),
  };
  return {
    ordered, creators,
    anonymous: { ...base, sensitivity: 'low disclosure',
      warning: 'Contains aggregate activity patterns; low disclosure does not guarantee anonymity.' },
    detailed: { ...base, sensitivity: 'personal',
      warning: 'This reveals interests, beliefs and affiliations; share only with someone you would tell these things to directly.', creators },
  };
}
