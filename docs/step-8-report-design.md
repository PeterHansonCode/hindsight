# Step 8 — approved memory report presentation

Implementation status: see [step-8 validation](step-8-validation.md). The following preserves the approved design, not a claim that every acceptance check has passed.

Step 6 is accepted; the report now comes before export diffing. This revision implements no browser, renderer, classifier, annotation changes or new detector run. The existing offline browser/intake/annotation contract in [browser-and-annotations.md](browser-and-annotations.md) remains applicable; this document specifies the presentation it must deliver.

## What the report helps someone do

**Burst detection cannot date phases. It can locate recorded concentrations that prompt memories of them.** For a memory aid, a broad, recognisable location can be useful: the user supplies dates and meaning from memory. This does not establish that every concentration corresponds to a lived phase. Neither model labels nor annotation defaults may imply that validation has happened.

The headline support is 18/46 primary outer intervals retaining overlap across all nine settings, including three with identical endpoints. The report preserves uncertainty rather than trying to rescue a crisp timeline. “Exact” means identical weekly model boundaries under the declared grid, not exact personal dates. An annotation may be more precise because the user remembers a date, but it remains separate evidence and never sharpens the computed shape underneath it.

## Reading order and initial screen

1. **Coverage header, always visible before any finding.** Show the first and last retained action, display timezone, supplied export date, and whether the export time is known. Also show snapshot identity in expandable provenance, partial import status and a direct route to omissions. Report generation time is separately labelled; it is never the data cutoff.
2. **Saving and liking over time.** Open with the observed behavioural divergence, requiring no detector. Two aligned annual series and a shared time axis show recorded saves and likes; counts and period completeness stay visible. A year can expand into months. Do not generate “consumption became curation,” intention, diagnosis or improvement language: those interpretations belong to the user.
3. **Creators across the years.** This is the main historical backbone. Saved and liked channels are separately selectable; combined is explicitly labelled. Show recorded active-month marks and first/last observations, not a continuous filled interest bar between them. Recurrence ordering is active months, active weeks, then distinct sessions; no leaderboard styling or raw-count winners. A compact aggregate explains singletons; repeat records have full detail. Keep sparse 2017 observations visible.
4. **Recent current-folder concentrations: mostly 2026, with December 2025 included.** A separate nine-month view contains the folder Gantt. Never backfill current folders onto earlier likes. The section prints its exact date range and excluded weeks alongside its title, rather than calling it simply “2026.”
5. **Saving patterns without a primary concentration.** A substantive separate section for all 39 no-primary-bar folders, specified below. These are not empty Gantt lanes or failed detections.
6. **Coverage and method detail.** Accessible from each relevant chart as well as here: missing/partial inputs, unmatched placements, unknown creator IDs, zero exposure, creation and endpoint exclusions, denominator and parameter checks. Annotations appear alongside both the creator and recent-folder timelines, not relegated to this appendix.

The current header would read “Recorded actions: 17 December 2017, 10:36:32 – 31 August 2026, 08:48:58 (Australia/Brisbane, UTC+10). Supplied export date: 30 August 2026; export time unknown.” The latest action is 30 August 22:48:58 UTC, so the local date is the next day. Explain this conversion immediately; do not hide it behind a tooltip. These are observed bounds, not a claim of complete coverage between them. Channel-specific bounds accompany channel switches.

The opening count evidence includes 1,689 likes and two saves in 2021, versus 60 likes and 4,047 saves in the retained 2026 portion. Mark 2026 partial on both series and in the sentence. Do not silently annualise, present this as equal-length periods, or attach percentage-change scorecards. An optional detail view can show corresponding calendar months with the same cutoff stated. This within-history behavioural description is explicitly requested; peer comparisons, percentiles, normative comparisons and better/worse scores remain excluded.

## Creator timeline and coverage

Use month marks/dots on an aligned multi-year axis, with separate saved/liked marks when combined is selected. A tooltip and keyboard-focus panel expose exact recorded action dates, observation counts, distinct days/weeks/sessions, and last recorded here. A run of active months can be shown as adjacent discrete cells; an empty month must remain visibly empty, never interpolated into continuous contact. Windowed active-month summaries keep the actual count and the unassigned exactly-six band. Left/right censoring and partial months remain explicit.

