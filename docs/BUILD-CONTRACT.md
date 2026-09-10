# HINDSIGHT build contract

Approved scope: core plus the Instagram adapter, delivered in small reviewable steps. Steps 1–3 were accepted. Finish and stop after step 4's outputs and failure-path validation for review. The other four packages contain specifications only. After approval, prove ERAS against Instagram before adding YouTube; do not start either in this step.

## Delivery steps

1. Relocate private data outside the repo, establish private GitHub repository, README, deny-by-default Git exclusions, contracts, synthetic fixtures and offline scaffold checks.
2. Implement bounded declared-file reading, URL canonicalisation, string repair, saved/liked parsing and collection interpretation necessary to reproduce the ENTIRE acceptance table. A developer script takes an explicit input path and prints observed, expected and PASS/FAIL per line. Any mismatch exits nonzero. Do not defer collection counts to step 3 and still call step 2 complete.
3. Complete persistent side-table integration for post extras, collections and placements, preserving unmatched and ambiguous joins. Investigate captions, permit future streaming in the contract without implementing it, and check actual GitHub visibility before pushing. Persist a standalone snapshot-scoped side-table bundle, not the full snapshot/event store.
4. Persist versioned snapshots and generate both CSVs, both summaries, parse-report.txt and quarantine.log by default. Test CSV formula injection in written files, anonymous-summary disclosure and all eight requested failure paths. Keep --output configurable. Record real-export evidence in step-4-validation.md and stop. No report UI or executable packaging yet.

## Runtime boundaries

Only local filesystem data enters ingestion. No network calls, telemetry, servers, accounts or AI in core. Parsers receive injected readJson and optional iterateJsonRecords capabilities returning unknown data; no writes, output paths, network clients or snapshot management. Runtime shape validation is mandatory. Adding a platform requires one adapter module supplied to the future generic ingest function; generic ingestion must not branch on platform-specific fields. Streaming implementation is deferred; see streaming-contract.md.

Input must be an explicitly selected hand-trimmed directory in this release. Read only adapter-declared relative paths, reject traversal, absolute paths and links escaping the input boundary. Start with a 32 MiB per-file limit enforced during reading, not just a preliminary stat. Parse one whole JSON file at a time. Measure peak process memory against the real fixture; do not equate the byte limit with peak RAM. Missing files and malformed files produce clear diagnostics and allow valid independent files to continue. No valid supported events must be explicit, never silent success.

Diagnostics contain relative file identifiers, one-based row positions where available and fixed reason codes, not captions, raw exception text or absolute user paths. Export content remains untrusted after decoding and structural validation.

## Data model

The Activity type has exactly the ten fields in the user brief. Timestamp is validated ISO 8601 UTC. Instagram duration_sec is always null. Caption maps to title; missing or empty enrichment maps to null. Owner.Username maps to creator_id. Creator aggregation keys are (platform, creator_id), never display names; unknown IDs are not merged into a fictitious person. Usernames may change and are not immutable person IDs.

Each snapshot has independent identity, import time, optional supplied export date, schema/parser versions, source fingerprints and content trust metadata. Never infer export date from the newest event. Observations identify individual source records within snapshots. Event keys match potential corresponding events across snapshots, using platform + event type + raw_id, then a validated platform post identity if the raw ID is absent. Preserve ambiguous matches rather than guessing. IDs must remain strings to avoid numeric precision loss.

Store one immutable versioned JSON/JSONL directory per snapshot outside the source directory. Stage writes and publish only complete snapshots; failed writes must not replace an existing snapshot. CSV is derived, not the authoritative store. Outputs initially describe one selected snapshot. Never sum overlapping exports or overwrite old snapshots. Later diffing uses absence language: present in one export, absent in another; do not infer the cause. Encourage keeping older exports.

