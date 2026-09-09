# Synthetic fixtures

instagram.synthetic.json was constructed from the documented structure using invented names, IDs, URLs and captions. It contains no copied personal records. It includes saved/liked rows, nested owner URL labels, mojibake, absent captions, repeated memberships, an unmatched placement, an empty collection, both update-value forms, liked-comments shape, URL cases and hostile text.

Step 1 tests only fixture integrity and repository exclusions. URL cases and malicious strings are inputs for future behavioral tests, not evidence that those controls currently work. Add missing-file, malformed-input, encoding and ambiguous-join tests when the reader/parser exists.
