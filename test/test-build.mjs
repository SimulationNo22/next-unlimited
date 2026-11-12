import { build } from '../scripts/build-data.mjs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const E = require('../app/engine.js');
const synth = require('./synthetic.js');
const assert = require('assert');
const osm = synth();
const fakeFetch = async () => ({ ok: true, json: async () => osm });
const { data, stats } = await build(fakeFetch, ['48.7,10.5,49.7,11.5']);
console.log('stats', stats, 'bytes', JSON.stringify(data).length);
const g1 = new E.Graph(E.compactFromOsm(osm, data.bbox));
const g2 = new E.Graph(JSON.parse(JSON.stringify(data)));
const day = new Date(2026, 10, 12, 14, 0);
for (const [la, h] of [[49.58, 180], [49.5, 180], [49.2, 180], [49.55, 0]]) {
  const lo = h === 0 ? 10.9997 : 11.0003;
  const a = g1.evaluate({ lat: la, lon: lo, heading: h, acc: 10, date: day });
  const b = g2.evaluate({ lat: la, lon: lo, heading: h, acc: 10, date: day });
  const f = (r) => [r.onMotorway, r.ref, r.inUnl, r.main && Math.round(r.main.dist), r.ghosts && r.ghosts.map(x => Math.round(x.dist)), r.kreuz && r.kreuz.name, r.unlRemaining && Math.round(r.unlRemaining)];
  console.log(la, JSON.stringify(f(a)), JSON.stringify(f(b)));
  assert.deepStrictEqual(f(a).slice(0, 3), f(b).slice(0, 3));
  if (a.main) assert(Math.abs(a.main.dist - b.main.dist) < 30);
}
console.log('BUILD OK');
