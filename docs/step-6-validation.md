# Step 6 validation: lifecycles, session fitting and folder bursts

Implemented in the approved order against the existing retained snapshot. No re-parsing, network access, model calls, new runtime dependency, browser shell, diffing or annotations. Named detail remains outside Git. This document contains aggregate evidence only and is **low disclosure**, not a sharing guarantee.

**Finding, reframed after product review:** burst detection cannot date phases; it can locate recorded concentrations that may prompt memories of them. **18/46 primary outer intervals retain overlap across all nine settings**, including three with identical endpoints. For this memory aid, locating a period worth revisiting is useful even when dating its boundaries is unsupported: the user supplies the memory, meaning and approximate dates. This is an accepted product use, not validation that the detector has recovered a lived phase. The multi-year descriptive creator backbone works independently. No alternative configuration has been promoted.

## Inputs and reproducibility

Retained snapshot: `instagram-2026-08-30-validated`; supplied export date 2026-08-30. Observation SHA-256: `8080892ba165712539863565e13adf523c7f0f4a649fc2fbd090f862f203cb31`. All nine retained artifact hashes were independently checked unchanged after the run. The command verifies the snapshot before computation and compares the complete verified manifest again before output. Sources remain read-only.

The snapshot retains its original partial status: 387 duplicate-caption diagnostics, seven unmatched-placement diagnostics and one intentionally unsupported-file diagnostic. These statuses are not silently upgraded. The accepted 10,054 observations remain the analysis denominator.

From the repository, fresh output directory names are required:

```powershell
# Descriptive layer can ship on its own; explicitly labelled 60-minute convention.
npm run analyze:instagram -- --stage lifecycles --snapshot ../hindsight-data/step-4/instagram-2026-08-30-validated --output ../hindsight-data/lifecycles-new --source-root ../hindsight-data/Instagram

# Fit and inspect the three SVGs before acknowledging plot review.
npm run analyze:instagram -- --stage sessions --snapshot ../hindsight-data/step-4/instagram-2026-08-30-validated --output ../hindsight-data/session-fit-new --source-root ../hindsight-data/Instagram

# Only after reviewing those plots; unsupported fits still use the fallback.
npm run analyze:instagram -- --stage all --session-plots-reviewed yes --snapshot ../hindsight-data/step-4/instagram-2026-08-30-validated --output ../hindsight-data/step-6-new --source-root ../hindsight-data/Instagram
```

Final reviewed files for this run are in sibling `hindsight-data/step-6-final/`. Start with `step-six-personal.md`; all repeat-creator records are in three `lifecycles-*-personal.json` files. Every grid run, including all excluded candidates and unassessed weeks, is retained in 18 numbered personal JSON files. `burst-sensitivity-personal.json` records each primary interval's exact/overlap comparisons and boundary shifts. Anonymous aggregate files contain no source identities, captions or URLs; written-file tests enforce this distinction. The report contains no source captions or URLs. Personal creator/folder text is escaped before Markdown rendering.

The initial independent lifecycle artifact is preserved in `hindsight-data/step-6-lifecycles-convention/`; the first fit plots in `hindsight-data/step-6-session-fit/`. The final output refreshes session counts using the reviewed per-channel crossings. Nothing overwrites those earlier stages.

## Creator lifecycles: all years, no inferred topics

| Observation channel | Observations | Known creators | Singletons, aggregate only | Repeat rows | Repeat rows on one local date | Maximum active months |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Saved | 4,809 | 3,240 | 2,513 | 727 | 43 | 7 |
| Liked | 5,245 | 2,287 | 1,858 | 429 | 29 | 38 |
| Combined | 10,054 | 5,308 | 4,066 | 1,242 | 112 | 38 |

No unknown creator IDs occur in this snapshot; the implementation and tests retain a separate unknown-observation count. Counts across channels are not additive creator counts. The combined record can connect saved and liked actions with the same recorded platform/ID, without claiming immutable identity behind an Instagram username.

