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
    | 'invalid_url' | 'unmatched_placement' | 'ambiguous_join' | 'duplicate_caption'
    | 'empty_file' | 'file_too_large';
  severity: 'info' | 'warning' | 'error';
}

export type ReadResult =
  | { status: 'ok'; value: unknown }
  | { status: 'missing' | 'rejected'; code: Diagnostic['code'] };

export interface ParserInput {
  readJson(relativePath: string): Promise<ReadResult>;
  // Optional capability: absence must be handled explicitly, never by silently
  // buffering an oversized file through readJson. Not implemented yet.
  iterateJsonRecords?(
    relativePath: string,
    options: JsonRecordOptions,
  ): AsyncIterable<JsonRecordRead>;
}

export interface JsonRecordOptions {
  recordPath: readonly string[]; // [] = root array; keys select a nested array.
  maxRecordBytes: number;
  maxTotalBytes: number; // Separate from readJson's 32 MiB materialisation limit.
  signal?: AbortSignal;
}

export type JsonRecordRead =
  | { status: 'record'; row: number; value: unknown }
  | { status: 'end'; recordCount: number }
  | { status: 'missing' | 'rejected'; code: Diagnostic['code'] };

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

interface ParserDescriptor {
  readonly platform: Platform;
  readonly version: string;
  readonly sourceFiles: readonly string[];
}

export interface BufferedPlatformParser extends ParserDescriptor {
  parse(input: ParserInput): Promise<ParseResult>;
  // Future large adapters may emit incrementally too. Merely streaming input
  // would not solve memory use if all normalised events accumulated in arrays.
  parseIncrementally?(input: ParserInput): AsyncIterable<ParserEmission>;
}

export interface IncrementalPlatformParser extends ParserDescriptor {
  parseIncrementally(input: ParserInput): AsyncIterable<ParserEmission>;
  parse?(input: ParserInput): Promise<ParseResult>;
}

export type PlatformParser = BufferedPlatformParser | IncrementalPlatformParser;

export type ParserEmission =
  | { type: 'event'; record: EventRecord }
  | { type: 'side_row'; sourceFile: string; tableName: string; schemaVersion: number; row: Record<string, DataValue> }
  | { type: 'diagnostic'; diagnostic: Diagnostic }
  | { type: 'complete'; status: ParseResult['status'] };

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
