import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { readExplorationSnapshot } from './exploration-command.ts';
import { makeReportModel, type GridRun, type ReportModel } from './report-model.ts';
import type { creatorLifecycles } from './lifecycles.ts';
import { inside, verifySnapshot } from './snapshots.ts';

export function safeEmbeddedJson(value: unknown) { return JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029'); }
export async function reportHtml(model: ReportModel) {
  const css = await fs.readFile(new URL('../../report/report.css', import.meta.url), 'utf8');
  // HTML parsing normalises CRLF before CSP hashing. Hash the bytes the browser executes.
  const js = (await fs.readFile(new URL('../../report/annotations.js', import.meta.url), 'utf8') + '\n' + await fs.readFile(new URL('../../report/report.js', import.meta.url), 'utf8')).replace(/\r\n?/g, '\n');
  const hash = createHash('sha256').update(js).digest('base64');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'sha256-${hash}'; style-src 'unsafe-inline'; img-src data: blob:; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'"><title>HINDSIGHT — your recorded history</title><style>${css}</style></head><body><div id="app"></div><noscript>This local report needs JavaScript enabled to show its interactive evidence. No network connection is required.</noscript><script id="report-data" type="application/json">${safeEmbeddedJson(model)}</script><script id="annotation-data" type="application/json">{"format":"hindsight.annotations","schemaVersion":1,"revision":0,"sensitivity":"personal","events":[]}</script><script>${js}</script></body></html>`;
}
export async function buildReport(snapshot: string, analysis: string, output: string, sourceRoot?: string) {
  const source = await readExplorationSnapshot(snapshot);
  async function read(name: string) { const file = path.join(analysis, name), stat = await fs.lstat(file); if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 32 * 1024 * 1024) throw new Error('Invalid analysis artifact.'); return JSON.parse(await fs.readFile(file, 'utf8')); }
  const provenance = await read('provenance.json'), hash = source.manifest.artifacts.find(a => a.name === 'observations.jsonl')!.sha256;
  if (provenance.observationSha256 !== hash || provenance.snapshotId !== source.manifest.snapshotId || provenance.exportDate !== source.manifest.exportDate || !source.manifest.exportDate) throw new Error('Analysis does not match the selected snapshot.');
  const lifecycles: ReturnType<typeof creatorLifecycles>[] = [];
  for (const channel of ['saved', 'liked', 'combined']) { const l = await read(`lifecycles-${channel}-personal.json`); if (l.config.channel !== channel || l.config.snapshotRefs[0] !== source.manifest.snapshotId || !Array.isArray(l.rows)) throw new Error('Invalid lifecycles.'); lifecycles.push(l); }
  const runs: GridRun[] = [];
  for (let i = 1; i <= 18; i++) { const r = await read(`burst-run-${String(i).padStart(2, '0')}-personal.json`); if (!Array.isArray(r.lanes) || r.lanes.some((l: GridRun['lanes'][number]) => l.collectionRef.snapshotId !== source.manifest.snapshotId)) throw new Error('Invalid burst references.'); runs.push(r); }
  const keys = new Set(runs.map(r => `${r.denominator}/${r.s}/${r.gamma}`));
  if (keys.size !== 18 || !['all-saves', 'filed-saves'].every(d => [1.5, 2, 3].every(s => [0.5, 1, 2].every(g => keys.has(`${d}/${s}/${g}`))))) throw new Error('Incomplete or unexpected sensitivity grid.');
  const collectionIds = new Set(source.bundle.tables.find(t => t.name === 'instagram.collections')!.rows.map(c => String(c.collectionId)));
  for (const run of runs) {
    if (run.lanes.length !== collectionIds.size || new Set(run.lanes.map(l => l.collectionRef.collectionId)).size !== collectionIds.size) throw new Error('Incomplete folder coverage.');
    for (const lane of run.lanes) {
      if (!collectionIds.has(String(lane.collectionRef.collectionId)) || !Array.isArray(lane.weeks) || !Array.isArray(lane.detection.qualifiedBars)) throw new Error('Invalid folder evidence.');
      for (const w of lane.weeks) if (!Number.isFinite(Date.parse(w.week)) || !Number.isSafeInteger(w.numerator) || !Number.isSafeInteger(w.denominator) || w.numerator < 0 || w.denominator < w.numerator || !Array.isArray(w.timestamps) || w.timestamps.length !== w.numerator) throw new Error('Invalid weekly counts.');
      for (const b of lane.detection.qualifiedBars) {
        const weeks = lane.weeks.filter(w => w.week >= b.startWeek && w.week <= b.endWeek);
        if (![1, 2, 3].includes(b.level) || !weeks.length || weeks.some(w => w.status !== 'assessed' || w.denominator === 0) || b.observations !== weeks.reduce((n, w) => n + w.numerator, 0) || b.observations < 2 || b.activeDays < 2) throw new Error('Invalid qualifying interval.');
      }
    }
  }
  const model = makeReportModel(source.events, lifecycles, runs, { snapshotId: source.manifest.snapshotId, exportDate: source.manifest.exportDate, observationSha256: hash, parseStatus: source.manifest.parseStatus });
  const html = await reportHtml(model), parent = await fs.realpath(path.dirname(path.resolve(output))), destination = path.join(parent, path.basename(output));
  const repository = await fs.realpath(new URL('../../../', import.meta.url));
  for (const root of [snapshot, analysis, repository, ...(sourceRoot ? [sourceRoot] : [])]) if (inside(await fs.realpath(root), destination)) throw new Error('Choose a new output file outside source, analysis and repository.');
  if (JSON.stringify(await verifySnapshot(snapshot)) !== JSON.stringify(source.manifest)) throw new Error('Snapshot changed during report preparation.');
  await fs.writeFile(destination, html, { flag: 'wx', mode: 0o600 });
  return { observations: model.observations, tiers: model.tiers, bytes: Buffer.byteLength(html), output: destination };
}
