# HINDSIGHT

A local-first tool for understanding activity recorded in your own platform exports. Event counts are facts; missing durations stay missing. Exports are snapshots, not complete account histories.

## Current state: step 4

Core parses hand-trimmed Instagram exports and writes a complete local snapshot: activity and creator CSVs, both aggregate summaries, a plain-English parse report, a truthful quarantine log, observations, side tables and a checksum manifest. Files are staged before publication; old snapshots are never overwritten. Quarantine engine, HTML report, wizard, MCP server, AI, ERAS and YouTube remain unimplemented. Streaming contracts exist; streaming itself does not.

Generate all outputs from an explicitly selected folder:

```powershell
npm run import:instagram -- --input ..\hindsight-data\Instagram --output ..\hindsight-data\step-4 --export-date 2026-08-30
```

This creates a fresh snapshot subfolder under --output and prints its location. The export date is optional supplied provenance; it is never inferred from the newest activity. Use --snapshot-id for an explicit name; existing names are rejected, not overwritten. Use another --output location as needed. Documents/Hindsight is deferred to the future CLI package.

Typechecking and all 79 offline tests pass locally, including CSV formula injection, all eight requested failure paths and anonymous-summary disclosure tests. The real export passes the earlier 20 parser and 14 side-table checks. Its four primary outputs contain 10,054 activity rows, 5,308 creator rows and matching summary counts. See [step 4 validation](docs/step-4-validation.md).

## Verify

Use Node.js 24+ (local validation uses 24.19.0):

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm run typecheck
npm test
```

Validate the supplied August 30 reference export explicitly (PowerShell):

```powershell
npm run verify:instagram -- --input ..\hindsight-data\Instagram
```

Every reference comparison prints observed, expected and PASS/FAIL; any mismatch exits 1. Missing arguments exit 2. The command is specific to this reference export, not a generic success test for arbitrary users' exports. It prints aggregates only, performs no writes, and says quarantine not_run. It is a developer command, not the eventual end-user interface.

All 20 acceptance checks pass locally: 4,809 saves, 5,245 likes and the full collection/date/field table. The result is intentionally partial because seven placements have no saved match. All saved/liked events are retained. See [step 2 evidence](docs/step-2-validation.md). Offline tests use synthetic data only and check malformed input, encoding, URL rules, ambiguous joins, input boundaries and verifier failure behavior.

Verify and persist the side-table slice outside the repo:

```powershell
npm run verify:instagram-side-tables -- --input ..\hindsight-data\Instagram --output ..\hindsight-data\step-3 --snapshot-id instagram-2026-08-30
```

This earlier side-table-only command writes `instagram-2026-08-30.instagram-side-tables.json`, reloads it and checks source hashes. Fourteen checks still pass. An identical retry is allowed for this standalone artifact; changed content under the same ID is rejected. Full snapshot imports use the separate command above and reject existing IDs. Unmatched placements retain post details with a null saved link and timestamp. See [step 3 evidence](docs/step-3-validation.md).

The [caption investigation](docs/caption-investigation.md) found differences consistent with revisions, without evidence of per-image structure or reliable edit ordering. Selection remains first in export, with all variants preserved. The [streaming contract](docs/streaming-contract.md) permits future incremental input and output; it does not claim a streaming implementation or bounded-memory YouTube support today.

Installation downloads development dependencies. After installation, typechecking and tests run locally without network access, API keys, accounts, or models. CI uses synthetic fixtures only.

There are no runtime dependencies. TypeScript 5.9.3 and Node typings 24.13.3 match the existing voice-checkin toolchain; they provide static checking, not runtime validation. Node executes erasable TypeScript directly; no bundler or transpilation pipeline is needed for this development stage.

## Data and disclosure

The real Instagram fixture was moved outside this repository to `../hindsight-data/Instagram/`. All four file hashes matched after relocation. Developer verification accepts an explicit input path; it does not search for exports automatically. Original exports remain read-only during ingestion.

Never commit personal exports or derived outputs. Root content is ignored by default; only approved source, documentation, and synthetic fixtures are eligible. Git ignore rules cannot prevent a forced add. Review staged contents before every push. `private: true` prevents npm publication; remote repository privacy is a separate GitHub setting.

Every successful import writes `activity.csv`, `creators.csv`, `summary-anonymous.json`, `summary-detailed.json`, `quarantine.log`, and `parse-report.txt`, plus internal snapshot files. Anonymous summaries are **low disclosure**, not anonymity guarantees. Detailed summaries carry `"sensitivity": "personal"` and a warning about interests, beliefs and affiliations. No HINDSIGHT component uploads either file.

Available activity is kept when other files are missing or damaged; the report explains the partial result and the command exits 0. An empty valid export also succeeds, with empty outputs. Missing input folders, no usable data due to errors, and output-write failures exit 1 with plain-English messages. Incorrect command arguments exit 2. Caption absence never causes an otherwise valid event to be skipped. Developer commands currently require a terminal; the later packaged interface will not.

See [build contract](docs/BUILD-CONTRACT.md), [measured schema](docs/instagram-schema.md), [decisions](docs/decisions.md), and [threat model](docs/threat-model.md).
