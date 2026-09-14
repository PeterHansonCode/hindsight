# HINDSIGHT build contract

HINDSIGHT is a local memory aid for close friends and family: corroborating evidence for their life story. The tool supplies evidence; the user supplies meaning. Never guessing that meaning is the mechanism, not a missing feature. Annotations are core and optional. No adoption funnel, virality, launch, app-store strategy or export-turnaround optimisation is in scope.

Steps 1–6 are accepted; see step-6-validation.md. Step 8 report design now precedes step 7 diffing and stops for review before implementation. The primary delivery shape is a downloadable self-contained HTML application. The packaged executable and quarantine engine are cancelled. CLI and MCP remain additional shells over the same core; MCP is the final portfolio/security milestone. The old changepoint design is superseded and retained as prior work, not a pending implementation request.

## Delivery steps

1–5. Accepted foundation: read-only declared-file Instagram parsing, validated snapshots/side tables, outputs/failure paths and reusable descriptive exploration. Existing Node commands remain available. Historical validation documents retain their original measurements.

6. Creator lifecycles and Kleinberg burst detection — accepted. See [lifecycles-and-bursts.md](lifecycles-and-bursts.md). Multi-year creator records and the recent folder-labelled save window remain distinct.
7. Export diffing across two independently dated Instagram snapshots — deferred until after the report. The 9 August export is not parsed; it needs its own supplied-date snapshot first. Presence/absence only; identical imports are not two timepoints.
8. Single self-contained HTML browser application and memory report, including ZIP allowlist/disclosure, optional user annotations, accessible overlapping swimlanes and offline verification on untrimmed exports. The report consumes data in memory; it must not assume filesystem output. See [browser-and-annotations.md](browser-and-annotations.md) and the review-stage [presentation design](step-8-report-design.md).
9. Complete incremental reading/coordinating/aggregation/persistence, then YouTube. A streaming reader alone is insufficient.
10. CLI and MCP server over the same core, with MCP built last and its prompt-injection defenses demonstrated. No packaged .exe, installer, quarantine or strangers' beta requirement remains in this order.

Current execution order: approved step 8 report work, then deferred step 7, followed by steps 9–10. The generated personal report and annotation UI are implemented; standalone export intake remains outstanding. The user passed core offline browser acceptance on 2026-09-11; revised annotation round-trip acceptance remains pending. See step-8-validation.md.

## Runtime boundaries

Only explicitly user-selected local data enters ingestion. The implemented shell uses the filesystem; the target browser shell uses Files/Blobs and selectively opened ZIP entries. No network calls, telemetry, accounts or AI in core or the browser shell. The later local MCP server exposes only explicitly selected evidence through a separate policy boundary; a model client is not part of core. Parsers receive injected readJson and optional iterateJsonRecords capabilities returning unknown data; no writes, output paths, network clients or snapshot management. Runtime shape validation is mandatory. Adding a platform requires one adapter module supplied to the future generic ingest function; generic ingestion must not branch on platform-specific fields. Streaming implementation is deferred; see streaming-contract.md.

The current Node importer still expects an explicitly selected hand-trimmed directory; full-export ZIP/File selection is step 8 work, not implemented protection evidence. The permanent policy is read-only, declared-path payload access, never quarantine or deletion. Read only adapter-declared relative paths, reject traversal, absolute paths and links escaping the input boundary. Start with a 32 MiB per-file limit enforced during reading, not just a preliminary stat. Parse one whole JSON file at a time. Measure peak process memory against the real fixture; do not equate the byte limit with peak RAM. Missing files and malformed files produce clear diagnostics and allow valid independent files to continue. No valid supported events must be explicit, never silent success.

Diagnostics contain relative file identifiers, one-based row positions where available and fixed reason codes, not captions, raw exception text or absolute user paths. Export content remains untrusted after decoding and structural validation.

## Data model

The Activity type has exactly the ten fields in the user brief. Timestamp is validated ISO 8601 UTC. Instagram duration_sec is always null. Caption maps to title; missing or empty enrichment maps to null. Owner.Username maps to creator_id. Creator aggregation keys are (platform, creator_id), never display names; unknown IDs are not merged into a fictitious person. Usernames may change and are not immutable person IDs.

Each snapshot has independent identity, import time, optional supplied export date, schema/parser versions, source fingerprints and content trust metadata. Never infer export date from the newest event. Observations identify individual source records within snapshots. Event keys match potential corresponding events across snapshots, using platform + event type + raw_id, then a validated platform post identity if the raw ID is absent. Preserve ambiguous matches rather than guessing. IDs must remain strings to avoid numeric precision loss.

The implemented Node shell stores one immutable versioned JSON/JSONL directory per snapshot outside the source directory. This is a persistence implementation, not a required engine/report interface; the browser keeps selected data in memory and exports a user-chosen local bundle explicitly. Stage writes and publish only complete snapshots; failed writes must not replace an existing snapshot. CSV is derived, not the authoritative store. Outputs initially describe one selected snapshot. Never sum overlapping exports or overwrite old snapshots. Later diffing uses absence language: present in one export, absent in another; do not infer the cause. Encourage keeping older exports.

