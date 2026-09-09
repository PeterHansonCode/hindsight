import type { BufferedPlatformParser, Diagnostic, EventRecord, ParseResult, SideTable } from '../domain.ts';
import { repairInstagramValues } from './instagram-encoding.ts';
import { canonicalInstagramPostUrl } from './instagram-url.ts';

type Obj = Record<string, unknown>;
const object = (value: unknown): value is Obj => value !== null && typeof value === 'object' && !Array.isArray(value);
function entries(value: unknown): Obj[] {
  if (!Array.isArray(value) || !value.every(object)) throw new Error('Invalid structure.');
  return value;
}
function label(values: Obj[], name: string): Obj | undefined {
  const found = values.filter(value => value.label === name);
  if (found.length > 1) throw new Error('Ambiguous field.');
  return found[0];
}
function group(values: Obj[], name: string): Obj | undefined {
  const found = values.filter(value => value.title === name);
  if (found.length > 1) throw new Error('Ambiguous group.');
  return found[0];
}
function string(value: unknown): string | null {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string') throw new Error('Invalid text.');
  return value;
}
function timestamp(value: unknown): string | null {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) return null;
  const date = new Date(value * 1000);
  // Ordinary four-digit ISO years keep lexical sorting chronological.
  if (!Number.isFinite(date.getTime()) || date.getUTCFullYear() > 9999) return null;
  return date.toISOString();
}
function postFields(values: Obj[]) {
  const captions = values.filter(value => value.label === 'Caption').map(value => string(value.value));
  const owner = group(values, 'Owner');
  const wrappers = owner ? entries(owner.dict) : [];
  if (wrappers.length > 1) throw new Error('Ambiguous owner.');
  const ownerFields = wrappers.length ? entries(wrappers[0].dict) : [];
  const hashtagGroup = group(values, 'Hashtags');
  const hashtags = hashtagGroup ? entries(hashtagGroup.dict).flatMap(wrapper => {
    const name = string(label(entries(wrapper.dict), 'Name')?.value);
    return name === null ? [] : [name];
  }) : [];
  return {
    url: string(label(values, 'URL')?.value),
    title: captions[0] ?? null,
    captionPresent: captions.length > 0,
    captions,
    creator: string(label(ownerFields, 'Name')?.value),
    creatorId: string(label(ownerFields, 'Username')?.value),
    hashtags,
  };
}

