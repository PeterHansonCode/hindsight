# Activity charts and shared date range — design for review

2026-09-12. This is a design, not an implemented chart or range control. The three accompanying interaction/copy fixes are separate. No new detector, parser, dependency or network feature is proposed.

## Evidence checked before designing

The retained snapshot contains 10,054 saved/liked actions. Brisbane calendar coverage runs from 17 December 2017 to 31 August 2026: 3,180 daily bins, 456 Monday-start weekly bins and 105 monthly bins, including zero-count bins. Account creation is not established by the retained action timestamps. Until an independently supplied creation date is available, the axis starts at the first recorded action and says so; it must not label that date account creation. An earlier supplied creation date would introduce an explicitly uncovered segment, not assumed zeros.

A local measurement using all retained timestamps produced 60,677 bytes of JSON for `[localDate,saved,liked]` daily rows. Two plain SVG path strings at one-decimal coordinates, broken at zero-count bins, measured 1,743 bytes monthly, 6,206 weekly and 25,101 daily. These are prototype geometry byte counts, not a rendered performance benchmark or a finished payload-size guarantee. Full daily detail is affordable; roughly three points per pixel at full width is not readable. The proposed adaptive resolution is appropriate. A two-year weekly view would contain about 105 points; 456 is the whole-history weekly count.

November 2025 has 51 saves and 129 likes; December has 244 saves and 83 likes, using Brisbane months. Mark this nominated crossover window without inventing an exact day or claiming it was the first crossover ever.

2022 contains 505 actions, including at least one in every month. It cannot be labelled an activity-free year. Its longest wholly internal daily gap is **15 May–9 June 2022, 26 days**. Put “no recorded activity on this platform” on that dated gap, with a nearby reminder that this describes the retained export only. The user's TikTok explanation is personal context, not a model-generated explanation; it can be added as an annotation.

## Opening chart

Replace the annual bar image and long monthly table with a single inline SVG line chart. Saved stays green and liked stays terracotta. Both use the same linear count axis, labelled “recorded actions per month/week/day”; no second axis, smoothing, annualisation or percentage scores. The legend is above the chart and lines also have accessible channel labels. Focus/hover reveals the date interval and both exact counts. A compact accessible list for the focused/selected interval replaces the 105-row default table.

The active window determines resolution, by calendar span:

- More than 24 months: monthly.
- More than 4 months, up to 24 months: weekly, Monday-start in Brisbane.
- Up to 4 months: daily in Brisbane.

The resolution label changes visibly beside the axis. Shared start/end inputs and presets provide zoom; a separate chart-only zoom state is forbidden. Optional drag-to-select can be added later, but is not needed for the first implementation. Touch and keyboard users have the same date controls.

Break each channel's path at zero-count bins; show isolated nonzero bins as dots. A missing/unknown interval is distinct from a known zero count in this retained record. Never connect a line through either. Daily gap disclosure below the axis survives monthly aggregation: narrow ticks for short empty runs, labelled spans for longer ones, with exact dates available on focus. This prevents two active monthly totals from suggesting uninterrupted daily activity. Boundary bins contain only selected dates and are labelled partial; no rescaling to a full bucket. Both series share a y scale recalculated for the selection, with its bounds visible.

The crossover band occupies November–December 2025, without a single vertical boundary. The 26-day 2022 gap gets the exact absence wording above. Annotations share the chart's date axis in a separate user-authored track. Their dates, uncertain bounds and recordedContext remain visible; they never change the action lines. Clipped memories have continuation marks. Click/focus opens the existing edit flow with the same nearby confirmation and return controls.

## Supporting questions: compact answers with charts

These are inexpensive passes over retained timestamps. Compute from all saved/liked actions, including creator singletons and missing creator IDs. The repeat-creator projection alone is not a complete source. Keep saved/liked separate in charts and use a clearly labelled combined count for the single-record summaries. An action is a row, not a unique post, viewing session or person.

Each headline is one plain sentence with its main number and dated context; supporting charts and collapsed calculation/coverage details provide the qualification. Ties are reported, never broken silently.

