import type { EventRecord } from './domain.ts';
import type { InstagramSideTableBundle } from './instagram-side-tables.ts';
import { DAY, localCalendar, mondayWeek } from './lifecycles.ts';

export interface RateWeek { week: string; numerator: number; denominator: number; timestamps: number[]; filed: number; total: number; status: string }
export interface BurstConfig { s: number; gamma: number; maxElevatedStates?: number; minimumObservations?: number; minimumDistinctDates?: number; timeZone?: string }
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
const transition = (a: number, b: number, gamma: number, T: number) => gamma * Math.max(0, b - a) * Math.log(Math.max(2, T));
function prefer(a: number[], b: number[]) {
  // Equal-cost paths: lower total intensity, then earlier upward boundaries, then lexicographic states.
  const intensity = sum(a) - sum(b); if (intensity) return intensity < 0;
  const boundaries = (p: number[]) => p.flatMap((x, i) => x > (p[i - 1] ?? 0) ? [i] : []);
  const aa = boundaries(a), bb = boundaries(b);
  for (let i = 0; i < Math.min(aa.length, bb.length); i++) if (aa[i] !== bb[i]) return aa[i] < bb[i];
  if (aa.length !== bb.length) return aa.length < bb.length;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] < b[i];
  return false;
}
export function fitRateSpan(weeks: RateWeek[], config: BurstConfig) {
  const { s, gamma, maxElevatedStates = 3 } = config;
  if (!(s > 1) || !Number.isFinite(s) || !(gamma >= 0) || !Number.isFinite(gamma) || !Number.isInteger(maxElevatedStates) || maxElevatedStates < 0 || maxElevatedStates > 3
    || !weeks.every(w => Number.isSafeInteger(w.numerator) && Number.isSafeInteger(w.denominator) && w.denominator > 0 && w.numerator >= 0 && w.numerator <= w.denominator)) throw new Error('Invalid rate span.');
  const total = sum(weeks.map(w => w.denominator)), relevant = sum(weeks.map(w => w.numerator)), p0 = total ? relevant / total : 0;
  if (!weeks.length || p0 === 0 || p0 === 1) return { baseline: p0, probabilities: [p0], states: weeks.map(() => 0), cost: 0, upwardPenalty: 0, identifiable: false };
  const probabilities = [p0]; for (let j = 1; j <= maxElevatedStates && p0 * s ** j < 1; j++) probabilities.push(p0 * s ** j);
  let previous = [{ cost: 0, states: [] as number[] }];
  for (const w of weeks) {
    previous = probabilities.map((p, state) => {
      const emission = -w.numerator * Math.log(p) - (w.denominator - w.numerator) * Math.log1p(-p);
      let best = { cost: Infinity, states: [] as number[] };
      for (const prior of previous) {
        const cost = prior.cost + transition(prior.states.at(-1) ?? 0, state, gamma, weeks.length) + emission, states = [...prior.states, state];
        if (cost < best.cost || cost === best.cost && prefer(states, best.states)) best = { cost, states };
      }
      return best;
    });
  }
  const best = previous.reduce((a, b) => b.cost < a.cost || b.cost === a.cost && prefer(b.states, a.states) ? b : a);
  return { baseline: p0, probabilities, states: best.states, cost: best.cost, upwardPenalty: sum(best.states.map((s, i) => transition(best.states[i - 1] ?? 0, s, gamma, weeks.length))), identifiable: probabilities.length > 1 };
}
export function detectBursts(weeks: RateWeek[], settings: BurstConfig) {
  const config = { maxElevatedStates: 3, minimumObservations: 2, minimumDistinctDates: 2, timeZone: 'Australia/Brisbane', ...settings };
  if (![config.minimumObservations, config.minimumDistinctDates].every(n => Number.isSafeInteger(n) && n >= 2)) throw new Error('Invalid support settings.');
  const calendar = localCalendar(config.timeZone);
  const segments: RateWeek[][] = []; let segment: RateWeek[] = [];
  for (const w of weeks) {
    if (w.status !== 'assessed' || w.denominator === 0) { if (segment.length) segments.push(segment); segment = []; continue; }
    if (segment.length && Date.parse(w.week) - Date.parse(segment.at(-1)!.week) !== 7 * DAY) { segments.push(segment); segment = []; }
    segment.push(w);
  }
  if (segment.length) segments.push(segment);
  const fits = segments.map(span => ({ start: span[0].week, end: span.at(-1)!.week, weeks: span, ...fitRateSpan(span, config) }));
  const candidates = fits.flatMap(fit => {
    const bars = [];
    for (let level = 1; level < fit.probabilities.length; level++) {
      for (let i = 0; i < fit.states.length; i++) {
        if (fit.states[i] < level) continue;
        const begin = i; while (i + 1 < fit.states.length && fit.states[i + 1] >= level) i++;
        const span = fit.weeks.slice(begin, i + 1), timestamps = span.flatMap(w => w.timestamps), observations = sum(span.map(w => w.numerator)), exposure = sum(span.map(w => w.denominator)), activeDays = new Set(timestamps.map(calendar.day)).size;
        const qualified = observations >= config.minimumObservations && activeDays >= config.minimumDistinctDates;
        bars.push({ startWeek: span[0].week, endWeek: span.at(-1)!.week, endExclusive: new Date(Date.parse(span.at(-1)!.week) + 7 * DAY).toISOString(), level, observations, activeDays, activeWeeks: span.filter(w => w.numerator > 0).length, exposure, baselineFraction: fit.baseline, observedFraction: observations / exposure, stateFraction: fit.probabilities[level], spanUpwardPenalty: fit.upwardPenalty, entryPenalty: transition(fit.states[begin - 1] ?? 0, fit.states[begin], config.gamma, fit.weeks.length), qualified, support: qualified ? 'At least two observations on two distinct local dates.' : 'Insufficient support: fewer than two observations or two distinct local dates.', evidence: 'Descriptive model evidence; no statistical confidence probability or personal phase claim.', touchesSpanStart: begin === 0, touchesSpanEnd: i === fit.weeks.length - 1, coverage: span.map(w => ({ week: w.week, filed: w.filed, total: w.total, fraction: w.total ? w.filed / w.total : null })), limitations: 'Current folder membership grouped by save date; incomplete retained coverage. Span edges may border unassessed weeks.' });
      }
    }
    return bars;
  });
  return { config, fits, candidates, qualifiedBars: candidates.filter(b => b.qualified), unassessedWeeks: weeks.filter(w => w.status !== 'assessed' || w.denominator === 0).map(w => ({ week: w.week, reason: w.status === 'assessed' ? 'zero exposure' : w.status })) };
}
export function folderRateLanes(events: readonly EventRecord[], bundle: InstagramSideTableBundle, options: { startDate: string; exportDate: string; denominator: 'all-saves' | 'filed-saves' }) {
  const start = Date.parse(options.startDate), endpointWeek = Date.parse(mondayWeek(Date.parse(options.exportDate)));
  if (!Number.isFinite(start) || !Number.isFinite(endpointWeek) || endpointWeek < start) throw new Error('Invalid folder window.');
  const saved = events.filter(e => e.activity.event_type === 'saved'), byId = new Map(saved.map(e => [e.observationId, e]));
  const collections = bundle.tables.find(t => t.name === 'instagram.collections')!.rows, placements = bundle.tables.find(t => t.name === 'instagram.placements')!.rows;
  const matched = placements.filter(p => p.joinStatus === 'matched' && typeof p.savedObservationId === 'string' && byId.has(p.savedObservationId));
  const filedIds = new Set(matched.map(p => String(p.savedObservationId)));
  const calendarWeeks: { week: string; total: number; filed: number }[] = [];
  for (let t = Date.parse(mondayWeek(start)); t <= endpointWeek; t += 7 * DAY) {
    const inWeek = saved.filter(e => mondayWeek(Date.parse(e.activity.timestamp)) === new Date(t).toISOString().slice(0, 10));
    calendarWeeks.push({ week: new Date(t).toISOString().slice(0, 10), total: inWeek.length, filed: inWeek.filter(e => filedIds.has(e.observationId)).length });
  }
  return collections.map(c => {
    const ids = new Set(matched.filter(p => p.collectionId === c.collectionId).map(p => String(p.savedObservationId))), rows = [...ids].map(id => byId.get(id)!);
    const created = typeof c.createdAt === 'string' ? Date.parse(c.createdAt) : null, creationWeek = created === null ? null : Date.parse(mondayWeek(created));
    const weeks: RateWeek[] = calendarWeeks.map(w => {
      const t = Date.parse(w.week), timestamps = rows.filter(e => mondayWeek(Date.parse(e.activity.timestamp)) === w.week).map(e => Date.parse(e.activity.timestamp));
      const n = options.denominator === 'all-saves' ? w.total : w.filed;
      const status = creationWeek === null ? 'creation date unavailable' : t < start ? 'partial start week' : t === endpointWeek ? 'endpoint week: export time unknown' : t < creationWeek ? 'before creation week' : t === creationWeek ? 'creation week' : n === 0 ? 'zero exposure' : 'assessed';
      return { ...w, numerator: timestamps.length, denominator: n, timestamps, status };
    });
    return { collectionRef: { snapshotId: bundle.snapshotId, collectionId: c.collectionId, name: c.collection_name }, createdAt: c.createdAt, denominator: options.denominator,
      descriptive: { distinctMatchedObservations: ids.size, excludedPlacementsWithoutMatchedObservation: placements.filter(p => p.collectionId === c.collectionId && (p.joinStatus !== 'matched' || !byId.has(String(p.savedObservationId)))).length, observationsBeforeCreation: created === null ? null : rows.filter(e => Date.parse(e.activity.timestamp) < created).length, observationsOutsideWindow: rows.filter(e => Date.parse(e.activity.timestamp) < start || Date.parse(e.activity.timestamp) >= endpointWeek + 7 * DAY).length, unassessedWindowObservations: sum(weeks.filter(w => w.status !== 'assessed').map(w => w.numerator)) }, weeks };
  });
}
export function folderBurstGrid(events: readonly EventRecord[], bundle: InstagramSideTableBundle, options: { startDate: string; exportDate: string }) {
  const runs = [];
  for (const denominator of ['all-saves', 'filed-saves'] as const) {
    const lanes = folderRateLanes(events, bundle, { ...options, denominator });
    for (const s of [1.5, 2, 3]) for (const gamma of [0.5, 1, 2]) {
      const started = performance.now();
      const results = lanes.map(lane => ({ ...lane, detection: detectBursts(lane.weeks, { s, gamma }) }));
      runs.push({ denominator, s, gamma, elapsedMilliseconds: performance.now() - started, lanes: results });
    }
  }
  return { sensitivity: 'personal', warning: 'Folder names and recorded actions can reveal interests, beliefs and affiliations.', options, primary: { denominator: 'all-saves', s: 2, gamma: 1 }, runs };
}
export function burstGridCounts(grid: ReturnType<typeof folderBurstGrid>) {
  return grid.runs.map(r => ({ denominator: r.denominator, s: r.s, gamma: r.gamma, elapsedMilliseconds: r.elapsedMilliseconds, lanes: r.lanes.length,
    lanesWithBars: r.lanes.filter(l => l.detection.qualifiedBars.length).length,
    qualifiedBars: sum(r.lanes.map(l => l.detection.qualifiedBars.length)),
    levelOneBars: sum(r.lanes.map(l => l.detection.qualifiedBars.filter(b => b.level === 1).length)),
    excludedCandidates: sum(r.lanes.map(l => l.detection.candidates.filter(b => !b.qualified).length)),
    assessedLaneWeeks: sum(r.lanes.map(l => l.weeks.filter(w => w.status === 'assessed').length)),
    zeroExposureLaneWeeks: sum(r.lanes.map(l => l.weeks.filter(w => w.status === 'zero exposure').length)) }));
}
export function burstSensitivity(grid: ReturnType<typeof folderBurstGrid>) {
  const primary = grid.runs.find(r => r.denominator === 'all-saves' && r.s === 2 && r.gamma === 1)!;
  return primary.lanes.flatMap(lane => lane.detection.qualifiedBars.map(bar => {
    const comparisons = grid.runs.map(run => {
      const other = run.lanes.find(l => l.collectionRef.collectionId === lane.collectionRef.collectionId)!;
      const overlaps = other.detection.qualifiedBars.filter(b => b.level === bar.level && b.startWeek <= bar.endWeek && b.endWeek >= bar.startWeek);
      const best = overlaps.slice().sort((a, b) => {
        const overlap = (x: typeof a) => Math.min(Date.parse(x.endExclusive), Date.parse(bar.endExclusive)) - Math.max(Date.parse(x.startWeek), Date.parse(bar.startWeek));
        return overlap(b) - overlap(a) || a.startWeek.localeCompare(b.startWeek);
      })[0];
      return { denominator: run.denominator, s: run.s, gamma: run.gamma, exact: overlaps.some(b => b.startWeek === bar.startWeek && b.endWeek === bar.endWeek), overlappingIntervals: overlaps.length, bestOverlap: best ? { startWeek: best.startWeek, endWeek: best.endWeek, startShiftWeeks: (Date.parse(best.startWeek) - Date.parse(bar.startWeek)) / (7 * DAY), endShiftWeeks: (Date.parse(best.endWeek) - Date.parse(bar.endWeek)) / (7 * DAY) } : null };
    });
    return { collectionRef: lane.collectionRef, startWeek: bar.startWeek, endWeek: bar.endWeek, level: bar.level, comparisons };
  }));
}
export function burstSensitivityCounts(rows: ReturnType<typeof burstSensitivity>) {
  const outer = rows.filter(r => r.level === 1);
  return ['all-saves', 'filed-saves'].map(denominator => {
    const comparisons = outer.flatMap(r => r.comparisons.filter(c => c.denominator === denominator));
    return { denominator, primaryOuterBars: outer.length,
      exactInAllNine: outer.filter(r => r.comparisons.filter(c => c.denominator === denominator).every(c => c.exact)).length,
      overlapsInAllNine: outer.filter(r => r.comparisons.filter(c => c.denominator === denominator).every(c => c.overlappingIntervals > 0)).length,
      comparisonsWithoutOverlap: comparisons.filter(c => c.overlappingIntervals === 0).length,
      maximumAbsoluteStartShiftWeeksAmongOverlaps: Math.max(0, ...comparisons.map(c => Math.abs(c.bestOverlap?.startShiftWeeks ?? 0))),
      maximumAbsoluteEndShiftWeeksAmongOverlaps: Math.max(0, ...comparisons.map(c => Math.abs(c.bestOverlap?.endShiftWeeks ?? 0))) };
  });
}