export const instagramParser: BufferedPlatformParser = {
  platform: 'instagram',
  version: '0.3.0',
  sourceFiles: ['saved/saved_posts.json', 'likes/liked_posts.json',
    'saved/saved_collections.json', 'likes/liked_comments.json'],
  async parse(input): Promise<ParseResult> {
    const events: EventRecord[] = [];
    const diagnostics: Diagnostic[] = [];
    const extras: SideTable = { name: 'instagram.post_extras', schemaVersion: 1, rows: [] };
    const collections: SideTable = { name: 'instagram.collections', schemaVersion: 1, rows: [] };
    const placements: SideTable = { name: 'instagram.placements', schemaVersion: 1, rows: [] };
    const savedByPost = new Map<string, string[]>();
    const savedTimes = new Map<string, string>();
    let validFiles = 0;
    const report = (sourceFile: string, code: Diagnostic['code'], row?: number, severity: Diagnostic['severity'] = 'warning') => {
      diagnostics.push({ sourceFile, code, ...(row === undefined ? {} : { row }), severity });
    };
    function decode(raw: unknown, source: string, row: number): Obj {
      const repaired = repairInstagramValues(raw);
      if (repaired.unexpected) report(source, 'invalid_encoding', row);
      if (!object(repaired.value)) throw new Error('Invalid row.');
      return repaired.value;
    }
    async function readArray(source: string): Promise<unknown[] | null> {
      const read = await input.readJson(source);
      if (read.status !== 'ok') {
        report(source, read.code, undefined, read.status === 'missing' ? 'warning' : 'error');
        return null;
      }
      if (!Array.isArray(read.value)) {
        report(source, 'invalid_shape', undefined, 'error');
        return null;
      }
      validFiles++;
      return read.value;
    }
    // Await each file in order: no simultaneous whole-file JSON buffers.
    for (const [source, eventType] of [
      ['saved/saved_posts.json', 'saved'], ['likes/liked_posts.json', 'liked'],
    ] as const) {
      const rows = await readArray(source);
      if (!rows) continue;
      for (const [index, raw] of rows.entries()) {
        const rowNumber = index + 1;
        try {
          const row = decode(raw, source, rowNumber);
          const time = timestamp(row.timestamp);
          if (time === null) throw new Error('Invalid timestamp.');
          const fields = postFields(entries(row.label_values));
          if (fields.captions.length > 1) report(source, 'duplicate_caption', rowNumber, 'info');
          const rawId = string(row.fbid);
          const canonical = fields.url === null ? null : canonicalInstagramPostUrl(fields.url);
          if (fields.url !== null && canonical === null) report(source, 'invalid_url', rowNumber);
          // Snapshot-local observation identity: ingestion will scope it to a
          // snapshot. Event matching must not depend on source array position.
          const observationId = `${source}:${rowNumber}`;
          const eventKey = rawId !== null
            ? JSON.stringify(['instagram', eventType, 'raw_id', rawId])
            : canonical ? JSON.stringify(['instagram', eventType, 'post', canonical.key]) : null;
          events.push({ observationId, eventKey, activity: {
            platform: 'instagram', timestamp: time, event_type: eventType,
            title: fields.title, creator: fields.creator, creator_id: fields.creatorId,
            url: fields.url, duration_sec: null, source_file: source, raw_id: rawId,
          } });
          extras.rows.push({ observationId, hashtags: fields.hashtags,
            post_type: canonical?.postType ?? null, postKey: canonical?.key ?? null,
            captionPresent: fields.captionPresent, captionValues: fields.captions,
            captionSelection: 'first_in_export' });
          if (eventType === 'saved' && canonical) {
            const matching = savedByPost.get(canonical.key) ?? [];
            matching.push(observationId);
            savedByPost.set(canonical.key, matching);
            savedTimes.set(observationId, time);
          }
        } catch {
          report(source, 'invalid_row', rowNumber);
        }
      }
    }
    const source = 'saved/saved_collections.json';
    const collectionRows = await readArray(source);
    if (collectionRows) for (const [index, raw] of collectionRows.entries()) {
      const rowNumber = index + 1;
      try {
        const row = decode(raw, source, rowNumber);
        const values = entries(row.label_values);
        const media = group(values, 'Media');
        if (!media) throw new Error('Missing media container.');
        if (!Array.isArray(media.dict)) throw new Error('Invalid media container.');
        const children: unknown[] = media.dict;
        const update = label(values, 'Update time');
        const createdAt = timestamp(row.timestamp);
        const updatedAt = timestamp(update?.timestamp_value);
        const name = string(label(values, 'Name')?.value);
        const rawId = string(row.fbid);
        const valueState = !update || !Object.hasOwn(update, 'value') ? 'absent'
          : update.value === 'None' ? 'None' : 'other';
        if (createdAt === null || updatedAt === null || valueState === 'other') report(source, 'invalid_row', rowNumber);
        const collectionId = `${source}:${rowNumber}`;
        collections.rows.push({ collectionId, raw_id: rawId, collection_name: name,
          createdAt, updatedAt, mediaChildCount: children.length,
          updateValueState: valueState,
          updateTimestampInteger: typeof update?.timestamp_value === 'number' && Number.isInteger(update.timestamp_value) });
        for (const [placementIndex, child] of children.entries()) {
          // Each Media child is one placement; its nested owner URL is not.
          const placementId = `${collectionId}:${placementIndex + 1}`;
          let url: string | null = null;
          let details: ReturnType<typeof postFields> | null = null;
          try {
            if (!object(child)) throw new Error('Invalid placement.');
            url = string(label(entries(child.dict), 'URL')?.value);
            details = postFields(entries(child.dict));
          } catch {
            report(source, 'invalid_row', rowNumber);
          }
          const canonical = url === null ? null : canonicalInstagramPostUrl(url);
          const matches = canonical ? savedByPost.get(canonical.key) ?? [] : [];
          const joinStatus = canonical === null ? 'invalid_url'
            : matches.length === 0 ? 'unmatched_placement'
            : matches.length > 1 ? 'ambiguous_join' : 'matched';
          if (joinStatus !== 'matched') report(source, joinStatus, rowNumber);
          placements.rows.push({ placementId, collectionId, postKey: canonical?.key ?? null,
            url, savedObservationId: joinStatus === 'matched' ? matches[0] : null, joinStatus,
            candidateObservationIds: matches,
            savedAt: joinStatus === 'matched' ? savedTimes.get(matches[0])! : null,
            title: details?.title ?? null, captionValues: details?.captions ?? [],
            captionSelection: 'first_in_export', creator: details?.creator ?? null,
            creator_id: details?.creatorId ?? null, hashtags: details?.hashtags ?? [],
            post_type: canonical?.postType ?? null });
        }
      } catch {
        report(source, 'invalid_row', rowNumber);
      }
    }
    // This intentionally does not read liked_comments: it is unsupported, so
    // loading and decoding personal comment records would serve no purpose.
    report('likes/liked_comments.json', 'unsupported_file', undefined, 'info');
    const warning = diagnostics.some(diagnostic => diagnostic.severity !== 'info');
    const status = events.length > 0 ? warning ? 'partial' : 'complete'
      : validFiles > 0 && !warning ? 'empty' : 'failed';
    return { status, events, sideTables: [extras, collections, placements], diagnostics };
  },
};
