import type { EventRecord } from './domain.ts';

export type LifecycleChannel = 'saved' | 'liked' | 'combined';
export const DAY = 86_400_000;
const iso = (t: number) => new Date(t).toISOString();
const compare = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0;
export function localCalendar(timeZone = 'Australia/Brisbane') {
  const formatter = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
  const parts = (t: number) => Object.fromEntries(formatter.formatToParts(t).filter(p => p.type !== 'literal').map(p => [p.type, Number(p.value)]));
  const day = (t: number) => { const p = parts(t); return `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`; };
  const month = (t: number) => { const p = parts(t); return p.year * 12 + p.month - 1; };
  const fromLocal = (y: number, m: number, d: number, h = 0, min = 0, sec = 0, ms = 0) => {
    const desired = Date.UTC(y, m, d, h, min, sec, ms); let t = desired;
    for (let i = 0; i < 6; i++) { const p = parts(t); const delta = desired - Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second, ms); if (!delta) return t; t += delta; }
    throw new Error('Local time is not uniquely representable; choose an unambiguous timezone/window.');
  };
  const monthStart = (m: number) => fromLocal(Math.floor(m / 12), m % 12, 1);
  const addMonths = (t: number, count: number) => {
    const p = parts(t), target = p.year * 12 + p.month - 1 + count, y = Math.floor(target / 12), m = target % 12;
    return fromLocal(y, m, Math.min(p.day, new Date(Date.UTC(y, m + 1, 0)).getUTCDate()), p.hour, p.minute, p.second, ((t % 1000) + 1000) % 1000);
  };
  return { day, month, monthStart, addMonths };
}
export function mondayWeek(t: number): string {
  const d = new Date(t); d.setUTCHours(0, 0, 0, 0); d.setUTCDate(d.getUTCDate() - (d.getUTCDay() + 6) % 7); return iso(d.getTime()).slice(0, 10);
}
export interface LifecycleConfig {
  channel: LifecycleChannel;
  snapshotRefs: string[];
  asOf: string;
  timeZone?: string;
  sessionSeconds?: number;
  sessionBasis?: string;
  rollingMonths?: number;
  newContactMonths?: number;
  audienceDays?: number;
  activationDays?: [number, number];
  followUpDays?: [number, number][];
  absenceDays?: number[];
  peakDays?: number;
}
export function creatorLifecycles(input: readonly EventRecord[], options: LifecycleConfig) {
  const config = { timeZone: 'Australia/Brisbane', sessionSeconds: 3600, sessionBasis: '60-minute convention; fit not yet assessed', rollingMonths: 12, newContactMonths: 12, audienceDays: 28, activationDays: [7, 30] as [number, number], followUpDays: [[7, 14], [30, 37], [90, 97]] as [number, number][], absenceDays: [30, 60, 90], peakDays: 28, ...options };
  const end = Date.parse(config.asOf), calendar = localCalendar(config.timeZone);
  if (!Number.isFinite(end) || !['saved', 'liked', 'combined'].includes(config.channel) || !config.snapshotRefs.length
    || ![config.sessionSeconds, config.audienceDays, config.peakDays, ...config.absenceDays].every(n => Number.isFinite(n) && n > 0)
    || ![config.rollingMonths, config.newContactMonths].every(n => Number.isInteger(n) && n > 0)
    || ![config.activationDays, ...config.followUpDays].every(([a, b]) => Number.isFinite(a) && Number.isFinite(b) && a >= 0 && b > a)) throw new Error('Invalid lifecycle settings.');
  const events = input.filter(e => (config.channel === 'combined' ? ['saved', 'liked'].includes(e.activity.event_type) : e.activity.event_type === config.channel) && Date.parse(e.activity.timestamp) <= end)
    .slice().sort((a, b) => compare(a.activity.timestamp, b.activity.timestamp) || compare(a.observationId, b.observationId));
  const start = events.length ? Date.parse(events[0].activity.timestamp) : end;
  const groups = new Map<string, { creatorRef: { platform: string; creatorId: string; name: string | null }; times: number[]; sessions: Set<number> }>();
  let session = 0, previous = -Infinity, unknownObservations = 0;
  for (const e of events) {
    const t = Date.parse(e.activity.timestamp); if (t - previous > config.sessionSeconds * 1000) session++; previous = t;
    const a = e.activity; if (a.creator_id === null) { unknownObservations++; continue; }
    const key = JSON.stringify([a.platform, a.creator_id]);
    const group = groups.get(key) ?? { creatorRef: { platform: a.platform, creatorId: a.creator_id, name: a.creator }, times: [], sessions: new Set<number>() };
    group.times.push(t); group.sessions.add(session); groups.set(key, group);
  }
  const coverage = { firstRecordedInChannel: events[0]?.activity.timestamp ?? null, asOf: config.asOf, completeness: 'Retained observations only. Absence here is not evidence of absence elsewhere.', currentMonthPartial: end < calendar.monthStart(calendar.month(end) + 1) - 1 };
  const rows = [...groups.values()].filter(g => g.times.length >= 2).map(g => {
    const ts = g.times, first = ts[0], last = ts.at(-1)!, months = new Set(ts.map(calendar.month));
    const followUpWindows = config.followUpDays.map(([a, b]) => ({ start: iso(first + a * DAY), endExclusive: iso(first + b * DAY), observations: ts.filter(t => t >= first + a * DAY && t < first + b * DAY).length, status: first + b * DAY > end ? 'not yet observable' : 'observable' }));
    const activeMonthsByWindow = [];
    for (let m = calendar.month(start); m <= calendar.month(end); m++) {
      const lower = m - config.rollingMonths + 1, count = [...months].filter(x => x >= lower && x <= m).length;
      activeMonthsByWindow.push({ month: `${Math.floor(m / 12)}-${String(m % 12 + 1).padStart(2, '0')}`, activeMonths: count, band: count === 0 ? '0' : count <= 5 ? '1–5' : count === 6 ? 'exactly 6' : '7+', lowerBound: calendar.monthStart(lower) < start, partial: m === calendar.month(end) && coverage.currentMonthPartial });
    }
    let left = 0, bestDays = -1, peakWindow = { startExclusive: '', endInclusive: '', activeDays: 0, observations: 0 };
    const dayCounts = new Map<string, number>();
    for (let right = 0; right < ts.length; right++) {
      const t = ts[right], d = calendar.day(t); dayCounts.set(d, (dayCounts.get(d) ?? 0) + 1);
      while (ts[left] <= t - config.peakDays * DAY) { const old = calendar.day(ts[left++]), n = dayCounts.get(old)! - 1; if (n) dayCounts.set(old, n); else dayCounts.delete(old); }
      // Evaluate all observations tied at this endpoint together.
      if (right + 1 < ts.length && ts[right + 1] === t) continue;
      if (dayCounts.size > bestDays) { bestDays = dayCounts.size; peakWindow = { startExclusive: iso(t - config.peakDays * DAY), endInclusive: iso(t), activeDays: bestDays, observations: right - left + 1 }; }
    }
    return { creatorRef: g.creatorRef, snapshotRefs: config.snapshotRefs, channel: config.channel, observationCount: ts.length, distinctDays: new Set(ts.map(calendar.day)).size, activeWeeks: new Set(ts.map(mondayWeek)).size, activeMonths: months.size, distinctSessions: g.sessions.size,
      firstRecorded: iso(first), lastRecorded: iso(last), daysSinceLastRecorded: (end - last) / DAY,
      absenceMarkers: config.absenceDays.map(days => ({ days, reached: end - last >= days * DAY })),
      newContactEpisodes: ts.filter((t, i) => i === 0 || t > calendar.addMonths(ts[i - 1], config.newContactMonths)).map(iso),
      anotherRecord7to30DaysLater: { observations: ts.filter(t => t > first && t >= first + config.activationDays[0] * DAY && t <= first + config.activationDays[1] * DAY).length, status: first + config.activationDays[1] * DAY > end ? 'not yet observable' : 'observable', elapsedDays: config.activationDays },
      followUpWindows, activeMonthsByWindow, peakWindow, observationCoverage: coverage, configRef: 'config' };
  }).sort((a, b) => b.activeMonths - a.activeMonths || b.activeWeeks - a.activeWeeks || b.distinctSessions - a.distinctSessions || compare(JSON.stringify(a.creatorRef && [a.creatorRef.platform, a.creatorRef.creatorId]), JSON.stringify([b.creatorRef.platform, b.creatorRef.creatorId])));
  return { sensitivity: 'personal', warning: 'Creator identities and activity can reveal interests, beliefs and affiliations.', config, coverage, observations: events.length, unknownObservations, knownCreators: groups.size, singletonCreators: [...groups.values()].filter(g => g.times.length === 1).length, repeatCreators: rows.length, creatorsRecordedLast28Days: [...groups.values()].filter(g => g.times.some(t => t > end - config.audienceDays * DAY)).length, sessionCount: session, rows };
}
export function lifecycleCounts(result: ReturnType<typeof creatorLifecycles>) {
  return { channel: result.config.channel, observations: result.observations, unknownObservations: result.unknownObservations, knownCreators: result.knownCreators, singletonCreators: result.singletonCreators, repeatCreators: result.repeatCreators, creatorsRecordedLast28Days: result.creatorsRecordedLast28Days, sessionCount: result.sessionCount,
    repeatCreatorsOnOneDate: result.rows.filter(r => r.distinctDays === 1).length,
    repeatCreatorsInOneSession: result.rows.filter(r => r.distinctSessions === 1).length,
    repeatCreatorsWithNewContactAfterGap: result.rows.filter(r => r.newContactEpisodes.length > 1).length,
    repeatCreatorsWith7to30DayRecord: result.rows.filter(r => r.anotherRecord7to30DaysLater.observations > 0).length,
    maximumActiveMonths: Math.max(0, ...result.rows.map(r => r.activeMonths)),
    latestWindowBands: ['0', '1–5', 'exactly 6', '7+'].map(band => ({ band, creators: result.rows.filter(r => r.activeMonthsByWindow.at(-1)?.band === band).length })) };
}