| Question | Proposed answer and view | Honest limits |
| --- | --- | --- |
| Months of year | Two lines across Jan–Dec, using mean actions per included complete calendar month; identify highest/lowest means. | Show number of contributing years per month and individual-year lines on demand. A high pooled mean does not establish consistency. With fewer than two complete examples, say there is not enough repeated coverage. Count how often the pooled highest/lowest month is also each eligible complete year's highest/lowest; report that agreement as a count, not a claim of stable seasonality. Growth and changed saving behaviour can dominate pooled totals. |
| Day of week | Seven-point saved/liked lines showing actions per included occurrence of each weekday; sentence naming the largest mean. | Include zero-count dates, exclude partially observed edge dates, disclose coverage. A raw Monday total is not comparable to a shorter selection's Tuesday total. |
| Time of day | A 24-hour clock, with two concentric sets of radial count marks; hour labels 00–23 and exact counts on focus. | Australia/Brisbane (UTC+10) stated on the chart. Count recorded actions at each hour, not time spent. Radial marks are justified by the explicit clock request; no polar area encoding. |
| Busiest day/week | One sentence per result with count and date(s), plus a marker on the main chart when visible. | “Busiest recorded day/week in this range.” Monday–Sunday Brisbane weeks; exclude incomplete boundary weeks from the week comparison and say so. If there is no complete week, say unavailable. “Ever” becomes “in this retained record” even at All time. |
| Consecutive days | Longest streak with at least one saved or liked action per local date; sentence with day count and dates. | Selection-clipped streaks say they may continue outside the window. No praise, score or assumed habit. |
| Longest gap | Longest consecutive zero-count local-day run between recorded actions in the selection, with dates and day count. | Selected leading/trailing blanks are shown separately as open-ended gaps, not evidence of a completed gap. Unknown/uncovered segments are not counted. An entirely empty selection says so without claiming an interest ended. |
| Cumulative totals | Two cumulative step lines and a sentence giving total actions in the range. | Start at zero at selection start and label “added within this range”. Flat segments are explicitly zero additional retained actions, not interpolation of activity. Unknown coverage is shaded and disclosed. This accounting curve is distinct from the gap-broken activity chart. |
| First like/save | First recorded date/time for each channel in the active range. | Say “first recorded here” or “first in this range”, never first ever on Instagram. Unknown channel start stays unknown. |
| Sessions per month | Two monthly lines plus the count of saved and liked sessions in the selection. | Use the accepted exact fitted cutoffs, displayed rounded as 14.3/43.2 minutes in collapsed detail. Form sessions across the full channel history first, using the existing threshold equality/chaining rules, then attribute each session to its first action's local month. Range counts select those session starts. A session crossing the start boundary is disclosed, not split into a new session. No refitting on zoom. |
| Same month across years | Month selector and saved/liked lines across years, with a sentence for the latest eligible year's count. | Default to latest complete month in the active range. Only complete instances of that month inside the selected range are compared. Fewer than two means insufficient comparable coverage. No forced previous-year comparison against a partial month. |

No claim of full platform coverage follows from having complete calendar bins. “Complete” above means inside retained observed bounds and the selected dates, not proof that Instagram retained every action. Put this distinction once beside the summaries and keep the counts and coverage available on focus.

## One shared range control

At the top, below permanent source coverage, a sticky labelled control contains **All time · Last 5 years · Last 12 months · Last 3 months · Custom**. Show `Viewing: [start]–[end] · Australia/Brisbane (UTC+10)` persistently, in print and on every chart's accessible description. Source coverage/export date remain separately labelled and do not change with zoom.

Use local calendar dates, inclusive in the UI and half-open internally. Anchor trailing presets to the latest retained action's local date, not today or the generation date. Clamp to actual observed bounds; calendar subtraction handles leap years and month ends. The known export is dated 30 August UTC and its final action is on 31 August Brisbane, so the source rollover explanation remains. Never truncate that action to make the filename's date fit.

Custom requires two valid dates, start no later than end, inside the displayed source bounds. Reject errors inline without changing the last valid range. Apply explicitly rather than redrawing while dates are half-entered. All time is the reset. Save personal HTML preserves the current view as view state; annotation JSON does not contain view settings. Every saved copy still prints its active range. No automatic browser storage.

Every section subscribes to this one range:

- **Activity:** rebucket from daily/all-action aggregates with the resolution rules above. Recompute supporting summaries for the selected dates; label unavailable comparisons.
- **Creators:** clip discrete action marks to the range and show selected-window counts/first/last. Search and channel remain orthogonal. Recompute recurrence ordering from selected activity, including full-history session membership rather than refitting sessions. Creators previously classed as singletons remain subject to the approved singleton policy; do not expand identities from that aggregate. Existing full-history follow-up/peak findings go into explicitly labelled “whole-record detail”, not silently presented as selection statistics. Do not turn range clipping into a new lifecycle conclusion.
- **Folders:** use the intersection with the fixed December 2025–August 2026 analysis window. Explicitly show both requested and available dates. A wholly earlier range says there is no folder analysis for these dates; it does not jump to 2026. Render the clipped shapes and gap hatching. Recompute displayed raw counts for visible weeks/dates where available, but do not rerun bursts or reclassify agreement tiers. If exact partial-week counts are unavailable, label whole-week count coverage rather than invent them. Clipping is marked with arrows and cannot create a crisp inferred endpoint. Distinguish visible bar counts from the fixed whole-window 3/15/28.
- **Other folders:** intersect with the same available folder window and label limits. “No concentration in view” is distinct from the existing 39 folders with no main bar anywhere in the full analysis window. A filtered-away bar must never turn a folder into that original category.
- **Memories:** both timelines and cards show intersecting memories with continuation marks. Give a count of memories outside the range and an explicit All time action to see them. A newly added memory outside the range still gets nearby confirmation and an explicit way to reveal it; no silent disappearance. Exports always preserve all memories, not just visible ones.
- **Method/source disclosure:** remains whole-record provenance, explicitly labelled; counts for the current view are separate. No source truth is rewritten by a view control.

## Verification required after approval

Tests will conserve all 10,054 channel counts through daily/weekly/monthly aggregation, exercise Brisbane midnight and Monday boundaries, leap dates, partial bins, tied maxima, zero/missing gaps, empty windows and no-comparison cases. Session tests will prove grouping is invariant under zoom. Synthetic SVG tests will assert missing paths across gaps, annotation clipping/context, and no crisp clipped unstable endpoints. Range tests will check every section uses the same selected dates, folder non-overlap disclosure, and complete annotation exports after filtering.

Browser acceptance will include keyboard/touch-equivalent controls, focus/return behaviour, print with the active range, reload of saved HTML view state, and user-performed offline checks under the existing CSP. Source data stays read-only; all chart assets/code remain inline. No implementation of this design begins before review.
