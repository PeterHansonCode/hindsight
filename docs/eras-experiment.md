> **SUPERSEDED — historical preregistration, not the current implementation plan.** The accepted exploration led to creator lifecycles and Kleinberg burst detection; see [lifecycles-and-bursts.md](lifecycles-and-bursts.md). No real-data changepoint experiment ran, so this is neither an experimental success nor a failed detection result. The discipline of fixed criteria, independent references, sensitivity and honest negative results remains useful prior work. The old ground-truth form is replaced by optional local annotations in [browser-and-annotations.md](browser-and-annotations.md); retrospective annotations are not held-out truth. Any old quarantine/executable/sequence statements below are archived context, not roadmap items. Do not execute this document's old gates or defaults.

# ERAS experiment — design for review, not implementation

Status: **DEFERRED, not cancelled**, by the revised step-5 request. Exploratory counting now precedes any decision to run this experiment. The preregistration below is preserved on the shelf; no real-data detection has run. Previous status: approved initial design, with amendments awaiting re-review. No real-data distances, detected boundaries or labels have been computed. A separate synthetic-only cost prototype has been measured as requested; see section 8. No network requests, raw-export parsing or new dependencies are authorised. The descriptive deliverable is required regardless of the detector's verdict.

## 1. Falsification criteria — written before the sparsity calculation

This section was written to disk before calculating weekly occupancy for this step. It is the failure contract, not a set of targets to tune toward. These gates apply to a proposed automatic Instagram era detector, not to changepoint detection on every possible platform. Failing a gate means we stop this approach for Instagram and retain descriptive activity/creator timelines. Do not search for a prettier configuration on these same data and call it a confirmatory result. Any later revised experiment must keep the failure visible and use new held-out evidence.

1. **Insufficient evidence:** if there are fewer than three independently supplied, evaluable reference boundaries spanning at least two known phases, or no sufficiently supported continuous period for a two-sided comparison, the experiment cannot establish useful era detection. Do not ship an automatic whole-history era timeline. Report insufficient evidence rather than an algorithmic success. Detailed minimum support rules must be fixed after the occupancy audit and before distances or phase dates are used.
2. **Missed lived phases:** every primary reference boundary that is dated with uncertainty at most four weeks and has sufficient observations on both sides must match a primary detected boundary. Matching uses the supplied date interval expanded by two weeks, one-to-one. One eligible missed primary boundary fails this gate. No post-hoc relabelling of a phase as secondary. Unevaluable phases stay in the evaluation table, explicitly counted as not demonstrated, never silently removed.
3. **Instability:** at least 80% of primary detected boundaries must recur within four weeks in at least 75% of eligible configurations in the prespecified sensitivity grid. Match boundaries one-to-one. A grid configuration unable to support the comparison counts as unsupported, not a confirming vote. If there are no primary boundaries, this gate cannot establish success. Also publish every configuration's boundary count and dates; an apparently stable subset does not hide unstable extras.
4. **Noise control failure:** on 100 creator-label permutation null datasets per activity channel, preserving event weeks and total creator frequencies while removing their association, at most 5/100 may produce any boundary above the primary scan-wide threshold. On 100 stationary two-week-block reorderings per channel, at most 10/100 may do so. Fix reproducible seeds and use separate calibration versus test randomisations. Exceeding either limit fails the method's control of false structure for these data. These are operational gates, not proofs of statistical error control under arbitrary serial dependence.
5. **No reproducible evidence:** if resampling retains fewer than 70% of primary boundaries within four weeks, or all boundaries depend on counting both a save and a like of the same post, the claimed eras fail. Report low-support candidates and sensitivity results even if they cause failure. Confidence here is evidence stability, never a probability that an interest phase is true.
6. **Irreducible ambiguity:** boundaries cannot be sold as interest changes if the evidence cannot distinguish changed creator composition from switching between saving and liking, missing/sparse observations or an export's endpoint. If separate-channel and activity-mix controls leave that ambiguity unresolved, the combined automatic timeline fails. This does not require likes and saves to have identical boundaries; disagreement is evidence to report.

Hard stop: if any gate above fails, abandon automatic changepoint-based Instagram eras for this release. No silently relaxed windows, thresholds, matching tolerance, labels or success definition. A sparse or right-censored known phase is not evidence against the user's recollection; it is a limit of this export and blocks claims that the detector recovered that phase. There is no retrospective parameter selection using supplied phase dates.

The occupancy audit below was completed after writing these criteria. No distances, boundary scores or phase matches were calculated. The criteria above remain unchanged.

## 2. What was measured before designing the detector

Source: the retained `instagram-2026-08-30-validated` snapshot in `../hindsight-data/step-4/`, with supplied export date 2026-08-30 and parser version 0.3.0. All manifest checksums were verified. The SHA-256 of `observations.jsonl` is `8080892ba165712539863565e13adf523c7f0f4a649fc2fbd090f862f203cb31`. This audit read retained observations; it did not rerun the adapter or read the original export. No source or snapshot files were changed.

