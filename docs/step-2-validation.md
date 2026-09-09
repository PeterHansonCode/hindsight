# Step 2 validation — 2026-09-10

Local environment: Windows, Node 24.19.0. No runtime dependencies added. Typechecking passes; all 41 offline tests pass with no skips. These tests use invented fixtures and temporary files only. GitHub Actions runs the same suite on Windows and Linux; consult the run status rather than infer remote success from local results.

Command from the repository root:

```powershell
npm run verify:instagram -- --input ..\hindsight-data\Instagram
```

Observed output from the actual parser on the 2026-08-30 export:

| Check | Observed | Expected | Result |
|---|---:|---:|---|
| Saved events | 4,809 | 4,809 | PASS |
| Saved first date UTC | 2018-12-18 | 2018-12-18 | PASS |
| Saved last date UTC | 2026-08-30 | 2026-08-30 | PASS |
| Liked events | 5,245 | 5,245 | PASS |
| Collections | 73 | 73 | PASS |
| Empty collections | 0 | 0 | PASS |
| Collection placements | 4,177 | 4,177 | PASS |
| Unique collection posts | 4,046 | 4,046 | PASS |
| Posts in multiple collections | 127 | 127 | PASS |
| Saved reels | 4,710 | 4,710 | PASS |
| Saved posts (p) | 99 | 99 | PASS |
| Saved captions absent | 91 | 91 | PASS |
| Saved usernames present | 4,809 | 4,809 | PASS |
| Saved username denominator | 4,809 | 4,809 | PASS |
| Unmatched unique post keys | 7 | 7 | PASS |
| Unmatched placements | 7 | 7 | PASS |
| Absent update value | 73 | 73 | PASS |
| Integer update timestamps | 73 | 73 | PASS |
| Non-null Instagram durations | 0 | 0 | PASS |
| Unexpected diagnostics | 0 | 0 | PASS |

Acceptance PASS, exit 0. Parse status partial because seven placements have no saved match. It does not mean saved/liked rows were lost: 10,054 events are retained. Diagnostic counts: duplicate_caption 387 (informational), unmatched_placement 7 (warning), unsupported_file 1 (informational). The comment file is deliberately not read. Quarantine is not_run; no deletion or output writes occur.

Latest measured verification run: 0.43 seconds elapsed, 212.0 MiB process peak RSS, including Node runtime and parsed/normalised data. This is a local observation, not a performance guarantee. The input reader enforces 32 MiB per file during reading; that does not bound total process memory to 32 MiB. Revisit streaming only when larger exports demonstrate a need.

The first real-data validation failed because strict duplicate-label rejection dropped rows with repeated Caption labels. Corrected with a deterministic first-caption rule and lossless captionValues extras, covered by a regression test and documented in instagram-schema.md. Acceptance thresholds were not weakened: every original count matches.

A subprocess test runs the same verifier against the tiny synthetic export. It checks that all 20 comparison lines print, the saved count explicitly reports observed 2 versus expected 4,809 with FAIL, and the process exits 1. A second subprocess test checks missing arguments exit 2. Thus the verifier is tested to reject incorrect data, not merely display reassuring output.

Limits: in-memory side tables only; no persistence, CSV, summaries, full quarantine, UI or AI. Parsed source strings remain untrusted. Files must not be concurrently replaced by a hostile process during ingestion. The reader's containment checks are not an OS sandbox.
