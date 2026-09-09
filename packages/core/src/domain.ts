export type Platform = 'instagram' | 'youtube' | 'tiktok' | 'netflix';
export type EventType = 'saved' | 'liked' | 'watched' | 'searched' | 'commented' | 'followed';

export interface Activity {
  platform: Platform;
  timestamp: string; // ISO 8601 UTC; validated at runtime by the parser.
  event_type: EventType;
  title: string | null;
  creator: string | null;
  creator_id: string | null;
  url: string | null;
  duration_sec: number | null;
  source_file: string; // Relative export path only.
  raw_id: string | null;
}

export interface EventRecord {
  observationId: string;
  eventKey: string | null;
  activity: Activity;
}

export interface Diagnostic {
  sourceFile: string;
  row?: number; // One-based source row, when available.
  code: 'missing_file' | 'rejected_file' | 'invalid_json' | 'invalid_shape'
    | 'invalid_row' | 'invalid_encoding' | 'unsupported_file'
    | 'invalid_url' | 'unmatched_placement' | 'ambiguous_join' | 'duplicate_caption';
  severity: 'info' | 'warning' | 'error';
}

export type ReadResult =
  | { status: 'ok'; value: unknown }
  | { status: 'missing' | 'rejected'; code: Diagnostic['code'] };

export interface ParserInput {
  readJson(relativePath: string): Promise<ReadResult>;
}

export type DataValue = string | number | boolean | null | DataValue[]
  | { [key: string]: DataValue };

export interface SideTable {
  name: string; // Platform-namespaced identifier, not an output filename.
  schemaVersion: number;
  rows: Record<string, DataValue>[];
}

export interface ParseResult {
  status: 'complete' | 'partial' | 'empty' | 'failed';
  events: EventRecord[];
  sideTables: SideTable[];
  diagnostics: Diagnostic[];
}

export interface PlatformParser {
  readonly platform: Platform;
  readonly version: string;
  readonly sourceFiles: readonly string[];
  parse(input: ParserInput): Promise<ParseResult>;
}

export interface SnapshotManifest {
  snapshotId: string;
  platform: Platform;
  importedAt: string;
  exportDate: string | null; // Supplied provenance, never inferred from latest event.
  parserVersion: string;
  schemaVersion: number;
  contentTrust: 'untrusted-third-party';
  sources: { relativePath: string; sha256: string; sizeBytes: number }[];
  quarantine: { status: 'not_run' | 'no_op' | 'completed'; removedFileCount: number };
}
