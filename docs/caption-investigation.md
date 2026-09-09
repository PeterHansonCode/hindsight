# Caption investigation — 2026-09-10

Read-only inspection of the local August 30 export, including all 31 differing pairs after encoding repair. No post URLs were fetched; no real captions, creator names or post identifiers are copied here.

| Measure | Saved | Liked |
|---|---:|---:|
| Repeated-caption rows | 298 | 89 |
| Identical repeated values | 274 | 82 |
| Differing values | 24 | 7 |
| Duplicate rows by path type | 295 reel, 3 p | 71 reel, 18 p |
| Differing rows by path type | 24 reel | 6 reel, 1 p |
| Distinct creators among differing rows | 24 | 7 |
| First value longer | 18 | 5 |
| Second value longer | 6 | 2 |
| Second is exact prefix of first | 4 | 1 |
| Second is exact suffix of first | 0 | 1 |
| Activity date range UTC | 2025-03-21 to 2026-08-13 | 2021-04-30 to 2025-12-05 |

The 31 rows represent 30 distinct posts and 30 distinct creators. One post occurs in both saved and liked with the same ordered pair. There are 22 matching collection placements, all preserving the same ordered arrays; nine differing activity rows have no matching collection placement. Repetition exists in the export, rather than being caused by a parser joining unrelated rows.

## Structural evidence

All 31 differing rows have immediate fields URL, Caption, Title, Caption, Title, Hashtags, Owner, Brand partner. Both Title values are empty. All 62 Caption objects have only label and value, with no image ID, language, revision number or edit timestamp. All 31 media arrays are empty.

Thirty of 31 differing rows are reels. Overall, saved has 4,710 reels and 99 p paths; liked has 2,455 reels, 2,662 p paths and 128 tv paths. There is no per-image nesting or image identifier linking these captions, and a p path alone cannot prove a carousel. A reel can also contain multiple still images. We cannot identify actual carousel contents from this export; there is no evidence justifying a per-image entity in the data model.

## What the text differences suggest

Manual inspection found typo/punctuation corrections, changed promotional calls to action, added/removed credits and hashtags, inventory changes, and wording revisions. One pair changes prerelease wording to released wording; another changes a waitlist call to an available guide. Some pairs are substantial rewrites: one changes a short promotion's call to action, another changes a game-update announcement into a question.

Five second values are exact prefixes of the first, one is an exact suffix, and 25 are neither. Complete promotional/credit blocks also disappear from the middle of text. First is longer in 23 pairs; second in eight. This is not a consistent truncation rule. No clear translation pair was observed: one pair remains Portuguese, the others remain English.

The most plausible explanation is duplicated export representations retaining different caption revisions. This is an inference, not a verified Meta schema guarantee. The files cannot establish the backend cause, edit dates, or which version is newest. Do not label the arrays edit history or per-image captions.

## Clustering

Differing saved rows span ten activity months: 2025-03 (1), 2025-06 (1), 2025-12 (1), 2026-01 (3), 2026-02 (3), 2026-03 (4), 2026-05 (4), 2026-06 (2), 2026-07 (3), 2026-08 (2). Twenty-one of 24 occur in 2026, while 4,047 of all 4,809 saves occur in 2026; much of that recency follows the underlying activity distribution.

Differing liked rows occur once each in 2021-04, 2024-10, 2025-01, 2025-02, 2025-05, 2025-08 and 2025-12. Five of seven are in 2025, compared with 1,192 of all 5,245 likes. That is a small sample, not evidence of an export change date. These timestamps represent saves/likes, not caption edits or publication dates.

Every differing post has a different creator. The broader duplicate groups span 206 saved creators (maximum 11 duplicate rows for one creator) and 76 liked creators (maximum six). A single-creator explanation does not fit the differing variants.

## Selection decision

First is longer in 23/31 pairs; additions such as hashtags and calls to action could weakly suggest a later version, not an earlier one, so export order must not be read as chronology: the justification is stable, deterministic selection, not presumed originality.

Keep the first Caption in source order and mark captionSelection: first_in_export. This preserves the export's presentation order, agrees across matching saved/liked/collection representations, and avoids manufacturing a concatenated caption. It is often fuller (23/31) and sometimes looks revised, but neither fact proves first always means newest or best.

Do not choose by length, inferred recency or content. Preserve all values and their order in captionValues so the display selection remains reversible. Do not call the selected caption latest or original. The ten-field Activity schema stays unchanged; variants remain Instagram-specific enrichment. Future adapters must make source-specific choices rather than inherit a first-means-newest assumption.
