import { stepSixCommand } from '../packages/core/src/step-six-command.ts';
process.exitCode = await stepSixCommand(process.argv.slice(2));
