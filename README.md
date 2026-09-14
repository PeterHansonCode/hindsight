# HINDSIGHT

A local memory aid for close friends and family: **corroborating evidence for their life story**. The tool supplies evidence — recorded creators, actions and dates. The user supplies meaning — a holiday, starting university, a memory of what life was like. HINDSIGHT must not invent that second part. Never interpreting or narrating the user's life is the mechanism, not a missing feature.

The primary planned shape is **one downloadable, self-contained HTML file**. Open it in a browser, select an export and work locally. No install, hosted upload, account, telemetry, runtime network assets or AI in the browser/core. “Turn off your wifi. Now use it. It still works” is an acceptance target, not a claim that the unbuilt browser shell already works. Optional local annotations let the user mark their own dates, uncertainty and notes. Nothing requires them to annotate or share.

This is not an analytics dashboard, launch or growth project. No percentiles, normative comparisons, goals, discrepancy scores or moralised consumption labels. The audience is people who already trust the builder. The packaged executable and quarantine engine are cancelled; CLI and MCP remain other shells over the same core. MCP is built last as the portfolio's principal prompt-injection defense demonstration.

## What exists today

The Node implementation reads declared files from an explicitly selected hand-trimmed Instagram directory, validates and repairs supported rows, and publishes immutable local snapshots. It also explores a retained snapshot without re-parsing an export: calendar activity, folder metadata, coverage, hashtags, action-clock distributions, account-frequency counts, URL formats and declared session groupings. Source text remains untrusted and originals stay read-only.

The accepted exploration has 10,054 observations. Its important limits changed the plan: 67/73 folders were created in 2026; 4,047/4,809 saves are from 2026; 90.96% of 2025 saves are unfiled. Current collections offer dense labels roughly December 2025–August 2026, **not a whole-history topic timeline**. Earlier likes have creator evidence and incomplete hashtag coverage instead. See [exploration findings and corrections](docs/instagram-exploration.md).

Step 6 now adds multi-year creator lifecycles, reviewed per-channel session fits and the complete prespecified folder-burst grid. The burst boundaries are parameter-sensitive; see [step-6 validation](docs/step-6-validation.md). Step 8 now generates a self-contained personal HTML report with activity, creator lifecycles, uncertainty-aware folder SVGs and editable/importable annotations. Browser ZIP intake, streaming, YouTube, CLI packaging and MCP are **not implemented**. The user passed Windows Chrome offline acceptance on 2026-09-11; the revised annotation round trip remains pending; see [step-8 validation](docs/step-8-validation.md). No quarantine engine will be built. Existing logs still say not_run under their legacy contract; the planned disclosure states that no files are removed and only declared payload paths are read. An allowlist does not remove private information from allowed captions or other fields.

Current validation: typecheck and 143/143 local tests pass. Independent retained-data checks cover all repeat lifecycle rows and all 1,355 qualifying nested bars across the full grid. These are implementation checks, not validation of personal phase boundaries or browser benchmarks.

## Current developer commands

Requires Node.js 24+; local validation used 24.19.0. No runtime dependency is installed. Development dependency installation may use the network; ingestion, exploration and tests use local files without models.

```powershell
npm run typecheck
npm test
npm run import:instagram -- --input ../hindsight-data/Instagram --output ../hindsight-data/step-4 --export-date 2026-08-30
npm run explore:instagram -- --snapshot ../hindsight-data/step-4/instagram-2026-08-30-validated --output ../hindsight-data/exploration-new-run --known-month 2021-11 --source-root ../hindsight-data/Instagram
```

These are developer interfaces, not the planned family-facing workflow. The optional known month is supplied context. Output directories must be outside protected inputs/repository and must not replace existing snapshots/reports. `--source-root` protects an original export directory without reading it for exploration. The existing Node importer still expects a hand-trimmed directory; full untrimmed-export intake is step 8 work.

Snapshots contain observations, side tables, manifest, diagnostics, both CSVs, both summaries and truthful logs. Anonymous summaries are **low disclosure**, never anonymity guarantees. Detailed reports and annotations are personal and may reveal interests, beliefs and affiliations. Committed findings omit source account names; named exploration outputs stay outside Git. The renderer's old research percentiles/comparison tables are preserved as historical evidence, not the new product UI specification.

## Current sequence

6. Creator lifecycles and Kleinberg burst detection — accepted; [findings and reproducible commands](docs/step-6-validation.md).
7. Export diffing across two independently dated Instagram snapshots, deferred until after the report; the 9 August export still needs its own import.
8. **Current work: report implementation; [validation and remaining acceptance checks](docs/step-8-validation.md).** Includes the existing single-file/offline/annotation/intake requirements; proceeds before step 7.
9. Full streaming pipeline, then YouTube.
10. CLI, then MCP server as the last security/portfolio milestone.

The earlier changepoint [ERAS preregistration](docs/eras-experiment.md) is superseded but preserved. It was not run on real data; its discipline was not wasted. Creator records can span years without pretending that current folders labelled those years. Saving timestamps record saving, never publication or viewing. A save can mean reference, aspiration, shopping, a recipe or a meme; current folders only partly clarify the recent period.

## Privacy and meaning

Only declared payload paths may be opened. The future disclosure combines that authority with the actual read audit; archive filename metadata is distinguished from file contents. HINDSIGHT never removes files from an export; operation-owned temporary-output cleanup is a separate, scoped action. Your export contains sensitive material; you may want to delete the ZIP yourself after use. Keeping it for later snapshot history is your choice.

No recorded activity here is not absence of interests or activity elsewhere. Say **last recorded here**, never churned, lost or abandoned. The user may supply context through annotations; the tool must not assign causes. MCP has a separate explicit selection/permission boundary: a local server can still feed a cloud client, so the browser's offline guarantee cannot be promised for every model client.

See the [build contract](docs/BUILD-CONTRACT.md), [decisions](docs/decisions.md), [threat model](docs/threat-model.md), [schema](docs/instagram-schema.md) and [streaming contract](docs/streaming-contract.md). Step 6 is accepted. The generated step-8 report is ready for local review; core offline acceptance passed; revised annotation acceptance remains pending.

Activity charts and the shared date-range control are [designed for review](docs/activity-and-range-design.md), not implemented yet.

The personal [folder split proposer](docs/folder-split-design.md) reads retained filing evidence without moving anything. See [results and commands](docs/folder-split-validation.md). Section 1 remains paused.

A [direct hashtag audit](docs/hashtag-audit-validation.md) now supplements the creator attempt: structured plus caption tags, counts, clean-post counts and complete repeated pair/triple tables, without naming or clustering.

The hashtag audit now accepts repeated `--folder "name"` and optional `--compare "name"`, with [dual rankings, flags and cross-folder comparison](docs/hashtag-taxonomy-validation.md).
