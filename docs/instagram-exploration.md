# Instagram exploration — recorded activity, not detected phases

**Low disclosure:** aggregate counts and report-local ranks; no individual account names, folder names or literal hashtags. These patterns are not guaranteed anonymous.

At the time of this exploration, ERAS was deferred; the later product revision supersedes the changepoint proposal. This is descriptive exploration, not changepoint detection or clustering. No source export was re-parsed and no network or AI analysis was used.

Scope: one retained snapshot, supplied export date **2026-08-30**; **10,054 observations**, 4,809 saved and 5,245 liked. Observed UTC range: 2017-12-17T00:36:32.000Z to 2026-08-30T22:48:58.000Z.

Calendar count tables use UTC to remain comparable with the validated summary. Time-of-day, weekday, session-month and supplied-life-month comparisons use **Australia/Brisbane = UTC+10, no daylight saving**. Local-year time tables are grouped by the converted year, so year totals can differ from UTC tables. The first observed period and the final export-limited period are partial; no annualisation. These are retained actions, not all viewing or a complete account history.

An empty week means **no recorded activity on this platform in this snapshot**. It does not mean no interests, experiences or activity elsewhere. Nonzero low-count intervals are labelled by their actual counts, never as absence.

Snapshot parse status: partial. Quarantine status: not_run; not_run means the quarantine engine did not run. Read the original parse-report.txt for omissions; a successful parse is not a completeness claim. Diagnostic counts are retained in the structured output.

## Accepted interpretation corrections and current scope

This accepted exploration remains a historical research report. Its before/after tables, raw-count ranks and distribution percentiles are not the future memory-aid UI contract. The runtime renderer was not changed in this documentation-only revision. The current product design is in browser-and-annotations.md and lifecycles-and-bursts.md; the changepoint proposal is now superseded, not merely awaiting a run.

**Collections are a 2026 organising system, not historical topic labelling.** 67 of 73 folders were created in 2026, including 30 in January; 4,047 of 4,809 saves are from 2026; 90.96% of 2025 saves are unfiled. The dense current-folder-labelled window is roughly December 2025–August 2026, with very little before it. Collection-based topic analysis across the whole history is not available. Even inside the recent window, current membership and creation timestamps cannot recover actual filing dates or historical membership.

**The user's stated friends-versus-creators hypothesis was not supported.** Once-or-twice account observations represent 17.50% of 2021 events versus 67.93% of 2026 events: the observed frequency direction is the reverse of the hypothesis. This does not identify friends or professional creators. No explanation of the reversal is assigned.

**The November 2021 signal is confounded.** The weekday daytime share rose from 17.77% to 25.18%, but recorded events fell from 1,418 to 544 across the same 12-month flank windows. The 2022 low-count interval sits inside the after-window. Leaving school and the user's reported move toward TikTok overlap in the relevant context. These observations cannot be attributed to either cause; Instagram records do not independently date the migration.

## Measured findings to read first

These observations refer only to the retained August 30 snapshot. Full tables, denominators and limitations follow; named details stay in the personal report outside Git.

- **The action crossover is November–December 2025.** November records 51 saves and 130 likes; December records 243 saves and 82 likes. December is the first save-majority calendar month, followed by save-majority months through August 2026. This is a transition window in monthly action counts, not a detected phase boundary.
- **The longest low-count run within the supplied 2020–2023 migration window is 2 May–13 November 2022:** 41 observations in 28 weeks, including seven empty weeks. It cannot be described as entirely absent activity, and it cannot establish the dates of a TikTok move. No exact inter-event gap of 28+ days occurs in 2020–2023. All such exact gaps occur in 2018–2019; all shorter-week low-count runs are listed below.
- **The November 2021 comparison changes both volume and clock distribution.** The 12 local months before November contain 1,418 events, versus 544 in the 12 local months after November. Weekday 09:00–15:00 observations are 252/1,418 (17.77%) before and 137/544 (25.18%) after. November itself is separate. The 2022 low-count interval falls within the after-window; school departure and the supplied TikTok-migration context overlap, so neither cause can be assigned. This is not evidence about attendance or holidays.
- **Folder evidence has two early objects, then many later ones.** The earliest retained folder was created 10 August 2023 at 13:29:34 UTC; the second on 20 December 2024 at 10:03:42 UTC; the third on 18 December 2025 at 07:51:18 UTC. Of 73 retained folders, 67 were created in 2026, including 30 in January. This dates those objects exactly; it does not establish first-ever organising or when their current posts were filed.
- **The backlog is 770, not 763.** Only 4,039 saved observations match at least one folder. The 4,046 unique collection post identities include seven unmatched posts, which cannot be subtracted from 4,809 saves. Among the 770 without matched placements, only seven were saved in the last 90 days. Median save age is 355.38 days; 624 are from 2025. Unfiled shares are 624/686 (90.96%) for 2025 versus 72/4,047 (1.78%) for 2026. This describes older unfiled observations, not abandonment.
- **Long-before-creation saves are uncommon in the dated pairs, but late filing remains unknowable.** Only 75/4,170 matched post–folder pairs predate folder creation. Just one predates it by 30+ days, also the sole 90+ day case (120.81 days); none by a year. These are lower bounds on filing delay, not estimates of actual delay. All seven unmatched placements occur in the first two retained folders: six in the first, one in the second. Their save dates remain unknown.
- **There are 19 folders with at most three posts, including ten with one.** Median size is 16, maximum 796. No timestamp establishes that a small folder was abandoned. The highest-overlap pair is F15/F37 with 18 distinct shared posts; the full ranked pairs and named personal lookup are available below and outside Git respectively.
- **Hashtag coverage limits the likes description.** The 22,439 liked-event hashtag tokens occur on 1,992/5,245 observations (37.98%). Saves have 14,083 tokens on 2,746/4,809 observations (57.10%). Here raw counts equal per-observation deduplicated presences. Year/channel rankings follow; the personal report supplies literal tags while this document uses anonymous ranks.
- **Frequency alone cannot classify friends and creators.** Events involving accounts observed once or twice across the whole snapshot are 296/1,691 (17.50%) in 2021 and 2,790/4,107 (67.93%) in 2026. The later records are not more concentrated on repeated account IDs by this measure. The stated hypothesis was not supported and the observed direction is reversed. This does not establish whether the accounts are peers or content creators, and usernames are not immutable person identities.
- **URL formats change, but photos are not identified reliably.** Saves contain 4,710 /reel/ URLs out of 4,809; likes contain 2,662 /p/, 2,455 /reel/ and 128 /tv/ URLs out of 5,245. A /p/ URL can represent a photo, carousel or video. The last recorded /tv/ action is 8 October 2022 at 07:59:11 UTC, all /tv/ observations being likes. That is not a platform discontinuation date.
- **Session counts depend on the declared gap.** Combined observations form 4,795 / 4,378 / 3,923 groups at 15 / 30 / 60 minutes. At 30 minutes, mean size rises from 1.85 events in 2021 to 4.17 in partial 2026; medians and tails are below. Groups measure bursts in recorded actions, not one decision or viewing duration.

**Cross-export check remains unavailable:** the two retained August 30 directories have identical observation SHA-256 values. Neither is the user's earlier export. No older raw export was parsed to fill this gap. The claimed older-account absences therefore cannot be confirmed or cross-referenced here.

## 1. Saving and liking: the observed transition

This behavioural divergence is a result in its own right. It needs no detector. “Consumption became curation” is the user’s interpretation, not a conclusion these action records can establish.

| UTC year | Saved | Liked | Save share of both | Period coverage |
| --- | --- | --- | --- | --- |
| 2017 | 0 | 4 | 0.00% | first observed period |
| 2018 | 1 | 52 | 1.89% | calendar year; retention unknown |
| 2019 | 0 | 151 | 0.00% | calendar year; retention unknown |
| 2020 | 2 | 582 | 0.34% | calendar year; retention unknown |
| 2021 | 2 | 1,689 | 0.12% | calendar year; retention unknown |
| 2022 | 1 | 404 | 0.25% | calendar year; retention unknown |
| 2023 | 11 | 349 | 3.06% | calendar year; retention unknown |
| 2024 | 59 | 762 | 7.19% | calendar year; retention unknown |
| 2025 | 686 | 1,192 | 36.53% | calendar year; retention unknown |
| 2026 | 4,047 | 60 | 98.54% | partial through export |


First observed save-majority calendar month: **2025-12**. Final uninterrupted run of save-majority months through this export starts **2025-12**. Its preceding month is **2025-11**, with 51 saves and 130 likes.

These are literal comparisons of monthly counts, not an estimated change date. The first majority month and the eventual uninterrupted run need not agree. A final month is censored; this does not predict continued dominance. Read the adjacent months as a transition window, not a day.