The earliest retained observations, including 2017, are included. Ranking uses active months, then UTC active weeks, then distinct sessions, then a deterministic platform/ID tie-break. Raw observation count does not rank the rows. First/last observations, elapsed follow-up windows, calendar-month histories, strict >12-calendar-month new-contact gaps, end-of-month clamping, 28-day peak windows and snapshot censoring are implemented. All clocks/settings travel with the result; Brisbane dates are the default. Peak-window ties select the earliest endpoint, including all timestamp-tied observations there. Sessions are formed across the selected channel before creator memberships are counted, so actions involving other creators can connect a session chain.

| Detail | Saved | Liked | Combined |
| --- | ---: | ---: | ---: |
| Creators recorded in the final 28 elapsed days | 528 | 2 | 530 |
| Repeat creators with another record 7–30 days after first | 248 | 135 | 379 |
| Repeat creators with a new-contact episode after >12 calendar months | 19 | 67 | 108 |
| Repeat creators wholly within one derived session | 28 | 22 | 92 |
| Latest trailing-year band: no observations | 23 | 357 | 395 |
| Latest trailing-year band: 1–5 active months | 689 | 72 | 830 |
| Latest trailing-year band: exactly six active months | 12 | 0 | 12 |
| Latest trailing-year band: 7–12 active months | 3 | 0 | 5 |

These are recorded-contact patterns, not loyalty or relationship statuses. The snapshot's final local month is partial. Follow-up windows extending past the supplied endpoint are not yet observable; their already-observed counts remain visible. Empty periods disclose incomplete retained coverage, not an empty life. The earlier liked history supplies considerably more multi-year recurrence than saves; current folder labels are not projected backwards onto it.

## Session fit: crossing is not the valley

All three deterministic initialisations converged for all three channels. The best converged likelihood was selected, with the original sigma floor, iteration limit and tolerance unchanged. All long gaps were retained. The nine fitted initialisation records and their likelihoods are in `session-fits.json`.

| Channel | Positive gaps | Ties excluded from log | Short/long effective gap counts | Selected crossing, minutes | Mixture valley, minutes | Longest gap, days |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Saved | 4,808 | 0 | 3,085.82 / 1,722.18 | 14.3423 | 25.6946 | 428.98 |
| Liked | 5,244 | 0 | 2,139.53 / 3,104.47 | 43.2411 | 37.5125 | 95.98 |
| Combined | 10,052 | 1 | 5,719.57 / 4,332.43 | 32.1351 | 35.8051 | 95.98 |

| Channel | Short mean / sigma, log10 seconds | Long mean / sigma, log10 seconds | Short-component weight |
| --- | --- | --- | ---: |
| Saved | 2.084175 / 0.419619 | 3.985333 / 0.847482 | 0.641809 |
| Liked | 2.381576 / 0.648327 | 4.527531 / 0.601041 | 0.407995 |
| Combined | 2.196058 / 0.565497 | 4.353838 / 0.620285 | 0.568998 |

The selected crossing equates the two weighted component densities. The valley minimises their sum between the two modes. Unequal component weights/spreads make them different; the save fit illustrates this particularly clearly. Each SVG shows fixed 0.25-wide log10-second histogram bins, both component curves, their sum, crossing and valley. Curves are scaled to expected bin counts. The plots were rendered and visually inspected; no extra component, trimming or parameter search was introduced. The fits capture two broad populations but do not validate inferred viewing sessions, and pooling across years does not prove a time-invariant behaviour.

| Channel | Sessions at 15 min | At 30 min | At 60 min | At selected crossing |
| --- | ---: | ---: | ---: | ---: |
| Saved | 1,585 | 1,389 | 1,207 | 1,602 |
| Liked | 3,492 | 3,273 | 3,003 | 3,137 |
| Combined | 4,795 | 4,378 | 3,923 | 4,338 |

Only a gap strictly greater than the cutoff starts a new group; equality and ties remain together. Unsupported synthetic fits use the declared 60-minute fallback. A numerical candidate is not used for lifecycle counts until plot review is acknowledged. SVG generation adds no runtime dependency; existing bundled Sharp was used only to render PNGs for this review.

## Full prespecified folder grid

Recent window begins 2025-12-01. Monday UTC weeks ending before the export endpoint week are eligible; 2026-08-24 is conservatively unassessed because the actual export time is unknown. Collection creation weeks and earlier weeks remain descriptive, not fitted. Two newly created folders consequently have no assessed week. Across all 73 lanes, there are 1,823 assessed lane-weeks with the all-save denominator, versus 1,819 with the filed-save denominator.

