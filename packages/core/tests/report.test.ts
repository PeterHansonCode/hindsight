import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import path from 'node:path';
import os from 'node:os';
import { reportHtml, safeEmbeddedJson, buildReport } from '../src/report-build.ts';
import { ingestInstagram } from '../src/ingest.ts';
import { stepSixCommand } from '../src/step-six-command.ts';
import { intervalAgreement, makeReportModel, type GridRun } from '../src/report-model.ts';
import { creatorLifecycles, DAY } from '../src/lifecycles.ts';
import { detectBursts, type RateWeek } from '../src/bursts.ts';
import type { EventRecord } from '../src/domain.ts';

const epoch = Date.parse('2026-01-05');
function week(i: number) { return new Date(epoch + i * 7 * DAY).toISOString().slice(0, 10); }
function rateWeeks(): RateWeek[] { return Array.from({ length: 32 }, (_, i) => ({ week: week(i), numerator: i === 3 || i === 4 ? 30 : 0, denominator: 100, timestamps: i === 3 || i === 4 ? [epoch + i * 7 * DAY, epoch + i * 7 * DAY + DAY] : [], total: 100, filed: 80, status: 'assessed' })); }
function sample() {
  const weeks = rateWeeks(), detection = detectBursts(weeks, { s: 2, gamma: 1 });
  const lane = { collectionRef: { snapshotId: 'synthetic', collectionId: 'synthetic-folder', name: 'SYNTHETIC FOLDER <script>canary</script>' }, createdAt: '2025-12-01T00:00:00.000Z', denominator: 'all-saves' as const, weeks, descriptive: { distinctMatchedObservations: 60, excludedPlacementsWithoutMatchedObservation: 0, observationsBeforeCreation: 0, observationsOutsideWindow: 0, unassessedWindowObservations: 0 }, detection };
  const bar = detection.qualifiedBars.find(b => b.level === 1)!;
  const runs: GridRun[] = [1.5, 2, 3].flatMap(s => [0.5, 1, 2].map(gamma => ({ denominator: 'all-saves' as const, s, gamma, elapsedMilliseconds: 0, lanes: [structuredClone(lane)] })));
  return { lane, bar, runs };
}
function event(id: string, timestamp: string, type: 'saved' | 'liked'): EventRecord { return { observationId: id, eventKey: null, activity: { platform: 'instagram', timestamp, event_type: type, title: 'PRIVATE_CAPTION_CANARY', creator: 'Synthetic creator', creator_id: 'SYNTHETIC_CREATOR', url: 'https://example.invalid/private', duration_sec: null, source_file: 'synthetic.json', raw_id: id } }; }
function model() {
  const events = [event('a', '2021-01-01T00:00:00.000Z', 'liked'), event('b', '2026-01-01T00:00:00.000Z', 'saved'), event('c', '2026-08-30T22:48:58.000Z', 'saved')];
  const life = (['combined', 'saved', 'liked'] as const).map(channel => creatorLifecycles(events, { channel, asOf: '2026-08-30T23:59:59.999Z', snapshotRefs: ['synthetic'] }));
  return makeReportModel(events, life, sample().runs, { snapshotId: 'synthetic', exportDate: '2026-08-30', observationSha256: 'synthetic', parseStatus: 'partial' });
}
test('Report agreement tiers are exclusive, include all nine settings and never elevate incomplete grids', () => {
  const { bar, lane, runs } = sample();
  assert.equal(intervalAgreement(bar, lane, runs).tier, 'exact-stable');
  runs[0].lanes[0].detection.qualifiedBars.forEach(b => { b.startWeek = week(2); });
  assert.equal(intervalAgreement(bar, lane, runs).tier, 'overlap-stable');
  runs[1].lanes[0].detection.qualifiedBars = [];
  assert.equal(intervalAgreement(bar, lane, runs).tier, 'primary-only');
  assert.equal(intervalAgreement(bar, lane, runs.slice(1)).tier, 'agreement not assessed');
  runs[1].gamma = 9; assert.equal(intervalAgreement(bar, lane, runs).tier, 'agreement not assessed');
});
test('Report support preserves split candidates, counts one vote per setting, and cuts zero exposure', () => {
  const { bar, lane, runs } = sample();
  for (const r of runs) r.lanes[0].detection.qualifiedBars.push(structuredClone(bar));
  lane.weeks[3].status = 'zero exposure'; lane.weeks[3].denominator = 0;
  const a = intervalAgreement(bar, lane, runs);
  assert.equal(a.cells[3].votes, 0); assert.ok(a.cells.every(c => c.votes <= 9)); assert.ok(a.contributors.every(c => c.intervals.length >= 2));
});
test('Report endpoints retain ten-week movement without inventing a common week', () => {
  const { bar, lane, runs } = sample();
  const broad = { ...bar, startWeek: week(0), endWeek: week(15), endExclusive: new Date(epoch + 16 * 7 * DAY).toISOString() };
  runs.forEach((r, i) => { const start = i % 2 ? 10 : 0; r.lanes[0].detection.qualifiedBars = [{ ...broad, startWeek: week(start), endWeek: week(start + 1), endExclusive: new Date(epoch + (start + 2) * 7 * DAY).toISOString() }]; });
  const a = intervalAgreement(broad, lane, runs); assert.equal(a.tier, 'overlap-stable'); assert.equal((a.envelope.latestStart - a.envelope.earliestStart) / (7 * DAY), 10); assert.ok(!a.cells.some(c => c.votes === 9));
});
test('Report projection conserves annual counts and omits captions and URLs', () => {
  const m = model(); assert.equal(m.years.reduce((n, y) => n + y.saved + y.liked, 0), 3); assert.equal(m.tiers.exact + m.tiers.overlap + m.tiers.primary, 1); assert.equal(m.metadata.last, '2026-08-30T22:48:58.000Z');
  assert.ok(!JSON.stringify(m).includes('PRIVATE_CAPTION_CANARY')); assert.ok(!JSON.stringify(m).includes('https://example.invalid'));
});
test('Standalone HTML prevents script breakout, bundles resources and hashes browser-normalised script bytes', async () => {
  const m = model(); m.metadata.snapshotId = '</script><script>ATTACK</script>';
  const html = await reportHtml(m); assert.ok(!html.includes(m.metadata.snapshotId)); assert.equal(JSON.parse(safeEmbeddedJson({ text: '<script>&\u2028' })).text, '<script>&\u2028');
  const script = html.match(/<script>([\s\S]*?)<\/script><\/body>/)![1], hash = createHash('sha256').update(script.replace(/\r\n?/g, '\n')).digest('base64');
  assert.ok(html.includes(`script-src 'sha256-${hash}'`)); assert.ok(html.includes("connect-src 'none'")); assert.ok(!/<script[^>]*src=|<link[^>]*href=|@import|url\(https?:/i.test(html));
  assert.doesNotThrow(() => new vm.Script(script));
});
test('Personal HTML save uses a real newline and losslessly escapes annotation script-like text', async () => {
  const source = await fs.readFile(new URL('../../report/report.js', new URL('../src/', import.meta.url)), 'utf8');
  const prefix = source.match(/download\(('(?:[^'\\]|\\.)*')\+copy\.outerHTML/)![1];
  assert.equal(vm.runInNewContext(prefix), '<!doctype html>\n');
  const expression = source.match(/querySelector\('#annotation-data'\)\.textContent=([^;]+);/)![1];
  const annotations = { notes: '</script><script>ATTACK</script>&', recordedContext: 'after-viewing-evidence' };
  const encoded = vm.runInNewContext(expression, { annotations }); assert.ok(!encoded.includes('</script>')); assert.deepEqual(JSON.parse(encoded), annotations);
});
test('Actual SVG renderer gives only exact-stable intervals solid edges and never fills unassessed gaps', async () => {
  const source = await fs.readFile(new URL('../../report/report.js', new URL('../src/', import.meta.url)), 'utf8');
  const functionText = source.slice(source.indexOf('function shape('), source.indexOf('function folderDetail('));
  interface Node { tag: string; attrs: Record<string, any>; children: Node[]; append: (...nodes: Node[]) => void }
  const svg = (tag: string, attrs: Record<string, any> = {}): Node => ({ tag, attrs, children: [], append(...nodes) { this.children.push(...nodes); } });
  const scope: Record<string, any> = { svg, X: (t: number) => (t - epoch) / DAY, shapeId: 0 };
  vm.runInNewContext(functionText, scope);
  const { bar, lane, runs } = sample();
  for (const tier of ['exact-stable', 'overlap-stable', 'primary-only']) {
    const a = { ...intervalAgreement(bar, lane, runs), tier, cells: [3, 4, 5].map(i => ({ week: week(i), time: epoch + i * 7 * DAY, votes: i === 4 ? 0 : 5, assessed: i !== 4 })) };
    const plot = svg('svg'); scope.shape(plot, a, 30);
    const shapes = plot.children.filter(n => n.attrs['data-tier']); assert.equal(shapes.length, 2);
    assert.ok(shapes.every(n => n.attrs.width === 7));
    if (tier === 'exact-stable') assert.ok(shapes.every(n => n.attrs.stroke));
    else { assert.ok(shapes.every(n => !n.attrs.stroke)); assert.ok(shapes.every(n => n.attrs.fill.startsWith('url('))); }
    const defs = plot.children.find(n => n.tag === 'defs')!;
    if (tier !== 'exact-stable') for (const gradient of defs.children.filter(n => n.tag === 'linearGradient')) { assert.equal(gradient.children[0].attrs['stop-opacity'], 0); assert.equal(gradient.children.at(-1)!.attrs['stop-opacity'], 0); }
  }
});
async function annotationAPI() { const scope: Record<string, any> = { Intl }; vm.runInNewContext(await fs.readFile(new URL('../../report/annotations.js', new URL('../src/', import.meta.url)), 'utf8'), scope); return scope.HindsightAnnotations; }
const empty = () => ({ format: 'hindsight.annotations', schemaVersion: 1, revision: 0, sensitivity: 'personal', events: [] });
const draft = () => ({ kind: 'period', label: 'Synthetic memory', start: { earliest: '2026-01-01', latest: '2026-01-31', precision: 'month' }, end: null, timezone: 'Australia/Brisbane', notes: 'User-authored only' });
test('Annotation add/edit/import preserves recordedContext and prior revisions instead of rewriting provenance', async () => {
  const a = await annotationAPI(); let b = a.upsert(empty(), draft(), { id: 'synthetic', now: '2026-09-11T00:00:00.000Z', snapshotId: 'synthetic' });
  assert.equal(b.events[0].recordedContext, 'after-viewing-evidence');
  b.events[0].recordedContext = 'before-viewing-evidence';
  b = a.upsert(b, { ...draft(), label: 'Edited memory' }, { id: 'synthetic', now: '2026-09-12T00:00:00.000Z', snapshotId: 'synthetic' });
  assert.equal(b.events[0].recordedContext, 'before-viewing-evidence'); assert.equal(b.events[0].lastEditedContext, 'after-viewing-evidence'); assert.equal(b.events[0].history[0].label, 'Synthetic memory'); assert.equal(b.events[0].revision, 2);
  assert.equal(a.merge(empty(), JSON.parse(JSON.stringify(b))).events[0].history.length, 1);
  const changed = JSON.parse(JSON.stringify(b)); changed.events[0].notes = 'Conflicting import'; assert.throws(() => a.merge(b, changed), /neither version was overwritten/);
});
test('Annotation validation rejects impossible dates, duplicate IDs and corrupt history; unknown context stays unknown', async () => {
  const a = await annotationAPI(); let b = a.upsert(empty(), draft(), { id: 'synthetic', now: '2026-09-11T00:00:00.000Z', snapshotId: 'synthetic' });
  delete b.events[0].recordedContext; assert.equal(a.validate(b).events[0].recordedContext, 'unknown');
  assert.throws(() => a.validate({ ...b, events: [b.events[0], b.events[0]] }), /Duplicate/);
  b.events[0].start.earliest = '2026-02-30'; assert.throws(() => a.validate(b), /calendar-date/);
  assert.equal(a.context('after-viewing-evidence'), 'Recorded after viewing evidence');
});
test('Report builder reads retained artifacts, protects existing/input files and rejects a replaced grid configuration', async t => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'hindsight-report-'));
  t.after(async () => { const target = path.resolve(root); assert.equal(path.dirname(target), path.resolve(os.tmpdir())); assert.ok(path.basename(target).startsWith('hindsight-report-')); await fs.rm(target, { recursive: true, force: true }); });
  const fixture = JSON.parse(await fs.readFile(new URL('./fixtures/instagram.synthetic.json', import.meta.url), 'utf8')), input = path.join(root, 'input');
  for (const [name, content] of Object.entries(fixture.files)) { const f = path.join(input, name); await fs.mkdir(path.dirname(f), { recursive: true }); await fs.writeFile(f, JSON.stringify(content)); }
  const snapshot = await ingestInstagram({ input, output: path.join(root, 'snapshots'), snapshotId: 'synthetic', exportDate: '2026-08-30' });
  const analysis = path.join(root, 'analysis');
  assert.equal(await stepSixCommand(['--snapshot', snapshot.directory, '--output', analysis, '--stage', 'all'], { stdout: () => {}, stderr: () => {} }), 0);
  const output = path.join(root, 'report.html'); assert.equal((await buildReport(snapshot.directory, analysis, output, input)).observations, 3);
  const bytes = await fs.readFile(output); await assert.rejects(buildReport(snapshot.directory, analysis, output, input)); assert.deepEqual(await fs.readFile(output), bytes);
  await assert.rejects(buildReport(snapshot.directory, analysis, path.join(input, 'forbidden.html'), input));
  await assert.rejects(buildReport(snapshot.directory, analysis, path.join(snapshot.directory, 'forbidden.html'), input));
  const bad = path.join(analysis, 'burst-run-01-personal.json'), run = JSON.parse(await fs.readFile(bad, 'utf8')); run.s = 99; await fs.writeFile(bad, JSON.stringify(run));
  await assert.rejects(buildReport(snapshot.directory, analysis, path.join(root, 'bad.html'), input), /sensitivity grid/);
});