| UTC month | Saved | Liked | Larger observed count |
| --- | --- | --- | --- |
| 2017-12 | 0 | 4 | liked |
| 2018-01 | 0 | 1 | liked |
| 2018-02 | 0 | 5 | liked |
| 2018-03 | 0 | 5 | liked |
| 2018-04 | 0 | 1 | liked |
| 2018-05 | 0 | 8 | liked |
| 2018-06 | 0 | 1 | liked |
| 2018-07 | 0 | 0 | no observations |
| 2018-08 | 0 | 0 | no observations |
| 2018-09 | 0 | 2 | liked |
| 2018-10 | 0 | 5 | liked |
| 2018-11 | 0 | 9 | liked |
| 2018-12 | 1 | 15 | liked |
| 2019-01 | 0 | 4 | liked |
| 2019-02 | 0 | 2 | liked |
| 2019-03 | 0 | 5 | liked |
| 2019-04 | 0 | 14 | liked |
| 2019-05 | 0 | 10 | liked |
| 2019-06 | 0 | 9 | liked |
| 2019-07 | 0 | 4 | liked |
| 2019-08 | 0 | 5 | liked |
| 2019-09 | 0 | 9 | liked |
| 2019-10 | 0 | 28 | liked |
| 2019-11 | 0 | 34 | liked |
| 2019-12 | 0 | 27 | liked |
| 2020-01 | 0 | 37 | liked |
| 2020-02 | 1 | 82 | liked |
| 2020-03 | 0 | 42 | liked |
| 2020-04 | 0 | 18 | liked |
| 2020-05 | 0 | 25 | liked |
| 2020-06 | 0 | 36 | liked |
| 2020-07 | 0 | 39 | liked |
| 2020-08 | 0 | 39 | liked |
| 2020-09 | 1 | 55 | liked |
| 2020-10 | 0 | 49 | liked |
| 2020-11 | 0 | 82 | liked |
| 2020-12 | 0 | 78 | liked |
| 2021-01 | 0 | 53 | liked |
| 2021-02 | 0 | 38 | liked |
| 2021-03 | 0 | 87 | liked |
| 2021-04 | 0 | 173 | liked |
| 2021-05 | 0 | 160 | liked |
| 2021-06 | 0 | 147 | liked |
| 2021-07 | 0 | 128 | liked |
| 2021-08 | 0 | 98 | liked |
| 2021-09 | 2 | 196 | liked |
| 2021-10 | 0 | 176 | liked |
| 2021-11 | 0 | 258 | liked |
| 2021-12 | 0 | 175 | liked |
| 2022-01 | 1 | 135 | liked |
| 2022-02 | 0 | 66 | liked |
| 2022-03 | 0 | 73 | liked |
| 2022-04 | 0 | 20 | liked |
| 2022-05 | 0 | 3 | liked |
| 2022-06 | 0 | 4 | liked |
| 2022-07 | 0 | 9 | liked |
| 2022-08 | 0 | 9 | liked |
| 2022-09 | 0 | 8 | liked |
| 2022-10 | 0 | 5 | liked |
| 2022-11 | 0 | 31 | liked |
| 2022-12 | 0 | 41 | liked |
| 2023-01 | 0 | 16 | liked |
| 2023-02 | 2 | 4 | liked |
| 2023-03 | 0 | 10 | liked |
| 2023-04 | 1 | 17 | liked |
| 2023-05 | 1 | 40 | liked |
| 2023-06 | 1 | 63 | liked |
| 2023-07 | 0 | 16 | liked |
| 2023-08 | 0 | 38 | liked |
| 2023-09 | 3 | 41 | liked |
| 2023-10 | 2 | 44 | liked |
| 2023-11 | 1 | 45 | liked |
| 2023-12 | 0 | 15 | liked |
| 2024-01 | 2 | 26 | liked |
| 2024-02 | 1 | 15 | liked |
| 2024-03 | 3 | 32 | liked |
| 2024-04 | 13 | 69 | liked |
| 2024-05 | 15 | 114 | liked |
| 2024-06 | 3 | 36 | liked |
| 2024-07 | 6 | 31 | liked |
| 2024-08 | 3 | 28 | liked |
| 2024-09 | 4 | 50 | liked |
| 2024-10 | 4 | 119 | liked |
| 2024-11 | 5 | 160 | liked |
| 2024-12 | 0 | 82 | liked |
| 2025-01 | 3 | 98 | liked |
| 2025-02 | 27 | 106 | liked |
| 2025-03 | 60 | 69 | liked |
| 2025-04 | 60 | 128 | liked |
| 2025-05 | 45 | 133 | liked |
| 2025-06 | 36 | 64 | liked |
| 2025-07 | 33 | 138 | liked |
| 2025-08 | 25 | 99 | liked |
| 2025-09 | 54 | 68 | liked |
| 2025-10 | 49 | 77 | liked |
| 2025-11 | 51 | 130 | liked |
| 2025-12 | 243 | 82 | saved |
| 2026-01 | 265 | 14 | saved |
| 2026-02 | 386 | 13 | saved |
| 2026-03 | 273 | 7 | saved |
| 2026-04 | 456 | 8 | saved |
| 2026-05 | 662 | 5 | saved |
| 2026-06 | 836 | 8 | saved |
| 2026-07 | 506 | 3 | saved |
| 2026-08 | 663 | 2 | saved |


## 2. Low-count intervals and possible cross-platform comparisons

No Instagram timestamp identifies a TikTok migration. The table dates the low-count intervals that can be compared with the user’s recollection. “Little” is an explicit counting convention: every week has 0–4 observations, for at least four consecutive Monday-starting UTC weeks. This is not a fitted threshold. Exact zero runs are listed separately. Endpoint weeks are excluded conservatively; apparent gaps may reflect incomplete retention.

| Start UTC | End UTC inclusive | Weeks | Recorded events | Empty weeks | Events/week max |
| --- | --- | --- | --- | --- | --- |
| 2017-12-18 | 2018-05-06 | 20 | 16 | 8 | 3 |
| 2018-05-14 | 2018-11-25 | 28 | 13 | 20 | 4 |
| 2018-12-31 | 2019-03-31 | 13 | 11 | 6 | 2 |
| 2019-04-22 | 2019-10-06 | 24 | 42 | 6 | 4 |
| 2020-03-23 | 2020-04-19 | 4 | 13 | 0 | 4 |
| 2022-05-02 | 2022-11-13 | 28 | 41 | 7 | 4 |
| 2023-01-02 | 2023-02-26 | 8 | 17 | 2 | 4 |
| 2023-03-06 | 2023-04-16 | 6 | 12 | 0 | 4 |
| 2023-07-10 | 2023-08-13 | 5 | 12 | 1 | 4 |
| 2023-12-18 | 2024-01-14 | 4 | 4 | 1 | 2 |


**Exact zero runs of four or more weeks — no recorded activity on this platform:**

| Start UTC | End UTC inclusive | Weeks |
| --- | --- | --- |
| 2018-06-11 | 2018-09-02 | 12 |
| 2019-02-11 | 2019-03-10 | 4 |
| 2019-07-15 | 2019-08-11 | 4 |


**Every inter-observation gap of at least 28 elapsed days:** this additional check catches gaps not aligned to Mondays. The endpoints themselves are recorded observations; the open interval between them has no recorded activity on this platform. It is not a claim about activity before the first or after the last observation.

| Preceding observation UTC | Next observation UTC | Elapsed days |
| --- | --- | --- |
| 2018-06-05T13:04:57.000Z | 2018-09-09T12:36:19.000Z | 95.98 |
| 2018-09-13T05:26:01.000Z | 2018-10-13T12:10:45.000Z | 30.28 |
| 2018-10-15T22:19:11.000Z | 2018-11-15T11:48:33.000Z | 30.56 |
| 2019-02-06T11:21:20.000Z | 2019-03-12T11:05:21.000Z | 33.99 |
| 2019-07-08T10:41:16.000Z | 2019-08-16T00:35:16.000Z | 38.58 |


Four-week before/inside/after comparisons for every low-count interval are included below and in the structured file. A low interval containing some records cannot truthfully be called “no recorded activity.” Its zero subweeks have that description. Saved-only and liked-only runs are also retained in the structured output.

## 3. Supplied life-event month and other before/after comparisons

Supplied month: **2021-11**. No exact departure day was supplied. The whole local month is kept separate; before ends at the start of that local month and after begins at the start of the next local month. Twelve-month flanks make unequal whole-history spans visible. No comparison establishes the cause of a difference.