The filed-save denominator has four zero-exposure lane-weeks: weeks 2025-12-01 and 2025-12-08 in the two then-existing lanes. They split spans. No qualifying bar crosses an unassessed or zero-exposure week. Each saved observation is counted once per folder even if placements repeat; multiple different folders may include the same observation. The seven unmatched placements supply no inferred save date or numerator. Filed/total coverage accompanies every fitted week and bar.

The primary is unchanged: **all saves, s=2, gamma=1**. It yields 75 qualifying nested bars: 46 at level one, 18 at level two and 11 at level three, spread across 34 folders. The other 39 folders remain visible with no qualifying bar. Of the 75 bars, 38 touch a fitting-span edge, disclosed individually. These counts are not independent episodes. The number of nested states depends on s and cannot be compared as though each row counted the same substantive unit.

| Denominator | s | gamma | Folders with bars | Outer bars | All nested bars | Support-excluded candidates |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| All saves | 1.5 | 0.5 | 39 | 55 | 123 | 0 |
| All saves | 1.5 | 1 | 25 | 31 | 66 | 0 |
| All saves | 1.5 | 2 | 14 | 15 | 33 | 0 |
| All saves | 2 | 0.5 | 45 | 68 | 121 | 0 |
| **All saves** | **2** | **1** | **34** | **46** | **75** | **0** |
| All saves | 2 | 2 | 19 | 22 | 37 | 0 |
| All saves | 3 | 0.5 | 48 | 72 | 105 | 4 |
| All saves | 3 | 1 | 38 | 51 | 71 | 0 |
| All saves | 3 | 2 | 24 | 29 | 40 | 0 |
| Filed saves | 1.5 | 0.5 | 39 | 56 | 125 | 0 |
| Filed saves | 1.5 | 1 | 27 | 33 | 68 | 0 |
| Filed saves | 1.5 | 2 | 15 | 16 | 34 | 0 |
| Filed saves | 2 | 0.5 | 45 | 68 | 122 | 0 |
| Filed saves | 2 | 1 | 34 | 46 | 76 | 0 |
| Filed saves | 2 | 2 | 20 | 23 | 38 | 0 |
| Filed saves | 3 | 0.5 | 48 | 74 | 108 | 4 |
| Filed saves | 3 | 1 | 39 | 52 | 73 | 0 |
| Filed saves | 3 | 2 | 24 | 29 | 40 | 0 |

The two-observations/two-distinct-local-dates support rule stayed fixed. It excludes candidates in the lowest-penalty s=3 runs; the primary happens to have no candidate failing it. This does not make the rule redundant: the synthetic singleton and one-date controls generate candidates which it rejects explicitly.

### Boundary sensitivity, with disappearances retained

For each primary bar, comparisons use the same folder and level. Exact means identical endpoints. Overlap means any shared fitted week; the largest overlap, ties by earliest start, is used to report shifts. Merges/splits can therefore change which interval is compared: a shift is not proof that one uniquely identified episode moved.

| Alternative versus 46 primary outer bars | Exact endpoints | Any overlap | No overlap |
| --- | ---: | ---: | ---: |
| All saves, s=1.5, gamma=1 | 18 | 35 | 11 |
| All saves, s=3, gamma=1 | 27 | 43 | 3 |
| All saves, s=2, gamma=0.5 | 44 | 46 | 0 |
| All saves, s=2, gamma=2 | 19 | 25 | 21 |
| Filed saves, s=2, gamma=1 | 45 | 46 | 0 |

Only **3/46** keep exact endpoints across all nine all-save settings; **18/46** retain any overlap across all nine. The corresponding filed-save results are also 3 and 18. Among best-overlap comparisons, either endpoint can differ by as much as ten weeks. The full run files retain alternative-only bars too; the primary-anchored comparison is not a complete count of every alternative interval.

