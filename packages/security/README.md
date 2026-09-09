# Security — specification only

See ../../docs/threat-model.md and ../../docs/BUILD-CONTRACT.md. Future quarantine operates only on disposable working copies. Taxonomy includes messages, contacts/connections, login/IP history, payment data, device identifiers and precise location; prefer an allowlist for retained activity. No deletion of original exports. Log actual removal categories and counts without sensitive content; distinguish not_run, no_op and completed.

Future ZIP handling must reject traversal and escaping links, bound expansion and handle partial extraction. Add adversarial CI gates for filesystem boundaries, malformed/oversized inputs, leakage, spreadsheet formula injection, report injection and indirect prompt injection via third-party export content. No security engine is implemented in step 1.