| Segment | UTC start inclusive | UTC end exclusive | Saved | Liked | Events | Unique creators | Requested window exceeds observed range |
| --- | --- | --- | --- | --- | --- | --- | --- |
| before supplied month | first observation | 2021-10-31T14:00:00.000Z | 5 | 2045 | 2050 | 456 | no; completeness still unknown |
| supplied month | 2021-10-31T14:00:00.000Z | 2021-11-30T14:00:00.000Z | 0 | 253 | 253 | 113 | no; completeness still unknown |
| after supplied month | 2021-11-30T14:00:00.000Z | last observation | 4804 | 2947 | 7751 | 4873 | no; completeness still unknown |
| 12 months before supplied month | 2020-10-31T14:00:00.000Z | 2021-10-31T14:00:00.000Z | 2 | 1416 | 1418 | 294 | no; completeness still unknown |
| 12 months after supplied month | 2021-11-30T14:00:00.000Z | 2022-11-30T14:00:00.000Z | 1 | 543 | 544 | 223 | no; completeness still unknown |
| before earliest retained folder creation | first observation | 2023-08-10T13:29:34.000Z | 11 | 3054 | 3065 | 838 | no; completeness still unknown |
| at or after earliest retained folder creation | 2023-08-10T13:29:34.000Z | last observation | 4798 | 2191 | 6989 | 4511 | no; completeness still unknown |
| before final save-majority monthly run | first observation | 2025-12-01T00:00:00.000Z | 519 | 5103 | 5622 | 2511 | no; completeness still unknown |
| during final save-majority monthly run | 2025-12-01T00:00:00.000Z | last observation | 4290 | 142 | 4432 | 2968 | no; completeness still unknown |
| low-count interval 2017-12-18 | 2017-12-18T00:00:00.000Z | 2018-05-07T00:00:00.000Z | 0 | 16 | 16 | 8 | no; completeness still unknown |
| 4 weeks before low-count interval 2017-12-18 | 2017-11-20T00:00:00.000Z | 2017-12-18T00:00:00.000Z | 0 | 2 | 2 | 1 | yes |
| 4 weeks after low-count interval 2017-12-18 | 2018-05-07T00:00:00.000Z | 2018-06-04T00:00:00.000Z | 0 | 6 | 6 | 6 | no; completeness still unknown |
| low-count interval 2018-05-14 | 2018-05-14T00:00:00.000Z | 2018-11-26T00:00:00.000Z | 0 | 13 | 13 | 10 | no; completeness still unknown |
| 4 weeks before low-count interval 2018-05-14 | 2018-04-16T00:00:00.000Z | 2018-05-14T00:00:00.000Z | 0 | 7 | 7 | 7 | no; completeness still unknown |
| 4 weeks after low-count interval 2018-05-14 | 2018-11-26T00:00:00.000Z | 2018-12-24T00:00:00.000Z | 1 | 13 | 14 | 10 | no; completeness still unknown |
| low-count interval 2018-12-31 | 2018-12-31T00:00:00.000Z | 2019-04-01T00:00:00.000Z | 0 | 11 | 11 | 10 | no; completeness still unknown |
| 4 weeks before low-count interval 2018-12-31 | 2018-12-03T00:00:00.000Z | 2018-12-31T00:00:00.000Z | 1 | 15 | 16 | 13 | no; completeness still unknown |
| 4 weeks after low-count interval 2018-12-31 | 2019-04-01T00:00:00.000Z | 2019-04-29T00:00:00.000Z | 0 | 14 | 14 | 11 | no; completeness still unknown |
| low-count interval 2019-04-22 | 2019-04-22T00:00:00.000Z | 2019-10-07T00:00:00.000Z | 0 | 42 | 42 | 32 | no; completeness still unknown |
| 4 weeks before low-count interval 2019-04-22 | 2019-03-25T00:00:00.000Z | 2019-04-22T00:00:00.000Z | 0 | 14 | 14 | 11 | no; completeness still unknown |
| 4 weeks after low-count interval 2019-04-22 | 2019-10-07T00:00:00.000Z | 2019-11-04T00:00:00.000Z | 0 | 28 | 28 | 15 | no; completeness still unknown |
| low-count interval 2020-03-23 | 2020-03-23T00:00:00.000Z | 2020-04-20T00:00:00.000Z | 0 | 13 | 13 | 8 | no; completeness still unknown |
| 4 weeks before low-count interval 2020-03-23 | 2020-02-24T00:00:00.000Z | 2020-03-23T00:00:00.000Z | 0 | 58 | 58 | 19 | no; completeness still unknown |
| 4 weeks after low-count interval 2020-03-23 | 2020-04-20T00:00:00.000Z | 2020-05-18T00:00:00.000Z | 0 | 18 | 18 | 8 | no; completeness still unknown |
| low-count interval 2022-05-02 | 2022-05-02T00:00:00.000Z | 2022-11-14T00:00:00.000Z | 0 | 41 | 41 | 32 | no; completeness still unknown |
| 4 weeks before low-count interval 2022-05-02 | 2022-04-04T00:00:00.000Z | 2022-05-02T00:00:00.000Z | 0 | 17 | 17 | 16 | no; completeness still unknown |
| 4 weeks after low-count interval 2022-05-02 | 2022-11-14T00:00:00.000Z | 2022-12-12T00:00:00.000Z | 0 | 42 | 42 | 32 | no; completeness still unknown |
| low-count interval 2023-01-02 | 2023-01-02T00:00:00.000Z | 2023-02-27T00:00:00.000Z | 0 | 17 | 17 | 16 | no; completeness still unknown |
| 4 weeks before low-count interval 2023-01-02 | 2022-12-05T00:00:00.000Z | 2023-01-02T00:00:00.000Z | 0 | 38 | 38 | 32 | no; completeness still unknown |
| 4 weeks after low-count interval 2023-01-02 | 2023-02-27T00:00:00.000Z | 2023-03-27T00:00:00.000Z | 2 | 8 | 10 | 10 | no; completeness still unknown |
| low-count interval 2023-03-06 | 2023-03-06T00:00:00.000Z | 2023-04-17T00:00:00.000Z | 0 | 12 | 12 | 12 | no; completeness still unknown |
| 4 weeks before low-count interval 2023-03-06 | 2023-02-06T00:00:00.000Z | 2023-03-06T00:00:00.000Z | 2 | 5 | 7 | 7 | no; completeness still unknown |
| 4 weeks after low-count interval 2023-03-06 | 2023-04-17T00:00:00.000Z | 2023-05-15T00:00:00.000Z | 2 | 45 | 47 | 46 | no; completeness still unknown |
| low-count interval 2023-07-10 | 2023-07-10T00:00:00.000Z | 2023-08-14T00:00:00.000Z | 0 | 12 | 12 | 10 | no; completeness still unknown |
| 4 weeks before low-count interval 2023-07-10 | 2023-06-12T00:00:00.000Z | 2023-07-10T00:00:00.000Z | 1 | 57 | 58 | 53 | no; completeness still unknown |
| 4 weeks after low-count interval 2023-07-10 | 2023-08-14T00:00:00.000Z | 2023-09-11T00:00:00.000Z | 0 | 54 | 54 | 44 | no; completeness still unknown |
| low-count interval 2023-12-18 | 2023-12-18T00:00:00.000Z | 2024-01-15T00:00:00.000Z | 0 | 4 | 4 | 4 | no; completeness still unknown |
| 4 weeks before low-count interval 2023-12-18 | 2023-11-20T00:00:00.000Z | 2023-12-18T00:00:00.000Z | 1 | 29 | 30 | 26 | no; completeness still unknown |
| 4 weeks after low-count interval 2023-12-18 | 2024-01-15T00:00:00.000Z | 2024-02-12T00:00:00.000Z | 3 | 27 | 30 | 29 | no; completeness still unknown |


Composition of the supplied-month, folder and action-mix segments follows. Hashtag presence is not a topic inference. Complete low-count/flank compositions are in JSON.

| Segment | Channel | Events | With hashtags | Top three tags | /reel/ /p/ /tv/ unknown |
| --- | --- | --- | --- | --- | --- |
| before supplied month | saved | 5 | 2 | H2074 (1), H2075 (1), H2082 (1) | 0/5/0/0 |
| before supplied month | liked | 2045 | 425 | H0009 (168), H0006 (160), H0012 (128) | 218/1803/24/0 |
| supplied month | saved | 0 | 0 | none recorded | 0/0/0/0 |
| supplied month | liked | 253 | 69 | H0009 (23), H0017 (17), H0016 (17) | 73/141/39/0 |
| after supplied month | saved | 4804 | 2744 | H0001 (224), H0007 (139), H0004 (133) | 4710/94/0/0 |
| after supplied month | liked | 2947 | 1498 | H0003 (227), H0005 (183), H0011 (126) | 2164/718/65/0 |
| 12 months before supplied month | saved | 2 | 1 | H1891 (1) | 0/2/0/0 |
| 12 months before supplied month | liked | 1416 | 308 | H0009 (157), H0006 (138), H0016 (116) | 216/1176/24/0 |
| 12 months after supplied month | saved | 1 | 0 | none recorded | 1/0/0/0 |
| 12 months after supplied month | liked | 543 | 128 | H0009 (42), H0017 (34), H0002 (32) | 261/217/65/0 |
| before earliest retained folder creation | saved | 11 | 6 | H0006 (2), H2074 (1), H2075 (1) | 3/8/0/0 |
| before earliest retained folder creation | liked | 3054 | 724 | H0009 (235), H0006 (204), H0016 (163) | 696/2230/128/0 |
| at or after earliest retained folder creation | saved | 4798 | 2740 | H0001 (224), H0007 (139), H0004 (133) | 4707/91/0/0 |
| at or after earliest retained folder creation | liked | 2191 | 1268 | H0003 (227), H0005 (182), H0011 (115) | 1759/432/0/0 |
| before final save-majority monthly run | saved | 519 | 340 | H0019 (78), H0028 (60), H0005 (58) | 504/15/0/0 |
| before final save-majority monthly run | liked | 5103 | 1923 | H0006 (241), H0009 (236), H0003 (226) | 2345/2630/128/0 |
| during final save-majority monthly run | saved | 4290 | 2406 | H0001 (201), H0013 (127), H0007 (116) | 4206/84/0/0 |
| during final save-majority monthly run | liked | 142 | 69 | H0011 (9), H0153 (5), H0113 (5) | 110/32/0/0 |


## 4. Retained folders in creation order

Collections are a recent topic source, roughly December 2025–August 2026, not historical labels for the whole timeline. Creation times are recorded facts about these retained folders, not filing timestamps. The earliest surviving folder dates the earliest organising evidence here, not necessarily the first folder ever used. No collection membership is projected backwards in time. Unidentified placements, if any, are counted separately in JSON rather than treated as distinct known posts.

