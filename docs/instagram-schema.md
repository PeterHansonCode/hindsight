# Instagram schema reference

Based on planning/hindsight-instagram-schema.md, originally measured against exports dated 2026-08-09 and 2026-08-30. This version retains the measured schema and supersedes the planning reference on unmatched collection counts and Update time.value presence. No real captions, creator identities or post identifiers are included here.

## Source and status

On 2026-09-10, the four 2026-08-30 files were inspected read-only after hash-verified relocation to ../hindsight-data/Instagram/. These are inspection results, not parser acceptance results. The August 9 export is not available in the supplied fixture; its figures below are attributed to the planning reference, not independently reverified.

| Metric | August 9, reference | August 30, inspected |
|---|---:|---:|
| Saved posts | 4,385 | 4,809 |
| Liked posts | 5,337 | 5,245 |
| Collections | 76 | 73 |
| Empty collections | 4 | 0 |
| Placements | 3,741 | 4,177 |
| Unique collection URLs | 3,617 | 4,046 |
| Items in multiple collections | 120 | 127 |
| Saved reels | 4,293 | 4,710 |
| Saved posts of type p | 92 | 99 |
| Saved captions absent | 84 | 91 |
| Saved usernames present | 100% | 4,809 / 4,809 |
| Saved first date UTC | 2018-12-18 | 2018-12-18 |
| Saved last date UTC | 2026-08-09 | 2026-08-30 |
| Unmatched unique collection URLs | 5 | 7 |

The five and seven unmatched counts refer to different exports. August 30 has seven unmatched unique shortcodes and seven unmatched placements after canonicalisation, the same as exact URL matching. They are absent from this saved_posts file, not proven deleted posts. Whether each of the earlier five corresponds to a later unmatched item cannot be established without the older export.

## Files and field navigation

- saved/saved_posts.json and likes/liked_posts.json are top-level arrays. Each row has timestamp (Unix seconds), media (empty array in measured exports), label_values and fbid (string).
- Find the post URL by label URL at the row's immediate label_values level; do not recursively collect URL labels. The owner also has a URL field.
- Caption.value maps to Activity.title; ignore the low-value Title field. Caption/Title may both be absent. August 30 has 91 absent saved captions and 512 absent liked captions.
- Owner is a title group whose dict contains a wrapper with another dict containing labels Name, Username and URL. Map Name to creator and Username to creator_id. August 30 usernames are present on all 4,809 saved and 5,245 liked rows.
- Hashtags is a title group; its nested dict children contain Name values. Preserve the resulting string array in post extras.
- Ignore media and Brand partner. The original reference found media always empty, and Brand partner populated on only 1–2 rows.
- Repair mojibake in every string value once, including nested usernames, hashtags, captions and collection names. The measured transformation is Buffer.from(value, 'latin1') followed by UTF-8 decoding; add strict validity guards to avoid silent replacement characters. A repaired curly apostrophe remains curly.
- duration_sec is always null. No Instagram duration exists in these files.
- source_file is the relative path, and raw_id is fbid preserved as a string. Timestamp converts seconds to ISO 8601 UTC.

The earlier reference measured saved Caption presence 98.1%, liked Caption presence 90.9%, Owner.Name/Username/URL and top-level URL at 100%; those percentages describe August 9. Title was predominantly empty and is not a fallback caption. Do not substitute these historical percentages for August 30 acceptance counts.

## Collections

saved/saved_collections.json is a top-level array. Each collection has timestamp (creation time), fbid, media and label_values. Name is the collection name; Type and Privacy are not needed for activity. Locate the title Media container and count its dict children: each child contains one post's dict fields. Never count URL labels; each post may have both post and owner URL labels.

Collection posts have no activity timestamp. Join to saved observations by validated canonical post identity. Keep unmatched placements with a null saved observation link. A post in several collections remains one saved event.

### Correction: Update time

| August 30 distribution, all 73 collections | Count |
|---|---:|
| value key absent | 73 |
| value equal to string "None" | 0 |
| value explicitly null | 0 |
| Other value | 0 |
| timestamp_value present and integer | 73 |

Rule: value may be ABSENT or the string "None"; always read timestamp_value. The planning reference documents the string "None" form; the supplied export uses absence. Do not claim the older form was independently rechecked. Collection update time is not an individual post's saved time.

## URL observations and canonical identity

| URL property | Saved | Liked | Placements |
|---|---:|---:|---:|
| Total inspected | 4,809 | 5,245 | 4,177 |
| Trailing slash | 4,809 | 5,245 | 4,177 |
| Query present | 0 | 0 | 0 |
| Fragment present | 0 | 0 | 0 |
| Host www.instagram.com | 4,809 | 5,245 | 4,177 |
| Two segments, reel/p/tv then shortcode | 4,809 | 5,245 | 4,177 |

Across all 14,231 URLs, zero shortcodes appear under multiple path types. The fixture provides no evidence of cross-path variation, tracking parameters or slash differences. All seven unmatched placements stay unmatched using the shortcode alone.

Proposed canonical identity: instagram:post:<shortcode>, case-sensitive. Validate the HTTPS Instagram host and two-segment supported path before extracting; accept optional trailing slash, ignore query/fragment for identity, reject credentials, non-default ports, malformed paths and encoded path separators. Preserve original decoded URL and observed post_type (reel, p or tv). Treat cross-type paths sharing a shortcode as equivalent by explicit design; synthetic tests must cover this assumption and ambiguous joins. No URL fetching or inferred case folding.

## Liked comments and partial input

likes/liked_comments.json is an object with root key likes_comment_likes, not an array using label_values. Skip with a named diagnostic in this version. Missing folders, malformed JSON, absent captions, empty collections, multiple memberships, unexpected encoding and unmatched placements need dedicated synthetic tests.

## Historical interpretation

The planning comparison records 174 liked and 63 saved items absent from the later snapshot, with 82 liked and 487 saved items newly present. These figures do not establish why records disappeared. Keep old exports; say present in one export and absent in another. Never imply a complete lifetime history or label observed timestamps first ever.