The audit grouped validated observation timestamps into Monday-starting UTC weeks. It included every week between the first and last observation, including zero-count weeks: **455 weeks, starting 2017-12-11 through 2026-08-24 inclusive**. The actual observation range is 2017-12-17T00:36:32Z to 2026-08-30T22:48:58Z, slightly longer than the described 2018–2026 history. Endpoint weeks are included in occupancy counts but must not be treated as proof of complete observation before or after the export. “Near-empty” was defined as 1–4 events, separately from empty, before counting.

| Calendar-week statistic | Combined | Saved | Liked |
| --- | ---: | ---: | ---: |
| Events | 10,054 | 4,809 | 5,245 |
| Median events/week, including zeros | **9** | **0** | **6** |
| Mean events/week | 22.10 | 10.57 | 11.53 |
| Empty weeks | 53 (11.65%) | 333 (73.19%) | 60 (13.19%) |
| Near-empty weeks, 1–4 events | 112 (24.62%) | 48 (10.55%) | 142 (31.21%) |
| Total weeks below 5 events | 165 (36.26%) | 381 (83.74%) | 202 (44.40%) |
| Median in nonempty weeks only | 12 | 8 | 8 |
| Longest consecutive empty run, weeks | 12 | 60 | 12 |
| Distinct creator IDs | 5,308 | 3,240 | 2,287 |
| Events from creators observed only once in that channel | 4,066 (40.44%) | 2,513 (52.26%) | 1,858 (35.42%) |

The common calendar includes time before the first saved observation (2018-12-18). Restricting saves to their own 402-week observed span still gives a median of **0** and **280 empty weeks (69.65%)**. Early missing saves therefore do not explain away the sparsity. An empty week means no retained observations, not proof of no activity or no interests.

Calendar-year counts below use each event's UTC year, not the year of its week's Monday. That distinction matters around New Year.

| Event year | Saved | Liked | Combined |
| --- | ---: | ---: | ---: |
| 2017 | 0 | 4 | 4 |
| 2018 | 1 | 52 | 53 |
| 2019 | 0 | 151 | 151 |
| 2020 | 2 | 582 | 584 |
| 2021 | 2 | 1,689 | 1,691 |
| 2022 | 1 | 404 | 405 |
| 2023 | 11 | 349 | 360 |
| 2024 | 59 | 762 | 821 |
| 2025 | 686 | 1,192 | 1,878 |
| 2026, through this export | 4,047 | 60 | 4,107 |

**Assessment:** 10,054 observations justify an experiment in supported periods; they do not justify a continuous eight-year creator-based timeline. A weekly vector is extremely sparse relative to thousands of creators. More than half the saves belong to creators appearing once. Large distances between adjacent windows may simply reflect this turnover, which is why null calibration is a prerequisite, not an optional finishing check. Saves provide little historical evidence before 2025; likes provide little in 2026. Neither behaviour is a sample of everything watched, and event counts alone cannot establish recoverable phases.

### Prespecified fourth channel: repeat creators (amendment before detection)

The fourth channel is **repeat-combined**: retain observations whose `(platform, creator_id)` occurs at least three times in the original combined saved-plus-liked snapshot. The cutoff is across that channel's whole snapshot, not per week, window, era or behaviour. Thus two saves plus one like qualify. This interpretation supplies exactly four channels: saved, liked, combined and repeat-combined. Freeze membership before permutations or bootstraps; do not reselect it in a replicate. No pooled “other” category is introduced.

Run repeat-combined through the identical support rules, primary configuration, 45-configuration grid, calibration/test nulls, 200 bootstraps and six gates. Apply the same reference endpoints as combined, reporting repeat-channel eligibility separately. For its behaviour-mix controls, split this fixed repeat cohort into saved and liked subsets and assess their support separately; do not apply another >=3 filter within those subsets. Freeze the cohort also for post-deduplication sensitivity. A fourth-channel success cannot replace a failed full-creator result or rescue the overall verdict. Report disagreement explicitly: restricting to recurring creators changes the population being described and is not proof that turnover caused a full-channel failure.

The following repeat-channel occupancy audit is authorised before detection. No creator/time distances or actual boundaries are to be computed until this amendment has been re-reviewed and ground truth frozen.

### Shared support rules (all four channels)

A candidate split is a Monday. Compare the preceding W complete calendar bins with the W bins starting at that split; never borrow future observations beyond this snapshot. Each side must contain at least **40 events, observations in at least ceil(W/2) distinct weeks, and at least five distinct known creator IDs**. Missing creator IDs contribute to event coverage but never form a fictitious creator. Count their coverage separately if encountered. An entirely absent comparison is unsupported, never distance zero.

These are minimum evidence safeguards, not a statistical power guarantee. Forty observations still cannot estimate thousands of creator probabilities precisely. W=8 is the primary comparison: it sacrifices temporal precision to reduce weekly sampling noise. Smaller and larger windows are mandatory sensitivity checks, not alternatives chosen by their results.