| Folder | Creation UTC | Unique posts | Matched saved | Unmatched | Dated pairs | Saved before creation | At least 90 days earlier |
| --- | --- | --- | --- | --- | --- | --- | --- |
| F01 | 2023-08-10T13:29:34.000Z | 8 | 2 | 6 | 2 | 0 | 0 |
| F02 | 2024-12-20T10:03:42.000Z | 2 | 1 | 1 | 1 | 0 | 0 |
| F03 | 2025-12-18T07:51:18.000Z | 150 | 150 | 0 | 150 | 1 | 0 |
| F04 | 2025-12-21T22:47:32.000Z | 21 | 21 | 0 | 21 | 1 | 0 |
| F05 | 2025-12-21T22:58:06.000Z | 87 | 87 | 0 | 87 | 2 | 0 |
| F06 | 2025-12-21T23:09:38.000Z | 47 | 47 | 0 | 47 | 1 | 0 |
| F07 | 2026-01-05T10:05:07.000Z | 216 | 216 | 0 | 216 | 0 | 0 |
| F08 | 2026-01-05T10:10:24.000Z | 5 | 5 | 0 | 5 | 1 | 0 |
| F09 | 2026-01-05T10:11:09.000Z | 106 | 106 | 0 | 106 | 1 | 0 |
| F10 | 2026-01-05T10:11:41.000Z | 43 | 43 | 0 | 43 | 3 | 0 |
| F11 | 2026-01-05T10:12:01.000Z | 1 | 1 | 0 | 1 | 1 | 0 |
| F12 | 2026-01-05T10:13:05.000Z | 6 | 6 | 0 | 6 | 3 | 0 |
| F13 | 2026-01-05T10:13:23.000Z | 7 | 7 | 0 | 7 | 1 | 0 |
| F14 | 2026-01-05T10:13:53.000Z | 4 | 4 | 0 | 4 | 1 | 0 |
| F15 | 2026-01-05T10:14:21.000Z | 667 | 667 | 0 | 667 | 2 | 0 |
| F16 | 2026-01-05T10:17:25.000Z | 1 | 1 | 0 | 1 | 1 | 0 |
| F17 | 2026-01-05T10:20:26.000Z | 1 | 1 | 0 | 1 | 1 | 0 |
| F18 | 2026-01-05T10:22:48.000Z | 150 | 150 | 0 | 150 | 1 | 0 |
| F19 | 2026-01-05T10:23:50.000Z | 27 | 27 | 0 | 27 | 1 | 0 |
| F20 | 2026-01-06T09:54:44.000Z | 10 | 10 | 0 | 10 | 1 | 0 |
| F21 | 2026-01-07T07:51:44.000Z | 47 | 47 | 0 | 47 | 1 | 0 |
| F22 | 2026-01-07T07:52:23.000Z | 1 | 1 | 0 | 1 | 1 | 0 |
| F23 | 2026-01-07T07:57:36.000Z | 3 | 3 | 0 | 3 | 1 | 0 |
| F24 | 2026-01-08T01:16:15.000Z | 2 | 2 | 0 | 2 | 1 | 0 |
| F25 | 2026-01-10T01:59:27.000Z | 92 | 92 | 0 | 92 | 0 | 0 |
| F26 | 2026-01-10T02:13:13.000Z | 2 | 2 | 0 | 2 | 1 | 0 |
| F27 | 2026-01-10T02:16:42.000Z | 17 | 17 | 0 | 17 | 1 | 0 |
| F28 | 2026-01-10T07:30:43.000Z | 31 | 31 | 0 | 31 | 1 | 0 |
| F29 | 2026-01-10T07:31:59.000Z | 517 | 517 | 0 | 517 | 1 | 0 |
| F30 | 2026-01-12T06:14:35.000Z | 4 | 4 | 0 | 4 | 1 | 0 |
| F31 | 2026-01-12T11:03:38.000Z | 130 | 130 | 0 | 130 | 1 | 0 |
| F32 | 2026-01-13T05:34:49.000Z | 1 | 1 | 0 | 1 | 1 | 0 |
| F33 | 2026-01-22T22:10:06.000Z | 75 | 75 | 0 | 75 | 1 | 0 |
| F34 | 2026-01-23T04:01:21.000Z | 7 | 7 | 0 | 7 | 1 | 0 |
| F35 | 2026-01-24T05:35:56.000Z | 1 | 1 | 0 | 1 | 1 | 0 |
| F36 | 2026-01-31T00:24:02.000Z | 15 | 15 | 0 | 15 | 1 | 0 |
| F37 | 2026-02-03T06:25:09.000Z | 796 | 796 | 0 | 796 | 2 | 0 |
| F38 | 2026-02-03T06:28:19.000Z | 7 | 7 | 0 | 7 | 1 | 0 |
| F39 | 2026-02-04T07:58:02.000Z | 37 | 37 | 0 | 37 | 1 | 0 |
| F40 | 2026-02-06T11:20:44.000Z | 16 | 16 | 0 | 16 | 0 | 0 |
| F41 | 2026-02-07T02:36:45.000Z | 4 | 4 | 0 | 4 | 1 | 0 |
| F42 | 2026-02-07T06:19:01.000Z | 1 | 1 | 0 | 1 | 1 | 0 |
| F43 | 2026-02-07T06:19:20.000Z | 6 | 6 | 0 | 6 | 1 | 0 |
| F44 | 2026-02-08T23:34:23.000Z | 93 | 93 | 0 | 93 | 1 | 0 |
| F45 | 2026-02-13T01:35:10.000Z | 7 | 7 | 0 | 7 | 1 | 0 |
| F46 | 2026-02-24T11:50:29.000Z | 22 | 22 | 0 | 22 | 1 | 0 |
| F47 | 2026-02-25T02:28:09.000Z | 54 | 54 | 0 | 54 | 1 | 0 |
| F48 | 2026-03-03T08:50:59.000Z | 32 | 32 | 0 | 32 | 1 | 0 |
| F49 | 2026-03-03T09:51:36.000Z | 2 | 2 | 0 | 2 | 1 | 0 |
| F50 | 2026-03-07T07:27:13.000Z | 3 | 3 | 0 | 3 | 1 | 0 |
| F51 | 2026-03-15T00:54:01.000Z | 3 | 3 | 0 | 3 | 1 | 0 |
| F52 | 2026-04-01T03:33:41.000Z | 51 | 51 | 0 | 51 | 3 | 0 |
| F53 | 2026-04-08T06:12:29.000Z | 35 | 35 | 0 | 35 | 1 | 0 |
| F54 | 2026-04-09T00:03:15.000Z | 5 | 5 | 0 | 5 | 1 | 0 |
| F55 | 2026-04-29T23:52:30.000Z | 47 | 47 | 0 | 47 | 1 | 0 |
| F56 | 2026-05-02T02:51:05.000Z | 77 | 77 | 0 | 77 | 1 | 0 |
| F57 | 2026-05-02T03:07:20.000Z | 2 | 2 | 0 | 2 | 1 | 0 |
| F58 | 2026-05-02T03:38:48.000Z | 16 | 16 | 0 | 16 | 1 | 0 |
| F59 | 2026-05-02T08:05:37.000Z | 17 | 17 | 0 | 17 | 1 | 0 |
| F60 | 2026-05-02T08:18:47.000Z | 35 | 35 | 0 | 35 | 0 | 0 |
| F61 | 2026-05-02T08:58:58.000Z | 60 | 60 | 0 | 60 | 1 | 0 |
| F62 | 2026-05-02T12:47:41.000Z | 14 | 14 | 0 | 14 | 0 | 0 |
| F63 | 2026-05-14T06:13:03.000Z | 20 | 20 | 0 | 20 | 1 | 0 |
| F64 | 2026-05-31T13:25:42.000Z | 14 | 14 | 0 | 14 | 0 | 0 |
| F65 | 2026-06-19T03:49:59.000Z | 1 | 1 | 0 | 1 | 1 | 1 |
| F66 | 2026-06-21T08:47:50.000Z | 67 | 67 | 0 | 67 | 1 | 0 |
| F67 | 2026-06-24T23:31:58.000Z | 20 | 20 | 0 | 20 | 1 | 0 |
| F68 | 2026-06-27T03:51:19.000Z | 3 | 3 | 0 | 3 | 1 | 0 |
| F69 | 2026-06-27T07:29:38.000Z | 25 | 25 | 0 | 25 | 1 | 0 |
| F70 | 2026-07-01T09:24:08.000Z | 69 | 69 | 0 | 69 | 2 | 0 |
| F71 | 2026-08-04T15:35:22.000Z | 1 | 1 | 0 | 1 | 1 | 0 |
| F72 | 2026-08-17T03:52:49.000Z | 10 | 10 | 0 | 10 | 1 | 0 |
| F73 | 2026-08-28T14:35:07.000Z | 1 | 1 | 0 | 1 | 1 | 0 |


## 5. Filing backlog, folder sizes and overlap

Of **4,809 saved observations**, **4,039** match at least one retained folder, leaving **770 without a matched placement**. There are 4,177 placements and 4,046 unique canonical placement posts. Subtracting all unique placement posts from saves is wrong when placements are unmatched. Ambiguous joins, if present, also cannot prove filing.

Age is elapsed time since saving, measured at the end of the supplied UTC export date (2026-08-31T00:00:00.000Z exclusive). It is not time since filing or proof of being unsorted/abandoned. Unfiled age median **355.38 days**, p90 **575.52**, maximum **2812.53**; dated denominator 770.

| Save-age days [lower, upper) | Unfiled | Filed |
| --- | --- | --- |
| 0–30 | 2 | 661 |
| 30–90 | 5 | 1311 |
| 90–180 | 12 | 1372 |
| 180–365 | 389 | 693 |
| 365–730 | 301 | 0 |
| 730–unbounded | 61 | 2 |


| Save year UTC | All saves | No matched placement | Share |
| --- | --- | --- | --- |
| 2017 | 0 | 0 | not available |
| 2018 | 1 | 1 | 100.00% |
| 2019 | 0 | 0 | not available |
| 2020 | 2 | 2 | 100.00% |
| 2021 | 2 | 2 | 100.00% |
| 2022 | 1 | 1 | 100.00% |
| 2023 | 11 | 11 | 100.00% |
| 2024 | 59 | 57 | 96.61% |
| 2025 | 686 | 624 | 90.96% |
| 2026 | 4047 | 72 | 1.78% |


Folder-size distribution (unique canonical posts): 73 folders, minimum 1, median 16, p90 103.40, maximum 796. Tiny does not mean abandoned.

| Unique posts in folder | Folders |
| --- | --- |
| 1 | 10 |
| 2 | 5 |
| 3 | 4 |
| 4 | 3 |
| 5 | 2 |
| 6 | 2 |
| 7 | 4 |
| 8 | 1 |
| 10 | 2 |
| 14 | 2 |
| 15 | 1 |
| 16 | 2 |
| 17 | 2 |
| 20 | 2 |
| 21 | 1 |
| 22 | 1 |
| 25 | 1 |
| 27 | 1 |
| 31 | 1 |
| 32 | 1 |
| 35 | 2 |
| 37 | 1 |
| 43 | 1 |
| 47 | 3 |
| 51 | 1 |
| 54 | 1 |
| 60 | 1 |
| 67 | 1 |
| 69 | 1 |
| 75 | 1 |
| 77 | 1 |
| 87 | 1 |
| 92 | 1 |
| 93 | 1 |
| 106 | 1 |
| 130 | 1 |
| 150 | 2 |
| 216 | 1 |
| 517 | 1 |
| 667 | 1 |
| 796 | 1 |


127 canonical posts occur in multiple folders. Top 15 folder pairs by distinct shared canonical posts; a post in three folders contributes to three pairs. Includes unmatched posts with valid identities; this measures folder overlap, not matched-save counts. Jaccard is shared / union.

| Folder A | Folder B | Shared posts | Jaccard |
| --- | --- | --- | --- |
| F15 | F37 | 18 | 1.25% |
| F07 | F15 | 9 | 1.03% |
| F15 | F29 | 9 | 0.77% |
| F07 | F09 | 8 | 2.55% |
| F18 | F29 | 7 | 1.06% |
| F15 | F31 | 5 | 0.63% |
| F03 | F31 | 4 | 1.45% |
| F61 | F62 | 4 | 5.71% |
| F29 | F37 | 3 | 0.23% |
| F44 | F56 | 3 | 1.80% |
| F56 | F59 | 3 | 3.30% |
| F05 | F12 | 2 | 2.20% |
| F07 | F31 | 2 | 0.58% |
| F08 | F19 | 2 | 6.67% |
| F15 | F52 | 2 | 0.28% |


## 6. Retroactive filing: what creation dates can bound

75 unique matched saved observations predate at least one folder containing them. Across deduplicated post–folder pairs, 75 of 4,170 dated pairs predate creation; 1 by at least 30 days, 1 by at least 90 days and 0 by at least a year. A post in multiple folders contributes once per folder here.

For a post saved before a folder existed, creation minus save time is a lower bound on the delay before placement in that folder. Actual filing may have happened later. For a post saved after creation, the lower bound is zero and the actual delay remains unknown. No filing-date distribution or historical folder membership can be recovered. Per-folder counts are above; lag quantiles and undated/unmatched coverage are in the structured output.

## 7. Hashtags by year and behaviour

Counts below are observations containing each exact exported hashtag, deduplicated within one observation; no case folding or caption extraction. Denominator is all events in that year/channel. Coverage is observations with at least one exported tag. Missing tags are not evidence of no topic. Raw token totals, full rankings and quarterly detail remain in the structured output.

H-ranks substitute for all literal hashtags here, including tags that might name accounts. They are report-local ranks by whole-snapshot frequency. The personal file contains the actual tags, allowing topic inspection without committing names.

