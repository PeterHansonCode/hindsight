import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readExplorationSnapshot } from './exploration-command.ts';
import { verifySnapshot } from './snapshots.ts';
import { creatorLifecycles, lifecycleCounts, type LifecycleChannel } from './lifecycles.ts';
import { writeAnalysisOutput } from './analysis-output.ts';
import { fitSessions, sessionFitSvg } from './session-fit.ts';
import { folderBurstGrid, burstGridCounts, burstSensitivity, burstSensitivityCounts } from './bursts.ts';

const json = (v: unknown) => JSON.stringify(v, null, 2) + '\n';
const cell = (v: unknown) => String(v ?? '').replace(/[&<>"'|\[\]()*_`\\\r\n]/g, c => `&#${c.charCodeAt(0)};`);
export async function stepSixCommand(args: string[], io: { stdout?: (s: string) => void; stderr?: (s: string) => void } = {}) {
  const out = io.stdout ?? console.log, err = io.stderr ?? console.error;
  const repository = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
  const flags = new Map<string, string>();
  try {
    for (let i = 0; i < args.length; i += 2) {
      if (!['--snapshot', '--output', '--source-root', '--stage', '--session-plots-reviewed'].includes(args[i]) || !args[i + 1] || args[i + 1].startsWith('--') || flags.has(args[i])) throw new Error('Arguments');
      flags.set(args[i], args[i + 1]);
    }
    if (!flags.has('--snapshot') || !flags.has('--output')) throw new Error('Arguments');
    const stage = flags.get('--stage') ?? 'lifecycles', reviewed = flags.get('--session-plots-reviewed') === 'yes';
    if (!['lifecycles', 'sessions', 'bursts', 'all'].includes(stage) || flags.has('--session-plots-reviewed') && !reviewed) throw new Error('Stage or review flag');
    const started = performance.now(), snapshot = flags.get('--snapshot')!;
    const { manifest, events, bundle, coverage } = await readExplorationSnapshot(snapshot);
    if (!manifest.exportDate) throw new Error('A supplied export date is required.');
    const asOf = `${manifest.exportDate}T23:59:59.999Z`;
    if (events.some(e => e.activity.timestamp > asOf)) throw new Error('Events exceed the supplied export date.');
    const files: Record<string, string> = {}, channels: LifecycleChannel[] = ['saved', 'liked', 'combined'];
    const fits = stage === 'sessions' || stage === 'all' || reviewed ? channels.map(channel => ({ channel, ...fitSessions(events.filter(e => channel === 'combined' || e.activity.event_type === channel).map(e => Date.parse(e.activity.timestamp))) })) : [];
    if (fits.length) {
      for (const f of fits) files[`session-fit-${f.channel}.svg`] = sessionFitSvg(f, f.channel, reviewed);
      files['session-fits.json'] = json({ disclosure: 'low disclosure', plotsReviewed: reviewed, fits });
    }
    const aggregate: Record<string, unknown> = { disclosure: 'low disclosure', coverage };
    const report = ['# Step 6 personal evidence', '', 'Sensitivity: personal. Creator and folder identities can reveal interests, beliefs and affiliations.', '', 'Only retained observations are described. Absence here does not establish absence elsewhere. Current folder membership is grouped by save date, not observed filing date.', ''];
    if (stage === 'lifecycles' || stage === 'all') {
      const results = channels.map(channel => {
        const f = fits.find(f => f.channel === channel), derived = reviewed && f?.numericalChecksPass;
        return creatorLifecycles(events, { channel, snapshotRefs: [manifest.snapshotId], asOf, sessionSeconds: derived ? f!.proposedSeconds : 3600, sessionBasis: derived ? 'Derived crossing; numerical checks and plot reviewed' : f && !f.numericalChecksPass ? f.basis : '60-minute convention; plot not yet reviewed' });
      });
      for (const result of results) {
        files[`lifecycles-${result.config.channel}-personal.json`] = JSON.stringify(result) + '\n';
        report.push(`## ${result.config.channel} creator lifecycles`, '', `${result.repeatCreators} repeat creators; ${result.singletonCreators} singletons remain aggregate-only. Session threshold: ${(result.config.sessionSeconds / 60).toFixed(2)} minutes (${result.config.sessionBasis}).`, '', 'Ordered by active months, active weeks, then distinct sessions. The first 50 are shown here; all repeat rows and monthly windows are in the accompanying personal JSON.', '', '| Rank | Creator ID | Active months | Active weeks | Sessions | Observations | First recorded | Last recorded here |', '| --- | --- | --- | --- | --- | --- | --- | --- |');
        result.rows.slice(0, 50).forEach((r, i) => report.push(`| ${i + 1} | ${cell(r.creatorRef.creatorId)} | ${r.activeMonths} | ${r.activeWeeks} | ${r.distinctSessions} | ${r.observationCount} | ${r.firstRecorded.slice(0, 10)} | ${r.lastRecorded.slice(0, 10)} |`)); report.push('');
      }
      aggregate.lifecycles = results.map(lifecycleCounts); files['lifecycles-aggregate.json'] = json({ disclosure: 'low disclosure', channels: aggregate.lifecycles });
    }
    if (fits.length) aggregate.sessions = fits.map(f => ({ channel: f.channel, positiveGaps: f.positiveGaps, tiedGaps: f.tiedGaps, crossingMinutes: f.crossingSeconds === null ? null : f.crossingSeconds / 60, extrema: f.extrema.map(e => ({ type: e.type, minutes: 10 ** e.x / 60 })), numericalChecksPass: f.numericalChecksPass, plotsReviewed: reviewed, reasons: f.reasons, sensitivity: f.sensitivity, candidateSessions: f.candidateSessions }));
    if (stage === 'bursts' || stage === 'all') {
      const burstStart = performance.now();
      const grid = folderBurstGrid(events, bundle, { startDate: '2025-12-01', exportDate: manifest.exportDate });
      aggregate.burstWallSeconds = (performance.now() - burstStart) / 1000;
      aggregate.bursts = burstGridCounts(grid);
      const sensitivity = burstSensitivity(grid);
      aggregate.boundarySensitivity = burstSensitivityCounts(sensitivity);
      files['burst-sensitivity-personal.json'] = json({ sensitivity: 'personal', warning: grid.warning, comparisons: sensitivity });
      files['burst-grid-aggregate.json'] = json({ disclosure: 'low disclosure', runs: aggregate.bursts });
      for (const [i, run] of grid.runs.entries()) files[`burst-run-${String(i + 1).padStart(2, '0')}-personal.json`] = JSON.stringify({ sensitivity: grid.sensitivity, warning: grid.warning, options: grid.options, primary: grid.primary, ...run }) + '\n';
      const primary = grid.runs.find(r => r.denominator === 'all-saves' && r.s === 2 && r.gamma === 1)!;
      report.push('## Current folders: fixed primary burst configuration', '', 's=2, gamma=1, all retained saves as exposure. Every folder remains listed, including those with no qualifying bars. Nested levels are separate intervals, not independent phases. All nine settings and both denominators are retained in the numbered personal run files.', '', 'The creation week, pre-creation weeks and export endpoint week are unassessed; zero exposure splits spans. Every candidate needs two observations on two distinct Brisbane dates. Excluded candidates are preserved in JSON. No significance or personal phase claim follows from a qualifying bar.', '');
      primary.lanes.forEach((lane, i) => {
        report.push(`### Folder ${i + 1}: ${cell(lane.collectionRef.name)}`, '', `${lane.detection.qualifiedBars.length} qualifying nested bars; ${lane.detection.candidates.length - lane.detection.qualifiedBars.length} candidates excluded for support; ${lane.detection.unassessedWeeks.length} unassessed weeks. ${lane.descriptive.excludedPlacementsWithoutMatchedObservation} placements lack a matched observation.`, '');
        for (const b of lane.detection.qualifiedBars) {
          const checks = sensitivity.find(r => r.collectionRef.collectionId === lane.collectionRef.collectionId && r.startWeek === b.startWeek && r.endWeek === b.endWeek && r.level === b.level)!.comparisons;
          const primaryChecks = checks.filter(c => c.denominator === 'all-saves'), exact = primaryChecks.filter(c => c.exact).length, overlap = primaryChecks.filter(c => c.overlappingIntervals).length;
          report.push(`- ${b.startWeek} to ${b.endExclusive.slice(0, 10)} (end exclusive), UTC weeks; level ${b.level}; ${b.observations} records on ${b.activeDays} Brisbane dates across ${b.activeWeeks} active weeks; observed ${(100 * b.observedFraction).toFixed(2)}% of exposure versus span baseline ${(100 * b.baselineFraction).toFixed(2)}%. Exact boundaries in ${exact}/9 all-save configurations; an overlapping interval in ${overlap}/9. ${exact < 9 ? 'Boundaries depend on parameters; do not treat these dates as established.' : 'Parameter agreement is not a confidence probability.'} ${b.touchesSpanStart || b.touchesSpanEnd ? 'Touches a fitting-span edge; evidence ends there.' : 'Interior interval.'}`);
        }
        report.push('');
      });
    }
    if (stage !== 'sessions') files['step-six-personal.md'] = report.join('\n') + '\n';
    files['step-six-aggregate.json'] = json(aggregate);
    if (JSON.stringify(await verifySnapshot(snapshot)) !== JSON.stringify(manifest)) throw new Error('Snapshot changed during analysis.');
    files['provenance.json'] = json({ snapshotId: manifest.snapshotId, exportDate: manifest.exportDate, asOfConvention: 'Supplied export day inclusive in UTC; folder endpoint week conservatively unassessed', observationSha256: manifest.artifacts.find(a => a.name === 'observations.jsonl')!.sha256, sourceArtifacts: manifest.artifacts.map(a => ({ name: a.name, sha256: a.sha256 })), sourceIntegrityRechecked: true, stage, sessionPlotsReviewed: reviewed, computationSecondsIncludingReadsAndSerialization: (performance.now() - started) / 1000, peakRssMiBBeforeWriting: process.resourceUsage().maxRSS / 1024 });
    await writeAnalysisOutput(flags.get('--output')!, [snapshot, repository, ...(flags.has('--source-root') ? [flags.get('--source-root')!] : [])], files);
    out(json({ ...aggregate, totalWallSeconds: (performance.now() - started) / 1000, peakRssMiB: process.resourceUsage().maxRSS / 1024 })); return 0;
  } catch { err('Analysis could not finish. Supply --snapshot <verified snapshot> --output <new directory outside the repository and snapshot> [--stage lifecycles|sessions|bursts|all] [--source-root <protected export directory>]. Check input integrity, supplied export date and output access. Sources were not changed; incomplete output may remain.'); return 1; }
}
