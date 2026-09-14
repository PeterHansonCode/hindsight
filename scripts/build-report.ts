import { buildReport } from '../packages/core/src/report-build.ts';
try {
  const args = process.argv.slice(2), flags = new Map<string, string>();
  for (let i = 0; i < args.length; i += 2) { if (!['--snapshot', '--analysis', '--output', '--source-root'].includes(args[i]) || !args[i + 1] || args[i + 1].startsWith('--') || flags.has(args[i])) throw new Error('Arguments'); flags.set(args[i], args[i + 1]); }
  if (!['--snapshot', '--analysis', '--output'].every(f => flags.has(f))) throw new Error('Arguments');
  console.log(JSON.stringify(await buildReport(flags.get('--snapshot')!, flags.get('--analysis')!, flags.get('--output')!, flags.get('--source-root')), null, 2));
} catch { console.error('Report could not be built. Supply --snapshot <retained snapshot> --analysis <accepted step-6 output> --output <new HTML file outside the repository and inputs>. Check matching inputs and output access.'); process.exitCode = 1; }
