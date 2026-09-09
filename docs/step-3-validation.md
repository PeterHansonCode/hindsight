# Step 3 evidence — 2026-09-10

Actual GitHub API fields returned visibility: PRIVATE and isPrivate: true for PeterHansonCode/hindsight before changes were pushed. This is separate from package.json's npm publication guard.

Local Windows validation: TypeScript passes; 54/54 offline tests pass, no skips. The original August 30 parser verifier still passes 20/20 comparisons. The new side-table verifier passes all 14 comparisons below. No additional dependencies were installed.

| Check | Observed | Expected | Result |
|---|---:|---:|---|
| Events retained in memory | 10,054 | 10,054 | PASS |
| Persisted post extras | 10,054 | 10,054 | PASS |
| Persisted collections | 73 | 73 | PASS |
| Persisted placements | 4,177 | 4,177 | PASS |
| Unique collection post keys | 4,046 | 4,046 | PASS |
| Posts in multiple collections | 127 | 127 | PASS |
| Matched placements | 4,170 | 4,170 | PASS |
| Valid saved references | 4,170 | 4,170 | PASS |
| Unmatched in this snapshot | 7 | 7 | PASS |
| Unmatched with null saved link/date | 7 | 7 | PASS |
| Ambiguous matches | 0 | 0 | PASS |
| Lossless bundle round trip | true | true | PASS |
| Identical retry | already_exists | already_exists | PASS |
| Source hashes unchanged | true | true | PASS |

The private side-table artifact is under ../hindsight-data/step-3/, outside the repository and the source export. SHA-256 before/after comparisons cover all four source files, including the deliberately unparsed liked comments file. No source content or hash values are printed by the verifier.

New tests exercise lossless reload, unmatched metadata/null dates, empty collections, ambiguous candidate retention, concurrent identical publication, conflicting-write rejection, two coexisting IDs, invalid references, malformed stored data, output-path containment through a Windows junction, and fixed absence wording. The three streaming tests exercise contract-only stand-ins, not a real streaming reader.

## Format and scope

The artifact has a format identifier, schemaVersion 1, platform, caller-supplied snapshotId, personal sensitivity and untrusted-third-party content marker, plus post_extras, collections and placements. Every local reference is scoped to that snapshot ID. The reader requires the current parsed observations to validate links and dates; it does not restore a complete activity snapshot independently. This dependency is intentional until step 4 persists observations and source manifests together.

Matched placements store the referenced saved timestamp; unmatched/ambiguous placements store null. Ambiguous candidates are retained without selecting one. Placement captions, creators and hashtags survive even when unmatched. No membership is added to the event count.

Writes require a directory outside the source tree. A fully written temporary file is linked to a fresh final name without overwrite; identical retries succeed and conflicting data fails. Existing corrupt data is rejected, not repaired. The implementation requires filesystem hard links and is capped at 32 MiB for this buffered artifact. Unsupported storage fails without falling back to unsafe overwrites. Concurrent hostile filesystem replacement and power-loss recovery are not solved by this slice.

Full snapshots, CSVs, summaries, report UI, quarantine and AI remain outside step 3. The caption investigation's backend explanation remains an inference, and YouTube's memory scenario remains a design input, not a benchmark. See caption-investigation.md, streaming-contract.md and decisions.md.