| UTC year | Channel | Events | With tags | Coverage | Top five hashtag presences |
| --- | --- | --- | --- | --- | --- |
| 2017 | saved | 0 | 0 | not available | none recorded |
| 2017 | liked | 4 | 3 | 75.00% | H0939 (2), H0983 (2), H0114 (2), H2866 (2), H1035 (2) |
| 2018 | saved | 1 | 0 | 0.00% | none recorded |
| 2018 | liked | 52 | 17 | 32.69% | H0006 (6), H0012 (4), H0018 (4), H1372 (4), H0769 (3) |
| 2019 | saved | 0 | 0 | not available | none recorded |
| 2019 | liked | 151 | 27 | 17.88% | H0015 (9), H0020 (8), H0012 (7), H0006 (7), H0023 (6) |
| 2020 | saved | 2 | 1 | 50.00% | H2074 (1), H2075 (1), H2082 (1), H1466 (1), H0585 (1) |
| 2020 | liked | 582 | 91 | 15.64% | H0097 (43), H0100 (43), H0105 (41), H0112 (38), H0147 (31) |
| 2021 | saved | 2 | 1 | 50.00% | H1891 (1) |
| 2021 | liked | 1689 | 394 | 23.33% | H0009 (190), H0006 (155), H0016 (144), H0012 (130), H0017 (97) |
| 2022 | saved | 1 | 0 | 0.00% | none recorded |
| 2022 | liked | 404 | 106 | 26.24% | H0009 (22), H0002 (22), H0017 (21), H0024 (16), H0020 (15) |
| 2023 | saved | 11 | 9 | 81.82% | H0002 (2), H0014 (2), H0188 (2), H0182 (1), H3776 (1) |
| 2023 | liked | 349 | 177 | 50.72% | H0011 (20), H0004 (18), H0002 (17), H0007 (16), H0008 (15) |
| 2024 | saved | 59 | 43 | 72.88% | H0036 (7), H0033 (5), H0007 (5), H0336 (5), H0021 (5) |
| 2024 | liked | 762 | 460 | 60.37% | H0003 (102), H0005 (76), H0011 (57), H0007 (46), H0010 (42) |
| 2025 | saved | 686 | 399 | 58.16% | H0019 (81), H0028 (61), H0005 (56), H0070 (38), H0003 (38) |
| 2025 | liked | 1192 | 687 | 57.63% | H0003 (124), H0005 (104), H0004 (61), H0001 (60), H0008 (43) |
| 2026 | saved | 4047 | 2293 | 56.66% | H0001 (198), H0013 (123), H0007 (115), H0004 (102), H0010 (101) |
| 2026 | liked | 60 | 30 | 50.00% | H0153 (5), H0035 (4), H0011 (4), H2084 (1), H2117 (1) |


## 8. Time of day and day of week in Brisbane

Stored UTC timestamps are converted by adding exactly ten hours. Monday is weekday index 0; all 24 hourly bins and all seven weekday bins are provided below. The 09:00–15:00 weekday bin is a descriptive clock interval, not a claim about the user’s actual school timetable, holidays or attendance. Shares use all recorded events in the row, not all hours spent online.

| Local year | Channel | Events | Mon/Tue/Wed/Thu/Fri/Sat/Sun | Weekday 09–15 share | Hours 00 through 23 |
| --- | --- | --- | --- | --- | --- |
| 2017 | combined | 4 | 0/0/1/0/0/0/3 | 25.00% | 0/0/0/0/0/0/0/0/0/0/3/0/0/0/0/0/0/1/0/0/0/0/0/0 |
| 2017 | saved | 0 | 0/0/0/0/0/0/0 | not available | 0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0 |
| 2017 | liked | 4 | 0/0/1/0/0/0/3 | 25.00% | 0/0/0/0/0/0/0/0/0/0/3/0/0/0/0/0/0/1/0/0/0/0/0/0 |
| 2018 | combined | 53 | 1/6/8/11/1/15/11 | 1.89% | 2/0/0/0/0/1/0/1/2/1/0/2/0/2/3/2/2/3/5/7/0/6/9/5 |
| 2018 | saved | 1 | 0/1/0/0/0/0/0 | 0.00% | 0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/1/0/0 |
| 2018 | liked | 52 | 1/5/8/11/1/15/11 | 1.92% | 2/0/0/0/0/1/0/1/2/1/0/2/0/2/3/2/2/3/5/7/0/5/9/5 |
| 2019 | combined | 151 | 25/28/18/23/20/16/21 | 16.56% | 2/1/1/1/0/0/0/2/4/5/3/5/10/6/10/14/6/18/8/12/4/18/13/8 |
| 2019 | saved | 0 | 0/0/0/0/0/0/0 | not available | 0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0 |
| 2019 | liked | 151 | 25/28/18/23/20/16/21 | 16.56% | 2/1/1/1/0/0/0/2/4/5/3/5/10/6/10/14/6/18/8/12/4/18/13/8 |
| 2020 | combined | 584 | 82/78/85/85/81/77/96 | 22.95% | 27/7/4/3/3/0/1/2/32/38/35/43/27/23/33/33/17/26/36/37/28/44/58/27 |
| 2020 | saved | 2 | 1/0/0/1/0/0/0 | 50.00% | 0/0/0/0/0/0/0/0/0/0/0/0/1/0/0/0/0/0/0/0/1/0/0/0 |
| 2020 | liked | 582 | 81/78/85/84/81/77/96 | 22.85% | 27/7/4/3/3/0/1/2/32/38/35/43/26/23/33/33/17/26/36/37/27/44/58/27 |
| 2021 | combined | 1690 | 193/219/271/207/212/250/338 | 20.36% | 71/27/7/8/1/1/0/23/47/65/96/114/107/139/114/128/66/120/73/86/69/107/70/151 |
| 2021 | saved | 2 | 0/0/1/1/0/0/0 | 50.00% | 0/0/0/0/0/0/0/0/0/0/0/0/0/1/0/0/0/0/0/0/0/0/0/1 |
| 2021 | liked | 1688 | 193/219/270/206/212/250/338 | 20.32% | 71/27/7/8/1/1/0/23/47/65/96/114/107/138/114/128/66/120/73/86/69/107/70/150 |
| 2022 | combined | 405 | 55/34/63/56/70/71/56 | 23.95% | 18/11/2/3/0/1/0/1/8/7/22/38/32/25/34/26/9/26/16/23/22/37/15/29 |
| 2022 | saved | 1 | 0/0/1/0/0/0/0 | 0.00% | 0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/1/0/0/0/0/0/0/0/0 |
| 2022 | liked | 404 | 55/34/62/56/70/71/56 | 24.01% | 18/11/2/3/0/1/0/1/8/7/22/38/32/25/34/25/9/26/16/23/22/37/15/29 |
| 2023 | combined | 361 | 59/61/52/47/38/38/66 | 33.80% | 13/2/0/0/1/0/1/2/4/16/30/39/33/26/24/20/14/16/11/24/23/30/22/10 |
| 2023 | saved | 11 | 2/2/2/1/1/0/3 | 27.27% | 0/0/0/0/0/0/0/0/0/0/1/1/1/0/3/0/0/0/0/3/2/0/0/0 |
| 2023 | liked | 350 | 57/59/50/46/37/38/63 | 34.00% | 13/2/0/0/1/0/1/2/4/16/29/38/32/26/21/20/14/16/11/21/21/30/22/10 |
| 2024 | combined | 820 | 142/110/132/87/102/123/124 | 22.56% | 40/28/9/4/0/3/4/23/38/43/48/47/34/22/54/57/48/31/33/31/64/68/59/32 |
| 2024 | saved | 59 | 16/9/10/5/8/4/7 | 25.42% | 4/5/2/0/0/1/0/1/2/4/4/5/2/0/0/2/3/2/1/5/7/4/3/2 |
| 2024 | liked | 761 | 126/101/122/82/94/119/117 | 22.34% | 36/23/7/4/0/2/4/22/36/39/44/42/32/22/54/55/45/29/32/26/57/64/56/30 |
| 2025 | combined | 1879 | 193/247/252/309/252/301/325 | 22.78% | 88/43/31/15/5/4/11/29/68/103/99/118/99/102/102/95/164/98/93/101/107/93/109/102 |
| 2025 | saved | 686 | 82/90/101/92/95/103/123 | 20.12% | 37/22/16/10/2/4/10/20/32/37/24/35/38/34/51/29/60/27/31/41/37/21/33/35 |
| 2025 | liked | 1193 | 111/157/151/217/157/198/202 | 24.31% | 51/21/15/5/3/0/1/9/36/66/75/83/61/68/51/66/104/71/62/60/70/72/76/67 |
| 2026 | combined | 4107 | 708/530/587/546/397/742/597 | 24.30% | 89/41/48/13/19/42/65/184/334/330/320/290/228/199/174/203/236/231/284/215/168/108/140/146 |
| 2026 | saved | 4047 | 703/515/576/535/391/737/590 | 24.29% | 89/40/48/13/19/42/65/179/331/330/313/288/222/196/173/203/230/224/282/211/163/105/138/143 |
| 2026 | liked | 60 | 5/15/11/11/6/5/7 | 25.00% | 0/1/0/0/0/0/0/5/3/0/7/2/6/3/1/0/6/7/2/4/5/3/2/3 |


