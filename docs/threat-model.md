# Threat model — read-only selection, offline evidence, explicit MCP boundary

This is a design revision, not a claim that new defenses are implemented. Existing Node evidence covers declared-path reads, size/path/link bounds, strict decoding, shape/reference validation, safe diagnostics, snapshot publication, CSV formula neutralisation and disclosure projection. Browser ZIP, annotation/rendering and MCP defenses remain to be implemented. The quarantine engine is cancelled permanently: no privacy-driven deletion of originals or disposable copies.

Assets: original exports, selected observations and source text, user annotations, local derived bundles, filesystem integrity, repository history, and the user's control over disclosure and meaning. Official exports can contain malicious third-party text. A valid hash establishes consistency with a manifest, not authenticity against a maliciously rewritten manifest.

## The protection is an allowlist, not a blocklist

Only adapter-declared relative payload paths can be opened. Unknown export additions remain unopened without requiring a sensitive-file taxonomy. Do not extract everything and delete selected categories afterwards. Node containment rules and the future browser archive selector enforce the same logical policy; interfaces are not an OS sandbox against arbitrary malicious plugin code or a compromised host.

Today the Instagram descriptor declares four paths: saved/saved_posts.json, likes/liked_posts.json, saved/saved_collections.json and likes/liked_comments.json. The parser actually reads the first three and deliberately skips the fourth as unsupported. Therefore an allowlist is an upper bound on authority, not proof all four were opened. Future capability minimisation can narrow declarations, but no code is changed in this revision.

A disclosure section must be generated from the exact versioned descriptor and the actual read audit. Record declared paths, opened payload paths and outcomes, declared-but-unopened paths, and that every other payload was outside authority. Test it against instrumented reads, including changed adapter descriptors and failed/partial reads. Do not infer actual access from a static paragraph.

Proposed wording when supported by that audit: **“We opened only the selected activity files listed here. We did not open messages, login-history, contacts, advertising-profile or location-data files.”** Category descriptions require versioned descriptor metadata mapping known path semantics; path strings alone cannot generate a correct semantic taxonomy. Prefer the exact list plus “other file contents were not opened” when category semantics are unknown. The claim is about files, not absence of private details: an allowed caption, username or URL may itself mention a location, contact or private fact. No claim of content sanitisation or complete detection of PII is made.

ZIP directory enumeration reads filenames/sizes and other archive metadata even for unopened entries. State that separately. Do not inflate, hash, inspect or log non-allowlisted payload contents to prove that they were skipped. Avoid retaining raw unknown filenames in logs; they can be sensitive too. Refuse ambiguous roots or duplicate logical matches rather than guessing which copy the user intended.

The next version of quarantine.log will say **“No files are ever removed; only declared paths are read.”** This wording is explicitly scoped to source export files, not operation-owned temporary output cleanup. Proposed policy marker: declared_paths_only, source removal policy never, removed export count 0, plus the generated disclosure. Existing cleanup of incomplete output stages remains scoped to paths created by that operation. Retain legacy not_run/no_op/completed meanings when reading old artifacts and never rewrite immutable snapshots. Current logs still contain the older not_run wording; a future code change must update it with tests, not pretend this documentation changed runtime output.

User guidance: **“Your export contains sensitive material; you may want to delete the ZIP yourself after use.”** That decision belongs to the user. Keeping an export for future diffing is also their choice.

## Threats and acceptance evidence

| Threat | Boundary and required test |
| --- | --- |
| Personal source/annotation data committed | Outside-repo inputs/outputs, deny-by-default Git paths, synthetic fixtures and staged-content review. Forced adds remain possible. |
| Traversal, links, ambiguous archive entries | Exact logical path selection, bounded metadata and contents, reject duplicate/root ambiguity, links and traversal; instrument unopened ZIP entries to prove no payload access. |
| Decompression bombs/resource exhaustion | Bound selected entry sizes during inflation, total expanded bytes, metadata counts, nesting and retained state; cancellation and measured browser memory. Worker responsiveness is not a memory bound. |
| Sensitive data leaked through diagnostics | Fixed messages and aggregate coverage; no captions, arbitrary exception strings or unknown metadata paths. Allowed-file content remains personal. |
| CSV formula injection | Existing serialisation neutralisation and written-file tests remain required in Node and any browser export. |
| Script/markup injection | Text-only rendering for captions, labels and annotations; safe JSON embedding including closing-script payloads; restrictive CSP; no remote media, frames or executable source markup. Test imported annotations as hostile too. |
| Unexpected requests or deferred uploads | Entire HTML/worker/ZIP codec bundled locally, request-denial tests, no telemetry/sync, no remote references triggered by data; airplane-mode acceptance. External navigation only by explicit informed user action. |
| Loss of annotations | User-visible save state, explicit portable local bundle and import; do not promise automatic durability from file-origin browser storage. Source snapshots remain immutable. |
| Prompt injection through MCP | Primary adversarial use case described below, exercised against capability boundaries rather than relying on model obedience. |
| Misleading memory claims | Action-time provenance, gaps/coverage and current-folder limits. User-authored meaning is separate from computed evidence; no causal, normative or absence-as-disinterest claim. |

Browser ZIP intake needs untrimmed-export tests even though quarantine is cancelled. A correct path allowlist does not by itself validate an archive implementation. Downloading HTML instead of an executable changes trust and compatibility concerns, not the need for secure code. The application cannot prevent a malicious extension, compromised machine, hostile concurrent filesystem replacement or intentionally modified application file.

## MCP is the primary prompt-injection attack surface

The local MCP shell, built last, is the concrete portfolio centrepiece: third-party export text is intentionally made available to a model client. This is the primary place indirect prompt injection is realised in the architecture, not an optional speculative feature. It is **not yet a running/live server**. Core and the offline browser perform no model calls.

A caption could instruct the client to ignore policy, read contacts or send private observations elsewhere. Imported annotations, creator names, hashtags and tool-result fields are untrusted text too. Keeping instructions out of core does not make model-facing data trusted. An allowed file can carry the attack.

Server policy: explicitly user-selected snapshots only; aggregate tools by default; bounded, separately authorised excerpts; no arbitrary path arguments, filesystem enumeration, contact access, write/delete tools, shell execution, URL fetching or outbound network capability. User annotations are excluded by default and need separate explicit inclusion. Stable source references and contentTrust accompany responses; source text cannot grant permissions or change tool selection policy. Log decisions/counts rather than content. Use the same reader allowlist and disclosure across shells.

Use a local transport such as stdio, not an exposed HTTP service by default. The MCP server making no network calls does **not** mean its client keeps data offline: a cloud model client may transmit supplied tool results. Selection/permission copy must distinguish this from the browser's offline guarantee. No automatic connection or sharing; no assumption that model integration is harmless because the source is the user's own export.

Adversarial acceptance must include instruction-bearing captions/labels/annotations asking for contacts, files outside the selected snapshot, extra tools, forged system messages and outbound disclosure; source-response limits and provenance; no secret canary leakage through logs/errors; and real demonstrations of denied capability escalation. Sanitisation, delimiters and regex filtering cannot prove prompt-injection immunity, and the server cannot control unrelated powers the host gives its model. Document that residual risk and keep this shell read-only and narrowly scoped. Synthetic fixtures only in CI; no personal data sent to an LLM during implementation without explicit authorisation.
