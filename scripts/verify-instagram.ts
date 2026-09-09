import { createInputReader, instagramParser } from '../packages/core/src/index.ts';

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.length !== 2 || args[0] !== '--input' || !args[1]) {
    console.error('Usage: npm run verify:instagram -- --input <hand-trimmed Instagram folder>');
    process.exitCode = 2;
    return;
  }
  const started = performance.now();
  const result = await instagramParser.parse(createInputReader(args[1], instagramParser.sourceFiles));
  const table = (name: string) => result.sideTables.find(value => value.name === `instagram.${name}`)!.rows;
  const saved = result.events.filter(value => value.activity.event_type === 'saved');
  const liked = result.events.filter(value => value.activity.event_type === 'liked');
  const savedIds = new Set(saved.map(value => value.observationId));
  const extras = table('post_extras').filter(value => savedIds.has(String(value.observationId)));
  const collections = table('collections');
  const placements = table('placements');
  const memberships = new Map<string, Set<string>>();
  for (const placement of placements) {
    if (typeof placement.postKey !== 'string' || typeof placement.collectionId !== 'string') continue;
    const members = memberships.get(placement.postKey) ?? new Set<string>();
    members.add(placement.collectionId);
    memberships.set(placement.postKey, members);
  }
  const dates = saved.map(value => value.activity.timestamp).sort();
  const unmatched = placements.filter(value => value.joinStatus === 'unmatched_placement');
  const checks: [string, number | string, number | string][] = [
    ['Saved events', saved.length, 4809],
    ['Saved first date (UTC)', dates[0]?.slice(0, 10) ?? 'missing', '2018-12-18'],
    ['Saved last date (UTC)', dates.at(-1)?.slice(0, 10) ?? 'missing', '2026-08-30'],
    ['Liked events', liked.length, 5245],
    ['Collections', collections.length, 73],
    ['Empty collections', collections.filter(value => value.mediaChildCount === 0).length, 0],
    ['Collection placements', placements.length, 4177],
    ['Unique collection posts', memberships.size, 4046],
    ['Posts in multiple collections', [...memberships.values()].filter(value => value.size > 1).length, 127],
    ['Saved reels', extras.filter(value => value.post_type === 'reel').length, 4710],
    ['Saved posts (p)', extras.filter(value => value.post_type === 'p').length, 99],
    ['Saved captions absent', extras.filter(value => value.captionPresent === false).length, 91],
    ['Saved usernames present', saved.filter(value => value.activity.creator_id !== null).length, 4809],
    ['Saved username denominator', saved.length, 4809],
    ['Unmatched unique post keys', new Set(unmatched.map(value => value.postKey)).size, 7],
    ['Unmatched placements', unmatched.length, 7],
    ['Absent update value', collections.filter(value => value.updateValueState === 'absent').length, 73],
    ['Integer update timestamps', collections.filter(value => value.updateTimestampInteger === true).length, 73],
    ['Non-null Instagram durations', result.events.filter(value => value.activity.duration_sec !== null).length, 0],
    ['Unexpected diagnostics', result.diagnostics.filter(value =>
      value.code !== 'unsupported_file' && value.code !== 'unmatched_placement'
      && value.code !== 'duplicate_caption').length, 0],
  ];
  console.log('2026-08-30 reference acceptance — observed in this export, not complete history');
  console.log(`${'Check'.padEnd(34)} ${'Observed'.padEnd(12)} ${'Expected'.padEnd(12)} Result`);
  for (const [name, observed, expected] of checks) {
    console.log(`${name.padEnd(34)} ${String(observed).padEnd(12)} ${String(expected).padEnd(12)} ${observed === expected ? 'PASS' : 'FAIL'}`);
  }
  const passed = checks.every(([, observed, expected]) => observed === expected);
  console.log(`Acceptance: ${passed ? 'PASS' : 'FAIL'}; parse status: ${result.status}`);
  // Aggregate-only diagnostics; never print input strings or absolute paths.
  const counts = new Map<string, number>();
  for (const diagnostic of result.diagnostics) counts.set(diagnostic.code, (counts.get(diagnostic.code) ?? 0) + 1);
  console.log(`Diagnostic counts: ${JSON.stringify(Object.fromEntries(counts))}`);
  console.log('Quarantine: not_run (hand-trimmed input; no files removed).');
  console.log(`Peak process RSS: ${(process.resourceUsage().maxRSS / 1024).toFixed(1)} MiB; elapsed: ${((performance.now() - started) / 1000).toFixed(2)} s.`);
  console.log('File limit: 32 MiB each; whole-file JSON parsed sequentially. No output files written.');
  process.exitCode = passed ? 0 : 1;
}

main().catch(() => {
  console.error('Verification could not complete. No source content is included in this error.');
  process.exitCode = 1;
});
