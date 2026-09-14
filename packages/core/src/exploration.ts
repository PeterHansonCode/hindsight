import type { EventRecord } from './domain.ts';
import type { InstagramSideTableBundle } from './instagram-side-tables.ts';
import { aggregate, sortEvents, utcWeek } from './aggregate.ts';

const DAY = 86_400_000, WEEK = 7 * DAY;
export const BRISBANE_OFFSET = 10 * 3_600_000;
const channels = ['combined', 'saved', 'liked'] as const;
type Channel = typeof channels[number];
const inChannel = (e: EventRecord, c: Channel) => c === 'combined' || e.activity.event_type === c;
const day = (t: number) => new Date(t).toISOString().slice(0, 10);
const key = (e: EventRecord) => e.activity.creator_id === null ? null : JSON.stringify([e.activity.platform, e.activity.creator_id]);
const rate = (n: number, d: number) => d ? n / d : null;
const increment = (map: Map<string, number>, k: string, n = 1) => map.set(k, (map.get(k) ?? 0) + n);
const entries = (map: Map<string, number>) => [...map].sort(([a], [b]) => a.localeCompare(b));
const histogram = (values: string[]) => { const m = new Map<string, number>(); for (const v of values) increment(m, v); return entries(m).map(([value, count]) => ({ value, count })); };
export function distribution(values: number[]) {
  const a = [...values].sort((x, y) => x - y);
  const q = (p: number) => { if (!a.length) return null; const i = (a.length - 1) * p, lo = Math.floor(i); return a[lo] + (a[Math.ceil(i)] - a[lo]) * (i - lo); };
  return { n: a.length, min: a[0] ?? null, p25: q(.25), median: q(.5), p75: q(.75), p90: q(.9), max: a.at(-1) ?? null, mean: a.length ? a.reduce((s, v) => s + v, 0) / a.length : null };
}
export function timeProfile(events: readonly EventRecord[]) {
  const hours = Array<number>(24).fill(0), weekdays = Array<number>(7).fill(0);
  let weekday09to15 = 0;
  for (const e of events) {
    const d = new Date(Date.parse(e.activity.timestamp) + BRISBANE_OFFSET), h = d.getUTCHours(), wd = (d.getUTCDay() + 6) % 7;
    hours[h]++; weekdays[wd]++; if (wd < 5 && h >= 9 && h < 15) weekday09to15++;
  }
  return { n: events.length, hours, weekdaysMondayFirst: weekdays, weekday09to15, weekday09to15Share: rate(weekday09to15, events.length) };
}
export function weeklyActivity(events: readonly EventRecord[]) {
  const ordered = sortEvents(events); if (!ordered.length) return [];
  const byWeek = new Map<string, { saved: number; liked: number }>();
  for (const e of ordered) { const w = utcWeek(e.activity.timestamp), row = byWeek.get(w) ?? { saved: 0, liked: 0 }; if (e.activity.event_type === 'saved') row.saved++; else row.liked++; byWeek.set(w, row); }
  const start = Date.parse(utcWeek(ordered[0].activity.timestamp)), end = Date.parse(utcWeek(ordered.at(-1)!.activity.timestamp));
  const rows = [];
  for (let t = start; t <= end; t += WEEK) { const c = byWeek.get(day(t)) ?? { saved: 0, liked: 0 }; rows.push({ week: day(t), ...c, combined: c.saved + c.liked, edge: t === start || t === end }); }
  return rows;
}
export function lowRuns(weeks: ReturnType<typeof weeklyActivity>, channel: Channel, maximum: number, minimumWeeks = 4) {
  const runs: { start: string; endInclusive: string; weeks: number; events: number; emptyWeeks: number; maximumPerWeek: number }[] = [];
  let run: typeof weeks = [];
  const flush = () => { if (run.length >= minimumWeeks) runs.push({ start: run[0].week, endInclusive: day(Date.parse(run.at(-1)!.week) + 6 * DAY), weeks: run.length, events: run.reduce((n, r) => n + r[channel], 0), emptyWeeks: run.filter(r => r[channel] === 0).length, maximumPerWeek: Math.max(...run.map(r => r[channel])) }); run = []; };
  for (const row of weeks) { if (!row.edge && row[channel] <= maximum) run.push(row); else flush(); } flush(); return runs;
}
export function sessionize(events: readonly EventRecord[], gapMinutes: number) {
  if (!Number.isFinite(gapMinutes) || gapMinutes <= 0) throw new Error('Invalid session gap.');
  const ordered = sortEvents(events);
  const sessions: { start: string; end: string; events: number; saved: number; liked: number; spanMinutes: number }[] = [];
  for (const e of ordered) {
    let s = sessions.at(-1);
    if (!s || Date.parse(e.activity.timestamp) - Date.parse(s.end) > gapMinutes * 60_000) { s = { start: e.activity.timestamp, end: e.activity.timestamp, events: 0, saved: 0, liked: 0, spanMinutes: 0 }; sessions.push(s); }
    s.end = e.activity.timestamp; s.events++; if (e.activity.event_type === 'saved') s.saved++; else s.liked++;
    s.spanMinutes = (Date.parse(s.end) - Date.parse(s.start)) / 60_000;
  }
  return sessions;
}
function calendarPeriods(events: readonly EventRecord[], unit: 'month' | 'quarter' | 'year') {
  if (!events.length) return [];
  const min = events[0].activity.timestamp, max = events.at(-1)!.activity.timestamp;
  let y = Number(min.slice(0, 4)), m = unit === 'year' ? 0 : Number(min.slice(5, 7)) - 1;
  if (unit === 'quarter') m = Math.floor(m / 3) * 3;
  const rows: { period: string; start: number; end: number }[] = [];
  while (Date.UTC(y, m) <= Date.parse(max)) {
    const step = unit === 'year' ? 12 : unit === 'quarter' ? 3 : 1, start = Date.UTC(y, m), end = Date.UTC(y, m + step);
    rows.push({ period: unit === 'year' ? String(y) : unit === 'quarter' ? `${y}-Q${m / 3 + 1}` : `${y}-${String(m + 1).padStart(2, '0')}`, start, end });
    const next = new Date(end); y = next.getUTCFullYear(); m = next.getUTCMonth();
  }
  return rows;
}
export function exploreInstagram(eventsInput: readonly EventRecord[], bundle: InstagramSideTableBundle, options: { exportDate: string | null; knownMonth?: string; coverage?: { parseStatus: string; quarantineStatus: string; diagnosticCounts: { code: string; count: number }[] } }) {
  const events = sortEvents(eventsInput.filter(e => e.activity.event_type === 'saved' || e.activity.event_type === 'liked'));
  if (options.knownMonth && !/^\d{4}-(0[1-9]|1[0-2])$/.test(options.knownMonth)) throw new Error('Invalid known month.');
  const table = (name: string) => bundle.tables.find(t => t.name === `instagram.${name}`)!.rows;
  const extras = new Map(table('post_extras').map(r => [String(r.observationId), r]));
  const creatorTotals = new Map<string, number>();
  for (const e of events) { const k = key(e); if (k !== null) increment(creatorTotals, k); }
  function summary(rows: readonly EventRecord[]) {
    const saved = rows.filter(e => e.activity.event_type === 'saved').length;
    return { events: rows.length, saved, liked: rows.length - saved, saveShare: rate(saved, rows.length), knownCreators: new Set(rows.map(key).filter(k => k !== null)).size, first: rows[0]?.activity.timestamp ?? null, last: rows.at(-1)?.activity.timestamp ?? null };
  }
  function channelDetail(rows: readonly EventRecord[]) {
    const tags = new Map<string, number>(); let withTags = 0, rawTags = 0;
    const formats = new Map<string, number>(), localTotals = new Map<string, number>();
    for (const e of rows) { const ex = extras.get(e.observationId), list = (ex?.hashtags ?? []) as string[]; rawTags += list.length; if (list.length) withTags++;
      for (const t of new Set(list)) increment(tags, t);
      increment(formats, String(ex?.post_type ?? 'unknown'));
      const k = key(e); if (k !== null) increment(localTotals, k);
    }
    let globalRare = 0, periodRare = 0, unknown = 0;
    for (const e of rows) { const k = key(e); if (k === null) unknown++; else { if (creatorTotals.get(k)! <= 2) globalRare++; if (localTotals.get(k)! <= 2) periodRare++; } }
    return { ...summary(rows), withTags, hashtagCoverage: rate(withTags, rows.length), rawHashtagTokens: rawTags, distinctHashtagPresences: [...tags.values()].reduce((s, n) => s + n, 0), hashtags: [...tags].sort(([a, n], [b, m]) => m - n || a.localeCompare(b)).map(([tag, count]) => ({ tag, count })), formats: Object.fromEntries(entries(formats)), globalOnceOrTwiceEvents: globalRare, globalThreePlusEvents: rows.length - globalRare - unknown, withinPeriodOnceOrTwiceEvents: periodRare, unknownCreatorEvents: unknown, time: timeProfile(rows) };
  }
  const periods = (unit: 'month' | 'quarter' | 'year') => calendarPeriods(events, unit).map(p => {
    const rows = events.filter(e => Date.parse(e.activity.timestamp) >= p.start && Date.parse(e.activity.timestamp) < p.end);
    return { period: p.period, start: day(p.start), endExclusive: day(p.end), firstObservedPeriod: p.start <= Date.parse(events[0].activity.timestamp) && Date.parse(events[0].activity.timestamp) < p.end, exportLimited: options.exportDate === null ? null : p.end > Date.parse(options.exportDate) + DAY,
      ...summary(rows), channels: Object.fromEntries(channels.map(c => [c, channelDetail(rows.filter(e => inChannel(e, c)))])) as Record<Channel, ReturnType<typeof channelDetail>> };
  });
  const years = periods('year'), quarters = periods('quarter'), months = periods('month');
  const weekly = weeklyActivity(events);
  const monthlyDominance = months.map(m => ({ month: m.period, saved: m.saved, liked: m.liked, dominance: m.events === 0 ? 'no observations' : m.saved === m.liked ? 'tie' : m.saved > m.liked ? 'saved' : 'liked' }));
  let suffix = monthlyDominance.length;
  while (suffix > 0 && monthlyDominance[suffix - 1].dominance === 'saved') suffix--;
  const transition = { firstSaveMajorityMonth: monthlyDominance.find(m => m.dominance === 'saved')?.month ?? null, finalSaveMajorityRunStart: suffix < monthlyDominance.length ? monthlyDominance[suffix].month : null, precedingMonth: suffix > 0 && suffix < monthlyDominance.length ? monthlyDominance[suffix - 1] : null, months: monthlyDominance };
  const collectionRows = [...table('collections')].sort((a, b) => String(a.createdAt ?? '9999').localeCompare(String(b.createdAt ?? '9999')) || String(a.collectionId).localeCompare(String(b.collectionId)));
  const placements = table('placements'), memberships = new Map<string, Set<string>>(), postFolders = new Map<string, Set<string>>();
  for (const p of placements) {
    if (typeof p.postKey === 'string') { const set = postFolders.get(p.postKey) ?? new Set<string>(); set.add(String(p.collectionId)); postFolders.set(p.postKey, set); }
    if (typeof p.savedObservationId === 'string') { const set = memberships.get(p.savedObservationId) ?? new Set<string>(); set.add(String(p.collectionId)); memberships.set(p.savedObservationId, set); }
  }
  const reference = options.exportDate === null ? null : Date.parse(options.exportDate) + DAY;
  const saved = events.filter(e => e.activity.event_type === 'saved'), unfiled = saved.filter(e => !memberships.has(e.observationId));
  const age = (e: EventRecord) => reference === null ? null : (reference - Date.parse(e.activity.timestamp)) / DAY;
  const ageBins = [[0, 30], [30, 90], [90, 180], [180, 365], [365, 730], [730, Infinity]];
  const ageRows = (rows: EventRecord[]) => ageBins.map(([lo, hi]) => ({ daysFrom: lo, daysToExclusive: Number.isFinite(hi) ? hi : null, count: rows.filter(e => { const a = age(e); return a !== null && a >= lo && a < hi; }).length }));
  const collections = collectionRows.map((c, i) => {
    const ps = placements.filter(p => p.collectionId === c.collectionId), unique = [...new Map(ps.filter(p => typeof p.postKey === 'string').map(p => [p.postKey, p])).values()];
    const dated = unique.filter(p => typeof p.savedAt === 'string' && typeof c.createdAt === 'string');
    const lags = dated.map(p => (Date.parse(String(c.createdAt)) - Date.parse(String(p.savedAt))) / DAY);
    return { rank: i + 1, collectionId: String(c.collectionId), name: c.collection_name, createdAt: c.createdAt as string | null, updatedAt: c.updatedAt, placements: ps.length, uniquePosts: unique.length, unidentifiedPlacements: ps.filter(p => typeof p.postKey !== 'string').length, matched: unique.filter(p => p.joinStatus === 'matched').length, unmatched: unique.filter(p => p.joinStatus === 'unmatched_placement').length, ambiguous: unique.filter(p => p.joinStatus === 'ambiguous_join').length, datedPairs: dated.length, savedBeforeCreation: lags.filter(n => n > 0).length, savedAtLeast30DaysBefore: lags.filter(n => n >= 30).length, savedAtLeast90DaysBefore: lags.filter(n => n >= 90).length, savedAtLeast365DaysBefore: lags.filter(n => n >= 365).length, preCreationLagDays: distribution(lags.filter(n => n > 0)), lowerBoundFilingLagDays: distribution(lags.map(n => Math.max(0, n))) };
  });
  const pairs = new Map<string, number>();
  for (const set of postFolders.values()) { const ids = [...set].sort(); for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) increment(pairs, JSON.stringify([ids[i], ids[j]])); }
  const overlap = [...pairs].map(([pair, sharedPosts]) => { const [a, b] = JSON.parse(pair) as string[], ca = collections.find(c => c.collectionId === a)!, cb = collections.find(c => c.collectionId === b)!; return { a: Math.min(ca.rank, cb.rank), b: Math.max(ca.rank, cb.rank), sharedPosts, jaccard: sharedPosts / (ca.uniquePosts + cb.uniquePosts - sharedPosts) }; }).sort((a, b) => b.sharedPosts - a.sharedPosts || a.a - b.a || a.b - b.b);
  const segments: { label: string; start: string | null; endExclusive: string | null; extendsOutsideObservedRange: boolean; channels: Record<Channel, ReturnType<typeof channelDetail>> }[] = [];
  function segment(label: string, start: string | null, end: string | null) {
    const rows = events.filter(e => (start === null || e.activity.timestamp >= start) && (end === null || e.activity.timestamp < end));
    segments.push({ label, start, endExclusive: end, extendsOutsideObservedRange: !events.length || start !== null && start < events[0].activity.timestamp || end !== null && end > events.at(-1)!.activity.timestamp, channels: Object.fromEntries(channels.map(c => [c, channelDetail(rows.filter(e => inChannel(e, c)))])) as Record<Channel, ReturnType<typeof channelDetail>> });
  }
  if (options.knownMonth) {
    // A supplied month is a window, not a guessed day. Calendar bounds are Brisbane.
    const [y, m] = options.knownMonth.split('-').map(Number), start = new Date(Date.UTC(y, m - 1) - BRISBANE_OFFSET).toISOString(), end = new Date(Date.UTC(y, m) - BRISBANE_OFFSET).toISOString();
    segment('before supplied month', null, start); segment('supplied month', start, end); segment('after supplied month', end, null);
    segment('12 months before supplied month', new Date(Date.UTC(y - 1, m - 1) - BRISBANE_OFFSET).toISOString(), start);
    segment('12 months after supplied month', end, new Date(Date.UTC(y + 1, m) - BRISBANE_OFFSET).toISOString());
  }
  const firstFolder = collections.find(c => c.createdAt !== null)?.createdAt ?? null;
  if (firstFolder) { segment('before earliest retained folder creation', null, firstFolder); segment('at or after earliest retained folder creation', firstFolder, null); }
  if (transition.finalSaveMajorityRunStart) { const cut = `${transition.finalSaveMajorityRunStart}-01T00:00:00.000Z`; segment('before final save-majority monthly run', null, cut); segment('during final save-majority monthly run', cut, null); }
  const gaps = Object.fromEntries(channels.map(c => [c, { zero: lowRuns(weekly, c, 0), atMostFour: lowRuns(weekly, c, 4) }])) as Record<Channel, { zero: ReturnType<typeof lowRuns>; atMostFour: ReturnType<typeof lowRuns> }>;
  const exactGaps = Object.fromEntries(channels.map(c => {
    const rows = events.filter(e => inChannel(e, c));
    return [c, rows.slice(1).flatMap((e, i) => { const elapsedDays = (Date.parse(e.activity.timestamp) - Date.parse(rows[i].activity.timestamp)) / DAY;
      return elapsedDays >= 28 ? [{ precedingObservation: rows[i].activity.timestamp, nextObservation: e.activity.timestamp, elapsedDays }] : []; })];
  })) as Record<Channel, { precedingObservation: string; nextObservation: string; elapsedDays: number }[]>;
  for (const gap of gaps.combined.atMostFour) {
    const end = new Date(Date.parse(gap.endInclusive) + DAY).toISOString(), start = `${gap.start}T00:00:00.000Z`;
    segment(`low-count interval ${gap.start}`, start, end);
    segment(`4 weeks before low-count interval ${gap.start}`, new Date(Date.parse(start) - 4 * WEEK).toISOString(), start);
    segment(`4 weeks after low-count interval ${gap.start}`, end, new Date(Date.parse(end) + 4 * WEEK).toISOString());
  }
  const sessions = channels.flatMap(c => [15, 30, 60].map(gapMinutes => {
    const rows = sessionize(events.filter(e => inChannel(e, c)), gapMinutes);
    const monthKeys = calendarPeriods(events.map(e => ({ ...e, activity: { ...e.activity, timestamp: new Date(Date.parse(e.activity.timestamp) + BRISBANE_OFFSET).toISOString() } })), 'month').map(p => p.period), local = (s: typeof rows[number]) => new Date(Date.parse(s.start) + BRISBANE_OFFSET).toISOString();
    // Add local months outside UTC bounds, when a boundary-crossing event needs one.
    for (const s of rows) if (!monthKeys.includes(local(s).slice(0, 7))) monthKeys.push(local(s).slice(0, 7));
    const summaries = (period: string) => { const selected = rows.filter(s => local(s).startsWith(period)); return { period, sessions: selected.length, events: selected.reduce((n, s) => n + s.events, 0), eventsPerSession: distribution(selected.map(s => s.events)), spanMinutes: distribution(selected.map(s => s.spanMinutes)) }; };
    return { channel: c, gapMinutes, sessionCount: rows.length, singleEventSessions: rows.filter(s => s.events === 1).length, mixedSessions: rows.filter(s => s.saved && s.liked).length, eventsPerSession: distribution(rows.map(s => s.events)), spanMinutes: distribution(rows.map(s => s.spanMinutes)), months: monthKeys.sort().map(summaries), years: [...new Set(monthKeys.map(m => m.slice(0, 4)))].sort().map(summaries) };
  }));
  const localYearKeys = [...new Set(events.map(e => new Date(Date.parse(e.activity.timestamp) + BRISBANE_OFFSET).getUTCFullYear()))].sort();
  const localTimeByYear = localYearKeys.map(year => ({ year, channels: Object.fromEntries(channels.map(c => [c, timeProfile(events.filter(e => inChannel(e, c) && new Date(Date.parse(e.activity.timestamp) + BRISBANE_OFFSET).getUTCFullYear() === year))])) as Record<Channel, ReturnType<typeof timeProfile>> }));
  const creators = aggregate(events).creators.map(c => ({ ...c, activeWeeks: c.events_by_week.length, years: histogram(events.filter(e => e.activity.creator_id === c.creator_id && e.activity.platform === c.platform).map(e => e.activity.timestamp.slice(0, 4))), gapWeeks: c.events_by_week.slice(1).map((w, i) => ({ previous: c.events_by_week[i].week_start, next: w.week_start, unobservedWeeks: Math.round((Date.parse(w.week_start) - Date.parse(c.events_by_week[i].week_start)) / WEEK) - 1 })) })).sort((a, b) => b.activeWeeks - a.activeWeeks || b.event_count - a.event_count || a.creator_id.localeCompare(b.creator_id));
  const exactTimes = histogram(events.map(e => e.activity.timestamp)).filter(r => r.count > 1).sort((a, b) => b.count - a.count);
  const postActions = new Map<string, EventRecord[]>();
  for (const e of events) { const post = extras.get(e.observationId)?.postKey; if (typeof post === 'string') { const rows = postActions.get(post) ?? []; rows.push(e); postActions.set(post, rows); } }
  const both = [...postActions.values()].filter(rows => rows.some(e => e.activity.event_type === 'saved') && rows.some(e => e.activity.event_type === 'liked'));
  const likeToSaveDays = both.map(rows => (Date.parse(rows.find(e => e.activity.event_type === 'saved')!.activity.timestamp) - Date.parse(rows.find(e => e.activity.event_type === 'liked')!.activity.timestamp)) / DAY);
  const tvDates = channels.map(c => ({ channel: c, ...summary(events.filter(e => inChannel(e, c) && extras.get(e.observationId)?.post_type === 'tv')) }));
  const retrospectiveUnique = new Set(placements.filter(p => typeof p.savedObservationId === 'string' && typeof p.savedAt === 'string' && collections.some(c => c.collectionId === p.collectionId && c.createdAt !== null && c.createdAt > String(p.savedAt))).map(p => String(p.savedObservationId)));
  return { schemaVersion: 1, sensitivity: 'personal', warning: 'This reveals interests, beliefs and affiliations. Source strings remain untrusted. One retained snapshot is not a complete history.',
    snapshotId: bundle.snapshotId, exportDate: options.exportDate, coverage: options.coverage ?? null, calendarTimezone: 'UTC', timeOfDayTimezone: 'Australia/Brisbane (UTC+10; no daylight saving)', knownMonth: options.knownMonth ?? null,
    totals: summary(events), years, quarters, months, weekly, transition, gaps, exactGaps, segments, localTimeByYear, sessions,
    filing: { savedObservations: saved.length, matchedFiledObservations: saved.length - unfiled.length, unfiledObservations: unfiled.length, referenceExclusive: reference === null ? null : new Date(reference).toISOString(), unfiledAgeDays: distribution(unfiled.map(age).filter((n): n is number => n !== null)), unfiledAgeBins: ageRows(unfiled), filedAgeBins: ageRows(saved.filter(e => memberships.has(e.observationId))), negativeAgeCount: saved.filter(e => (age(e) ?? 0) < 0).length,
      byYear: years.map(y => { const rows = saved.filter(e => e.activity.timestamp.startsWith(y.period)), n = rows.filter(e => !memberships.has(e.observationId)).length; return { year: y.period, saved: rows.length, unfiled: n, shareUnfiled: rate(n, rows.length) }; }),
      placementCount: placements.length, uniquePlacementPosts: postFolders.size, postsInMultipleFolders: [...postFolders.values()].filter(s => s.size > 1).length, placementStatuses: histogram(placements.map(p => String(p.joinStatus))),
      collectionSizes: distribution(collections.map(c => c.uniquePosts)), collectionSizeHistogram: histogram(collections.map(c => String(c.uniquePosts))), collections, overlap, uniqueSavedPredatingAtLeastOneFolder: retrospectiveUnique.size },
    creators, other: { bothActionsSamePost: both.length, likeToSaveDays: distribution(likeToSaveDays), savedAfterLike: likeToSaveDays.filter(n => n > 0).length, savedBeforeLike: likeToSaveDays.filter(n => n < 0).length, sameTimestamp: likeToSaveDays.filter(n => n === 0).length, timestampCollisions: exactTimes, tvDates },
  };
}
export type InstagramExploration = ReturnType<typeof exploreInstagram>;
