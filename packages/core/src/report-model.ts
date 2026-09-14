import type { EventRecord } from './domain.ts';
import type { creatorLifecycles, LifecycleChannel } from './lifecycles.ts';
import type { folderBurstGrid } from './bursts.ts';
import { localCalendar, DAY } from './lifecycles.ts';

type Lifecycle = ReturnType<typeof creatorLifecycles>;
export type GridRun = ReturnType<typeof folderBurstGrid>['runs'][number];
type Bar = GridRun['lanes'][number]['detection']['qualifiedBars'][number];
export function intervalAgreement(bar: Bar, lane: GridRun['lanes'][number], runs: GridRun[]) {
  const primaryRuns = runs.filter(r => r.denominator === 'all-saves');
  const keys = new Set(primaryRuns.map(r => `${r.s}/${r.gamma}`));
  const complete = primaryRuns.length === 9 && [1.5, 2, 3].every(s => [0.5, 1, 2].every(g => keys.has(`${s}/${g}`)))
    && primaryRuns.every(r => r.lanes.some(l => l.collectionRef.collectionId === lane.collectionRef.collectionId));
  const contributors = primaryRuns.map(r => ({ s: r.s, gamma: r.gamma, intervals: (r.lanes.find(l => l.collectionRef.collectionId === lane.collectionRef.collectionId)?.detection.qualifiedBars ?? []).filter(b => b.level === bar.level && b.startWeek <= bar.endWeek && b.endWeek >= bar.startWeek).map(b => ({ start: b.startWeek, end: b.endExclusive.slice(0, 10) })) }));
  const exact = contributors.filter(c => c.intervals.some(i => i.start === bar.startWeek && i.end === bar.endExclusive.slice(0, 10))).length;
  const overlap = contributors.filter(c => c.intervals.length).length;
  const tier = !complete ? 'agreement not assessed' : exact === 9 ? 'exact-stable' : overlap === 9 ? 'overlap-stable' : 'primary-only';
  const all = contributors.flatMap(c => c.intervals), starts = all.map(i => Date.parse(i.start)), ends = all.map(i => Date.parse(i.end));
  const envelope = all.length ? { earliestStart: Math.min(...starts), latestStart: Math.max(...starts), earliestEnd: Math.min(...ends), latestEnd: Math.max(...ends) } : { earliestStart: Date.parse(bar.startWeek), latestStart: Date.parse(bar.startWeek), earliestEnd: Date.parse(bar.endExclusive), latestEnd: Date.parse(bar.endExclusive) };
  // Configurations vote once per assessed week, even when multiple candidates overlap it.
  const cells = lane.weeks.map(w => ({ week: w.week, time: Date.parse(w.week), votes: w.status === 'assessed' && w.denominator > 0 ? contributors.filter(c => c.intervals.some(i => i.start <= w.week && w.week < i.end)).length : 0, assessed: w.status === 'assessed' && w.denominator > 0 }));
  const secondary = runs.find(r => r.denominator === 'filed-saves' && r.s === 2 && r.gamma === 1)?.lanes.find(l => l.collectionRef.collectionId === lane.collectionRef.collectionId)?.detection.qualifiedBars ?? [];
  return { ...bar, tier, exact, overlap, contributors, envelope, cells, secondaryExact: secondary.some(b => b.level === bar.level && b.startWeek === bar.startWeek && b.endWeek === bar.endWeek), secondaryOverlap: secondary.some(b => b.level === bar.level && b.startWeek <= bar.endWeek && b.endWeek >= bar.startWeek) };
}

