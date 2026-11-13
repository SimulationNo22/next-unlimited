// Vergleicht zwei Datensätze (z. B. Overpass vs. Geofabrik) und gibt eine Zusammenfassung aus.
// node scripts/compare-data.mjs alt.json neu.json
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const E = require('../app/engine.js');
const [A, B] = process.argv.slice(2).map((f) => new E.Graph(JSON.parse(fs.readFileSync(f, 'utf8'))));
const day = new Date(2026, 10, 13, 14, 0);

// Raster der Knoten von B, um zu prüfen, ob eine Strecke aus A auch in B vorkommt
const cell = (la, lo) => Math.floor(la / 0.002) * 1e6 + Math.floor(lo / 0.002);
function gridOf(g) { const m = new Set(); for (let e = 0; e < g.E; e++) { const steps = Math.max(1, Math.ceil(g.len[e] / 100)); const a = g.from[e], b = g.to[e];
  for (let s = 0; s <= steps; s++) { const f = s / steps; m.add(cell(g.lat[a] + (g.lat[b] - g.lat[a]) * f, g.lon[a] + (g.lon[b] - g.lon[a]) * f)); } } return m; }
function near(grid, la, lo) { const c0 = cell(la, lo); for (const d of [0, 1, -1, 1e6, -1e6, 1e6 + 1, 1e6 - 1, -1e6 + 1, -1e6 - 1]) if (grid.has(c0 + d)) return true; return false; }
function stats(g, other) {
  const og = gridOf(other); const r = { km: 0, unl: 0, onlyHere: 0, onlyHereUnl: 0, onlyBoxes: {} };
  for (let e = 0; e < g.E; e++) { if (g.kind(e) !== 'm') continue; const L = g.len[e] / 1000; r.km += L; const u = g.lim[e] === 0; if (u) r.unl += L;
    const a = g.from[e], b = g.to[e], la = (g.lat[a] + g.lat[b]) / 2, lo = (g.lon[a] + g.lon[b]) / 2;
    if (!near(og, la, lo)) { r.onlyHere += L; if (u) r.onlyHereUnl += L; const k = la.toFixed(0) + '/' + lo.toFixed(0); r.onlyBoxes[k] = (r.onlyBoxes[k] || 0) + L; } }
  for (const k of Object.keys(r)) if (typeof r[k] === 'number') r[k] = Math.round(r[k]);
  r.onlyBoxes = Object.entries(r.onlyBoxes).sort((x, y) => y[1] - x[1]).slice(0, 12).map(([k, v]) => k + ':' + Math.round(v));
  return r;
}
console.log('A (alt):', JSON.stringify(stats(A, B)));
console.log('B (neu):', JSON.stringify(stats(B, A)));
// Stichproben: dieselben Stellen in beiden Datensätzen auswerten
const pts = [];
for (let e = 0; e < A.E && pts.length < 400; e += 331) { if (A.kind(e) !== 'm') continue; const a = A.from[e], b = A.to[e];
  const la = (A.lat[a] + A.lat[b]) / 2, lo = (A.lon[a] + A.lon[b]) / 2; if (la < 47.4 || la > 54.8 || lo < 6.2 || lo > 14.8) continue; pts.push([la, lo, A.brg[e]]); }
let same = 0, diff = 0, missing = 0; const ex = [];
for (const [la, lo, h] of pts) {
  const ra = A.evaluate({ lat: la, lon: lo, heading: h, acc: 10, date: day }), rb = B.evaluate({ lat: la, lon: lo, heading: h, acc: 10, date: day });
  if (!rb.onMotorway) { missing++; continue; }
  const da = ra.inUnl ? 'U' + Math.round((ra.unlRemaining || 0) / 1000) : (ra.main ? Math.round(ra.main.dist / 1000) : '-');
  const db = rb.inUnl ? 'U' + Math.round((rb.unlRemaining || 0) / 1000) : (rb.main ? Math.round(rb.main.dist / 1000) : '-');
  if (da === db || (typeof da === 'number' && typeof db === 'number' && Math.abs(da - db) <= 1)) same++; else { diff++; if (ex.length < 8) ex.push([la.toFixed(3), lo.toFixed(3), ra.ref, da, db]); }
}
console.log(`Stichproben: ${pts.length}, gleich: ${same}, abweichend: ${diff}, in B nicht gefunden: ${missing}`);
console.log('Abweichungen (lat, lon, Autobahn, alt, neu):', JSON.stringify(ex));
