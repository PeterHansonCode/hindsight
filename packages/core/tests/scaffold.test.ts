import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = fileURLToPath(new URL('../../..', import.meta.url));
const fixture = JSON.parse(readFileSync(new URL('./fixtures/instagram.synthetic.json', import.meta.url), 'utf8'));

test('synthetic fixture carries independently stated collection expectations', () => {
  assert.equal(fixture.synthetic, true);
  assert.equal(fixture.files['saved/saved_posts.json'].length, 2);
  assert.equal(fixture.files['likes/liked_posts.json'].length, 1);
  assert.equal(fixture.expected.placements, 4);
  assert.equal(fixture.expected.uniqueCollectionPosts, 3);
  assert.equal(fixture.expected.unmatchedUnique, 1);
  assert.equal(fixture.files['saved/saved_collections.json'].length, 3);
  assert.ok(fixture.urlCases.some((c: { key: string | null }) => c.key === null));
});

test('Git excludes private inputs and outputs even under eligible directories', () => {
  const paths = ['Instagram/saved/saved_posts.json', 'data/private/snapshot.json',
    'accidental-export.json', 'export.zip', 'summary-detailed.json',
    'packages/core/src/export.json', 'packages/core/tests/export.json',
    'packages/core/tests/fixtures/real-export.json', 'docs/activity.csv',
    'docs/.env', 'packages/core/src/Instagram/export.json'];
  const result = spawnSync('git', ['check-ignore', '--no-index', '--stdin'], {
    cwd: root, input: paths.join('\n') + '\n', encoding: 'utf8',
  });
  assert.ifError(result.error);
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(result.stdout.trim().split(/\r?\n/).sort(), [...paths].sort());
});

test('Git permits the intended source and synthetic fixture files', () => {
  const paths = ['README.md', 'package-lock.json', 'docs/BUILD-CONTRACT.md',
    'packages/core/src/domain.ts', 'packages/core/tests/scaffold.test.ts',
    'packages/core/tests/fixtures/instagram.synthetic.json',
    'packages/report/README.md', '.github/workflows/test.yml'];
  const result = spawnSync('git', ['check-ignore', '--no-index', '--stdin'], {
    cwd: root, input: paths.join('\n') + '\n', encoding: 'utf8',
  });
  assert.ifError(result.error);
  assert.equal(result.status, 1, result.stderr);
  assert.equal(result.stdout, '');
});