Creator labels are source labels; no profession, friendship, topic or emotional category is inferred. The first 20 lanes are an initial viewport choice, not a qualifying threshold: show the total repeat-creator count, provide local search and “show more,” retain annotations when scrolling. Sorting changes only display order. Never remove low-support rows to tidy the history. Unknown creator IDs remain a count, not a fictitious lane.

## Folder Gantt: three visually distinct agreement tiers

One lane per folder with a qualifying primary outer interval; multiple overlapping intervals on that lane use stacked subtracks. Keep overlaps across folders on a shared time axis. All 34 qualifying folders are reachable; 39 no-primary-bar folders have their own section. Default to level-one intervals to avoid counting nested intensities as separate memories; an explicit expansion reveals levels two and three with their own evidence/tier, not inherited stability. A folder can contain intervals of different tiers, so the tier belongs to the interval rather than its lane label.

Tier assignment uses the unchanged all-save primary (s=2, gamma=1) and its nine all-save configurations, same folder and level. All nine must be present, completed and applicable. Missing sensitivity data is “agreement not assessed,” with no stable styling; it is not a fourth confidence tier for this complete snapshot. Keep filed-save sensitivity as a visible secondary check, never select whichever denominator gives a more attractive tier.

| Tier | Exact definition | Current outer count | Visual grammar |
| --- | --- | ---: | --- |
| Exact-stable | Identical primary start/end in all nine configurations | 3 | Solid fill and solid vertical end edges, with an equals badge. Positions snap to UTC week boundaries; labels still say weekly model agreement. |
| Overlap-stable | Not exact-stable; at least one qualified interval overlaps the primary in every configuration | 15 | Soft gradient edges following the measured endpoint ranges, no vertical endpoint strokes; wave badge. The visible footprint expands to the observed envelope, not the crisp primary range. |
| Primary-only | Qualified at the primary but lacks overlap in at least one other configuration | 28 | Lower-emphasis stippled/hatch texture and fading edges, no closed rectangular outline; dotted badge. Explicit text “not consistent across all settings.” |

The inclusive overlap count is 18; it must never be added to the three as though there were 21. “Primary-only” is a requested tier name, not a claim that exactly one configuration found it. Details show the actual number of supporting settings, including disappearances. These are confidence-in-repeatability tiers, not probabilities, significance or correctness of a remembered phase. Patterns/badges and accessible labels carry the distinction as well as colour.

### Geometry must be computed from variation

For each primary interval, retain every qualified overlapping counterpart at the same folder/level from each configuration. Keep split/merge relationships; do not collapse them into one supposedly tracked phase. The existing largest-overlap match remains available in technical detail to reproduce step-6 comparisons, but is insufficient by itself to define the entire drawing.

Construct a set of weekly support cells: for each configuration, count its overlapping candidates as a union, then record whether it supports each assessed week. A configuration contributes at most one vote per week. Use these cells and the earliest/latest candidate start/end positions for the displayed envelope. Include the primary as one of the nine, never as the centre of a fitted probability distribution. Store which candidate intervals contributed to each envelope.

For overlap-stable shapes, the start transition spans earliest to latest observed start; the end transition spans earliest to latest end. These ranges may overlap, leaving no uniform centre: then draw a wholly soft region. Even if one endpoint happens to be invariant, an unstable interval receives no crisp vertical end edge. If no week is shared by all nine, do not invent a central “certain” core. Opacity is an illustrative encoding of grid support, not a confidence density. The legend states this.

For primary-only shapes, use the envelope of the supporting configurations with stipple/fade, and show support out of nine. Never fill missing runs as zeros in the underlying observations. If only a single configuration supports an interval and therefore no endpoint spread is measurable, represent its supported weeks as disconnected stippled cells with soft display edges, not a crisp bar or invented ten-week error interval; state that boundary variation is not estimable from one match.

Cut every shape at unassessed/zero-exposure gaps and visibly hatch the gap. Gradients must not bleed into it. Creation week, pre-creation history and the export endpoint week are separately qualified even if a blur would otherwise cross them. Do not fill the convex hull across disconnected supported regions. Measured endpoint movement can reach ten weeks; use the actual spread for each shape rather than a cosmetic fixed blur. Fuzzy edges remain fuzzy on zoom, focus, hover, print and export; focus outlines surround an accessible control area, never redraw model endpoints as authoritative lines.

