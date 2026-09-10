# Step 4 validation

Step 4 is complete: aggregate outputs, immutable snapshot folders, human-readable parse reports, and tested failure handling. The WIP checkpoint was c880af3. No new dependencies were added. The private GitHub repository's API returned visibility PRIVATE before final publication; this is independent of package.json private.

## Local results

- TypeScript: PASS.
- Offline tests: 79/79 PASS, no failures or skips.
- Original real-export acceptance: 20/20 PASS.
- Step 3 side-table verification: 14/14 PASS.
- Real import: exit 0, 10,054 events retained; partial status records seven unmatched collection placements.
- Independent output verification: 15/15 PASS, using Python's CSV/JSON readers and SHA-256 checks. Only aggregate results were printed.
- SHA-256 checks before and after the real import: all four source files unchanged.

The local runtime was Windows, Node 24.19.0. The latest parser-only validation run peaked at 215.8 MiB RSS and took 0.45 seconds. This is not a memory measurement of the full output-writing pipeline; it does not establish YouTube capacity. CI uses synthetic fixtures only.

## Reproduce

```powershell
npm run typecheck
npm test
npm run verify:instagram -- --input ..\hindsight-data\Instagram
npm run verify:instagram-side-tables -- --input ..\hindsight-data\Instagram --output ..\hindsight-data\step-3 --snapshot-id instagram-2026-08-30
npm run import:instagram -- --input ..\hindsight-data\Instagram --output ..\hindsight-data\step-4 --export-date 2026-08-30
```

The last command generates a new snapshot ID and prints the full output directory. The validated artifact already exists at ../hindsight-data/step-4/instagram-2026-08-30-validated/. Reusing that explicit ID fails rather than overwriting it. An earlier WIP artifact is left unchanged. No files are written inside the source export or the repository.

## Written outputs

| File | Verified result |
|---|---|
| activity.csv | 10,054 rows plus header; 4,809 saved and 5,245 liked; ascending UTC timestamps; all duration cells empty |
| creators.csv | 5,308 creator rows plus header; event counts sum to 10,054 |
| summary-anonymous.json | 10,054 events; frequency distribution matches an independent creator counter; sensitivity low disclosure |
| summary-detailed.json | Same counts plus 5,308 creator identities and weekly frequencies; sensitivity personal; warning says it reveals interests, beliefs and affiliations |
| parse-report.txt | Plain English first, with references to optional diagnostics below; no raw source excerpts or reason codes as primary text |
| quarantine.log | Truthfully says quarantine did not run and no files were removed |

Internal files are observations.jsonl, side-tables.json, diagnostics.json and manifest.json: ten files in total. The manifest includes source fingerprints, parser/schema versions, import time, supplied export date, snapshot ID, parse status, event count and checksums/byte lengths for the other nine artifacts. Missing, rejected and skipped files are recorded separately from source fingerprints; fingerprints describe exact bytes actually read, not unread files. Liked comments remain deliberately unparsed.

The combined saved/liked observed date range is 2017-12-17T00:36:32.000Z through 2026-08-30T22:48:58.000Z. This differs from the saved-only acceptance range, which still begins 2018-12-18. No completeness claim or duration estimate is made.

## CSV formula injection: demonstrated behavior

The test named **CSV formula injection: written CSV neutralises = + - @ tab and carriage return; JSONL is lossless** sends all six requested leading characters through the actual import command. It reads the written activity.csv and creators.csv with an independent CSV decoder and asserts apostrophe-prefix neutralisation in the resulting cells. Additional cases include plain text starting with tab/CR, spaces before a formula, commas, quotes and embedded line breaks.

It also reads observations.jsonl and checks that original parsed captions are unchanged there. CSV protection is an export-boundary transformation, not a mutation of the authoritative records. These are serialization/round-trip tests; they do not automate every spreadsheet application's behavior after users edit or re-save the CSV.

## Anonymous-summary disclosure tests

Tests recursively reject exact personal field names and check that known synthetic names, IDs, captions and URLs do not occur. The aggregate count key events_without_creator_id is allowed: it stores a number, not an identifier.

A second test replaces names, creator IDs, raw post IDs, captions and post URLs with distinctive canaries, reruns the real import command and asserts the anonymous summary is byte-for-byte unchanged. It verifies those canaries really reach the personal CSV, and that detailed output contains only the intended creator canaries, not caption/URL canaries. This makes the privacy assertion behavioral rather than a README claim or manual inspection.

The anonymous file is described as low disclosure, never as guaranteed anonymity. Detailed output is personal. Neither file is labelled safe to share.

## Failure-path tests and exit policy

| Condition | Automated result |
|---|---|
| Input folder missing entirely | Exit 1; clear input-location message; no output folder |
| One of four files missing | Each file tested separately; remaining activity succeeds with exit 0; supported missing files explained; comments remain intentionally unsupported |
| Truncated or malformed JSON | Both tested: exit 0 with explicit partial report when other activity remains; exit 1 when no usable activity remains |
| Zero-byte file | Explicit empty-file message; same partial-versus-failed exit policy |
| File over limit | Actual sparse 32 MiB + 1 byte fixture rejected before parsing; explicit size-limit message; partial or failed exit as above |
| Valid JSON with wrong shape | Object in place of array rejected with plain format message; partial or failed exit as above |
| Empty but valid export | Exit 0; zero counts, null date range, empty frequency distribution and header-only CSVs; explicit no-activity message |
| Output directory not writable | Filesystem EACCES injected at mkdir; command handler returns 1 with a writable-folder instruction; no output directory created |

All file/input cases run as subprocesses and assert no stack trace or planted private error text appears. Permission denial is injected at the filesystem boundary for deterministic Windows/Linux coverage, including elevated CI accounts; it is not a real Windows ACL test. The same command handler is used by the CLI wrapper, which assigns its returned exit code to process.exitCode.

An ENOSPC fault injected during a later snapshot's write proves no new completed snapshot appears and an earlier snapshot remains verifiable. The fault applies only to writes, so validating the earlier snapshot still exercises real reads. Additional tests cover snapshot-ID conflict, two coexisting snapshots, source-tree output rejection, checksum corruption, creator identity grouping and UTC week/year boundaries.

## Human-facing report

The real report states: 603 items had no caption and were kept with an empty title. Missing captions do not cause skipped events. Repeated captions are explained without selecting a supposed original/latest version. Seven placements are unmatched in this snapshot, with no inferred saved date or cause. Diagnostics use fixed reason codes only in the separate technical JSON file.

## Transaction and scope limits

Output locations are configurable through --output. Each run gets its own snapshot directory. All artifacts are staged, file contents synced, and the completed directory renamed into place. A per-ID lock prevents cooperating writers from racing; existing IDs are never overwritten. Ordinary failures remove the operation's own staging directory and lock. A killed process or failed cleanup can leave hidden staging/lock directories; these are not complete snapshots. Choose a new ID to proceed. Directory-metadata power-loss durability and hostile concurrent directory replacement are not guaranteed.

The current buffered implementation retains a 32 MiB per-input/per-output-artifact limit. Incremental parsing contracts remain available but streaming is unimplemented. No HTML report, wizard, quarantine engine, AI, ERAS algorithm or YouTube parser was added. The agreed next experiment is ERAS on the retained Instagram data, after review of this step.
