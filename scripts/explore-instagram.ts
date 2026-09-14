import { fileURLToPath } from 'node:url';
import { explorationCommand } from '../packages/core/src/exploration-command.ts';
process.exitCode = await explorationCommand(process.argv.slice(2), {
  forbiddenDirectories: [fileURLToPath(new URL('..', import.meta.url))],
});
