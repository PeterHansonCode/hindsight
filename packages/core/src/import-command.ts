import { ingestInstagram, ImportError } from './ingest.ts';
import { SnapshotError } from './snapshots.ts';
import { SideTableError, validSnapshotId } from './instagram-side-tables.ts';

const usage = 'Usage: npm run import:instagram -- --input <hand-trimmed folder> --output <output folder> [--snapshot-id <id>] [--export-date YYYY-MM-DD]';
export async function importCommand(args: string[], options: {
  stdout?: (text: string) => void; stderr?: (text: string) => void; forbiddenDirectories?: string[];
} = {}): Promise<number> {
  const out = options.stdout ?? console.log, errorOut = options.stderr ?? console.error;
  const flags = new Map<string, string>();
  const allowed = new Set(['--input', '--output', '--snapshot-id', '--export-date']);
  for (let index = 0; index < args.length; index += 2) {
    if (!allowed.has(args[index]) || !args[index + 1] || args[index + 1].startsWith('--') || flags.has(args[index])) {
      errorOut(usage); return 2;
    }
    flags.set(args[index], args[index + 1]);
  }
  const input = flags.get('--input'), output = flags.get('--output');
  const snapshotId = flags.get('--snapshot-id'), exportDate = flags.get('--export-date');
  if (!input || !output || snapshotId !== undefined && !validSnapshotId(snapshotId)
    || exportDate !== undefined && (!/^\d{4}-\d{2}-\d{2}$/.test(exportDate)
      || !Number.isFinite(Date.parse(exportDate)) || new Date(exportDate).toISOString().slice(0, 10) !== exportDate)) {
    errorOut(usage); return 2;
  }
  try {
    const imported = await ingestInstagram({ input, output, snapshotId, exportDate, forbiddenDirectories: options.forbiddenDirectories });
    out(imported.report);
    out(`Files saved in: ${imported.directory}`);
    return 0;
  } catch (error) {
    if (error instanceof ImportError) {
      if (error.report) out(error.report.replace('Exact file references, row numbers and reason codes are in diagnostics.json.', 'No output files were created.'));
      errorOut(error.code === 'missing_input' ? 'The input folder was not found. Check the --input location and try again.'
        : error.code === 'unreadable_input' ? 'The input folder could not be opened. Choose an accessible folder containing your export.'
        : 'No usable activity could be imported. Check the file notes above and try exporting the data again.');
    } else if (error instanceof SnapshotError) {
      const messages: Record<SnapshotError['code'], string> = {
        output_unavailable: 'The output folder could not be written. Choose a writable --output folder, check available space and try again. No complete snapshot was published.',
        unsafe_output: 'Choose an output folder outside your source export and the project repository. Original files must remain unchanged.',
        snapshot_exists: 'This snapshot name already exists or is in use. Choose a different --snapshot-id, or omit it to create a new one. Existing files were not replaced.',
        artifact_too_large: 'One output exceeds the current 32 MiB limit. No complete snapshot was published. Larger exports need the planned incremental writer.',
        invalid_snapshot: 'The snapshot could not be validated. No complete snapshot was published.',
      };
      errorOut(messages[error.code]);
    } else if (error instanceof SideTableError) {
      errorOut('The collection relationships could not be validated. No output files were created.');
    } else {
      errorOut('The import could not finish. Your original files were not changed. Please try again with a new output location.');
    }
    return 1;
  }
}
