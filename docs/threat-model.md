# Threat model — initial specification

This is a design document with partial implementation evidence. Step 2 implements declared-file reads, size bounds, link/path rejection, strict decoding, structural validation and content-free diagnostics. The quarantine engine and downstream CSV/report/MCP defenses remain specifications.

Assets: original exports, third-party content and identifiers, local snapshots, derived summaries, filesystem integrity and repository history. Inputs can be malformed, oversized, unexpectedly shaped or deliberately hostile. An export being officially downloaded does not make its captions trusted.

| Threat | Planned boundary / verification |
|---|---|
| Personal exports committed to Git | Keep exports outside repo; deny default paths; synthetic-only fixtures; inspect staged contents. Forced adds remain possible. |
| Path traversal, escaping symlinks/junctions | Declared relative input paths; containment checks; bounded read; Windows and Linux tests. No ZIP ingestion in core. |
| Resource exhaustion | Enforce per-file read limits while reading; validate shapes; measure real memory use; clear failures. |
| Sensitive data retained or logged | Future working-copy quarantine taxonomy; truthful not_run/no_op/completed status; fixed diagnostic codes, no content snippets. |
| Spreadsheet formula injection | Neutralise spreadsheet-executable text cells at CSV serialization, including control-prefix tricks; preserve lossless internal strings; test formula payloads and quotes/newlines. Name this threat in serializer comments when implemented. |
| HTML/script injection | Future report escapes text and validates links; no remote scripts, assets or raw HTML interpolation. |
| INDIRECT PROMPT INJECTION VIA THIRD-PARTY CONTENT IN PERSONAL DATA EXPORTS | Keep content marked untrusted; future MCP/LLM access has a policy boundary, minimal capabilities and explicit source attribution. No model or MCP implementation in v1 core. A caption saying to disclose contacts stays data. Regex cleaning cannot establish injection immunity. |
| Interest disclosure through summaries | Detailed file labelled personal; anonymous distributions labelled low disclosure. Neither guarantees anonymity or safety; no automatic uploading. |
| Misleading historical claims | Snapshot-scoped counts; absence language; first/last observed, never completeness or inferred causes. |

The later security package will define the full PII taxonomy and a broader adversarial CI gate. Current synthetic tests include path/junction rejection and malicious text, but are not the full security gate. Local filesystem permissions and compromised host software are outside the protection provided by parser interfaces. The reader rejects all descendant links; its path checks are not a sandbox against hostile concurrent directory replacement. The user-selected input tree must not be modified during reading.
