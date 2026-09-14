import assert from 'node:assert/strict';
import test from 'node:test';
import { fitSessions, componentCrossings, mixtureExtrema, countSessions } from '../src/session-fit.ts';

test('Weighted Gaussian crossing and mixture valley are distinct quantities, with an analytic equal-variance check', () => {
  const a = { mean: 2, sigma: 0.4, weight: 0.5 }, b = { mean: 4, sigma: 0.4, weight: 0.5 };
  assert.deepEqual(componentCrossings(a, b), [3]);
  assert.deepEqual(mixtureExtrema([a, b]).map(e => e.type), ['mode', 'valley', 'mode']);
  assert.ok(Math.abs(mixtureExtrema([a, b])[1].x - 3) < 1e-10);
  assert.equal(mixtureExtrema([a, { ...b, mean: 2.1 }]).filter(e => e.type === 'valley').length, 0);
});
test('Session EM recovers a deterministic separated synthetic mixture without trimming long gaps', () => {
  let seed = 41; const rand = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return (seed + 0.5) / 4294967296; };
  let t = 0; const ts = [t];
  for (let i = 0; i < 1000; i++) { const z = Math.sqrt(-2 * Math.log(rand())) * Math.cos(2 * Math.PI * rand()); t += 1000 * 10 ** ((i % 2 ? 4.5 : 2) + 0.3 * z); ts.push(t); }
  const f = fitSessions(ts); assert.equal(f.numericalChecksPass, true); assert.equal(f.starts.length, 3); assert.ok(Math.abs(f.best!.components[0].mean - 2) < 0.05); assert.ok(Math.abs(f.best!.components[1].mean - 4.5) < 0.05); assert.equal(f.histogram.reduce((n, b) => n + b.count, 0), 1000);
  assert.deepEqual(fitSessions(ts), f);
});
test('Session unsupported/unimodal fits use the declared fallback; ties and equality remain together', () => {
  assert.equal(fitSessions([]).proposedSeconds, 3600);
  const f = fitSessions(Array.from({ length: 150 }, (_, i) => i * 60_000)); assert.equal(f.numericalChecksPass, false); assert.equal(f.proposedSeconds, 3600);
  assert.equal(countSessions([0, 0, 3600000, 7200000, 10800001], 3600), 2); assert.equal(fitSessions([0, 0, 3600000]).tiedGaps, 1);
});
