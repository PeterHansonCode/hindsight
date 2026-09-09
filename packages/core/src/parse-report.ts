import type { Diagnostic, ParseResult } from './domain.ts';

const labels: Record<string, string> = {
  'saved/saved_posts.json': 'Saved posts', 'likes/liked_posts.json': 'Liked posts',
  'saved/saved_collections.json': 'Saved collections', 'likes/liked_comments.json': 'Liked comments',
};
export function diagnosticMessage(code: Diagnostic['code'], count: number, severity: Diagnostic['severity']): string {
  switch (code) {
    case 'missing_file': return 'This file was not found. Other available activity was kept.';
    case 'file_too_large': return 'This file exceeds the 32 MiB reading limit and was not read.';
    case 'empty_file': return 'This file is empty (zero bytes) and could not be read as an export.';
    case 'invalid_json': return 'This file is incomplete or is not valid JSON. Its activity was not included; try exporting it again.';
    case 'invalid_shape': return 'This file uses an unexpected format. Its activity was not included.';
    case 'rejected_file': return 'This file could not be read, or its location did not pass the input checks.';
    case 'invalid_row': return `${count} item${count === 1 ? '' : 's'} contained missing or unexpected values. Unreadable activity items were skipped; usable collection details were kept.`;
    case 'invalid_encoding': return severity === 'error'
      ? 'This file could not be decoded as UTF-8 and was not included.'
      : `${count} item${count === 1 ? '' : 's'} contained unexpected text encoding. That text was kept unchanged for inspection.`;
    case 'unsupported_file': return 'Liked comments are not included in this version. This file was not read.';
    case 'invalid_url': return `${count} post link${count === 1 ? '' : 's'} could not be used for matching. Available details were kept.`;
    case 'unmatched_placement': return `${count} collection placement${count === 1 ? ' is' : 's are'} unmatched in this snapshot. No saved date was assigned; the cause is unknown.`;
    case 'ambiguous_join': return `${count} collection placement${count === 1 ? '' : 's'} matched more than one saved item. All candidates were kept and no match was selected.`;
    case 'duplicate_caption': return `${count} item${count === 1 ? '' : 's'} had repeated captions. The first in export order is shown; every version was kept.`;
  }
}
export function parseReport(result: ParseResult): string {
  const lines = ['HINDSIGHT — your import results', ''];
  lines.push(result.status === 'failed' ? 'No usable activity could be imported. See the file notes below.'
    : result.events.length === 0 ? 'This export contains no saved or liked activity. Empty output files were created.'
    : `${result.events.length.toLocaleString('en-US')} saved and liked activity items were imported.`);
  if (result.status === 'partial') lines.push('Some data could not be included or matched. The usable activity was kept.');
  lines.push('These results describe one export snapshot, not your complete account history.',
    'No time spent was estimated. Keep older exports so their observations remain available.', '');
  const extras = result.sideTables.find(table => table.name === 'instagram.post_extras')?.rows ?? [];
  const missingCaptions = extras.filter(row => row.captionPresent === false).length;
  if (missingCaptions) lines.push(`${missingCaptions} items had no caption. These items were kept, with an empty title.`, '');
  const groups = new Map<string, { diagnostic: Diagnostic; count: number }>();
  for (const diagnostic of result.diagnostics) {
    const key = JSON.stringify([diagnostic.sourceFile, diagnostic.code, diagnostic.severity]);
    const group = groups.get(key) ?? { diagnostic, count: 0 }; group.count++; groups.set(key, group);
  }
  for (const { diagnostic, count } of groups.values()) {
    lines.push(`${labels[diagnostic.sourceFile] ?? 'Activity file'}: ${diagnosticMessage(diagnostic.code, count, diagnostic.severity)}`);
  }
  lines.push('', 'Privacy and files',
    'Your original files were not changed. Quarantine did not run: this version expects a hand-trimmed input folder.',
    'summary-anonymous.json contains low-disclosure aggregate patterns; it does not guarantee anonymity.',
    'summary-detailed.json contains personal creator information and reveals interests, beliefs and affiliations.',
    'The CSV files and internal snapshot data also contain personal information.',
    '', 'Technical detail (optional)', 'Exact file references, row numbers and reason codes are in diagnostics.json.', '');
  return lines.join('\n');
}
export const QUARANTINE_LOG = 'Quarantine did not run.\nThis version reads a hand-trimmed folder; it has not checked a full export for sensitive files.\nNo files were removed. Original files were not changed.\nStatus: not_run\nRemoved files: 0\n';