Instagram side tables: post extras (observation reference, hashtags, post_type, ordered caption variants and selection provenance); collections (snapshot-local collection identity, name, creation/update timestamps); placements (collection reference, canonical identity, optional saved observation reference, candidate IDs and observed post details). Multiple placements must not create multiple saved events. Unmatched links and savedAt remain null. Matched savedAt comes from the referenced saved event only. A collection timestamp belongs to the collection, not its posts. Persisted references are scoped by bundle.snapshotId; user-facing wording is Unmatched in this snapshot.

## URL and encoding rules

See instagram-schema.md for observed URL evidence. Proposed Instagram identity is instagram:post:<case-sensitive shortcode>. Accept only HTTPS instagram.com or www.instagram.com, no credentials or non-default port, and exactly /reel/<shortcode>, /p/<shortcode> or /tv/<shortcode>, with optional trailing slash. Shortcodes contain ASCII letters, digits, underscore or hyphen. Discard query and fragment for identity; preserve the decoded original URL in Activity. Reject extra segments, encoded separators and lookalike hosts. Path type remains a separate observed attribute. Do not make network requests to resolve URLs. Cross-path equivalence is a documented identity rule, not an observed variation in this fixture. Report ambiguous collisions instead of silently choosing a saved row.

Step 2 tests trailing-slash, query/fragment, path-type equivalence, case-sensitive shortcode differences, malformed URL, unsafe scheme, userinfo, lookalike host and duplicate-match cases. The canonicaliser and regression tests are implemented. Repeated Caption labels use the first value for title and retain all values in post extras; see the measured schema correction.

Apply documented Latin-1 to UTF-8 repair once to every Instagram string value, including nested values. Guard byte representability and strict UTF-8 validity; Buffer.toString does not throw on all corrupt byte sequences. Preserve/report unexpected encoding rather than silently inserting replacement characters. Preserve typographic apostrophes and emoji; repair is not transliteration.

## Outputs

- activity.csv: exact unified columns, ascending UTC timestamp with deterministic tie ordering.
- creators.csv: creator, platform, event_count, first_seen, last_seen; group internally by platform and creator_id even if display names collide.
- summary-anonymous.json: counts, date ranges, anonymous frequency distributions; no names, IDs, captions, URLs or stable pseudonyms. Label low disclosure, never safe to share.
- summary-detailed.json: the above plus creator names and IDs, sensitivity: personal. Include creator counts and temporal bins sufficient for questions about recurring creators; no captions or URLs. Weekly aggregates may support later era analysis but do not claim phases have been computed yet. Warn that interests, beliefs and affiliations may be revealed; share only with a party the user would tell directly.
- quarantine.log: truthful status and removal categories/counts. not_run means no engine ran. no_op means a check ran and removed nothing. A hand-trimmed fixture is not proof that a full export was sanitised. Never fabricate removed entries.
- parse-report.txt: omissions, failures and coverage, using fixed messages without source content.

CSV output must address spreadsheet formula injection, including formula-leading cells and control-character prefixes, as well as RFC-style quoting. Name the threat in implementation comments and tests. Keep internal strings lossless. Generate both summaries by default. Never label either safe. The later share-card step remains separate.

## Acceptance evidence

The 2026-08-30 fixture must match: 4,809 saves; saved UTC range 2018-12-18 through 2026-08-30; 5,245 likes; 73 collections; 0 empty; 4,177 placements; 4,046 unique collection items; 127 items in multiple collections; 4,710 saved reels; 99 saved posts; 91 saved captions absent; 4,809 saved usernames present out of 4,809. Also check 7 unmatched unique placements after canonicalisation, 73 absent update values and 73 integer update timestamps. A parser that merely runs is not accepted.

Synthetic tests cover missing folders, malformed JSON/rows, absent captions, duplicate URL labels, mojibake in all string contexts, absent/None update values, empty collections, multiple memberships, unmatched items, skipped liked comments, invalid timestamps, malicious text, and input boundaries. CI must not load real exports. Broader adversarial gates belong to the later security implementation.
