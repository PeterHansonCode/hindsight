# Hashtag distinctiveness and folder comparison — 2026-09-13

Personal output: `../hindsight-data/hashtag-taxonomy-2026-09-13/index.html`. Two newly requested named folders were analysed, plus the requested comparison folder with upgraded rankings. Named details and URLs remain outside Git. No interpretation, proposed folder names, assignments, dependencies, network calls, commit or push. Section 1 remains paused.

## Command

```powershell
npm run audit:hashtags -- --snapshot ../hindsight-data/step-4/instagram-2026-08-30-validated --output ../hindsight-data/my-next-audit --folder "Your folder name" --source-root ../hindsight-data/Instagram
```

Repeat `--folder "Another name"` for multiple targets. Add `--compare "Reference folder"` to compare the **first selected folder** with the reference; its upgraded audit is also generated. A named run uses the whole snapshot as the baseline without duplicating the large whole/saved/liked HTML tables. Existing `--largest 3` remains available, but cannot be combined with explicit folder selection.

Matching first tries case-insensitive trimmed NFC spelling; if none matches, it tries punctuation/space/emoji-insensitive spelling. Only a unique result is accepted. Duplicate requests collapse to one folder. Ambiguous or missing names produce a clear message and nonzero exit before creating output. The original requested first name had an emoji suffix; the unique fallback resolved it without changing the source name. Output must be fresh with an existing parent, outside inputs and repository.

## Rankings and flags

For every tag, publish its inside count/share, whole unique-post count/share, and `log2(((k_in+0.5)/(n_in+1))/((k_whole+0.5)/(n_whole+1)))`. The baseline is the whole unique saved/liked snapshot **including the target**, as requested, not the rest-of-folder baseline used by the old group labeller. Smoothed ratios are descriptive, not significance or certainty. Raw and distinctiveness orderings retain every tag with at least three folder posts; all tags and scores are also in JSON. No era naming gates were reintroduced.

Separate review flags retain all underlying rows and post links:

- Engagement: exactly the supplied list (fyp, explore, explorepage, reels, trending, viralreels, viral, foryou, foryoupage).
- Folder spelling: punctuation/space-insensitive whole name and words of at least four characters, simple trailing-s/trailing-ing forms, then exact or one-edit matches for strings at least five characters. These rules flag spelling variants, not synonyms. Flag reasons remain inspectable.
- Snapshot-wide: a tag on at least **10% of all saved posts**, a disclosed operational definition chosen before the run. No observed tag in these three scopes meets that rule. It was not lowered to manufacture noise flags.

“Only flagged” requires at least one tag and no unflagged tag, including rare tags. It is separate from entirely untagged; their sum is the number with no unflagged evidence. The raw pairs/triples and clean-post definition stay intact. Additional top-10/25/50 union coverage is shown for full distinctiveness and unflagged distinctiveness orderings.

Possible names/systems are unflagged tags on at least three folder posts with log2 ratio >=2 and whole-snapshot share <=0.5%. The rule uses no dictionary of people or methods. It is a deliberately broad candidate screen: uncommon topical words and bundles also qualify. The user must confirm actual names. Flagged candidates are separated, not deleted. No semantic category is assigned automatically.

## Anonymous results

| Scope | Posts | Tagged | Frequent tags | Flagged tags (all frequencies) | Only flagged posts | No tags | No unflagged tags | Unflagged name/system candidates |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| First requested folder | 216 | 127 | 63 | 5 | 3 | 89 | 92 | 53 |
| Second requested folder | 130 | 92 | 29 | 14 | 3 | 38 | 41 | 13 |
| Comparison folder | 667 | 403 | 131 | 12 | 6 | 264 | 270 | 82 |

The comparison folder's six flagged-only posts do not reproduce the user's approximate 60 manually set aside: these are narrower, explicit automatic rules, not a reconstruction of the user's manual grouping. No threshold was tuned to match 60. Candidate counts are broad, especially in the first and comparison folders; they are not counts of identified people/methods.

Top-10/25/50 distinctiveness union counts are 26/60/102, 46/71/73, and 42/78/145, respectively. Raw-count coverage is 88/102/111, 57/72/73, and 164/213/259. Distinctiveness finds narrower differences at the cost of raw coverage; both orderings are visible.

## Cross-folder comparison

The first requested and reference folders share **167 hashtags and nine filed posts**. Every shared tag has both counts and shares; the nine posts have validated links.

Tag distributions use one incidence per post per tag, normalised over incidences within each folder. JSD ranges 0 (identical) to 1 (disjoint); shared mass is the sum of the smaller probability per tag, with larger values meaning more overlap. These do not measure held-out assignment accuracy. Hashtag-rich posts contribute more incidences; untagged posts contribute none.

| View | JSD bits | Shared mass |
| --- | --- | --- |
| All tags, shared posts included | 0.6499 | 24.02% |
| Flags excluded symmetrically | 0.6663 | 23.22% |
| Flags excluded; tags with >=3 combined incidences | 0.4189 | 40.88% |
| Shared posts removed; all tags | 0.6848 | 21.64% |
| Shared posts removed; flags excluded | 0.7038 | 20.61% |
| Shared posts removed; flags excluded; >=3 incidences | 0.4565 | 38.22% |

Flags for either folder are excluded from both sides, avoiding artificial distinction from their names. The repeated-tag sensitivity view shows that rare tags contribute substantial separation. The two observed distributions are not identical and have an overlapping core; these statistics do not establish whether a personal taxonomy boundary is arbitrary. Only 127/216 and 403/667 posts carry tags at all. No conclusion about all posts is inferred from that incomplete coverage.

## Validation

Typecheck PASS; **143/143 tests PASS**. Six added tests cover exact whole-baseline scores/raw ordering, deterministic noise flags/only-flagged counts, dictionary-free candidate selection, named selection and ambiguous decoration, identical/disjoint/unassessable distributions and shared-post removal, and inert HTML with retained rankings. Existing command integration additionally exercises repeated --folder, --compare, missing names and incompatible selection flags. All previous tests pass.

Real-run scores were independently recomputed and flag-only/no-tag totals checked; every generated local HTML link resolves. Retained source integrity is reverified and provenance includes resolved folder identities. Run time was 0.481 seconds and peak RSS 234.89 MiB. The new artifacts have not received a browser/offline acceptance test; no prior report acceptance is transferred to them.
