# Folder split proposer — validation, 2026-09-12

Implemented the fixed [design](folder-split-design.md) and ran the three largest folders selected by the user, against the retained 2026-08-30 snapshot. Section 1 remains paused. No folders/posts were moved; source files are read-only. No dependencies or network calls were added. No commit or push.

## Personal deliverable

Open `../hindsight-data/folder-split-review-2026-09-12/index.html`. It links one all-folder audit and the three independent proposals. HTML and JSON contain names, IDs and URLs and stay outside Git. Each creator has counts in every other folder, weighted concentration, target-excluded support, direct shared-post evidence, and a post checklist. Proposed and leave-in-place posts are separate. Do not blindly combine proposals: a post may appear in multiple targets.

Reproduce in a fresh directory (parent must exist):

```powershell
npm run propose:folders -- --snapshot ../hindsight-data/step-4/instagram-2026-08-30-validated --output ../hindsight-data/folder-split-another-run --largest 3 --source-root ../hindsight-data/Instagram
```

For one folder, replace `--largest 3` with `--folder "ID from the audit"`. Unknown IDs and existing/protected outputs fail with a plain message and nonzero exit. Snapshot identity/hashes are retained in the personal provenance file; manifest/artifact integrity was reverified before publishing. A previous development run is preserved separately rather than overwritten.

## Results, without names

| Target size | Creators | Only-this-folder creators / posts | Strong proposed posts | Optional session posts | Stay | Illustrative clicks if all accepted |
| --- | --- | --- | --- | --- | --- | --- |
| 796 | 553 | 452 / 624 | 0 | 28, in 3 groups / 6 decisions | 768 | 133–266 |
| 667 | 480 | 298 / 366 | 12, in 2 groups / 8 decisions | 0 | 655 | 62–124 |
| 517 | 457 | 337 / 355 | 4, in 3 groups / 4 decisions | 0 | 513 | 24–48 |

The sparse creator recurrence is a real limit on posts-per-decision. The rules were not relaxed to produce a larger split. Only one creator that passed the full concentration rule failed the target-excluded independent-post check (in the 667-post folder). Thus the conservative self-corroboration guard is not the main cause of the small result.

No proposed group met the existing hashtag naming support gates. No topic names were invented. Coverage, candidate support and observed creator IDs remain available. Session groups are weaker review suggestions, not semantic clusters proven to belong together. The deterministic complete-link grouping avoids transitive chaining but can depend on the declared creator order; all supported pair edges are retained for inspection.

Across all 73 folders: **8 bin candidates, 22 under-five folders, 127 distinct posts in multiple folders, zero merge-review pairs and zero containment-review pairs** under the fixed rules. Zero pairs does not establish that no folders would benefit from merging; overlap alone did not meet this criterion.

The three largest pass the bin rule:

| Size | Creator HHI | Hashtag entropy | Hashtag coverage | Only-this-folder posts / matched posts |
| --- | --- | --- | --- | --- |
| 796 | 0.002860 | 0.928086 | 56.16% | 624 / 796 |
| 667 | 0.002848 | 0.933789 | 60.42% | 366 / 667 |
| 517 | 0.002802 | 0.951621 | 55.71% | 355 / 517 |

High diversity can reflect generic hashtags or broad creators, not actual semantic incoherence. “Only this folder” describes this snapshot only. The audit publishes every folder's numbers, not just the candidates.

Click figures are estimates from declared assumptions, not observed Instagram interaction measurements. Strong suggestions for the 667-post folder need eleven additions and twelve target removals (one post is already in its suggested destination); the 517-post folder needs four additions and four removals. The 796-post optional groups require 28 additions, 28 removals and three new folders. Creator decisions/searches do not eliminate per-post clicks. URL availability, login, scrolling and finding posts can increase effort.

## Checks

Typecheck PASS. **130/130 tests PASS**, including nine folder-split tests: fractional membership votes; strong/mixed/self-corroborating evidence; already-filed costs and post conservation; repeated sessions and anti-chaining; exact smoothed log-ratio support and weak coverage; pair overlap/small-folder audit; escaped names and blocked hostile URLs; retained-snapshot command/fresh-output protections/deduplication; and all-three-conditions bin qualification. Existing report tests remain passing.

Real output post conservation checked independently: proposed plus stay equals 796, 667 and 517, without omitting or duplicating target posts. The full JSON includes rules and support numbers. HTML is static with no scripts, styles/assets requiring network, or automatic requests; only validated Instagram post links navigate when clicked. No new browser/offline acceptance run is claimed for these files. The user's prior offline acceptance applies to the earlier report, not automatically to this new artifact.


## Correction after direct hashtag audit — 2026-09-13

The creator approach's limited result has an identified reason: 553, 480 and 457 creators for 796, 667 and 517 posts leave sparse repeat-account structure for large creator-level decisions. This matches the earlier observation that 67.93% of combined 2026 activity involved accounts observed once or twice (different scope; not a direct percentage for these folders). The result is a finding about dispersed saving across accounts, not an unexplained/inconclusive method run. It does not literally mean no creator ever repeats.

The old hashtag step only attempted to name already-formed creator/session groups under the era labelling gates. Its failure to name those groups was **not a test of whether hashtags contain useful organising signal**. A separate direct count/co-occurrence audit now counts hashtags first, with no naming gates or clustering; see hashtag-audit-validation.md. The old output is preserved as history, not presented as a negative hashtag-signal result.