export function makeReportModel(events: EventRecord[], lifecycles: Lifecycle[], runs: GridRun[], metadata: { snapshotId: string; exportDate: string; observationSha256: string; parseStatus: string }) {
  const calendar = localCalendar(), sorted = events.slice().sort((a, b) => a.activity.timestamp.localeCompare(b.activity.timestamp));
  const first = sorted[0]?.activity.timestamp ?? null, last = sorted.at(-1)?.activity.timestamp ?? null;
  const firstYear = first ? Number(first.slice(0, 4)) : Number(metadata.exportDate.slice(0, 4)), lastYear = Number(metadata.exportDate.slice(0, 4));
  const years = Array.from({ length: lastYear - firstYear + 1 }, (_, i) => ({ year: firstYear + i, saved: 0, liked: 0, partial: firstYear + i === firstYear || firstYear + i === lastYear, months: Array.from({ length: 12 }, (_, j) => ({ month: j + 1, saved: 0, liked: 0 })) }));
  for (const e of events) { const a = e.activity, y = years.find(y => y.year === Number(a.timestamp.slice(0, 4))); if (y && (a.event_type === 'saved' || a.event_type === 'liked')) { y[a.event_type]++; y.months[Number(a.timestamp.slice(5, 7)) - 1][a.event_type]++; } }
  const creatorEvents = new Map<string, EventRecord[]>();
  for (const e of events) { if (e.activity.creator_id === null) continue; const key = JSON.stringify([e.activity.platform, e.activity.creator_id]); const rows = creatorEvents.get(key) ?? []; rows.push(e); creatorEvents.set(key, rows); }
  const creators = lifecycles.map(l => ({ channel: l.config.channel, singletonCreators: l.singletonCreators, unknownObservations: l.unknownObservations, config: l.config, coverage: l.coverage, lastRecorded: sorted.filter(e => l.config.channel === 'combined' || e.activity.event_type === l.config.channel).at(-1)?.activity.timestamp ?? null, rows: l.rows.map(r => {
    const records = (creatorEvents.get(JSON.stringify([r.creatorRef.platform, r.creatorRef.creatorId])) ?? []).filter(e => l.config.channel === 'combined' || e.activity.event_type === l.config.channel).map(e => ({ time: e.activity.timestamp, channel: e.activity.event_type, month: calendar.day(Date.parse(e.activity.timestamp)).slice(0, 7) }));
    const { activeMonthsByWindow, observationCoverage, snapshotRefs, configRef, ...detail } = r;
    // Keep selected monthly evidence compact rather than copy repeated coverage/config into every month cell.
    return { ...detail, records, monthlyWindows: activeMonthsByWindow.slice(-1).map(w => [w.month, w.activeMonths, w.band, w.lowerBound, w.partial]) };
  }) }));
  const primary = runs.find(r => r.denominator === 'all-saves' && r.s === 2 && r.gamma === 1);
  const sessionByTime = new Map<number, number>(); let session = 0, prior = -Infinity;
  const cutoff = lifecycles.find(l => l.config.channel === 'saved')?.config.sessionSeconds ?? 3600;
  for (const e of sorted.filter(e => e.activity.event_type === 'saved')) { const t = Date.parse(e.activity.timestamp); if (t - prior > cutoff * 1000) session++; sessionByTime.set(t, session); prior = t; }
  const folders = (primary?.lanes ?? []).map((l, index) => {
    const times = l.weeks.flatMap(w => w.timestamps).sort((a, b) => a - b), assessed = l.weeks.filter(w => w.status === 'assessed'), eligibleTimes = assessed.flatMap(w => w.timestamps);
    return { id: String(l.collectionRef.collectionId), name: String(l.collectionRef.name ?? 'Unnamed folder'), order: index, createdAt: l.createdAt,
      weeks: l.weeks.map(w => ({ week: w.week, numerator: w.numerator, denominator: w.denominator, filed: w.filed, total: w.total, status: w.status })),
      bars: l.detection.qualifiedBars.map(b => intervalAgreement(b, l, runs)),
      summary: { records: times.length, eligibleRecords: eligibleTimes.length, excludedRecords: times.length - eligibleTimes.length, first: times.length ? new Date(times[0]).toISOString() : null, last: times.length ? new Date(times.at(-1)!).toISOString() : null, assessedWeeks: assessed.length, activeWeeks: assessed.filter(w => w.numerator > 0).length, activeMonths: new Set(eligibleTimes.map(t => calendar.day(t).slice(0, 7))).size, distinctSessions: new Set(eligibleTimes.map(t => sessionByTime.get(t)).filter(n => n !== undefined)).size, distinctDays: new Set(eligibleTimes.map(calendar.day)).size, unmatched: l.descriptive.excludedPlacementsWithoutMatchedObservation, otherSettings: runs.filter(r => r.lanes.find(x => x.collectionRef.collectionId === l.collectionRef.collectionId)?.detection.qualifiedBars.length).map(r => ({ denominator: r.denominator, s: r.s, gamma: r.gamma })) } };
  }).sort((a, b) => b.summary.activeMonths - a.summary.activeMonths || b.summary.activeWeeks - a.summary.activeWeeks || b.summary.distinctSessions - a.summary.distinctSessions || a.id.localeCompare(b.id));
  const outer = folders.flatMap(f => f.bars.filter(b => b.level === 1));
  const minTime = first ? Date.parse(first) : Date.parse(metadata.exportDate), maxTime = last ? Date.parse(last) : minTime;
  return { format: 'hindsight.report', schemaVersion: 1, sensitivity: 'personal', metadata: { ...metadata, first, last, timeZone: 'Australia/Brisbane', generatedAt: new Date().toISOString() }, years, creators, folders,
    historyRange: { start: Date.UTC(new Date(minTime).getUTCFullYear(), 0, 1), end: Date.UTC(new Date(maxTime).getUTCFullYear() + 1, 0, 1) }, folderRange: { start: Date.parse('2025-12-01'), end: Date.parse(metadata.exportDate) + DAY },
    tiers: { exact: outer.filter(b => b.tier === 'exact-stable').length, overlap: outer.filter(b => b.tier === 'overlap-stable').length, primary: outer.filter(b => b.tier === 'primary-only').length, unassessed: outer.filter(b => b.tier === 'agreement not assessed').length }, observations: events.length };
}
export type ReportModel = ReturnType<typeof makeReportModel>;
