import { createHash } from 'node:crypto';
import { readFile, realpath } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInputReader, instagramParser, createInstagramSideTableBundle,
  readInstagramSideTables, writeInstagramSideTables, SideTableError } from '../packages/core/src/index.ts';

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.length !== 6 || args[0] !== '--input' || args[2] !== '--output' || args[4] !== '--snapshot-id') {
    console.error('Usage: npm run verify:instagram-side-tables -- --input <folder> --output <external folder> --snapshot-id <id>');
    process.exitCode = 2; return;
  }
  // This verification script has fixed expectations for the August 30 fixture.
  // The library itself can persist valid partial or empty side tables.
  const input = args[1], output = args[3], snapshotId = args[5];
  const source = await realpath(input);
  const repository = fileURLToPath(new URL('..', import.meta.url));
  const relative = path.relative(repository, path.resolve(output));
  if (relative === '' || relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative)) {
    throw new SideTableError('unsafe_destination');
  }
  async function hashes(): Promise<string[]> {
    const values: string[] = [];
    for (const name of instagramParser.sourceFiles) {
      values.push(createHash('sha256').update(await readFile(path.join(source, name))).digest('hex'));
    }
    return values;
  }
  const before = await hashes();
  const result = await instagramParser.parse(createInputReader(source, instagramParser.sourceFiles));
  const bundle = createInstagramSideTableBundle(snapshotId, result);
  const savedIds = new Set(result.events.filter(value => value.activity.event_type === 'saved').map(value => value.observationId));
  const stored = await writeInstagramSideTables({ directory: output, sourceDirectory: source, bundle, observations: result.events });
  const loaded = await readInstagramSideTables(output, snapshotId, result.events);
  const retry = await writeInstagramSideTables({ directory: output, sourceDirectory: source, bundle, observations: result.events });
  const rows = (name: string) => loaded.tables.find(value => value.name === `instagram.${name}`)!.rows;
  const placements = rows('placements');
  const unmatched = placements.filter(value => value.joinStatus === 'unmatched_placement');
  const matches = placements.filter(value => value.joinStatus === 'matched');
  const memberships = new Map<string, Set<string>>();
  for (const placement of placements) {
    const key = String(placement.postKey);
    const set = memberships.get(key) ?? new Set<string>();
    set.add(String(placement.collectionId)); memberships.set(key, set);
  }
  const after = await hashes();
  const checks: [string, number | string | boolean, number | string | boolean][] = [
    ['Events retained in memory', result.events.length, 10054],
    ['Persisted post extras', rows('post_extras').length, 10054],
    ['Persisted collections', rows('collections').length, 73],
    ['Persisted placements', placements.length, 4177],
    ['Unique collection post keys', memberships.size, 4046],
    ['Posts in multiple collections', [...memberships.values()].filter(value => value.size > 1).length, 127],
    ['Matched placements', matches.length, 4170],
    ['Valid saved references', matches.filter(value => savedIds.has(String(value.savedObservationId))).length, 4170],
    ['Unmatched in this snapshot', unmatched.length, 7],
    ['Unmatched with null saved link/date', unmatched.filter(value => value.savedObservationId === null && value.savedAt === null).length, 7],
    ['Ambiguous matches', placements.filter(value => value.joinStatus === 'ambiguous_join').length, 0],
    ['Lossless bundle round trip', JSON.stringify(loaded) === JSON.stringify(bundle), true],
    ['Identical retry', retry.status, 'already_exists'],
    ['Source hashes unchanged', JSON.stringify(before) === JSON.stringify(after), true],
  ];
  console.log(`${'Check'.padEnd(37)} ${'Observed'.padEnd(16)} ${'Expected'.padEnd(16)} Result`);
  for (const [name, observed, expected] of checks) {
    console.log(`${name.padEnd(37)} ${String(observed).padEnd(16)} ${String(expected).padEnd(16)} ${observed === expected ? 'PASS' : 'FAIL'}`);
  }
  console.log(`Side-table write: ${stored.status}; sensitivity: personal; source text remains untrusted.`);
  console.log('Unmatched in this snapshot describes absence, not its cause. No full snapshot or summary outputs created.');
  process.exitCode = checks.every(([, actual, expected]) => actual === expected) ? 0 : 1;
}

main().catch(error => {
  console.error(error instanceof SideTableError ? error.message : 'Side-table verification failed; source contents are omitted.');
  process.exitCode = 1;
});
