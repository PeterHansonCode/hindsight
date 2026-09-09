# Decisions

- Follow voice-checkin: Node 24, ES modules, strict erasable TypeScript, src/tests separation and Node's built-in runner. No runtime dependencies. TypeScript documents the adapter boundary; runtime validation still does the security work.
- Keep only core as an npm workspace for now. Specification folders do not need executable package scaffolding.
- Inject the reader into the parser. This makes missing and rejected inputs testable without giving the parser filesystem-write or network capabilities. This is architectural separation, not an OS sandbox against malicious plugin code.
- Whole-file JSON remains the implemented Instagram reader. The contract explicitly permits streaming; implementation is deferred, not architecturally excluded. See the memory decision below.
- Keep snapshot provenance outside the ten-field Activity schema and platform extras in side tables. Future comparison can preserve both exports without changing every platform row.
- Use versioned JSON/JSONL initially for inspection and lossless records. Introduce a database only for a demonstrated query or scale need.
- Use case-sensitive Instagram shortcodes as URL fallback identity, preserving raw_id as preferred event identity and keeping the observed path type separately.
- Generate two aggregate summaries by default. Removing all creator identity would defeat the user's intended assistant-assisted analysis. Disclosure labels inform the user's choice; HINDSIGHT never uploads the files.
- Source export relocation was explicitly requested before repository creation. Future ingestion never moves or modifies sources; quarantine may delete only disposable working-copy files.
- Step 2's full acceptance table requires collection interpretation. Move that parsing work forward while keeping persistence integration in step 3.
- Repeated Caption labels exist in the reference data. Select the first in source order for the unified title, retain every value in post extras, and emit an informational diagnostic. Do not treat repetition as a malformed event or concatenate alternative captions.
- Observation IDs are deterministic source-file/row references local to one parse. The later snapshot layer must scope them to its snapshot ID; event keys omit source positions so reordering does not change matching identity.
- Parse status partial includes unmatched placements even when acceptance passes. Acceptance means matching the measured export; complete would incorrectly conceal known gaps.

## Memory ceiling and future YouTube ingestion

The user's Instagram run measured 187.7 MiB RSS for roughly 30 MB input (about 6x as a rough ratio). Our recorded step 2 run measured 212.0 MiB; step 3 measured 217.7 MiB. RSS includes the runtime, buffers, parsed objects and normalised rows. These ratios vary and are not linear predictions.

The user supplied a 100–300 MB YouTube watch-history planning scenario; we have not benchmarked such an export. Today's 32 MiB whole-file ceiling would reject it. A naive 6x extrapolation at 300 MB suggests approximately 1.8 GB RSS, an unacceptable design assumption for unattended family laptops, not a measured result. Raising the whole-file limit is not the plan.

ParserInput now optionally exposes iterateJsonRecords alongside readJson, with separate total-byte/per-record limits, backpressure, cancellation and terminal validation. PlatformParser also permits incremental-only adapters: streaming input would not suffice if normalised output still had to accumulate in ParseResult.events. Types and synthetic contract demonstrations exist; no streaming JSON reader, incremental coordinator or YouTube implementation exists. See streaming-contract.md for provisional-record and malformed-tail rules.

The step 3 side-table bundle is still buffered and capped at 32 MiB. Future storage and aggregation must consume incremental emissions and bound their own indexes and sorting. An iterator interface alone is not a bounded-memory guarantee.

## Persist side tables before full snapshots

One versioned bundle contains exactly the three Instagram side tables, marked personal and untrusted, scoped to a caller-supplied snapshot ID. Validate references before publication and after loading. Unmatched in this snapshot means null savedObservationId and savedAt; ambiguous joins retain candidates and select none. Empty collections and ordered caption variants survive persistence.

Publish by linking a fully written, synced temporary file to a new destination name, then removing the temporary name. This cannot overwrite an existing target: identical retries succeed, changed contents under one ID fail. It requires same-filesystem hard-link support (verified on local Windows); unsupported filesystems fail clearly. File sync does not guarantee directory-metadata durability across power loss. An interrupted process may leave an unpublished temporary file. Full snapshot recovery belongs to step 4.

This standalone artifact is not a complete snapshot: event persistence and source manifests remain step 4. The existing caption-selection decision is supported and bounded by the findings in caption-investigation.md; first_in_export does not mean latest.