The recent UTC window is 1 December 2025 through the supplied 30 August 2026 export date; the week beginning 24 August is unassessed. Inferred intervals end no later than 24 August 00:00 UTC (exclusive), subject to each folder's creation boundary. Display Brisbane dates with an explicit “Monday UTC weeks” axis note; conversions cannot turn weekly bins into exact local-day claims. The relevant window and zero-exposure markings remain visible when zoomed.

### Selecting an interval

Click, keyboard focus or tap opens the same evidence panel: source folder label; current membership grouped by save date; tier and support count; observed endpoint ranges; primary weekly span labelled as one configuration; saved observations, distinct dates/weeks, rate/exposure, creation/endpoint/gap limitations; and secondary denominator agreement. No high state is called an important interest. Do not rank by tier or conceal primary-only results by default.

“Add a memory here” uses the visible uncertainty envelope as a suggested range, explicitly editable or removable. Never silently fill the primary's exact endpoints or call them remembered dates. The user can use month/year precision, widen bounds, leave an end unknown, or cancel. No generated title, narrative or emotional prompt. A neutral prompt is “Does this bring anything to mind?”

## Saving patterns without a primary concentration

The user-facing section title is **“Saving patterns without a primary concentration”**, with introductory text: “These folders have saved records without a qualifying concentration at the selected settings. Some recur across weeks; others have sparse or newly available history.” This fulfils the steady-interest use case without equating a null detector result with proven steadiness. No automatic “steady interest” label or new steadiness classifier is introduced after seeing output.

For all 39 folders, show a compact card/row with:

- Source folder label and creation date, explicitly distinguished from save dates.
- Distinct matched saved records in the displayed window; separately, records eligible for assessment and those excluded by date/coverage.
- First and last recorded save in the window, with no date invented when unmatched; full-history dates available separately.
- Active assessed weeks out of eligible weeks, distinct local action dates and number of active months. Show “not assessed yet” rather than 0/0 for the two with no eligible week.
- A small discrete weekly count strip: observed counts visible, observed zero distinct from hatched unassessed weeks. No continuous interest band across empty weeks.
- A text fact when another grid setting yields a bar, with access to the evidence; do not promote that bar into the primary Gantt.

The observed audit belongs in the section's expandable overview: 17/39 have bars under another setting, 15/39 have saves in at least two assessed weeks, two lack any assessed week. These groups overlap and are not a partition. Twenty-two have no bar in any of the 18 runs. Their actual recurrence strips and counts provide the positive descriptive finding; a person can recognise something steady without the tool declaring it. Do not sort these into an inferior tier or title the section “failed/no results.”

## Annotations share the axis and preserve how they were recorded

Place a pinned annotation track on the same date axis in both the multi-year and recent views. User-authored diamonds/brackets/outlined spans use a distinct visual grammar from model concentration fills. Uncertain endpoints retain their bounds, and unknown ends are open/unknown, never drawn as continuing to today. Overlapping annotations stack with a visible count and expansion, not deletion. The selected annotation appears on both views when dates intersect; clipping shows continuation at the viewport edge, not a new boundary.

`recordedContext` is visible in the annotation label/card, evidence panel, print view and saved personal HTML/bundle re-import. Display **“Recorded after viewing evidence”** verbatim when applicable. A pre-evidence value reads “Recorded before viewing this report”; it is not an assertion the person never saw related evidence elsewhere. Missing/legacy/unknown context reads “Recording context not recorded,” never defaults to before. The enum/validation must preserve these distinctions in the implementation plan; imported values cannot silently acquire a stronger provenance claim.

Creating an annotation from a displayed chart records after-viewing-evidence automatically. No checkbox can turn it into pre-evidence memory. Edits create a new revision and keep the earlier provenance; if dates/text are revised after viewing, show “Edited after viewing evidence” alongside the original recording context. Keep created/updated times and a revision trail; never overwrite an earlier pre-evidence record into apparent untouched ground truth. Existing valid annotations remain user-owned/editable, but provenance is generated rather than a user-selectable confidence score.

