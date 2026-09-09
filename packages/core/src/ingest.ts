import fs from 'node:fs/promises';
import type { ParseResult, ParserInput, SnapshotManifest } from './domain.ts';
import { createInputReader } from './input.ts';
import { instagramParser } from './parsers/instagram.ts';
import { createInstagramSideTableBundle } from './instagram-side-tables.ts';
import { outputArtifacts } from './outputs.ts';
import { parseReport, QUARANTINE_LOG } from './parse-report.ts';
import { newSnapshotId, publishSnapshot } from './snapshots.ts';

export class ImportError extends Error {
  readonly code: 'missing_input' | 'unreadable_input' | 'parse_failed';
  readonly report: string | undefined;
  constructor(code: ImportError['code'], report?: string) {
    super(code); this.code = code; this.report = report; this.name = 'ImportError';
  }
}

export async function ingestInstagram(options: {
  input: string; output: string; snapshotId?: string; exportDate?: string;
  forbiddenDirectories?: string[];
}): Promise<{ directory: string; snapshotId: string; result: ParseResult; report: string }> {
  let source: string;
  try {
    source = await fs.realpath(options.input);
    if (!(await fs.stat(source)).isDirectory()) throw new ImportError('unreadable_input');
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') throw new ImportError('missing_input');
    throw new ImportError('unreadable_input');
  }
  const sources: SnapshotManifest['sources'] = [];
  const reader = createInputReader(source, instagramParser.sourceFiles, { onRead: value => sources.push(value) });
  const readStatuses: { relativePath: string; status: string; code?: string }[] = [];
  const input: ParserInput = { async readJson(relativePath) {
    const read = await reader.readJson(relativePath);
    readStatuses.push({ relativePath, status: read.status, ...(read.status === 'ok' ? {} : { code: read.code }) });
    return read;
  } };
  const result = await instagramParser.parse(input);
  const report = parseReport(result);
  if (result.status === 'failed') throw new ImportError('parse_failed', report);
  const snapshotId = options.snapshotId ?? newSnapshotId();
  const bundle = createInstagramSideTableBundle(snapshotId, result);
  function* observations(): Generator<string> {
    for (const event of result.events) yield JSON.stringify(event) + '\n';
  }
  const directory = await publishSnapshot({
    outputDirectory: options.output, sourceDirectory: source, forbiddenDirectories: options.forbiddenDirectories,
    manifest: {
      format: 'hindsight.snapshot', snapshotId, platform: 'instagram', importedAt: new Date().toISOString(),
      exportDate: options.exportDate ?? null, parserVersion: instagramParser.version, schemaVersion: 1,
      contentTrust: 'untrusted-third-party', sources,
      quarantine: { status: 'not_run', removedFileCount: 0 }, parseStatus: result.status, eventCount: result.events.length,
    },
    artifacts: [
      ...outputArtifacts(result),
      { name: 'parse-report.txt', chunks: [report] }, { name: 'quarantine.log', chunks: [QUARANTINE_LOG] },
      { name: 'observations.jsonl', chunks: observations() },
      { name: 'side-tables.json', chunks: [JSON.stringify(bundle) + '\n'] },
      { name: 'diagnostics.json', chunks: [JSON.stringify({ status: result.status, files: readStatuses,
        ignoredFiles: ['likes/liked_comments.json'], diagnostics: result.diagnostics }, null, 2) + '\n'] },
    ],
  });
  return { directory, snapshotId, result, report };
}
