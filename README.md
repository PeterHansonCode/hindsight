# HINDSIGHT

A local-first tool for understanding activity recorded in your own platform exports. Event counts are facts; missing durations stay missing. Exports are snapshots, not complete account histories.

## Current state: step 3

Core reads declared files from a hand-trimmed directory and parses Instagram saved/liked events, collections and placements. Strict encoding repair, URL matching, diagnostics and exact reference validation are implemented. Step 3 adds lossless persistence of the three side tables, scoped to a snapshot ID, with reference validation and no-overwrite retries. Full snapshot/event persistence, CSV/summary outputs, quarantine engine, report, wizard, MCP server and AI remain unimplemented. Optional streaming contracts exist; streaming itself is not implemented.

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

This writes `instagram-2026-08-30.instagram-side-tables.json` in the selected output directory, reloads and validates it, and checks all source hashes. Fourteen checks pass; all 54 offline tests and typechecking pass locally. An identical retry is allowed; changed content under the same ID is rejected. The artifact contains personal captions and creator information: it is not a summary or a complete snapshot. Unmatched placements retain post details with a null saved link and timestamp, described only as unmatched in this snapshot. See [step 3 evidence](docs/step-3-validation.md).

The [caption investigation](docs/caption-investigation.md) found differences consistent with revisions, without evidence of per-image structure or reliable edit ordering. Selection remains first in export, with all variants preserved. The [streaming contract](docs/streaming-contract.md) permits future incremental input and output; it does not claim a streaming implementation or bounded-memory YouTube support today.

Installation downloads development dependencies. After installation, typechecking and tests run locally without network access, API keys, accounts, or models. CI uses synthetic fixtures only.

There are no runtime dependencies. TypeScript 5.9.3 and Node typings 24.13.3 match the existing voice-checkin toolchain; they provide static checking, not runtime validation. Node executes erasable TypeScript directly; no bundler or transpilation pipeline is needed for this development stage.

## Data and disclosure

The real Instagram fixture was moved outside this repository to `../hindsight-data/Instagram/`. All four file hashes matched after relocation. Developer verification accepts an explicit input path; it does not search for exports automatically. Original exports remain read-only during ingestion.

Never commit personal exports or derived outputs. Root content is ignored by default; only approved source, documentation, and synthetic fixtures are eligible. Git ignore rules cannot prevent a forced add. Review staged contents before every push. `private: true` prevents npm publication; remote repository privacy is a separate GitHub setting.

Planned outputs include `activity.csv`, `creators.csv`, `summary-anonymous.json`, `summary-detailed.json`, `quarantine.log`, and `parse-report.txt`. Anonymous summaries are **low disclosure**, not anonymous guarantees. Detailed summaries carry `"sensitivity": "personal"`: they reveal interests, beliefs and affiliations; share only with a party you would tell those things to directly. No HINDSIGHT component uploads either file.

See [build contract](docs/BUILD-CONTRACT.md), [measured schema](docs/instagram-schema.md), [decisions](docs/decisions.md), and [threat model](docs/threat-model.md).
