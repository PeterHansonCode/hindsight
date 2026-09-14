import {hashtagAuditCommand} from '../packages/core/src/hashtag-audit-command.ts';
process.exitCode = await hashtagAuditCommand(process.argv.slice(2));
