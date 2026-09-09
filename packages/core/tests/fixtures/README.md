# Synthetic fixtures

instagram.synthetic.json was constructed from the documented structure using invented names, IDs, URLs and captions. It contains no copied personal records. It includes saved/liked rows, nested owner URL labels, mojibake, absent captions, repeated memberships, an unmatched placement, an empty collection, both update-value forms, liked-comments shape, URL cases and hostile text.

Step 2 tests now exercise parsing, encoding, URL cases, missing/malformed input and ambiguous joins using these fixtures. Hostile captions are preserved as inert data; this is not a claim that the later CSV/report/MCP boundaries are implemented. The first collection's invented ID is ASCII, matching the field's role and avoiding accidental already-decoded Unicode in the all-mojibake fixture.
