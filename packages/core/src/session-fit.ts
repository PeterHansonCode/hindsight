export interface Gaussian { mean: number; sigma: number; weight: number }
const LOG2PI = Math.log(2 * Math.PI);
const logDensity = (x: number, c: Gaussian) => Math.log(c.weight) - Math.log(c.sigma) - LOG2PI / 2 - (x - c.mean) ** 2 / (2 * c.sigma ** 2);
export const componentDensity = (x: number, c: Gaussian) => Math.exp(logDensity(x, c));
const logAdd = (a: number, b: number) => { const m = Math.max(a, b); return m + Math.log(Math.exp(a - m) + Math.exp(b - m)); };
function em(xs: number[], pair: number[]) {
  let components: Gaussian[] = pair.map(mean => ({ mean: Math.log10(mean), sigma: 1, weight: 0.5 }));
  let previous = -Infinity, likelihood = -Infinity;
  for (let iteration = 0; iteration <= 200; iteration++) {
    likelihood = 0; const weights = [0, 0], sums = [0, 0], squares = [0, 0];
    for (const x of xs) {
      const logs = components.map(c => logDensity(x, c)), total = logAdd(logs[0], logs[1]); likelihood += total;
      for (let k = 0; k < 2; k++) { const r = Math.exp(logs[k] - total); weights[k] += r; sums[k] += r * x; squares[k] += r * x * x; }
    }
    if (!Number.isFinite(likelihood) || weights.some(w => w <= 0)) return { converged: false, iteration, likelihood, components };
    if (iteration > 0 && Math.abs(likelihood - previous) <= 1e-6 * Math.max(1, Math.abs(previous))) return { converged: true, iteration, likelihood, components: components.sort((a, b) => a.mean - b.mean) };
    if (iteration === 200) return { converged: false, iteration, likelihood, components };
    previous = likelihood;
    components = weights.map((weight, k) => { const mean = sums[k] / weight; return { mean, sigma: Math.max(0.1, Math.sqrt(Math.max(0, squares[k] / weight - mean * mean))), weight: weight / xs.length }; });
  }
  throw new Error('Unreachable fit state.');
}
export function componentCrossings(a: Gaussian, b: Gaussian) {
  const A = 1 / (2 * b.sigma ** 2) - 1 / (2 * a.sigma ** 2);
  const B = a.mean / a.sigma ** 2 - b.mean / b.sigma ** 2;
  const C = Math.log(a.weight / a.sigma) - Math.log(b.weight / b.sigma) - a.mean ** 2 / (2 * a.sigma ** 2) + b.mean ** 2 / (2 * b.sigma ** 2);
  let roots: number[] = [];
  if (Math.abs(A) < 1e-12) { if (Math.abs(B) > 1e-12) roots = [-C / B]; }
  else { const d = B * B - 4 * A * C; if (d >= 0) roots = [(-B - Math.sqrt(d)) / (2 * A), (-B + Math.sqrt(d)) / (2 * A)]; }
  return [...new Set(roots)].filter(x => Number.isFinite(x) && x > a.mean && x < b.mean).sort((x, y) => x - y);
}
export function mixtureExtrema(components: Gaussian[]) {
  const derivative = (x: number) => components.reduce((v, c) => v - (x - c.mean) / c.sigma ** 2 * componentDensity(x, c), 0);
  const lo = Math.min(...components.map(c => c.mean - 6 * c.sigma)), hi = Math.max(...components.map(c => c.mean + 6 * c.sigma));
  const roots: { x: number; type: 'mode' | 'valley' }[] = [];
  for (let i = 1; i <= 8192; i++) {
    let a = lo + (hi - lo) * (i - 1) / 8192, b = lo + (hi - lo) * i / 8192;
    const da = derivative(a), db = derivative(b);
    if (da === 0 || da * db > 0 || da === db) continue;
    for (let j = 0; j < 50; j++) { const mid = (a + b) / 2; if (derivative(mid) * da > 0) a = mid; else b = mid; }
    roots.push({ x: (a + b) / 2, type: da > 0 ? 'mode' : 'valley' });
  }
  return roots;
}
export function countSessions(timestamps: readonly number[], seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) throw new Error('Invalid session threshold.');
  const ts = [...timestamps].sort((a, b) => a - b); return ts.filter((t, i) => i === 0 || t - ts[i - 1] > seconds * 1000).length;
}
export function fitSessions(timestamps: readonly number[]) {
  if (timestamps.some(t => !Number.isFinite(t))) throw new Error('Invalid session timestamps.');
  const ts = [...timestamps].sort((a, b) => a - b), xs: number[] = []; let ties = 0;
  for (let i = 1; i < ts.length; i++) { const gap = (ts[i] - ts[i - 1]) / 1000; if (gap > 0) xs.push(Math.log10(gap)); else ties++; }
  const width = 0.25, min = xs.length ? Math.floor(Math.min(...xs) / width) * width : 0, max = xs.length ? Math.floor(Math.max(...xs) / width) * width + width : 1;
  const histogram = Array.from({ length: Math.round((max - min) / width) }, (_, i) => ({ startLog10Seconds: min + i * width, endLog10Seconds: min + (i + 1) * width, count: 0 }));
  for (const x of xs) histogram[Math.min(histogram.length - 1, Math.floor((x - min) / width))].count++;
  const starts = xs.length ? [[60, 86400], [300, 43200], [1800, 259200]].map(pair => ({ initialSeconds: pair, ...em(xs, pair) })) : [];
  const best = starts.filter(s => s.converged).sort((a, b) => b.likelihood - a.likelihood)[0] ?? null;
  const crossings = best ? componentCrossings(best.components[0], best.components[1]) : [];
  const extrema = best ? mixtureExtrema(best.components) : [];
  const crossingSeconds = crossings.length === 1 ? 10 ** crossings[0] : null;
  const reasons: string[] = [];
  if (xs.length < 100) reasons.push('Fewer than 100 positive gaps.');
  if (!best) reasons.push('No initialisation converged.');
  if (best?.components.some(c => c.weight * xs.length < 20)) reasons.push('Fewer than 20 effective gaps in a component.');
  if (crossings.length !== 1) reasons.push('No unique weighted-component crossing between the means.');
  if (extrema.map(e => e.type).join(',') !== 'mode,valley,mode') reasons.push('The fitted mixture does not have two modes separated by a valley.');
  if (crossingSeconds === null || crossingSeconds < 60 || crossingSeconds > 86400) reasons.push('Crossing is outside one minute to 24 hours or unavailable.');
  return { positiveGaps: xs.length, tiedGaps: ties, longestGapSeconds: xs.length ? 10 ** Math.max(...xs) : null, histogram, starts, best, extrema, crossingSeconds,
    numericalChecksPass: reasons.length === 0, reasons,
    // Numerical acceptance is provisional until the plot is reviewed. Callers must explicitly accept it.
    proposedSeconds: reasons.length === 0 ? crossingSeconds! : 3600,
    basis: reasons.length === 0 ? 'Derived candidate; plot review required' : '60-minute fallback convention; a stable split was not established',
    sensitivity: [15, 30, 60].map(minutes => ({ seconds: minutes * 60, sessions: countSessions(ts, minutes * 60) })),
    candidateSessions: crossingSeconds === null ? null : countSessions(ts, crossingSeconds) };
}
export function sessionFitSvg(fit: ReturnType<typeof fitSessions>, channel: 'saved' | 'liked' | 'combined', reviewed = false) {
  const bins = fit.histogram, lo = bins[0].startLog10Seconds, hi = bins.at(-1)!.endLog10Seconds;
  const density = (x: number, c: Gaussian) => componentDensity(x, c) * fit.positiveGaps * 0.25;
  const cs = fit.best?.components ?? [], samples = Array.from({ length: 801 }, (_, i) => lo + (hi - lo) * i / 800);
  const maximum = Math.max(1, ...bins.map(b => b.count), ...samples.map(x => cs.reduce((n, c) => n + density(x, c), 0))) * 1.1;
  const X = (x: number) => 80 + (x - lo) / (hi - lo) * 840, Y = (y: number) => 500 - y / maximum * 400;
  const curves = [...cs.map(c => (x: number) => density(x, c)), (x: number) => cs.reduce((n, c) => n + density(x, c), 0)];
  const colours = ['#1976d2', '#d35400', '#202020'];
  const line = (seconds: number, colour: string, label: string, y: number) => `<line x1="${X(Math.log10(seconds))}" x2="${X(Math.log10(seconds))}" y1="100" y2="500" stroke="${colour}" stroke-dasharray="5 4"/><text x="${X(Math.log10(seconds)) + 5}" y="${y}" fill="${colour}">${label}</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="640" viewBox="0 0 1000 640"><rect width="1000" height="640" fill="white"/><g font-family="Arial, sans-serif" font-size="13"><text x="60" y="30" font-size="21">${channel}: positive inter-action gaps</text><text x="60" y="54">${fit.positiveGaps} positive gaps; ${fit.tiedGaps} ties excluded from logarithms; all long gaps retained</text><text x="60" y="76">${fit.numericalChecksPass ? reviewed ? 'Numerical fit and plot reviewed; crossing selected' : 'Numerical fit passes; visual review required' : 'Numerical fit rejected; 60-minute fallback'}</text>${bins.map(b => `<rect x="${X(b.startLog10Seconds)}" y="${Y(b.count)}" width="${X(b.endLog10Seconds) - X(b.startLog10Seconds) - 1}" height="${500 - Y(b.count)}" fill="#d4d9df"/>`).join('')}${curves.map((f, i) => `<path d="${samples.map((x, j) => `${j ? 'L' : 'M'}${X(x).toFixed(2)},${Y(f(x)).toFixed(2)}`).join(' ')}" fill="none" stroke="${colours[i]}" stroke-width="2"/>`).join('')}${fit.crossingSeconds ? line(fit.crossingSeconds, '#8431a8', `crossing ${(fit.crossingSeconds / 60).toFixed(2)} min`, 116) : ''}${fit.extrema.filter(e => e.type === 'valley').map(e => line(10 ** e.x, '#28724f', `valley ${(10 ** e.x / 60).toFixed(2)} min`, 140)).join('')}${!fit.numericalChecksPass ? line(3600, '#b32121', 'selected: fallback 60 min', 162) : ''}<line x1="80" x2="920" y1="500" y2="500" stroke="black"/>${Array.from({ length: Math.floor(hi) - Math.ceil(lo) + 1 }, (_, i) => Math.ceil(lo) + i).map(x => `<text x="${X(x)}" y="522" text-anchor="middle">${x}</text>`).join('')}${[0, 0.25, 0.5, 0.75, 1].map(f => `<text x="70" y="${Y(maximum * f) + 4}" text-anchor="end">${Math.round(maximum * f)}</text>`).join('')}<text x="500" y="550" text-anchor="middle">log10(gap in seconds); bin width 0.25</text><text x="60" y="578">Blue: short-gap component • Orange: long-gap component • Black: mixture</text><text x="60" y="603">Curves scaled to expected bin counts. Action groups are not measured viewing sessions.</text></g></svg>`;
}