The following is an occupancy-only audit of those rules. It reports eligible weekly split dates, **not detected boundaries**.

| Weeks on each side | Combined eligible splits | Saved eligible splits | Liked eligible splits | Repeat-combined eligible splits |
| --- | ---: | ---: | ---: | ---: |
| 4 | 184 | 54 | 147 | 121 |
| 6 | 242 | 65 | 201 | 171 |
| **8** | **272** | **69** | **241** | **205** |
| 10 | 291 | 67 | 264 | 221 |
| 12 | 295 | 65 | 269 | 232 |

Repeat-combined contains **4,692 observations from 594 creators**, retaining 46.67% of combined events. On the same 455-week calendar its median is **4 events/week**, with **95 empty weeks** and **141 near-empty weeks (1–4)**. Its first and last eight-week eligible split dates are **2019-11-18 and 2026-07-06**, with gaps between them; those endpoints do not imply continuous support. Filtering improves repeat-creator concentration but reduces event support: 205 eligible splits versus 272 combined. These are measured support counts only, recorded before any real-data distance calculation.

At W=8, saved support is one continuous run of split dates, **2025-03-17–2026-07-06**. Liked support starts 2019-11-04 and ends 2025-12-15, with gaps; its longest continuous run is 2020-06-01–2022-03-21 (95 splits). Combined support also has gaps; its longest continuous run is 2024-04-01–2026-07-06 (119 splits). Only **40** split dates support both behaviours independently, from 2025-03-17 through 2025-12-15.

This rules out primary two-sided confirmation of an August 2026 closure: even combined activity's last eligible eight-week split is July 6. A four-week stress test does not turn an endpoint into an eight-week confirmatory result. Obtaining a later snapshot could make that closure testable in a separate, prospectively defined evaluation.

## 3. Ground truth stays independent

Before running detection, request approximate start and end dates for the user's Kruse/light-and-circadian, politics and earlier gaming phases. For each endpoint, record an uncertainty interval, whether it was mainly saving, liking or both, and optionally the associated creator usernames/hashtags. The date request has been made; answers are pending. The only currently supplied endpoint is the August 2026 closure, which is not evaluable here under the primary support rule. Do not invent the other dates.

Keep actual reference entries in a local personal evaluation file outside the repository. Freeze its hash before detection. All supplied phase endpoints are primary by default; any uncertainty or channel designation must be resolved before inspecting detector output. Dates, phase names and associated creators must not influence feature selection, parameters, scores, labels or boundary selection. Produce and freeze detector results before opening the reference file for matching. Human knowledge already mentioned in conversation cannot be made unseen; this separation reduces tuning opportunities, rather than claiming perfect blinding.

An endpoint is evaluable when its supplied uncertainty is at most ±4 weeks and its entire uncertainty interval has primary support in the declared channel, with full windows on both sides. For an explicitly “both” endpoint, evaluate each independently supported channel and the combined result, showing disagreement. Use maximum-cardinality one-to-one matching within the supplied interval expanded by two weeks, then minimum total date error, then earliest date to resolve ties. Never match one detected boundary to both ends of a phase.

Publish a row for **every** supplied endpoint: reference interval, channel, support on each side, detected match/date error or missed, and any reason it is unevaluable. At least three evaluable endpoints across two phases are required by gate 1. Every evaluable primary endpoint must be recovered by its declared channel; for “both”, each eligible channel must recover it. A missing start or end prevents a claim that the complete phase was recovered. A supported missed endpoint is failure even if the plot looks convincing. An unsupported remembered phase is “not demonstrated by these observations”; it cannot be used to claim whole-history success.

Publish unmatched detections as well. The user's phase list is not necessarily exhaustive, so unmatched does not automatically mean false, but post-hoc recognition cannot rescue a failed preregistered test. Do not report precision against an incomplete list as though every unlisted boundary were known false.

### Exact local ground-truth format and freeze procedure

User-owned file: `C:\Users\Hanso\Desktop\AI_Projects\hindsight-data\eras-experiment\ground-truth.json`. Its directory exists; the assistant has **not** created or populated that file. The user writes it before detection and owns the dates. Use UTF-8 JSON in this format; replace the placeholder phase and add one entry for every remembered phase:

```json
{
  "schemaVersion": 1,
  "snapshotObservationSha256": "8080892ba165712539863565e13adf523c7f0f4a649fc2fbd090f862f203cb31",
  "phases": [
    {
      "id": "phase-1",
      "description": "Your own description",
      "channel": "saved",
      "start": {"earliest": null, "latest": null},
      "end": {"earliest": null, "latest": null},
      "creatorUsernames": [],
      "hashtags": [],
      "notes": "Explain uncertain or undatable endpoints in your own words."
    }
  ]
}
```

`channel` is `saved`, `liked`, `both`, or `unknown`. It states remembered behaviour, not whichever detector later performs best. `unknown` remains explicitly unassigned and cannot count toward the three confirmatory endpoints; descriptive comparison can still show all channels. Repeat-combined is an analytical subset, not a remembered behaviour: compare it to combined-eligible references using its own support, without relabelling the reference.