**Interpretation limit:** evidence is substantially sensitive to the intensity/penalty configuration; denominator sensitivity is smaller at the primary setting. Do not ship these dates as stable phases. Each primary bar's report states its exact/overlap counts and edge limitations. Agreement is not a confidence probability or a significance test. No configuration is promoted, no unstable bar is hidden, and no creator/folder meaning is inferred. The descriptive lifecycle deliverable stands independently.

### Product finding: location can help memory without dating a phase

The practical distinction is **locating, not dating**. The 18 overlapping results provide repeatable prompts to revisit a broad part of the history; the user may recognise a period and supply their own dates, including uncertainty. The three identical-endpoint results establish agreement at weekly model resolution, not the true day a phase began or ended. Matching overlap with the primary in each run does not necessarily imply one week common to every run; the report must compute and display the actual support envelope without inventing a common centre.

The exclusive presentation tiers are three exact-stable, 15 additional overlap-stable, and 28 primary-only outer intervals. “Primary-only” here means not stable across every grid setting, not necessarily absent from every alternative run. These are parameter-agreement tiers, not confidence probabilities. User annotations recorded after viewing these prompts remain visibly retrospective rather than held-out ground truth. See [the step-8 presentation design](step-8-report-design.md).

### Product finding: 39 folders without a primary concentration

These 39 folders merit their own descriptive section, not empty lanes or failure messages. **No qualifying primary bar does not establish steady saving.** A read-only audit of the existing run files found:

- 17 of the 39 have a qualifying bar under at least one other grid/denominator setting; 22 have none in any of the 18 runs.
- Two have no assessed weeks. Eligible history ranges from zero to 38 weeks.
- Fifteen have saves in at least two assessed weeks. Active assessed weeks range from zero to nine, with median one; assessed save counts range from zero to 51 per folder.

Thus this category includes repeated saving without a primary concentration, sparse observed activity, parameter-dependent concentrations and unavailable assessment. The report will show each folder's observed save pattern, active/eligible weeks, first/last save dates and coverage, making distributed recurrence legible without declaring that every no-bar topic was a steady interest. “Steady interest” can be the user's interpretation; the computation supplies descriptive recurrence. This audit did not rerun detection or change any support setting.

## Runtime and validation

One primary configuration was measured before the grid: 0.197 s verified input reading, 0.414 s lane construction, 0.028 s fitting all 73 lanes, **0.639 s total**, peak RSS **177.38 MiB**. Extrapolation for 18 fits and two lane builds was 1.33 s. The final full grid including lane building took **1.087 s**. All 1,314 folder/configuration fits ran; no sensitivity setting was omitted.

Final complete command: **4.778 s wall time, 464.63 MiB peak RSS**, including snapshot reads, all three lifecycle channels, fits, 18 burst runs, sensitivity, serialization and writing. These are Node process measurements, not browser benchmarks. The lifecycle-only checkpoint used 288.14 MiB before writing. Materialising all detailed monthly records and output strings increases memory considerably beyond detector-only cost; the browser milestone must measure its own memory and avoid assuming this output-batch strategy is suitable for family laptops. No claim about 100–300 MB YouTube exports follows.

Typecheck and **104/104 offline tests pass**. New checks include calendar clamping, channel-specific singleton counts, distinct-date/session support, six-month band, exact elapsed-window edges, censored follow-ups, earliest peak ties, platform/ID ranking, analytical Gaussian crossing, deterministic mixture recovery, unsupported-fit fallback, exhaustive independent dynamic-programme enumeration across all grid values, constant-share/changing-volume control, zero/all-one baselines, overlapping lanes, zero exposure, creation/right-endpoint exclusions, duplicate placements, full 18-run command output, anonymous written-file content and protected output/error paths. Existing parser, CSV formula-injection, snapshot and failure-path tests still pass.

An independent Python audit of the final retained-data outputs verified every lifecycle row's counts, first/last, active days/months, follow-up counts and brute-force peak window (727 saved + 429 liked + 1,242 combined rows). It also checked all **1,355 qualifying nested bars across the grid** for exact count conservation, two-date support and contiguous assessed positive-exposure weeks. Results are in the external `independent-validation.json`. This verifies implementation consistency, not whether inferred intervals match the user's memories.

Step 6 is accepted. Step 8 presentation design now precedes step 7 snapshot diffing; browser implementation remains unstarted pending design review.
