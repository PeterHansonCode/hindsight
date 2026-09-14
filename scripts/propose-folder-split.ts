import { folderSplitCommand } from '../packages/core/src/folder-split-command.ts';
process.exitCode = await folderSplitCommand(process.argv.slice(2));
