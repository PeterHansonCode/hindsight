# Direct hashtag audit — 2026-09-13

Personal descriptive output: `../hindsight-data/hashtag-audit-2026-09-13/index.html`. Names, hashtags and post URLs stay outside Git. No naming proposals, clustering, assignments, dependency changes or network access. Section 1 stays paused. No commit or push.

The creator failure is now recorded as sparse repeat-account structure in folder-split-validation.md, not an inconclusive result. Failure to name creator-first groups was never evidence against hashtag signal.

## Rules and scope

Read the verified retained snapshot, not raw exports. Its parser already applied the strict Latin-1-byte to UTF-8 repair; do not repeat that transform on repaired text. Unexpected original encoding diagnostics stay in the snapshot. Extract from all retained captionValues, not only the selected first value; preserve and disclose alternate-only contributions without deciding which caption is current.

Caption tokens use an ASCII `#`, followed by a Unicode letter/number/underscore and then Unicode letters/marks/numbers/underscores. Punctuation, hyphens and emoji stop the token. Exclude attached word fragments and URL spans/fragments. Numeric tags remain textual candidates. NFC-normalise and lowercase, then NFC again. Do not remove accents, stem, translate, expand synonyms or interpret hashtags. Full-width hashes are not treated as ASCII hashes. The conservative extractor is not a claim to implement every Instagram tagging rule.

Structured field values are authoritative exported strings: trim, remove one leading hash and apply the same case/Unicode normalisation, retaining unusual punctuation rather than silently losing structured coverage. Values outside the caption grammar are disclosed separately in personal output. Source disagreement can include such representation differences, not only missing text. No markup is executed; output escapes source strings and validates Instagram URLs. Captions themselves are not printed in the audit.

Deduplicate each tag per canonical post. Whole snapshot: **9,959 unique posts from 10,054 observations**. Saved/liked versions of the same canonical post merge by source union; their channel tables overlap and must not be added. Missing post identity uses record IDs and is counted explicitly. Folder matched records use their saved observation; unmatched/ambiguous folder entries use retained placement text and are disclosed, without inventing a saved match or adding them to the whole saved/liked scope. The three target counts remain 796, 667, 517.

Use merged tags consistently, even where gain is zero. No hidden significance threshold determines which source is used.

- Frequent tag: at least three posts, exactly the requested display rule. JSON also retains all tags occurring once or twice.
- Clean count: posts carrying that tag and no other frequent tag in the same scope. Rarer tags may still be present. This does not establish semantic fit.
- Repeated pair/triple: present together on at least two posts, including tags with only two occurrences. Co-presence is unordered and not adjacency. No naming/support gate beyond repetition. Combinations overlap and cannot be added together as disjoint groups.
- Co-tag partner counts expose breadth: distinct other tags and distinct others sharing at least two posts. No generic/topic label is assigned automatically. Repeated tag bundles may create many pairs/triples.
- Top 10/25/50: union of posts carrying the leading frequent tags, ordered by post count then deterministic tag spelling. Exact leftover and no-frequent-tag counts are separate from completely untagged posts.
- Every tag includes whole-snapshot post count and its counts across all existing folders, so breadth and folder specificity are inspectable without a model label.

## Coverage finding

Caption presence is high, but caption hashtag extraction barely increases post coverage. That is a source-overlap finding, not a negative hashtag-signal result.

| Scope | Posts | With caption | Structured coverage | Merged coverage | Newly covered |
| --- | --- | --- | --- | --- | --- |
| Whole unique saved/liked | 9,959 | 9,352 | 4,681 | 4,687 | 6 |
| Saved | 4,809 | 4,718 | 2,746 (57.10%) | 2,747 (57.12%) | 1 |
| Liked | 5,245 | 4,728 | 1,992 | 1,997 | 5 |
| Target size 796 | 796 | 779 | 447 | 447 | 0 |
| Target size 667 | 667 | 664 | 403 | 403 | 0 |
| Target size 517 | 517 | 509 | 288 | 288 | 0 |

Whole unique-post vocabulary: 33 tags appear only in caption extraction, 1,255 only in structured values. Saved alone: nine caption-only and 407 structured-only distinct tags. The target folders have respectively 0/17, 1/119 and 4/26 caption-only/structured-only distinct vocabularies. These are vocabulary set differences, not per-post discrepancies.

Post-tag source discrepancies: whole 124 caption-only and 6,866 structured-only incidences; saved 34 and 929; liked 90 and 5,982; target folders 2/33, 2/171, 7/39. Thus caption tags can add evidence to already-tagged posts without increasing coverage. Four saved post-tag incidences occur only in alternate captions; no newly covered post depends solely on an alternate caption.

## Direct counts

| Scope | Tags on 3+ posts | Repeated pairs | Repeated triples | Top 10 union | Top 25 union | Top 50 union | No frequent tag | No tag |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Whole | 2,022 | 22,574 | 145,845 | 1,512 | 1,853 | 2,255 | 5,755 | 5,272 |
| Saved | 893 | 4,095 | 9,825 | 853 | 1,183 | 1,473 | 2,377 | 2,062 |
| Liked | 1,196 | 18,375 | 135,141 | 739 | 959 | 991 | 3,517 | 3,248 |
| Target 796 | 126 | 352 | 253 | 190 | 254 | 309 | 439 | 349 |
| Target 667 | 131 | 243 | 116 | 164 | 213 | 259 | 325 | 264 |
| Target 517 | 63 | 88 | 26 | 122 | 162 | 187 | 319 | 229 |

These lists are the deliverable. They are not automatically converted to folders or interpreted as coherent topics.

## Reproduction and checks

```powershell
npm run audit:hashtags -- --snapshot ../hindsight-data/step-4/instagram-2026-08-30-validated --output ../hindsight-data/hashtag-audit-another-run --largest 3 --source-root ../hindsight-data/Instagram
```

Require a fresh output directory with an existing parent, outside the repository and protected inputs. All names and post links are personal. Existing files are not overwritten. Source hashes were reverified after counting and recorded in provenance.json alongside observation-level coverage.

Typecheck PASS; **137/137 tests PASS**. Seven new tests cover Unicode/case/punctuation/URL handling; source-vocabulary versus incidence counts; deduplication/clean counts/union coverage; repeated pair/triple inclusion without naming gates; full pagination and hostile HTML/URL handling; cross-channel canonical-post deduplication; and retained command integrity/output protection.

Independent output audit checked all 336,933 emitted pair/triple rows against their post memberships and counts, all tag posting counts, top-N set unions, and every local HTML link target. Counts were not truncated. The complete deliverable is 708 files, about 456 MiB, including full JSON and 500-row HTML pages for whole/saved/liked and the three folders. This is intentionally exhaustive and repetitive across overlapping scopes, not a compact product payload. A page renders only its own rows. Generation took 7.222 seconds; measured peak RSS was 731.70 MiB. This is a personal audit, not bounded-memory streaming or a family-laptop performance acceptance claim.

No browser/offline acceptance run was performed for this new audit. Static HTML has no scripts or automatic network resources; validated post links navigate only on user action. Earlier user-tested report acceptance is not transferred to this artifact.