For each endpoint, supply inclusive ISO dates `YYYY-MM-DD` for the earliest and latest plausible dates. Equal dates express an honestly known day. Both null means undatable; do not use an invented midpoint. Broad ranges are allowed and stay visible. Define uncertainty as half the interval width: a range at most 56 days wide satisfies ±4 weeks; a wider range is unevaluable under the unchanged gate. Never tighten an interval merely to pass. Calendar dates map to UTC; support eligibility is assessed at the Monday bin containing each possible date. An earliest date after its latest date is invalid. The optional names, hashtags and notes remain evaluation-only personal text. The accepted August 2026 closure stays unevaluable here; no workaround is planned.

After finishing the file, freeze its **raw bytes** using PowerShell (run these lines separately):

```powershell
$erasTruthPath = 'C:\Users\Hanso\Desktop\AI_Projects\hindsight-data\eras-experiment\ground-truth.json'
$erasTruthHash = (Get-FileHash -LiteralPath $erasTruthPath -Algorithm SHA256).Hash.ToLowerInvariant()
$erasTruthHash | Set-Content -LiteralPath ($erasTruthPath + '.sha256') -Encoding ascii
$erasTruthHash
```

Send only that hash, not the dates, to record the freeze. Do not edit the JSON afterwards, including whitespace. The eventual run must verify its bytes against the recorded hash without exposing its dates to the detector. After results are frozen, evaluation can parse the reference file and validate the schema. If invalid, stop and disclose that the precommitted reference cannot be evaluated; do not quietly repair it after looking at results. The design re-review and the user's freeze are both prerequisites to real-data detection. The synthetic costing below neither opens this file nor evaluates phase dates.

## 4. Proposed detector — specification only

Use a **local two-window creator-composition scan**, rather than forcing a fixed number of eras or optimising a global segmentation across unsupported gaps. It can find sustained changes in observed creator mix; it cannot identify why a change happened, guarantee detection of gradual transitions, or recover a topic shift within the same creator. Failure on lived phases despite those limitations still triggers the failure contract.

1. Read validated observations from the retained JSONL snapshot and existing post extras from its side tables. Use observation timestamps, never collection timestamps or placement counts. Keep saved and liked matrices separately; also build their raw combined counts. Do not merge snapshots. Key sparse week maps by `(platform, creator_id)`. Do not merge identities by display-name similarity.
2. Retain all known creator IDs, including singletons, in the three full-creator channels. The fourth channel uses only the prespecified fixed >=3 combined cohort in section 2. Within each eligible window, normalise known-creator counts to a probability distribution. No semantic grouping, embeddings, smoothing selected from results, additional top-creator pruning or invented “other interest” category. Report the unknown-ID, excluded-event and singleton shares alongside support. Both full and restricted results remain visible.
3. Primary distance is the square root of Jensen–Shannon divergence with base-2 logs: `sqrt((KL(p||m) + KL(q||m))/2)`, where `m=(p+q)/2` and zero terms contribute zero. It is bounded from 0 to 1 and tolerates zero cells. Compute over the union of sparse keys. The sensitivity metrics are Hellinger distance `sqrt(sum((sqrt(p)-sqrt(q))^2)/2)` and total variation `sum(abs(p-q))/2`.
4. Calibrate a scan-wide threshold for each channel/window/metric using the null procedure below. The primary threshold is the **99th percentile of null maximum scan distances**, not a chosen raw distance or a per-date p-value.
5. Select eligible dates strictly above that threshold, ranked by decreasing score, with ties resolved by earlier date. Accept a date only if it is at least eight weeks from already accepted dates. Keep this separation fixed across the sensitivity grid to isolate the requested parameter changes. Record every excluded nearby candidate and the rule that suppressed it. This is deterministic peak selection, not evidence that nearby changes cannot occur.
6. Boundaries divide only supported regions. Unsupported gaps and export endpoints remain explicitly unassessed. Do not manufacture a boundary at a gap, bridge a gap into a confident era, infer a phase start before the data, or force at least one era. Resulting intervals are candidate periods of changed observed creator composition. Eight weeks on each side means broad temporal resolution, not a precise life-event date.

The implementation, if approved, must pin a deterministic seeded PRNG algorithm and seed derivation before any run. Use SHA-256 of `hindsight-eras-v1|snapshot-hash|channel|purpose|replicate` as seed material, with distinct purposes for calibration, null testing and resampling. Changing RNG or rules after seeing results is a new experiment, not a rerun of this one.

### Null calibration and falsification

Use two explicitly imperfect null models:

- **Event-label permutation:** permute creator IDs across event slots within a channel, keeping timestamps and the channel's total creator frequencies fixed. This removes creator/time association while preserving calendar volume. It does not preserve serial dependence.
- **Two-week block reordering:** partition the calendar into adjacent two-week blocks and uniformly permute whole blocks, carrying counts and creator identities together. Keep the final unmatched week fixed if the calendar length is odd. This preserves short runs within blocks but disrupts long-term ordering. Its stationary-null interpretation is an assumption, not an established property of the history.

