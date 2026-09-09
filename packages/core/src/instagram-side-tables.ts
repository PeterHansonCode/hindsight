import type { EventRecord, ParseResult, SideTable } from './domain.ts';
import { canonicalInstagramPostUrl } from './parsers/instagram-url.ts';

export interface InstagramSideTableBundle {
  format: 'hindsight.instagram-side-tables';
  schemaVersion: 1;
  snapshotId: string;
  platform: 'instagram';
  sensitivity: 'personal';
  contentTrust: 'untrusted-third-party';
  tables: SideTable[];
}

export class SideTableError extends Error {
  readonly code: 'invalid_bundle' | 'unsafe_destination' | 'conflict' | 'io_error';
  constructor(code: SideTableError['code']) {
    super(`Side-table operation failed: ${code}.`);
    this.code = code;
    this.name = 'SideTableError';
  }
}

function requireValue(condition: unknown): asserts condition {
  if (!condition) throw new SideTableError('invalid_bundle');
}
const object = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);
const nullableText = (value: unknown): boolean => value === null || typeof value === 'string';
const texts = (value: unknown): value is string[] => Array.isArray(value) && value.every(v => typeof v === 'string');
const captions = (value: unknown): value is (string | null)[] => Array.isArray(value) && value.every(nullableText);
const isoOrNull = (value: unknown): boolean => value === null || typeof value === 'string'
  && Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value;

export function validSnapshotId(value: unknown): value is string {
  return typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9_-]{0,99}$/.test(value);
}

// All references are scoped by bundle.snapshotId. The same local observation
// or collection ID may legitimately occur in another snapshot's bundle.
export function validateInstagramSideTableBundle(
  value: unknown, observations: readonly EventRecord[],
): asserts value is InstagramSideTableBundle {
  requireValue(object(value));
  requireValue(value.format === 'hindsight.instagram-side-tables' && value.schemaVersion === 1
    && value.platform === 'instagram' && value.sensitivity === 'personal'
    && value.contentTrust === 'untrusted-third-party' && validSnapshotId(value.snapshotId));
  requireValue(Array.isArray(value.tables) && value.tables.length === 3);
  const tables = new Map<string, Record<string, unknown>[]>();
  for (const table of value.tables) {
    requireValue(object(table) && typeof table.name === 'string' && table.schemaVersion === 1
      && Array.isArray(table.rows) && table.rows.every(object) && !tables.has(table.name));
    tables.set(table.name, table.rows);
  }
  const extras = tables.get('instagram.post_extras');
  const collections = tables.get('instagram.collections');
  const placements = tables.get('instagram.placements');
  requireValue(extras && collections && placements);
  const events = new Map(observations.map(event => [event.observationId, event]));
  requireValue(events.size === observations.length && observations.every(event => event.activity.platform === 'instagram'));
  const extraIds = new Set<string>();
  const savedByPost = new Map<string, string[]>();
  for (const extra of extras) {
    requireValue(typeof extra.observationId === 'string' && !extraIds.has(extra.observationId));
    const event = events.get(extra.observationId);
    requireValue(event);
    extraIds.add(extra.observationId);
    const url = event.activity.url === null ? null : canonicalInstagramPostUrl(event.activity.url);
    requireValue(extra.postKey === (url?.key ?? null) && extra.post_type === (url?.postType ?? null));
    requireValue(texts(extra.hashtags) && captions(extra.captionValues)
      && extra.captionSelection === 'first_in_export'
      && extra.captionPresent === (extra.captionValues.length > 0)
      && event.activity.title === (extra.captionValues[0] ?? null));
    if (event.activity.event_type === 'saved' && url) {
      const ids = savedByPost.get(url.key) ?? [];
      ids.push(event.observationId); savedByPost.set(url.key, ids);
    }
  }
  requireValue(extraIds.size === events.size);
  const collectionIds = new Map<string, number>();
  for (const collection of collections) {
    requireValue(typeof collection.collectionId === 'string' && !collectionIds.has(collection.collectionId)
      && nullableText(collection.raw_id) && nullableText(collection.collection_name)
      && isoOrNull(collection.createdAt) && isoOrNull(collection.updatedAt)
      && typeof collection.mediaChildCount === 'number' && Number.isSafeInteger(collection.mediaChildCount)
      && collection.mediaChildCount >= 0 && ['absent', 'None', 'other'].includes(String(collection.updateValueState))
      && typeof collection.updateTimestampInteger === 'boolean');
    collectionIds.set(collection.collectionId, collection.mediaChildCount);
  }
  const placementIds = new Set<string>();
  const counts = new Map<string, number>();
  for (const placement of placements) {
    requireValue(typeof placement.placementId === 'string' && !placementIds.has(placement.placementId)
      && typeof placement.collectionId === 'string' && collectionIds.has(placement.collectionId)
      && nullableText(placement.url) && texts(placement.candidateObservationIds)
      && captions(placement.captionValues) && placement.captionSelection === 'first_in_export'
      && placement.title === (placement.captionValues[0] ?? null)
      && nullableText(placement.creator) && nullableText(placement.creator_id) && texts(placement.hashtags));
    placementIds.add(placement.placementId);
    counts.set(placement.collectionId, (counts.get(placement.collectionId) ?? 0) + 1);
    const url = typeof placement.url === 'string' ? canonicalInstagramPostUrl(placement.url) : null;
    requireValue(placement.postKey === (url?.key ?? null) && placement.post_type === (url?.postType ?? null));
    const candidates = url ? savedByPost.get(url.key) ?? [] : [];
    const candidateIds = placement.candidateObservationIds;
    requireValue(candidateIds.length === candidates.length
      && new Set(candidateIds).size === candidates.length
      && candidates.every(id => candidateIds.includes(id)));
    const expectedStatus = url === null ? 'invalid_url' : candidates.length === 0
      ? 'unmatched_placement' : candidates.length > 1 ? 'ambiguous_join' : 'matched';
    requireValue(placement.joinStatus === expectedStatus);
    const match = expectedStatus === 'matched' ? events.get(candidates[0])! : null;
    requireValue(placement.savedObservationId === (match?.observationId ?? null)
      && placement.savedAt === (match?.activity.timestamp ?? null));
  }
  for (const [id, expected] of collectionIds) requireValue((counts.get(id) ?? 0) === expected);
}

export function createInstagramSideTableBundle(snapshotId: string, result: ParseResult): InstagramSideTableBundle {
  if (result.status === 'failed') throw new SideTableError('invalid_bundle');
  const bundle = {
    format: 'hindsight.instagram-side-tables' as const, schemaVersion: 1 as const,
    snapshotId, platform: 'instagram' as const, sensitivity: 'personal' as const,
    contentTrust: 'untrusted-third-party' as const, tables: structuredClone(result.sideTables),
  };
  validateInstagramSideTableBundle(bundle, result.events);
  return bundle;
}

export function placementStatusMessage(status: string): string {
  switch (status) {
    case 'matched': return 'Matched to a saved observation in this snapshot.';
    case 'unmatched_placement': return 'Unmatched in this snapshot.';
    case 'ambiguous_join': return 'Multiple saved observations match in this snapshot; no match selected.';
    default: return 'No valid post URL available for matching.';
  }
}