async function memoryHarness() {
  const source = await fs.readFile(new URL('../../report/report.js', new URL('../src/', import.meta.url)), 'utf8');
  const calls: string[] = [];
  const field = () => ({ value: '', checked: false, focus() { calls.push('focus'); } });
  const scope: Record<string, any> = { Intl, model: { metadata: { timeZone: 'Australia/Brisbane' } }, editingId: null, memoryOrigin: null, document: { activeElement: null },
    form: { reset() { calls.push('reset'); }, querySelector: field }, formError: { hidden: true, textContent: '' },
    labelInput: field(), kind: field(), notes: field(), precision: field(), startEarliest: field(), startLatest: field(), endEarliest: field(), endLatest: field(), unknown: field(),
    endState() { calls.push('endState'); }, showFailure() { calls.push('visible failure'); },
    dialog: { open: false, showModal() { calls.push('showModal'); this.open = true; } } };
  vm.runInNewContext(source.slice(source.indexOf('function calendarDay('), source.indexOf("form.addEventListener('submit'")), scope);
  return { scope, calls };
}
test('Folder Add a memory opens before prefill and visibly handles a malformed or partial envelope', async () => {
  for (const envelope of [{}, { earliestStart: epoch, latestStart: 'invalid', earliestEnd: null }, { earliestStart: undefined, latestStart: Infinity, earliestEnd: NaN, latestEnd: '' }]) {
    const { scope, calls } = await memoryHarness();
    assert.doesNotThrow(() => scope.openMemory(null, envelope));
    assert.equal(calls[0], 'showModal'); assert.equal(scope.dialog.open, true);
    assert.equal(scope.formError.hidden, false); assert.match(scope.formError.textContent, /enter the dates you remember/);
    assert.equal(scope.unknown.checked, true); assert.equal(scope.endEarliest.value, '');
  }
  const { scope } = await memoryHarness();
  for (const t of [undefined, null, '', NaN, Infinity, 'invalid', {}, false]) assert.equal(scope.calendarDay(t), '');
  assert.equal(scope.calendarDay('2026-08-30T22:48:58Z'), '2026-08-31');
});
test('Section 05 Add a memory needs no envelope and opens with blank dates and an unknown end', async () => {
  const { scope, calls } = await memoryHarness(); scope.openMemory();
  assert.equal(calls[0], 'showModal'); assert.equal(scope.dialog.open, true); assert.equal(scope.formError.hidden, true);
  for (const name of ['startEarliest', 'startLatest', 'endEarliest', 'endLatest']) assert.equal(scope[name].value, '');
  assert.equal(scope.unknown.checked, true); assert.equal(scope.kind.value, 'period');
});
test('Memory dialog remains open with a visible message when prefill throws; showModal failures are surfaced', async () => {
  const { scope, calls } = await memoryHarness(); scope.form.reset = () => { throw Error('synthetic failure'); };
  scope.openMemory(); assert.equal(scope.dialog.open, true); assert.equal(scope.formError.hidden, false); assert.match(scope.formError.textContent, /section 05/);
  scope.dialog.open = false; scope.dialog.showModal = () => { throw Error('synthetic unsupported dialog'); };
  scope.openMemory(); assert.ok(calls.includes('visible failure'));
});
test('Report button failures surface a user-facing message for synchronous and asynchronous errors', async () => {
  const source = await fs.readFile(new URL('../../report/report.js', new URL('../src/', import.meta.url)), 'utf8');
  let click: () => unknown = () => {}; let failures = 0;
  const scope: Record<string, any> = { el: () => ({ addEventListener(_name: string, fn: () => unknown) { click = fn; } }), showFailure() { failures++; } };
  vm.runInNewContext(source.slice(source.indexOf('function button('), source.indexOf('function section(')), scope);
  scope.button('synthetic', () => { throw Error('synthetic'); }); click(); assert.equal(failures, 1);
  scope.button('synthetic', async () => { throw Error('synthetic'); }); click(); await new Promise(resolve => setImmediate(resolve)); assert.equal(failures, 2);
});