For each model generate 499 calibration replicates, recompute eligibility, and take the maximum eligible distance over the entire scan in each replicate. Use the larger of the two models' quantiles as the threshold. Define the empirical quantile as the order statistic at `min(499, ceil(q*500))`, one-based. Reuse a model's replicate datasets across metrics/windows for comparable sensitivity results. If a replicate has no eligible split, record that explicitly; if more than 5% lack support, calibration is inadequate and the channel cannot pass. Otherwise assign those maxima zero and disclose their count.

Use **separate** 100-replicate test batches per model and channel with the frozen primary threshold, applying the same support and selection rules. Count replicates yielding any accepted boundary and apply the fixed 5/100 and 10/100 limits in section 1. These are per-channel scan controls, not a claim of family-wide error control over all four channels and every exploratory configuration. Null tests on this one snapshot cannot prove generalisation to other people.

### Parameter sensitivity: no winning configuration selected afterwards

Run the complete cross-product for each channel:

| Parameter | Primary | Mandatory variations |
| --- | --- | --- |
| W, weeks on each side | 8 | 4, 6, 8, 10, 12 |
| Distance | sqrt Jensen–Shannon | sqrt Jensen–Shannon, Hellinger, total variation |
| Scan-null quantile | 0.99 | 0.975, 0.99, 0.995 |

That is **45 configurations per channel, 180 across four channels**, with 6/10 weeks the nearby-window checks and 4/12 the broader stress tests. Publish all boundary dates/counts and support coverage, including zero-boundary configurations. For each primary boundary, match alternatives one-to-one within four weeks, maximising matches then minimising total displacement. Report the signed displacement for every match, unmatched extras, and unsupported comparisons. Also publish full-combined versus repeat-combined boundary matches, date displacement, support differences and unmatched detections. This comparison diagnoses sensitivity to the chosen population; it does not select a winning channel after the fact.

For gate 3, use all **44 non-primary configurations** as the fixed denominator: an unsupported comparison is not a vote for stability. Each primary boundary needs matches in at least 33/44 configurations; at least `ceil(0.8 * primary boundary count)` must meet that rule. Also report the 6/8/10-week subset separately so broad-window failures do not conceal the effect of small changes. Empty primary output cannot pass by vacuous arithmetic. Do not promote a successful secondary configuration after primary failure.

### Resampling and repeated posts

Run 200 bootstrap replicates, sampling events with replacement **within each calendar week and channel**, preserving the original weekly counts. Hold the original eligibility mask and calibrated primary threshold fixed, rerun scores/selection, and match boundaries one-to-one within four weeks. This measures sensitivity to which observed events populate a week; it does not capture all serial dependence or uncertainty about unobserved activity. Null block tests address a different concern.

Operationalise gate 5 as the mean fraction of primary boundaries retained across those 200 replicates: it must be at least 0.70. Also publish each boundary's own retention fraction, conditional 5th–95th percentile matched dates, and unmatched fraction. That date range is a perturbation range, not a calibrated confidence interval for a true phase boundary.

The snapshot has **95 post URLs observed in both saved and liked**. Those are distinct deliberate actions, not parser duplicates. Keep both in the primary behavioural analysis. A mandatory combined sensitivity run retains one observation per canonical post identity, choosing the earliest observed timestamp and breaking ties by observation ID. Recalibrate that run under the same procedure. Report how many primary boundaries survive within four weeks; if none do, gate 5 fails. Do not deduplicate unrelated observations merely because they share a creator.

## 5. Saved, liked and the activity-mix confound

### First-class descriptive result: observed saving and liking diverged

The retained observations show **1,689 likes and 2 saves in 2021**, versus **60 likes and 4,047 saves in 2026 through this export**. Save share of these two observed actions changed from **0.12% to 98.54%**. Likes reached their highest observed calendar-year count in 2021. This result is independently useful and requires no changepoint detection. It must lead the descriptive report, not sit only in a detector caveat or appendix.

Use the automatic heading **“Observed saving and liking changed”**. The user's interpretation, “consumption became curation,” can appear only as an explicitly attributed personal note if the user wants it included, never as the algorithm's conclusion. Likes are not all consumption, saves are not all curation, and export retention may differ. The observed action mix is established; motivation and a complete history are not.

Label 2026 **partial year through export date 2026-08-30**. Display raw counts and shares, but do not claim a like-for-like full-year percentage decline, annualise 2026, or extrapolate the missing months. Include aligned Jan 1–Aug 30 counts for earlier years as an additional comparison in the deliverable, with the same calendar-date cutoff rather than equal day counts, and retain full-year counts separately. Export date is a coverage limit, not a guarantee that every earlier action was retained.

### Detector controls remain necessary