Instagram side tables: post extras (observation reference, hashtags, post_type, ordered caption variants and selection provenance); collections (snapshot-local collection identity, name, creation/update timestamps); placements (collection reference, canonical identity, optional saved observation reference, candidate IDs and observed post details). Multiple placements must not create multiple saved events. Unmatched links and savedAt remain null. Matched savedAt comes from the referenced saved event only. A collection timestamp belongs to the collection, not its posts. Persisted references are scoped by bundle.snapshotId; user-facing wording is Unmatched in this snapshot. Collections are a recent topic source only: 67/73 were created in 2026, 4,047/4,809 saves are from 2026, and 90.96% of 2025 saves are unfiled. The dense current-folder window is roughly December 2025–August 2026; no historical topic labelling of earlier likes or whole-history membership is available.

## URL and encoding rules

See instagram-schema.md for observed URL evidence. Proposed Instagram identity is instagram:post:<case-sensitive shortcode>. Accept only HTTPS instagram.com or www.instagram.com, no credentials or non-default port, and exactly /reel/<shortcode>, /p/<shortcode> or /tv/<shortcode>, with optional trailing slash. Shortcodes contain ASCII letters, digits, underscore or hyphen. Discard query and fragment for identity; preserve the decoded original URL in Activity. Reject extra segments, encoded separators and lookalike hosts. Path type remains a separate observed attribute. Do not make network requests to resolve URLs. Cross-path equivalence is a documented identity rule, not an observed variation in this fixture. Report ambiguous collisions instead of silently choosing a saved row.

Step 2 tests trailing-slash, query/fragment, path-type equivalence, case-sensitive shortcode differences, malformed URL, unsafe scheme, userinfo, lookalike host and duplicate-match cases. The canonicaliser and regression tests are implemented. Repeated Caption labels use the first value for title and retain all values in post extras; see the measured schema correction.

Apply documented Latin-1 to UTF-8 repair once to every Instagram string value, including nested values. Guard byte representability and strict UTF-8 validity; Buffer.toString does not throw on all corrupt byte sequences. Preserve/report unexpected encoding rather than silently inserting replacement characters. Preserve typographic apostrophes and emoji; repair is not transliteration.

## Outputs

- activity.csv: exact unified columns, ascending UTC timestamp with deterministic tie ordering.
- creators.csv: creator, platform, event_count, first_seen, last_seen; group internally by platform and creator_id even if display names collide.
- summary-anonymous.json: counts, date ranges, anonymous frequency distributions; no names, IDs, captions, URLs or stable pseudonyms. Label low disclosure, never safe to share.
- summary-detailed.json: the above plus creator names and IDs, sensitivity: personal. Include creator counts and temporal bins sufficient for questions about recurring creators; no captions or URLs. Weekly aggregates may support later era analysis but do not claim phases have been computed yet. Warn that interests, beliefs and affiliations may be revealed; share only with a party the user would tell directly.
- quarantine.log: preserve existing snapshot logs and their literal legacy statuses. The next version makes the permanent policy explicit: no files are ever removed; only declared payload paths are read. Add a versioned declared_paths_only policy and actual read disclosure, with removed count zero, rather than rewriting the historical meaning of not_run. The current code still emits the old wording; this document does not claim it was changed. There is no sanitisation engine to build.
- parse-report.txt: omissions, failures and coverage, using fixed messages without source content.

CSV output must address spreadsheet formula injection, including formula-leading cells and control-character prefixes, as well as RFC-style quoting. Name the threat in implementation comments and tests. Keep internal strings lossless. Generate both summaries by default. Never label either safe. No automatic share card or growth feature is planned; any personal save/export is an explicit user action.

## Acceptance evidence

The 2026-08-30 fixture must match: 4,809 saves; saved UTC range 2018-12-18 through 2026-08-30; 5,245 likes; 73 collections; 0 empty; 4,177 placements; 4,046 unique collection items; 127 items in multiple collections; 4,710 saved reels; 99 saved posts; 91 saved captions absent; 4,809 saved usernames present out of 4,809. Also check 7 unmatched unique placements after canonicalisation, 73 absent update values and 73 integer update timestamps. A parser that merely runs is not accepted.

Synthetic tests cover missing folders, malformed JSON/rows, absent captions, duplicate URL labels, mojibake in all string contexts, absent/None update values, empty collections, multiple memberships, unmatched items, skipped liked comments, invalid timestamps, malicious text, and input boundaries. CI must not load real exports. ZIP/browser and MCP adversarial tests belong to their respective shell milestones, not a quarantine subsystem.

## Memory-aid output contract

The user may mark dates/periods with uncertain bounds and free text locally. Annotations remain user-authored, owned by the user and separate from source observations; never required or uploaded. Their data shape and export/import persistence are specified in browser-and-annotations.md. Selecting dates on a timeline replaces the blank ground-truth form, but annotations made after seeing evidence are not held-out validation.

Answer history and context. User annotations can supply factors; the tool must not infer causes. Show no percentiles, comparisons to other people, goals, discrepancy scores, normative rankings or automated better/worse before–after framing. The old exploration's tables are historical research, not the new UI contract. Rank lanes by sustained recorded contact rather than raw count, and say last recorded here. No churn/at-risk/lapsed/dormant/lost/abandoned labels, moralised consumption terms or failure framing about the user's life.

Save timestamps date saving, never publication. A save can have many intentions; current folders only partly clarify the recent window. The November 2021 volume/clock change overlaps the 2022 low-count/migration context and cannot be attributed to either cause. The friends-versus-creators hypothesis was not supported; its frequency direction was reversed, without a causal explanation.