The user may explicitly freeze a revision/hash for a later separate evaluation, but ordinary memory making needs no held-out truth workflow. An annotation adds the user's meaning; it does not retrain detection, change the tier, increase support counts or prove causation.

## Renderer boundary, offline constraints and delivery

Use plain inline SVG with local gradients/patterns and ordinary semantic HTML controls; no charting dependency. Source text is rendered as text, never markup; no remote thumbnails/fonts/scripts. The standalone report is personal and warns that it reveals interests, beliefs and affiliations. Explicit local save/import and an unsaved-annotation indicator remain required. No telemetry, model or runtime network access.

Extend the in-memory `TimelineModel` with versioned coverage/display/source-date metadata, channel activity series, lifecycle marks, primary interval identity, all contributing configuration intervals, support cells, endpoint envelope, agreement tier, gap spans, secondary-denominator checks, no-primary-folder summaries and annotation revisions/context. The renderer consumes this model, not Node report filenames. Pure presentation transformations must be testable with synthetic data. Current JSON artifacts provide analysis evidence; they are not blindly embedded wholesale into the HTML.

Stage implementation after approval: (1) portable report model and synthetic rendering tests; (2) descriptive opening, creator backbone and no-primary-folder section; (3) uncertainty-preserving folder Gantt; (4) annotations on shared axes and explicit personal save/re-import; (5) standalone/offline intake integration and the already-required selective untrimmed ZIP/browser/security tests. No detector tuning or new platform is part of this sequence. Retained-snapshot consumption can establish presentation first; it does not replace full-export intake acceptance.

The full Node step-6 batch peaked at 464.63 MiB; do not duplicate all 18 full run files and lifecycle arrays into both main thread and worker. Derive the compact timeline model once, retain selected detail lazily, release intermediates and measure browser memory and responsiveness. The earlier ZIP dependency candidate remains a separate intake decision, with no charting dependency implied. No runtime package is installed by this design.

## Acceptance checks for implementation

| Check | Required evidence |
| --- | --- |
| Top-of-report cutoff | Snapshot date, first/last observed action, timezone and partial status visible; synthetic UTC/local next-day case prevents the supplied-date/latest-action discrepancy being hidden. |
| Descriptive opening | Saved/liked counts match retained data; partial 2026 marked; no annualisation, inferred intention, percentile or normative score. |
| Backbone | All years preserved; creator channel switching and discrete gaps work; no continuous bar through empty months. |
| Exclusive tiers | This snapshot has 3 exact + 15 overlap + 28 primary-only outer shapes; missing/incomplete grids never receive stable styling. Nested tiers computed independently. |
| Unstable geometry | Synthetic ten-week shifts, disjoint support, overlap with no common week, merges/splits and one-match cases never yield crisp unstable rectangles or invented certain centres. |
| Coverage | Zero exposure, creation and endpoint gaps visibly cut every gradient/support footprint, including print/export. |
| No-primary section | All 39 appear with counts and discrete activity; two unassessed cases and 17 parameter-dependent cases disclosed, never all classified steady. |
| Accessible distinctions | Tiers recognisable in greyscale, without hover/captions, with keyboard and screen-reader alternatives; touch details match keyboard details; reduced-motion supported by avoiding animation. |
| Annotation provenance | Context visible inline and after export/re-import/print; edits after evidence preserve original context/revision; no silent exact-date prefill from an unstable interval. |
| Local safety | Hostile labels/annotations stay inert; complete app works with requests denied and wifi off; saved personal report discloses embedded data. Existing browser/ZIP allowlist adversarial tests still required. |
| Practical use | Intended-user review checks whether fuzzy locations prompt recollection and whether tiers are distinguishable, without presenting retrospective annotations as independent detector accuracy. Browser memory, cancellation, zoom and long-list responsiveness measured on target devices. |

Stop at this design for review. Step 7 diffing remains deferred: the 9 August export has never been parsed and must later be imported as its own independently dated snapshot. Request its actual local input directory before providing an exact import command; do not guess the path or treat another copy of the 30 August snapshot as the earlier export. No import is requested or run now.
