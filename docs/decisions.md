# Decisions

- Follow voice-checkin: Node 24, ES modules, strict erasable TypeScript, src/tests separation and Node's built-in runner. No runtime dependencies. TypeScript documents the adapter boundary; runtime validation still does the security work.
- Keep only core as an npm workspace for now. Specification folders do not need executable package scaffolding.
- Inject the reader into the parser. This makes missing and rejected inputs testable without giving the parser filesystem-write or network capabilities. This is architectural separation, not an OS sandbox against malicious plugin code.
- Whole-file JSON with a bounded reader is simple to inspect at current file sizes. Streaming JSON is deferred until measured memory justifies a dependency.
- Keep snapshot provenance outside the ten-field Activity schema and platform extras in side tables. Future comparison can preserve both exports without changing every platform row.
- Use versioned JSON/JSONL initially for inspection and lossless records. Introduce a database only for a demonstrated query or scale need.
- Use case-sensitive Instagram shortcodes as URL fallback identity, preserving raw_id as preferred event identity and keeping the observed path type separately.
- Generate two aggregate summaries by default. Removing all creator identity would defeat the user's intended assistant-assisted analysis. Disclosure labels inform the user's choice; HINDSIGHT never uploads the files.
- Source export relocation was explicitly requested before repository creation. Future ingestion never moves or modifies sources; quarantine may delete only disposable working-copy files.
- Step 2's full acceptance table requires collection interpretation. Move that parsing work forward while keeping persistence integration in step 3.
