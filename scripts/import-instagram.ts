import { fileURLToPath } from 'node:url';
import { importCommand } from '../packages/core/src/import-command.ts';

process.exitCode = await importCommand(process.argv.slice(2), {
  forbiddenDirectories: [fileURLToPath(new URL('..', import.meta.url))],
});