No eras have been detected, so **whether saves and likes show the same eras is currently unknown**. Their radically different temporal coverage already rules out assuming agreement. The early combined history mostly measures likes, while 2026 mostly measures saves; switching behaviours can change a combined creator distribution even if each behaviour's own distribution is unchanged.

For every primary combined boundary, show the separate saved/liked scores, eligibility, nearest independent boundary and date displacement, plus save share on each side. In the 40 primary split dates where both behaviours have sufficient support, also compare equal-behaviour mixtures: `p = 0.5*p_saved + 0.5*p_liked` on each side. Calibrate this control using channel-preserving permutations/block reorderings; never invent the missing distribution in an unsupported channel. Report results of this control using the same primary window, metric, quantile and matching tolerance.

A combined boundary must have a matching independent boundary in at least one supported channel to support a creator-composition interpretation. Where equal-mixture comparison is supported, it must also retain a matching boundary. If these controls fail or cannot distinguish a behaviour switch, mark the combined result ambiguous and fail gate 6 for the proposed combined timeline. A descriptive change in observed behaviour can still be reported as such. Agreement is not forced, and the reason for a disagreement must not be invented. Separate-channel evidence remains visible even when the overall automatic-era proposal receives a no-go verdict.

## 6. Labels are descriptive statistics only

Assign labels **after** freezing boundaries. Use only creator identifiers/display names and hashtags already recorded in the snapshot; no caption interpretation, new topic extraction, external lookups, LLM, sentiment, psychological claims or moral judgement. User-supplied phase descriptions are evaluation references, never automatic output labels. Do not use collection names as inferred topics.

For each era and channel, compare a creator's event share inside with its share outside that era within the channel's supported observed domain. For hashtags, count presence at most once per observation using retained post extras; count each observation once regardless of collection placements. Disclose hashtag availability, since missing exported hashtags are not evidence that content had none.

A label candidate needs at least five observations across at least three distinct weeks inside the era. The outside baseline needs at least 40 observations across four weeks. Rank positive distinctiveness by smoothed log2 share ratio: `log2(((k_in+0.5)/(n_in+1))/((k_out+0.5)/(n_out+1)))`. Publish inside/outside counts, shares and ratio; this is a descriptive ranking, not a multiple-testing-corrected significance claim. Use creator ID or literal hashtag as the deterministic tie-break. Show at most three creator and three hashtag labels, using their recorded strings. If none meet the rule, say “No distinctive creator or hashtag supported.” Do not fill the gap with a topic or narrative.

These labels describe which recorded creators/tags distinguish an interval from this baseline. They do not tell the user what the interval meant, why it occurred or how to feel about it. Treat every displayed source string as untrusted text, never as instructions or markup.

## 7. Evidence travels with every interval

The eventual local experiment output must include:

- Every eligible primary boundary and resulting supported interval, including low-confidence ones; also a ledger of below-threshold and proximity-suppressed candidates. A separate candidate view may show dates passing 0.975 but not 0.99, clearly excluded from confirmatory detections.
- Per boundary: adjacent windows, event/creator/active-week counts, singleton and missing-ID shares, metric score, calibrated threshold, null-test outcome, parameter agreement, bootstrap retention/date range and channel/mix controls.
- Per interval: its observed counts, coverage gaps, distinctive-label evidence, and both endpoint evidence levels. Export edges and unsupported edges say “not evaluated”; they are not confident boundaries. An interval's evidence cannot exceed its weaker assessed endpoint, and an unassessed endpoint prevents a high-confidence complete-era claim.
- Evidence labels: **high** only when bootstrap retention is at least 90%, grid agreement at least 75%, support/calibration pass and applicable channel controls agree; **moderate** when retention is at least 70% with those other checks satisfied; **low-confidence** otherwise. These are operational evidence labels, never probabilities of a lived phase. A high local label cannot override an overall failed gate.
- The complete reference-endpoint table, all 45 configurations per channel, null outcomes and six-gate pass/fail/not-demonstrated verdict. No post-hoc deletion of an inconvenient interval to make the timeline tidy.

Keep personal experiment artifacts outside the repository with the same personal-data warning as detailed summaries. The design doc contains aggregate evidence only. No HTML report is built at this step.

## 8. Execution boundary and next review

**Real-data work remains design and support auditing only.** The only real-data calculations performed are checksum verification, occupancy, aggregate creator recurrence, post overlap and count-based support eligibility, including the prespecified fourth cohort. The requested cost measurement runs a separate synthetic-only prototype outside the repository. No real-data distance scan, calibration, bootstrap, boundary detection, label selection or ground-truth matching has run. No parser code, dependencies or snapshot contents changed. Re-review of these amendments and frozen reference dates are required before the confirmatory experiment runs.

After approval, implement this as a local statistical experiment using existing runtime facilities and sparse maps. There is no justified new dependency at present. Bound calibration memory by processing one replicate at a time; permit cancellation and explicit resource-limit failure. Do not silently reduce the grid or replicate counts if execution is slow. Record algorithm version, snapshot hash, seeds, parameters, runtime and peak RSS. Synthetic stationary/known-change and edge-case checks should validate the experiment machinery before real detection. Preserve the original snapshot; all results are derived artifacts. The descriptive deliverable below is required whether every gate passes, any gate fails, or detection cannot be evaluated.

