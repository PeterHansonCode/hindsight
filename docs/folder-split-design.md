# Folder split proposer — fixed design, 2026-09-12

Personal decision aid; no assignments change. Section 1 remains paused. Input is a retained snapshot plus a folder ID (or an explicitly requested largest-N batch). Write a single all-folder audit and separate creator-grouped proposals outside Git. All names and URLs in generated output are personal. No network, dependency, raw reparse or detector run.

## Counting and evidence

Deduplicate placements by canonical post key within a folder. Only unambiguous saved-observation joins provide creator/session/hashtag evidence; unmatched or ambiguous placements stay put and remain visible. Counts of identifiable unique posts and unknown placements are separate. A creator ID is an observed account identifier, not proof of immutable identity or single-topic content.

For each target creator show target count, raw distinct-post counts in every other folder (including zeros), external distinct posts, and concentration. Each external post contributes a total of one vote split equally among its other folders, avoiding extra confidence from multiply filed posts. Report largest weighted share and HHI (sum of squared weighted shares).

Fixed strong-suggestion rule: at least five distinct external posts, largest weighted share >=0.80 and HHI >=0.65. This is strong filing evidence, not a calibrated probability or proof all that creator's posts belong there. If the rule fails, leave the creator in place for review. No external folder evidence defines residue. Recompute the same mapping excluding target posts: if that independent-post evidence does not pass with the same winner, downgrade to leave/review. This stops shared posts validating themselves.

Direct same-post filing: report target/destination intersections for every pair and per creator, including target posts already at the proposed destination. It corroborates a suggestion, but is not an independent test because it comes from the same filing history. Report alternative-folder intersections too. Distinct posts across >1 folder are counted once globally.

## Residue

Build saved sessions from the complete retained saved channel using the accepted 14.34-minute crossing (860.4 seconds; fixed, not refitted). Consecutive action gaps greater than the threshold start a session; equality remains in-session. Session membership describes saving together, not a topic guarantee. Deduplicate each creator within a session.

For residue creators within the target, connect a pair only after >=2 shared sessions on >=2 Brisbane dates AND shared-session Jaccard >=0.20. Use deterministic complete-link grouping: a creator can join a group only if supported by every existing member. Sort creators by target count then ID; pick the first compatible group. This avoids connected-component chaining, but the greedy partition is order-dependent; disclose the fixed order and retain all edges, including cross-group edges. Isolated creators stay individual review items. Session groups are weaker review suggestions for a new folder, never high-confidence reassignment. No support adjustment after results.

## Labels

Use literal observed hashtags; never invent a topic name. Rank by the existing smoothed log2 ratio: log2(((k_in+0.5)/(n_in+1))/((k_out+0.5)/(n_out+1))). Count a hashtag once per distinct post; outside is the rest of the target. Preserve the labelling spec's support gates: >=5 inside posts across >=3 weeks, outside >=40 posts across >=4 weeks, positive ratio. Show at most three labels with counts and ratios, plus hashtag-bearing post coverage. Below 50% coverage explicitly say weak hashtag coverage; at 20% say 20%, not merely weak. No supported tags => list creator IDs as observed evidence and say no supported hashtag name. Existing destinations retain their actual folder name. Missing hashtags do not mean absent topics.

## All-folder audit, once per batch

- Bin candidate requires ALL: >=100 identifiable posts; creator HHI <=0.10; hashtag incidence normalised Shannon entropy >=0.80. Hashtag evidence additionally needs >=20 hashtag-bearing posts, >=30% coverage and >=10 distinct tags. Creator-known coverage must be >=90%. Otherwise show not-assessable or not-qualified with every metric. These thresholds define operational candidates, not objective semantic incoherence; generic tags can inflate diversity.
- Merge-review pair: >=10 shared identifiable posts, Jaccard >=0.50, and intersection covers >=50% of each folder. Also show containment candidates separately: >=5 shared and >=80% of the smaller folder. Containment alone is not a merge suggestion. No claim of topic identity from overlap. Show all pair metrics for inspection.
- Under-five folders: fewer than five identifiable posts AND no unknown-identity placements that could lift the count. Uncertain cases are disclosed.
- For every folder, list creators observed in exactly one folder in THIS snapshot, with their counts and share of matched posts. Never claim 'only one folder ever' from a single snapshot. Unfiled saves from the creator are counted separately, not misrepresented as other-folder evidence.

## Usable personal output

One audit HTML/JSON and one proposal HTML/JSON per target. Proposals contain ranked groups, creator decision cards, destination evidence, literal hashtag labels, coverage, and per-post clickable validated Instagram URLs. Proposed groups rank by posts removed from target / creator decisions, then total posts, then stable key. Show strong-existing-folder and session-review evidence types explicitly; ranking does not upgrade confidence. A separate leave-in-place list includes weak/mixed creators and unmatched/ambiguous records. Each post gets a proposed action or a stay flag; nothing executes it.

Count creator decisions/searches separately from post operations. Existing-destination posts need target removal only; others need destination addition plus target removal. Assuming all suggestions accepted, show new additions, removals, already-destination posts, unresolved links and new folders. An illustrative click range assumes 4–8 clicks per add+remove, 2–4 per removal-only, 2–4 per creator search and 3–6 per new folder. These are explicit unmeasured workflow assumptions, not a verified Instagram UI contract; failed links, scrolling, login, network delay and finding a particular post add unknown work. Report totals separately for strong suggestions and optional session groups. One creator is one decision/search, NOT one physical move. Do not promise an exact click count. Output links are the only intentional external navigation and require the user's click.

## Verification

Synthetic tests: fractional votes, self-validation exclusion, concentrated versus mixed creators, absent creator and unmatched placements, duplicate placements, repeated-session versus one-session/chain edges, supported label formula and missing-coverage behaviour, pair overlap/zero denominators, action conservation and cost arithmetic, escaped HTML/untrusted URL rejection, unknown folder, source/output protection and fresh-directory writes. Verify original snapshot hashes after the real run. Commit only anonymous aggregate findings; no names/URLs in repo. No automatic commit requested.