| Segment | Channel | Events | Mon/Tue/Wed/Thu/Fri/Sat/Sun | Weekday 09–15 share | Hours 00 through 23 |
| --- | --- | --- | --- | --- | --- |
| before supplied month | combined | 2050 | 266/275/301/268/243/297/400 | 18.39% | 96/28/10/7/4/2/1/26/82/96/114/118/90/123/142/149/69/120/98/128/92/156/142/157 |
| before supplied month | saved | 5 | 1/1/1/2/0/0/0 | 40.00% | 0/0/0/0/0/0/0/0/0/0/0/0/1/1/0/0/0/0/0/0/1/1/0/1 |
| before supplied month | liked | 2045 | 265/274/300/266/243/297/400 | 18.34% | 96/28/10/7/4/2/1/26/82/96/114/118/89/122/142/149/69/120/98/128/91/155/142/156 |
| supplied month | combined | 253 | 19/49/48/25/24/43/45 | 27.27% | 2/1/0/5/0/0/0/1/1/7/16/29/31/32/14/17/18/32/14/6/6/7/3/11 |
| supplied month | saved | 0 | 0/0/0/0/0/0/0 | not available | 0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0 |
| supplied month | liked | 253 | 19/49/48/25/24/43/45 | 27.27% | 2/1/0/5/0/0/0/1/1/7/16/29/31/32/14/17/18/32/14/6/6/7/3/11 |
| after supplied month | combined | 7751 | 1173/989/1120/1078/906/1293/1192 | 24.37% | 252/131/92/35/25/50/81/240/454/505/526/549/449/389/392/412/475/418/447/402/387/348/350/342 |
| after supplied month | saved | 4804 | 803/616/690/633/495/844/723 | 23.71% | 130/67/66/23/21/47/75/200/365/371/342/329/263/230/227/235/293/253/314/260/209/130/174/180 |
| after supplied month | liked | 2947 | 370/373/430/445/411/449/469 | 25.45% | 122/64/26/12/4/3/6/40/89/134/184/220/186/159/165/177/182/165/133/142/178/218/176/162 |
| 12 months before supplied month | combined | 1418 | 179/180/213/178/165/212/291 | 17.77% | 74/21/5/3/1/1/0/21/53/64/85/78/58/99/107/110/47/80/58/82/68/100/79/124 |
| 12 months before supplied month | saved | 2 | 0/0/1/1/0/0/0 | 50.00% | 0/0/0/0/0/0/0/0/0/0/0/0/0/1/0/0/0/0/0/0/0/0/0/1 |
| 12 months before supplied month | liked | 1416 | 179/180/212/177/165/212/291 | 17.73% | 74/21/5/3/1/1/0/21/53/64/85/78/58/98/107/110/47/80/58/82/68/100/79/123 |
| 12 months after supplied month | combined | 544 | 64/36/90/85/106/88/75 | 25.18% | 22/17/3/3/0/1/0/2/10/12/23/48/50/37/36/37/12/41/23/29/23/47/20/48 |
| 12 months after supplied month | saved | 1 | 0/0/1/0/0/0/0 | 0.00% | 0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/1/0/0/0/0/0/0/0/0 |
| 12 months after supplied month | liked | 543 | 64/36/89/85/106/88/75 | 25.23% | 22/17/3/3/0/1/0/2/10/12/23/48/50/37/36/36/12/41/23/29/23/47/20/48 |
| before earliest retained folder creation | combined | 3065 | 376/398/467/403/409/456/556 | 21.47% | 126/47/14/15/5/3/1/31/96/125/177/216/192/206/204/213/108/202/145/176/140/225/177/221 |
| before earliest retained folder creation | saved | 11 | 1/3/3/2/1/0/1 | 36.36% | 0/0/0/0/0/0/0/0/0/0/1/0/1/1/2/1/0/0/0/2/1/1/0/1 |
| before earliest retained folder creation | liked | 3054 | 375/395/464/401/408/456/555 | 21.41% | 126/47/14/15/5/3/1/31/96/125/176/216/191/205/202/212/108/202/145/174/139/224/177/220 |
| at or after earliest retained folder creation | combined | 6989 | 1082/915/1002/968/764/1177/1081 | 23.99% | 224/113/88/32/24/49/81/236/441/483/479/480/378/338/344/365/454/368/414/360/345/286/318/289 |
| at or after earliest retained folder creation | saved | 4798 | 803/614/688/633/494/844/722 | 23.70% | 130/67/66/23/21/47/75/200/365/371/341/329/263/230/225/234/293/253/314/258/209/130/174/180 |
| at or after earliest retained folder creation | liked | 2191 | 279/301/314/335/270/333/359 | 24.65% | 94/46/22/9/3/2/6/36/76/112/138/151/115/108/119/131/161/115/100/102/136/156/144/109 |
| before final save-majority monthly run | combined | 5622 | 699/753/831/797/728/856/958 | 22.87% | 258/105/48/28/10/6/12/66/196/253/327/387/332/333/357/365/292/325/266/280/288/394/335/359 |
| before final save-majority monthly run | saved | 519 | 61/78/80/78/74/81/67 | 23.89% | 38/15/14/4/2/1/5/7/28/23/24/28/34/27/39/26/37/20/25/18/26/21/23/34 |
| before final save-majority monthly run | liked | 5103 | 638/675/751/719/654/775/891 | 22.77% | 220/90/34/24/8/5/7/59/168/230/303/359/298/306/318/339/255/305/241/262/262/373/312/325 |
| during final save-majority monthly run | combined | 4432 | 759/560/638/574/445/777/679 | 23.67% | 92/55/54/19/19/46/70/201/341/355/329/309/238/211/191/213/270/245/293/256/197/117/160/151 |
| during final save-majority monthly run | saved | 4290 | 743/539/611/557/421/763/656 | 23.71% | 92/52/52/19/19/46/70/193/337/348/318/301/230/204/188/209/256/233/289/242/184/110/151/147 |
| during final save-majority monthly run | liked | 142 | 16/21/27/17/24/14/23 | 22.54% | 0/3/2/0/0/0/0/8/4/7/11/8/8/7/3/4/14/12/4/14/13/7/9/4 |


Time distributions for all low-count segments and their flanks are retained in JSON. School-related differences are observations to compare, not evidence of a cause.

## 9. Once/twice versus repeated account observations

No account is classified as friend, peer or professional creator. The primary count uses the account’s total frequency across this entire combined snapshot: 1–2 versus 3+ observations. The second column uses frequency within the displayed year/channel to expose dependence on this choice. Events without IDs are separate. Later observations affect the whole-snapshot category; neither category establishes a relationship.

| UTC year | Channel | Events | Global 1–2 events/share | Global 3+ events | Within-year/channel 1–2 events | Unknown IDs |
| --- | --- | --- | --- | --- | --- | --- |
| 2017 | combined | 4 | 2 / 50.00% | 2 | 4 | 0 |
| 2017 | saved | 0 | 0 / not available | 0 | 0 | 0 |
| 2017 | liked | 4 | 2 / 50.00% | 2 | 4 | 0 |
| 2018 | combined | 53 | 30 / 56.60% | 23 | 36 | 0 |
| 2018 | saved | 1 | 1 / 100.00% | 0 | 1 | 0 |
| 2018 | liked | 52 | 29 / 55.77% | 23 | 35 | 0 |
| 2019 | combined | 151 | 49 / 32.45% | 102 | 65 | 0 |
| 2019 | saved | 0 | 0 / not available | 0 | 0 | 0 |
| 2019 | liked | 151 | 49 / 32.45% | 102 | 65 | 0 |
| 2020 | combined | 584 | 102 / 17.47% | 482 | 126 | 0 |
| 2020 | saved | 2 | 1 / 50.00% | 1 | 2 | 0 |
| 2020 | liked | 582 | 101 / 17.35% | 481 | 125 | 0 |
| 2021 | combined | 1691 | 296 / 17.50% | 1395 | 331 | 0 |
| 2021 | saved | 2 | 1 / 50.00% | 1 | 2 | 0 |
| 2021 | liked | 1689 | 295 / 17.47% | 1394 | 330 | 0 |
| 2022 | combined | 405 | 152 / 37.53% | 253 | 189 | 0 |
| 2022 | saved | 1 | 0 / 0.00% | 1 | 1 | 0 |
| 2022 | liked | 404 | 152 / 37.62% | 252 | 189 | 0 |
| 2023 | combined | 360 | 278 / 77.22% | 82 | 307 | 0 |
| 2023 | saved | 11 | 9 / 81.82% | 2 | 11 | 0 |
| 2023 | liked | 349 | 269 / 77.08% | 80 | 296 | 0 |
| 2024 | combined | 821 | 471 / 57.37% | 350 | 537 | 0 |
| 2024 | saved | 59 | 44 / 74.58% | 15 | 59 | 0 |
| 2024 | liked | 762 | 427 / 56.04% | 335 | 492 | 0 |
| 2025 | combined | 1878 | 1192 / 63.47% | 686 | 1358 | 0 |
| 2025 | saved | 686 | 390 / 56.85% | 296 | 508 | 0 |
| 2025 | liked | 1192 | 802 / 67.28% | 390 | 920 | 0 |
| 2026 | combined | 4107 | 2790 / 67.93% | 1317 | 2907 | 0 |
| 2026 | saved | 4047 | 2756 / 68.10% | 1291 | 2869 | 0 |
| 2026 | liked | 60 | 34 / 56.67% | 26 | 54 | 0 |


Recurring accounts below means observed in at least two distinct UTC weeks, not necessarily an actual return after absence. First/last are first/last retained observations. All consecutive observed-week gaps are in the structured file; they never establish unfollowing, deletion or loss of interest.

| Account rank | Events | Active weeks | First observed UTC | Last observed UTC |
| --- | --- | --- | --- | --- |
| R1 | 145 | 71 | 2019-04-19T05:05:45.000Z | 2023-01-04T04:15:29.000Z |
| R2 | 165 | 70 | 2018-12-30T08:50:41.000Z | 2022-03-24T06:50:18.000Z |
| R3 | 157 | 51 | 2020-08-17T12:22:33.000Z | 2022-12-29T11:48:30.000Z |
| R4 | 49 | 47 | 2019-06-27T11:18:55.000Z | 2026-07-08T06:08:25.000Z |
| R5 | 104 | 45 | 2019-12-25T06:24:42.000Z | 2022-12-21T02:03:06.000Z |
| R6 | 91 | 44 | 2020-05-31T10:17:28.000Z | 2023-01-30T22:34:25.000Z |
| R7 | 92 | 43 | 2023-09-10T05:45:32.000Z | 2025-10-04T23:37:41.000Z |
| R8 | 61 | 42 | 2020-06-21T23:06:36.000Z | 2022-08-07T09:26:05.000Z |
| R9 | 96 | 41 | 2021-04-10T01:25:49.000Z | 2022-04-24T14:06:54.000Z |
| R10 | 75 | 39 | 2021-02-16T14:30:23.000Z | 2022-12-07T01:07:04.000Z |
| R11 | 52 | 36 | 2020-05-18T11:07:57.000Z | 2021-12-12T08:13:44.000Z |
| R12 | 43 | 32 | 2020-01-15T06:53:17.000Z | 2022-03-10T12:50:23.000Z |
| R13 | 101 | 31 | 2021-05-09T02:31:07.000Z | 2022-01-30T01:33:10.000Z |
| R14 | 42 | 29 | 2019-11-12T07:46:10.000Z | 2023-04-22T09:10:05.000Z |
| R15 | 37 | 27 | 2023-07-04T03:13:49.000Z | 2025-11-23T08:53:37.000Z |