### Descriptive deliverable specified independently of ERAS

Build a standalone local **“Instagram activity overview”** from retained observations and side tables. It is explicitly **not labelled eras or phases** and does not depend on a detector, threshold, sufficient phase dates or a positive verdict. The plain-language report must be usable on its own before the later HTML milestone. These are defined outputs for implementation after review, not outputs generated by this amendment.

1. **Observed saving and liking changed.** Lead with section 5's measured divergence, year completeness, action counts and shares. Show both absolute counts and mix; a share change alone can hide shrinking or expanding totals. Include aligned partial-year comparisons. Keep any user-authored interpretation visibly separate from computed facts.
2. **Activity by year and quarter.** Include every UTC calendar year and quarter intersecting the observed range, including zero-count periods, with saved, liked and combined counts, save share, unique creator counts per channel, observed-active weeks, empty weeks and near-empty weeks. Combined unique creators are a union, not the sum of channel counts. Repeat-combined appears as a labelled subset with retained/excluded counts, never added to combined totals as a fourth behaviour. Shares with zero total are null and displayed “No observations.” Events belong to their timestamp's year/quarter; within-period week occupancy uses the intersecting Monday bins and only events inside the period. Mark bins cut by quarter boundaries. Mark the first partial observed period and the last export-limited period; “full calendar period” never means complete retention. In particular 2026 Q3 and 2026 are partial, and Q4 is not an observed zero.
3. **Recurring creators: observed returns.** Key by platform/creator ID, retaining display strings without merging renamed or similar accounts. Define recurrence descriptively as observations in at least two different UTC weeks, independently of the detector's >=3-event filter. Provide every qualifying creator with total/saved/liked counts, active-week count, first/last observed timestamps, year/quarter counts and their ordered observed weeks. Include a table of consecutive observed-week gaps: the earlier and later observed week and the number of intervening weeks with no retained observations for that creator. Zero intervening weeks is not a gap. Say “Observed again after X weeks with no observations in this snapshot,” never “stopped following,” “abandoned,” “deleted” or “returned to an interest.” Give creator gaps alongside platform-wide coverage so sparse overall periods are visible. Sort by active weeks, then event count, then creator ID; the default readable view may show 20 rows but must state the total and link to all rows. First/last observed are not first-ever/last-ever, and no creator list is claimed complete. Unknown IDs remain an explicit unassigned count.
4. **Coverage and gaps.** Always show snapshot/export date, first/last event per behaviour, the 455-week common grid, empty/near-empty counts, consecutive empty runs with dates, partial periods and which support requirements fail where. Include original parse-report omissions and quarantine status: this snapshot came from a hand-trimmed export and quarantine did not run. Prominent wording: “An empty week means no observations retained here. It does not mean you had no activity, interests or experiences.” Do not fill gaps, infer deletion/private status, interpolate activity or let a blank chart imply a blank life. Separate “zero observed,” “outside snapshot range,” “unknown completeness” and “not enough support for detection.”
5. **Detector verdict, if attempted.** A short separate section says passed, failed or insufficient evidence, with the gate reasons and links to complete experimental evidence. Descriptive sections survive independently. Do not soften a negative verdict, promote the repeat subset or another configuration, or rebrand descriptive calendar intervals as detected phases.

Write `activity-overview.txt` and a structured `activity-overview-detailed.json` to a new explicit local results directory, not into the immutable snapshot. Both are **personal** because recurring-creator rows reveal names/IDs and interests, beliefs and affiliations; put that warning at the start. The structured file holds all recurrence and gap rows so truncating the readable view never discards data. No captions or post URLs are necessary. Preserve existing anonymous/detailed summary contracts and their existing files; do not insert creator rows into anonymous output or call this overview anonymous. A later HTML renderer can consume the same structured fields without needing a detector.

Acceptance checks for this deliverable must establish: year/quarter saved and liked counts sum to 4,809 and 5,245; combined sums to 10,054 without counting repeat subsets twice; empty periods stay present and unavailable periods are not zero-filled; zero denominators render plainly; partial 2026 is labelled; first/last and recurrence gap counts agree with retained observations; missing IDs never coalesce into a fictitious creator; source strings stay untrusted; and all four descriptive sections are produced with a failed or unevaluable detector as well as a passing one. Synthetic tests must cover a creator with several events in one week (not an observed return), a return after empty weeks, both behaviours for one creator, a partial quarter, and a zero-total period. None of these checks require reference phase dates or a positive ERAS result.

### Measured cost of one primary configuration

