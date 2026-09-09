import type { Activity, ParseResult } from './domain.ts';
import { aggregate } from './aggregate.ts';

export const ACTIVITY_COLUMNS: readonly (keyof Activity)[] = [
  'platform', 'timestamp', 'event_type', 'title', 'creator', 'creator_id',
  'url', 'duration_sec', 'source_file', 'raw_id',
];
export function csvCell(value: string | number | null): string {
  let text = value === null ? '' : String(value);
  // Spreadsheet formula injection: CSV quoting alone cannot stop execution.
  // Prefix dangerous text, then quote. Internal JSONL retains the original.
  if (typeof value === 'string' && (/^[\s\p{Cc}]*[=+\-@]/u.test(text) || /^[\t\r\n]/.test(text))) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}
function line(values: (string | number | null)[]): string { return values.map(csvCell).join(',') + '\r\n'; }
export interface OutputArtifact { name: string; chunks: Iterable<string> }

export function outputArtifacts(result: ParseResult): OutputArtifact[] {
  const totals = aggregate(result.events);
  function* activity(): Generator<string> {
    yield line([...ACTIVITY_COLUMNS]);
    for (const { activity } of totals.ordered) yield line(ACTIVITY_COLUMNS.map(key => activity[key]));
  }
  function* creators(): Generator<string> {
    yield line(['creator', 'platform', 'event_count', 'first_seen', 'last_seen']);
    for (const row of totals.creators) yield line([row.creator ?? row.creator_id, row.platform, row.event_count, row.first_seen, row.last_seen]);
  }
  return [
    { name: 'activity.csv', chunks: activity() }, { name: 'creators.csv', chunks: creators() },
    { name: 'summary-anonymous.json', chunks: [JSON.stringify(totals.anonymous, null, 2) + '\n'] },
    { name: 'summary-detailed.json', chunks: [JSON.stringify(totals.detailed, null, 2) + '\n'] },
  ];
}