Cross-export account absence is **not evaluated by this one-snapshot report**. A second retained, independently dated export is required. Two imports of the same observation bytes are not longitudinal evidence. “Absent from another export” would not mean an account vanished from Instagram.

## 10. Recorded URL formats over time

These are /reel/, /p/ and /tv/ URL shapes retained in post extras. /p/ is not proof of a photo: it may include a carousel or video. Therefore the snapshot cannot supply a reliable photo-versus-video split, and format counts cannot date when the platform itself changed.

| UTC year | Channel | /reel/ | /p/ | /tv/ | Unknown | Denominator |
| --- | --- | --- | --- | --- | --- | --- |
| 2017 | saved | 0 | 0 | 0 | 0 | 0 |
| 2017 | liked | 0 | 4 | 0 | 0 | 4 |
| 2018 | saved | 0 | 1 | 0 | 0 | 1 |
| 2018 | liked | 0 | 52 | 0 | 0 | 52 |
| 2019 | saved | 0 | 0 | 0 | 0 | 0 |
| 2019 | liked | 0 | 151 | 0 | 0 | 151 |
| 2020 | saved | 0 | 2 | 0 | 0 | 2 |
| 2020 | liked | 19 | 562 | 1 | 0 | 582 |
| 2021 | saved | 0 | 2 | 0 | 0 | 2 |
| 2021 | liked | 321 | 1279 | 89 | 0 | 1689 |
| 2022 | saved | 1 | 0 | 0 | 0 | 1 |
| 2022 | liked | 246 | 120 | 38 | 0 | 404 |
| 2023 | saved | 8 | 3 | 0 | 0 | 11 |
| 2023 | liked | 257 | 92 | 0 | 0 | 349 |
| 2024 | saved | 56 | 3 | 0 | 0 | 59 |
| 2024 | liked | 573 | 189 | 0 | 0 | 762 |
| 2025 | saved | 677 | 9 | 0 | 0 | 686 |
| 2025 | liked | 998 | 194 | 0 | 0 | 1192 |
| 2026 | saved | 3968 | 79 | 0 | 0 | 4047 |
| 2026 | liked | 41 | 19 | 0 | 0 | 60 |


| Channel | /tv/ observations | First recorded /tv/ | Last recorded /tv/ |
| --- | --- | --- | --- |
| combined | 128 | 2020-11-25T00:13:47.000Z | 2022-10-08T07:59:11.000Z |
| saved | 0 | none | none |
| liked | 128 | 2020-11-25T00:13:47.000Z | 2022-10-08T07:59:11.000Z |


The last recorded /tv/ action dates only this export’s evidence, not discontinuation of IGTV or the date content was posted.

## 11. Sessions: timestamp groupings, not decisions

Primary grouping splits when the gap from the immediately preceding observation is **greater than 30 minutes**. This is a declared operational convention for separating bursts, not an inferred behavioural boundary or a validated attention measure. Equality remains in one group; chaining can create a long session. Fifteen and sixty minutes show sensitivity. A group does not prove one sitting or one decision, and its first-to-last span is not time spent viewing.

| Channel | Gap minutes | Sessions | One-event sessions | Mean events | Median | p90 | Max |
| --- | --- | --- | --- | --- | --- | --- | --- |
| combined | 15 | 4795 | 2881 | 2.10 | 1 | 4 | 41 |
| combined | 30 | 4378 | 2501 | 2.30 | 1 | 5 | 85 |
| combined | 60 | 3923 | 2094 | 2.56 | 1 | 5 | 87 |
| saved | 15 | 1585 | 689 | 3.03 | 2 | 7 | 41 |
| saved | 30 | 1389 | 542 | 3.46 | 2 | 8 | 85 |
| saved | 60 | 1207 | 439 | 3.98 | 2 | 9 | 87 |
| liked | 15 | 3492 | 2525 | 1.50 | 1 | 3 | 13 |
| liked | 30 | 3273 | 2276 | 1.60 | 1 | 3 | 15 |
| liked | 60 | 3003 | 1963 | 1.75 | 1 | 3 | 22 |


Sessions are built on the full chronological stream before reporting periods. Session counts and all their events are assigned to the local month/year of the session’s first event; cross-boundary sessions can therefore differ from event-month totals. Combined sessions can contain both actions; separate-channel sessions can span events on the other channel and are not additive.

| Local year of session start | Channel | 30-minute sessions | Events in those sessions | Mean size | Median | p90 | Max |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2017 | combined | 3 | 4 | 1.33 | 1 | 1.80 | 2 |
| 2018 | combined | 41 | 53 | 1.29 | 1 | 2 | 5 |
| 2019 | combined | 135 | 151 | 1.12 | 1 | 1 | 3 |
| 2020 | combined | 478 | 584 | 1.22 | 1 | 2 | 5 |
| 2021 | combined | 913 | 1690 | 1.85 | 1 | 4 | 15 |
| 2022 | combined | 255 | 405 | 1.59 | 1 | 3 | 9 |
| 2023 | combined | 245 | 361 | 1.47 | 1 | 3 | 7 |
| 2024 | combined | 421 | 820 | 1.95 | 1 | 4 | 11 |
| 2025 | combined | 901 | 1879 | 2.09 | 1 | 4 | 19 |
| 2026 | combined | 986 | 4107 | 4.17 | 3 | 9 | 85 |
| 2017 | saved | 0 | 0 | not available | not available | not available | not available |
| 2018 | saved | 1 | 1 | 1 | 1 | 1 | 1 |
| 2019 | saved | 0 | 0 | not available | not available | not available | not available |
| 2020 | saved | 2 | 2 | 1 | 1 | 1 | 1 |
| 2021 | saved | 2 | 2 | 1 | 1 | 1 | 1 |
| 2022 | saved | 1 | 1 | 1 | 1 | 1 | 1 |
| 2023 | saved | 10 | 11 | 1.10 | 1 | 1.10 | 2 |
| 2024 | saved | 47 | 59 | 1.26 | 1 | 2 | 3 |
| 2025 | saved | 356 | 686 | 1.93 | 1 | 4 | 15 |
| 2026 | saved | 970 | 4047 | 4.17 | 3 | 9 | 85 |
| 2017 | liked | 3 | 4 | 1.33 | 1 | 1.80 | 2 |
| 2018 | liked | 41 | 52 | 1.27 | 1 | 2 | 5 |
| 2019 | liked | 135 | 151 | 1.12 | 1 | 1 | 3 |
| 2020 | liked | 478 | 582 | 1.22 | 1 | 2 | 5 |
| 2021 | liked | 913 | 1688 | 1.85 | 1 | 4 | 15 |
| 2022 | liked | 255 | 404 | 1.58 | 1 | 3 | 9 |
| 2023 | liked | 242 | 350 | 1.45 | 1 | 3 | 7 |
| 2024 | liked | 414 | 761 | 1.84 | 1 | 4 | 11 |
| 2025 | liked | 735 | 1193 | 1.62 | 1 | 3 | 12 |
| 2026 | liked | 57 | 60 | 1.05 | 1 | 1 | 2 |


## 12. Calendar quarters and monthly session counts

| UTC quarter | Saved | Liked | Save share | Coverage |
| --- | --- | --- | --- | --- |
| 2017-Q4 | 0 | 4 | 0.00% | first observed period |
| 2018-Q1 | 0 | 11 | 0.00% | calendar period; retention unknown |
| 2018-Q2 | 0 | 10 | 0.00% | calendar period; retention unknown |
| 2018-Q3 | 0 | 2 | 0.00% | calendar period; retention unknown |
| 2018-Q4 | 1 | 29 | 3.33% | calendar period; retention unknown |
| 2019-Q1 | 0 | 11 | 0.00% | calendar period; retention unknown |
| 2019-Q2 | 0 | 33 | 0.00% | calendar period; retention unknown |
| 2019-Q3 | 0 | 18 | 0.00% | calendar period; retention unknown |
| 2019-Q4 | 0 | 89 | 0.00% | calendar period; retention unknown |
| 2020-Q1 | 1 | 161 | 0.62% | calendar period; retention unknown |
| 2020-Q2 | 0 | 79 | 0.00% | calendar period; retention unknown |
| 2020-Q3 | 1 | 133 | 0.75% | calendar period; retention unknown |
| 2020-Q4 | 0 | 209 | 0.00% | calendar period; retention unknown |
| 2021-Q1 | 0 | 178 | 0.00% | calendar period; retention unknown |
| 2021-Q2 | 0 | 480 | 0.00% | calendar period; retention unknown |
| 2021-Q3 | 2 | 422 | 0.47% | calendar period; retention unknown |
| 2021-Q4 | 0 | 609 | 0.00% | calendar period; retention unknown |
| 2022-Q1 | 1 | 274 | 0.36% | calendar period; retention unknown |
| 2022-Q2 | 0 | 27 | 0.00% | calendar period; retention unknown |
| 2022-Q3 | 0 | 26 | 0.00% | calendar period; retention unknown |
| 2022-Q4 | 0 | 77 | 0.00% | calendar period; retention unknown |
| 2023-Q1 | 2 | 30 | 6.25% | calendar period; retention unknown |
| 2023-Q2 | 3 | 120 | 2.44% | calendar period; retention unknown |
| 2023-Q3 | 3 | 95 | 3.06% | calendar period; retention unknown |
| 2023-Q4 | 3 | 104 | 2.80% | calendar period; retention unknown |
| 2024-Q1 | 6 | 73 | 7.59% | calendar period; retention unknown |
| 2024-Q2 | 31 | 219 | 12.40% | calendar period; retention unknown |
| 2024-Q3 | 13 | 109 | 10.66% | calendar period; retention unknown |
| 2024-Q4 | 9 | 361 | 2.43% | calendar period; retention unknown |
| 2025-Q1 | 90 | 273 | 24.79% | calendar period; retention unknown |
| 2025-Q2 | 141 | 325 | 30.26% | calendar period; retention unknown |
| 2025-Q3 | 112 | 305 | 26.86% | calendar period; retention unknown |
| 2025-Q4 | 343 | 289 | 54.27% | calendar period; retention unknown |
| 2026-Q1 | 924 | 34 | 96.45% | calendar period; retention unknown |
| 2026-Q2 | 1954 | 21 | 98.94% | calendar period; retention unknown |
| 2026-Q3 | 1169 | 5 | 99.57% | partial |