The review gate prohibits real detection now. Therefore costing used a **synthetic-only, dependency-free JavaScript prototype**, in `../hindsight-data/eras-experiment/benchmark-primary.mjs`, rather than computing scores on actual creator/week assignments. Its input profile contains only the 455 weekly counts and the multiset of 5,308 creator frequencies (10,054 events). Invented integer identities are placed in artificial cohorts; actual creator names, creator/time associations, captions and phase dates never enter the benchmark. The profile and result are local files in that same directory, outside Git. This is an end-to-end cost measurement for one statistical configuration, not the real confirmatory experiment or a validation of detection quality.

Reproduce from the repository directory with `node ../hindsight-data/eras-experiment/benchmark-primary.mjs`. The measured script SHA-256 is `8f0cab04912406044900435e6df911bb97fd072e95f4d712309d7ed8fc8accb0`; profile SHA-256 is `841289302a1547dd9430330cc53e44ac16472710e4d4bc102d0de9e88e1feac2`. This prototype uses a fixed SHA-256-seeded mulberry32 generator; production seed rules remain subject to the already specified implementation review. Rerunning the benchmark rewrites only its local `benchmark-result.json` with new timings.

Measured on Windows x64, Node **24.19.0**, AMD **Ryzen 5 7600X** (12 logical CPUs), **31,895 MiB system RAM**, using one Node process. The complete W=8 / sqrt-JSD / 0.99 run performed the observed synthetic scan, **499 calibrations per null model**, **100 separate tests per null model**, and **200 within-week bootstraps**: **1,399 scans total**. It uses sparse rolling window maps, sequential replicates and frozen support for bootstraps. Cost includes synthetic construction, primary selection and bootstrap matching; it excludes real snapshot loading, label/report generation, phase evaluation and cross-grid stability because those are not authorised real-data work at this stage.

| Measured component | Wall-clock seconds |
| --- | ---: |
| 998 calibration scans | 3.732 |
| 200 held-out null scans | 0.744 |
| 200 bootstrap scans | 0.556 |
| Whole prototype run, including setup | **5.046** |

Peak process RSS from Node `process.resourceUsage().maxRSS` was **198.14 MiB** (reported KiB divided by 1,024); process launch to exit was approximately **5.15 seconds**. This is one run, not a confidence interval. The synthetic primary produced zero boundaries, so empirical matching work was small; bootstrap scans still all ran. Assertions checked identical/disjoint distributions and one-to-one matching, but this prototype has not passed the future production experiment's full correctness tests. Its zero-boundary output is not an Instagram result.

**Extrapolation:** naively running all 180 configurations at this measured cost is `180 * 5.046 = 908 seconds`, about **15.1 minutes**, before extra controls and report work. A deliberately simple 2x planning allowance is about **30 minutes**, not a measured upper bound. The specified design already permits reusing calibration scores across the three quantiles: there are only 15 distinct window/metric scan combinations per channel. At the measured eight-week JSD cost, 60 such calibration workloads plus the four primary null/bootstrap batches are roughly **229 seconds (3.8 minutes)**, before control runs, report work and differences between metrics/windows/channels. Other metrics may be cheaper and smaller channels may cost less, but that has not been measured. Do not promise the 3.8-minute estimate as total runtime.

The full grid appears **plausible on this machine**. Process channels and replicates sequentially; do not multiply peak RSS by 180 or hold every replicate matrix in memory. Roughly 198 MiB is a prototype observation, not a production ceiling or a prediction for family laptops. No grid or replicate count has been reduced. After re-review and the user's ground-truth freeze, time the real primary configuration before launching the grid and compare with these estimates. If real costs make the plan implausible, stop and report them before the rest of the grid; do not tune the statistical plan to the runtime. The synthetic measurement is the strongest compatible answer now to both “measure one configuration” and “do not start detection until re-review.”

## 9. Revised sequence and scope correction

I agree with the proposed order:

5. ERAS against the retained Instagram snapshot, beginning with this design review.
6. Export diffing across the two Instagram snapshots, describing presence/absence without inferring deletion or its cause.
7. Implement quarantine and test against a real untrimmed export.
8. HTML report.
9. Streaming infrastructure, then YouTube.
10. CLI and packaging, then a beta with 2–3 other people's exports.

YouTube is a subsystem milestone, not merely another adapter. The existing optional iterative parser capability preserves a route forward, but whole-file ingestion currently enforces 32 MiB and materialises data. A 100–300 MB watch-history file needs a streaming reader, incremental coordination/persistence and bounded aggregation/output; making just the reader stream would leave downstream growth unresolved. The measured roughly 187.7 MiB peak RSS for roughly 30 MB of Instagram input, and naive roughly 1.8 GB extrapolation at 300 MB, motivate this work; they are not a measured YouTube memory forecast. Raising the cap is not the design.

The quarantine engine remains unimplemented. Declared-file reading, path checks, private-data exclusions and a truthful `not_run` log are useful existing safeguards, but do not demonstrate inspection or quarantine of an untrimmed export. A hand-trimmed fixture cannot satisfy that milestone. Quarantine and a usable report before another platform are therefore appropriate priorities. The beta must not precede real untrimmed-export validation. The older step-4 build contract remains historical; this sequence records the newly requested scope, without authorising implementation beyond the current design review.