test('Evidence close and Escape restore the timeline trigger; Escape leaves an open memory dialog alone', async () => {
  const source = await fs.readFile(new URL('../../report/report.js', new URL('../src/', import.meta.url)), 'utf8');
  let close: () => void = () => {}, key: (e: any) => void = () => {}; let focused = 0, cleared = 0, modal = false;
  const origin = { isConnected: true, focus() { focused++; }, scrollIntoView() {} };
  const scope: Record<string, any> = { document: { activeElement: origin, querySelector() { return modal; } }, button(_label: string, fn: () => void) { close = fn; } };
  vm.runInNewContext(source.slice(source.indexOf('function openEvidence('), source.indexOf('function creatorDetail(')), scope);
  const target = { replaceChildren(...nodes: any[]) { if (!nodes.length) cleared++; } };
  const box = { prepend() {}, addEventListener(_name: string, fn: (e: any) => void) { key = fn; }, focus() {}, scrollIntoView() {} };
  scope.openEvidence(target, box); close(); assert.equal(cleared, 1); assert.equal(focused, 1);
  scope.openEvidence(target, box); key({ key: 'Escape', preventDefault() {} }); assert.equal(cleared, 2);
  modal = true; key({ key: 'Escape', preventDefault() {} }); assert.equal(cleared, 2);
});
test('Keeping a memory confirms beside the originating control and offers a focused jump to that memory', async () => {
  const source = await fs.readFile(new URL('../../report/report.js', new URL('../src/', import.meta.url)), 'utf8');
  let inserted: any, jump: () => void = () => {}, targetId = '', focused = false;
  const node = () => ({ children: [] as any[], append(...items: any[]) { this.children.push(...items); }, focus() {}, scrollIntoView() {} });
  const scope: Record<string, any> = { el(_tag: string, text: string, attrs: any) { return { ...node(), text, attrs }; }, button(_text: string, fn: () => void) { jump = fn; return node(); },
    memoryOrigin: { isConnected: true, insertAdjacentElement(where: string, n: any) { assert.equal(where, 'afterend'); inserted = n; } },
    document: { querySelectorAll() { return []; }, getElementById(id: string) { targetId = id; return { scrollIntoView() {}, focus() { focused = true; } }; } } };
  vm.runInNewContext(source.slice(source.indexOf('function confirmMemory('), source.indexOf('function localMidnight(')), scope);
  scope.confirmMemory('synthetic'); assert.equal(inserted.attrs.role, 'status'); assert.match(inserted.children[0].text, /Save annotations/);
  jump(); assert.equal(targetId, 'memory-synthetic'); assert.equal(focused, true);
});
test('Evidence translates the exact fraction ratio into a qualified plain-language share comparison', async () => {
  const source = await fs.readFile(new URL('../../report/report.js', new URL('../src/', import.meta.url)), 'utf8');
  const scope: Record<string, any> = {}; vm.runInNewContext(source.slice(source.indexOf('function rateDescription('), source.indexOf('function folderDetail(')), scope);
  assert.match(scope.rateDescription(0.0253, 0.0090), /About 3 times the usual share/);
  assert.match(scope.rateDescription(1, 0), /not enough information/); assert.match(scope.rateDescription(NaN, 1), /not enough information/);
});