| Month | UTC saved events | UTC liked events | Combined sessions 15/30/60 min, local start month |
| --- | --- | --- | --- |
| 2017-12 | 0 | 4 | 3/3/3 |
| 2018-01 | 0 | 1 | 1/1/1 |
| 2018-02 | 0 | 5 | 5/5/5 |
| 2018-03 | 0 | 5 | 4/4/4 |
| 2018-04 | 0 | 1 | 2/2/2 |
| 2018-05 | 0 | 8 | 5/4/4 |
| 2018-06 | 0 | 1 | 1/1/1 |
| 2018-07 | 0 | 0 | 0/0/0 |
| 2018-08 | 0 | 0 | 0/0/0 |
| 2018-09 | 0 | 2 | 2/2/2 |
| 2018-10 | 0 | 5 | 2/2/2 |
| 2018-11 | 0 | 9 | 8/7/7 |
| 2018-12 | 1 | 15 | 13/13/13 |
| 2019-01 | 0 | 4 | 4/4/4 |
| 2019-02 | 0 | 2 | 2/2/2 |
| 2019-03 | 0 | 5 | 5/5/5 |
| 2019-04 | 0 | 14 | 12/11/11 |
| 2019-05 | 0 | 10 | 10/10/9 |
| 2019-06 | 0 | 9 | 8/8/8 |
| 2019-07 | 0 | 4 | 4/4/4 |
| 2019-08 | 0 | 5 | 5/5/5 |
| 2019-09 | 0 | 9 | 7/7/7 |
| 2019-10 | 0 | 28 | 25/25/24 |
| 2019-11 | 0 | 34 | 30/29/28 |
| 2019-12 | 0 | 27 | 26/25/25 |
| 2020-01 | 0 | 37 | 29/29/28 |
| 2020-02 | 1 | 82 | 64/61/57 |
| 2020-03 | 0 | 42 | 36/34/30 |
| 2020-04 | 0 | 18 | 15/15/15 |
| 2020-05 | 0 | 25 | 20/20/20 |
| 2020-06 | 0 | 36 | 32/32/31 |
| 2020-07 | 0 | 39 | 36/36/35 |
| 2020-08 | 0 | 39 | 35/34/33 |
| 2020-09 | 1 | 55 | 47/46/44 |
| 2020-10 | 0 | 49 | 45/44/42 |
| 2020-11 | 0 | 82 | 65/63/59 |
| 2020-12 | 0 | 78 | 65/64/61 |
| 2021-01 | 0 | 53 | 43/39/37 |
| 2021-02 | 0 | 38 | 36/36/35 |
| 2021-03 | 0 | 87 | 72/69/64 |
| 2021-04 | 0 | 173 | 107/98/87 |
| 2021-05 | 0 | 160 | 96/84/72 |
| 2021-06 | 0 | 147 | 88/85/75 |
| 2021-07 | 0 | 128 | 81/73/58 |
| 2021-08 | 0 | 98 | 65/64/57 |
| 2021-09 | 2 | 196 | 94/85/74 |
| 2021-10 | 0 | 176 | 96/89/78 |
| 2021-11 | 0 | 258 | 112/96/73 |
| 2021-12 | 0 | 175 | 107/95/84 |
| 2022-01 | 1 | 135 | 73/70/62 |
| 2022-02 | 0 | 66 | 39/37/35 |
| 2022-03 | 0 | 73 | 43/42/39 |
| 2022-04 | 0 | 20 | 18/18/18 |
| 2022-05 | 0 | 3 | 2/2/2 |
| 2022-06 | 0 | 4 | 4/4/4 |
| 2022-07 | 0 | 9 | 8/8/8 |
| 2022-08 | 0 | 9 | 7/7/7 |
| 2022-09 | 0 | 8 | 8/7/7 |
| 2022-10 | 0 | 5 | 5/5/5 |
| 2022-11 | 0 | 31 | 21/21/20 |
| 2022-12 | 0 | 41 | 35/34/32 |
| 2023-01 | 0 | 16 | 16/16/15 |
| 2023-02 | 2 | 4 | 2/2/2 |
| 2023-03 | 0 | 10 | 7/7/7 |
| 2023-04 | 1 | 17 | 15/14/13 |
| 2023-05 | 1 | 40 | 24/24/23 |
| 2023-06 | 1 | 63 | 45/44/40 |
| 2023-07 | 0 | 16 | 13/12/12 |
| 2023-08 | 0 | 38 | 24/24/24 |
| 2023-09 | 3 | 41 | 31/31/26 |
| 2023-10 | 2 | 44 | 33/31/29 |
| 2023-11 | 1 | 45 | 33/32/30 |
| 2023-12 | 0 | 15 | 8/8/8 |
| 2024-01 | 2 | 26 | 11/11/11 |
| 2024-02 | 1 | 15 | 8/8/8 |
| 2024-03 | 3 | 32 | 21/18/17 |
| 2024-04 | 13 | 69 | 37/35/34 |
| 2024-05 | 15 | 114 | 60/51/49 |
| 2024-06 | 3 | 36 | 25/23/21 |
| 2024-07 | 6 | 31 | 28/28/28 |
| 2024-08 | 3 | 28 | 25/24/23 |
| 2024-09 | 4 | 50 | 37/33/32 |
| 2024-10 | 4 | 119 | 65/59/55 |
| 2024-11 | 5 | 160 | 88/77/69 |
| 2024-12 | 0 | 82 | 58/54/51 |
| 2025-01 | 3 | 98 | 71/66/60 |
| 2025-02 | 27 | 106 | 72/60/53 |
| 2025-03 | 60 | 69 | 74/70/63 |
| 2025-04 | 60 | 128 | 93/83/69 |
| 2025-05 | 45 | 133 | 105/97/89 |
| 2025-06 | 36 | 64 | 58/55/53 |
| 2025-07 | 33 | 138 | 99/81/71 |
| 2025-08 | 25 | 99 | 80/77/70 |
| 2025-09 | 54 | 68 | 76/68/62 |
| 2025-10 | 49 | 77 | 69/64/61 |
| 2025-11 | 51 | 130 | 93/78/67 |
| 2025-12 | 243 | 82 | 110/102/89 |
| 2026-01 | 265 | 14 | 82/68/60 |
| 2026-02 | 386 | 13 | 106/94/80 |
| 2026-03 | 273 | 7 | 99/88/82 |
| 2026-04 | 456 | 8 | 133/117/105 |
| 2026-05 | 662 | 5 | 149/125/101 |
| 2026-06 | 836 | 8 | 200/170/144 |
| 2026-07 | 506 | 3 | 183/153/119 |
| 2026-08 | 663 | 2 | 196/171/134 |


All monthly per-channel session counts and size distributions, for all three gap settings, are included in the structured file. Zero-count calendar periods remain present; periods after the export are not populated with zeros.

## 13. Other recorded structure and hard limits

95 canonical posts have both a saved and a liked observation. For these posts, 56 saves follow the like, 38 precede it and 1 have equal timestamps. Save-minus-like lag median 0.00 days; denominator 95. These are two recorded actions, not two views or duplicate imports.

1 exact UTC timestamps contain multiple observations; maximum multiplicity 2. Ties are kept, not assigned invented timing or causal order.

This snapshot cannot establish TikTok/YouTube activity, viewing time, attention, motives, actual friendships, why an account is absent, historical folder membership, actual filing dates, original post publication dates, complete photo/video media types, or the beginning/end of an interest. It cannot distinguish no activity from export omission, changed retention, unsaving or other missing observations. It cannot establish that twenty actions were one decision. Folder creation dates are precise for the retained folder objects only. These limits do not become solvable by naming calendar intervals “eras.”

The changepoint ERAS proposal is now superseded by lifecycle/burst design. This report neither passes nor fails that unrun experiment; no changepoint scores, clustering or inferred phase labels were produced.

## Reproduction and validation

Run from the repository root against a retained snapshot, choosing a new output directory:

```powershell
npm run explore:instagram -- --snapshot ../hindsight-data/step-4/instagram-2026-08-30-validated --output ../hindsight-data/exploration-new-run --known-month 2021-11 --source-root ../hindsight-data/Instagram
```

`--known-month` is optional, user-supplied context rather than a hardcoded school date. `--source-root` protects a selected original export directory against output placement; it is not read for analysis. The snapshot and repository are always protected by the command wrapper. Outputs must use a new directory, so existing results are not replaced. Snapshot checksums and side-table references are validated before analysis. A write failure reports an incomplete directory instead of success; snapshot files are never modified. This is still a bounded Instagram implementation, not the future streaming subsystem.

Reusable implementation: `packages/core/src/exploration.ts` (pure analysis), `exploration-report.ts` (explicit aggregate projection and escaped rendering), `exploration-command.ts` (validated retained-snapshot reading and output), and `scripts/explore-instagram.ts`. No runtime dependency was added. Statistical summaries use linear interpolation between sorted observations for quantiles; a null denominator is displayed as not available, never zero.

Local artifacts from this run are in `../hindsight-data/exploration-2026-08-30-reviewed/` relative to the repository root:

- `exploration-personal.md` and `exploration-personal.json`: named folder/account/tag detail, with the personal-data warning.
- `exploration-aggregate.md` and `exploration-aggregate.json`: source labels replaced by report-local ranks; not anonymity guarantees.
- `provenance.json`: snapshot identifier, source observation checksum, export date, parse/quarantine status and supplied month.

This document adds the measured-findings introduction to the generated aggregate report. Named source text, captions, IDs and URLs were not copied into the document. The personal output remains outside the repository; no files were uploaded or pushed.

Validation: **typecheck PASS; 88/88 offline tests PASS**. Nine exploration tests cover local calendar conversion, uncertain-month cuts, sessions and period crossings, whole-week and exact gaps, backlog/overlap/lag denominators, hashtag and frequency coverage, disclosure/markup protection, empty periods and command integrity. Existing 79 tests remain passing. A separate Python read of retained observations and side tables agreed with **1,602 independent comparisons** of calendar totals, hashtag/format coverage, Brisbane times, sessions, backlog and retrospective counts. Neither check re-parsed the export.

Observation SHA-256: `8080892ba165712539863565e13adf523c7f0f4a649fc2fbd090f862f203cb31`. The snapshot was verified again after analysis. ERAS preregistration is preserved in `docs/eras-experiment.md`; exploratory results are not a confirmatory ERAS run, and any later experiment must acknowledge this exploration rather than claim these data were unseen.
