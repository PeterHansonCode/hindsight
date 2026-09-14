# Step 8 — report implementation and validation

The four report sections are implemented. Core offline acceptance is **PASSED, performed by the user on 2026-09-11**. The revised annotation round trip remains pending; no commit is authorised until it passes. This document distinguishes user-performed checks from automated and agent-performed checks.

## Personal artifact and reproduction

Named output stays outside Git: `../hindsight-data/step-8/hindsight.html` (4,326,644 bytes). SHA-256: `34a678bd2be7bf46eb3aa95d82ce077e00b0c0eece88fe6b1f715f1fe626858f`.

Generate a fresh output from the retained snapshot and accepted step-6 analyses:

```powershell
npm run build:report -- --snapshot ../hindsight-data/step-4/instagram-2026-08-30-validated --analysis ../hindsight-data/step-6-final --output ../hindsight-data/step-8/hindsight-review.html --source-root ../hindsight-data/Instagram
```

The output parent must exist; an existing file is never overwritten. The command does not reparse the export or rerun detection. Nine retained input/analysis artifact hashes remained unchanged. Analysis provenance and structural consistency are checked; this is not cryptographic authentication of the analysis files.

## Implemented presentation

- Exact observed coverage appears first: 17 December 2017, 10:36:32 through 31 August 2026, 08:48:58 in Australia/Brisbane. The supplied export date is 30 August 2026, with time unknown. UTC-to-local rollover is explained.
- Annual saved/liked counts and monthly detail open the report. Partial periods are marked. There are 10,054 observations; the 2021 counts are 1,689 likes and two saves, versus 60 likes and 4,047 saves in partial 2026. No motive is inferred.
- Creator lifecycles show discrete observed activity across years, channel selection, search, first/last observations and recurrence detail. Absence is not interpreted as a continuous interest or its end.
- All 46 primary outer intervals appear in 34 folder lanes. Exclusive tiers are **3 exact-stable, 15 overlap-stable, 28 primary-only**. The inclusive overlap count is **18**, never 21. Only exact-stable intervals have solid endpoint outlines. Other intervals use measured gradient edges or stippled, faded shapes; unassessed gaps are split. Agreement is parameter agreement, not validation of personal phase dates.
- All 39 folders without a primary interval have their own descriptive section, with coverage and alternative-setting evidence. They are not labelled steady or failed.
- Annotations support add, edit, JSON save/import and a personal HTML copy. Context and edit context are visible on both timelines and annotation cards; revision history is retained. Imported text is inert. A JSON text backup supports manual copying if a browser blocks downloads.

No charting or runtime dependencies were added. The HTML embeds its assets and data, with a hash-based script policy and `connect-src 'none'`. New findings contain no creator or folder names in this document or committed fixtures.

## Checks actually performed

`npm run typecheck`: PASS. `npm test`: **114/114 PASS**, retaining all previous tests. `git diff --check`: PASS.

Report tests cover complete-grid agreement, split/merged counterparts, per-configuration vote caps, zero-exposure gaps, ten-week endpoint variation, count conservation, omitted caption/URL fields, JSON/script escaping, Windows newline-normalised CSP hashes, saved-HTML serialization, annotation dates/context/revisions/conflict rejection, and protected output paths. The SVG shape test executes the renderer's shape function and checks exact-only outlines, transparent fuzzy endpoints and gap splitting; it is not a browser-layout test.

A separate, entirely invented synthetic report was opened in the in-app browser via localhost. Visual inspection distinguished solid and fuzzy bars; all three tiers were present. Creator search/channel selection, add/edit annotation, revision retention, import, visible before/after-evidence context and literal untrusted text were exercised. This preview contained no personal export data. Minor subsequent copy/backup-control changes received automated checks but were not re-exercised in that browser preview.

JSON save produced a download-request notice. A personal-HTML download wait timed out; completed downloads were **not confirmed**. Serialization tests are not evidence that the browser saved a file successfully.

The real artifact was structurally audited for observation counts, tier counts, 39 no-primary folders, embedded current script bytes and source hashes. It was **not** visually opened in the browser.

## Offline acceptance — user performed, PASSED

The browser tool rejected the personal `file://` URL under its URL policy and explicitly prohibited bypasses. No alternate browser automation, local server for personal data or raw browser command was used to circumvent it. The synthetic localhost check above does not satisfy offline acceptance.

A read-only adapter check reported the Wi-Fi adapter as Not Present; Ethernet and VPN adapters were up. No networking settings were changed. Therefore neither “Wi-Fi off” nor “all networking off” is recorded as a performed product test.

On **2026-09-11**, the user tested the delivered personal file on **Windows, Chrome, with Ethernet disconnected**. The **DevTools Network tab was empty**, with **zero outbound requests and no CSP violations**. The page rendered fully and print preview worked. This closes the core offline claim for that delivered artifact. These are user-reported results, not agent-observed results. The preceding tool limitation is retained as history and does not negate this acceptance.

The revised file still needs the user’s annotation round trip (add, save, reload, re-import). Original acceptance checklist, retained for reproducibility:

1. Open the personal HTML directly from disk in a normal browser and confirm a `file://` address.
2. Disconnect networking, including Ethernet/VPN connectivity where applicable, then reload the file.
3. Confirm coverage at the top, activity counts, creator search/channel selection, all 46 primary bars and the 3/15/28 visual distinction. Inspect fuzzy endpoints and unassessed gaps.
4. Add and edit a memory; confirm its recorded context and edit history remain visible on the timelines.
5. Save annotation JSON. Reopen the original report and import that saved file; confirm dates, notes, context and revisions.
6. Save a personal HTML copy, reopen it from disk while offline and confirm the annotation round trip. Check the JSON backup control if downloads are blocked.

Chrome version was not supplied. Do not infer a version. Record the revised annotation round-trip outcome separately before committing.

## Remaining broader shell work

This delivery is a generated personal report from retained snapshots. The approved broader design also calls for an empty standalone application with selective local File/ZIP export intake, workers/cancellation and untrimmed-export checks; those are not implemented here. Cross-browser/macOS/mobile and browser performance acceptance remain unverified. Windows Chrome print preview passed in the user’s check above. The report must not be described as a completed standalone export-import application.

No commit or push was made during this continuation. Earlier worktree changes were preserved.


## Review fixes — 2026-09-11

Revised personal artifact: `../hindsight-data/step-8/hindsight-revised.html`, 4,329,554 bytes, SHA-256 `590d792f42b4792897b3bcd7896a104ad6cb0c772771ffce98f9711a3c6653c3`. The previously accepted file remains unchanged. Use the same build command with this fresh output filename to reproduce (choose another fresh name if it already exists).

Before changing the code, the old `openMemory` function was executed in an isolated DOM harness. A partial envelope reproduced `RangeError` before `showModal`. All 75 real-artifact envelopes (46 outer plus 29 nested) passed that isolated check. This identified a defensive failure path, but did not explain the user's click. **Closed on 2026-09-12 by the user's follow-up:** saving the memory worked; its result appeared out of view in section 05, without confirmation where the user remained in section 03. The observed issue was missing success feedback, not a failed dialog or invalid real envelope. The old section 05 no-envelope path opened successfully in the same harness; this is not a claim that the user tested it in Chrome.

`calendarDay` now returns an empty string for invalid/missing values. The dialog opens before any prefill. Missing suggested dates produce an in-dialog explanation and allow manual entry with an unknown end; unexpected prefill failure also stays visible. Synchronous/asynchronous button failures and uncaught runtime errors have a visible non-technical notice. No raw exception is displayed by the fallback notice.

The legend is prominent above the timeline, with dark solid, light faded and dark stippled swatches and inline 3/15/28 counts. The section opens by explaining its purpose: locating periods to revisit, not dating phases. Solid dates are described as holding across all nine settings, not verified personal dates. Faded shapes represent overlap across settings, without claiming a lived phase is proven. The 18 inclusive count is preserved. Coverage timestamps now carry Australia/Brisbane (UTC+10; times are local) directly beside them.

Typecheck PASS; **118/118 tests PASS**. New executable regressions cover partial/malformed envelopes, section 05 without an envelope, prefill and modal-opening exceptions, and synchronous/asynchronous button failure notices. Existing SVG uncertainty and CSP/serialization checks still pass. The revised artifact is generated from the same retained data; no detector rerun or dependency change.

**Pending:** user-performed revised annotation round trip and visual review. No commit or push.


## Interaction and plain-language fixes — 2026-09-12

The user resolved the reported memory failure: successful saves looked like no action because the result appeared out of view. Keeping a memory now places a visible, focused confirmation beside the originating control, states that a file copy is still needed, and offers “Go to this memory”. The destination card receives focus. Editing a re-rendered card falls back to the memory toolbar if its former control no longer exists.

Creator and folder evidence panels now have “Close evidence — back to timeline”. Escape closes the panel and restores the originating control, but does not close the evidence underneath an open memory dialog. The underlying timeline is retained.

Evidence leads with plain counts and an approximate share comparison: the supplied example, 0.0253 / 0.0090, becomes “About 3 times the usual share of your saves went into this folder.” This deliberately specifies **share**, not saves per day: changing total saving volume affects the original fraction. Exact numerical fields, settings, contributors, endpoint conventions and coverage remain in collapsed **Technical detail**. Creator detail and nearby labels also use plain-language primary text.

New artifact: `../hindsight-data/step-8/hindsight-ux-review.html`, 4,331,707 bytes, SHA-256 `8ad718bf67719678d769a4e713d7b820d331fc407f154016ee1c50f235df1722`. Earlier artifacts are unchanged. It retains all 10,054 actions and the 3/15/28 agreement counts.

Typecheck PASS; **121/121 tests PASS**. Added executable DOM-harness checks for nearby confirmation and a focused jump to the correct memory, Close/Escape return behaviour including an open-dialog guard, and the plain-language ratio calculation. These are isolated execution checks, not a new Chrome/offline acceptance run. The user-performed 2026-09-11 offline acceptance remains recorded above. Updated artifact annotation round-trip/interaction review remains pending; no commit or push.

The requested section 1 rebuild and shared range control are **design only**, in [activity-and-range-design.md](activity-and-range-design.md). Their measurement reads retained observations without re-parsing source exports or rerunning detection. They have not been implemented pending review.
