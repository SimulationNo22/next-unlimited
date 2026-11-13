// Alternative ohne Overpass-Server: liest einen Geofabrik-Deutschland-Extrakt,
// der vorher mit osmium auf Autobahnen gefiltert und als OPL-Text ausgegeben wurde.
//   osmium tags-filter germany-latest.osm.pbf w/highway=motorway,motorway_link -o mw.pbf
//   osmium cat mw.pbf -f opl,add_metadata=false -o mw.opl
//   node scripts/build-data-pbf.mjs mw.opl
import fs from 'node:fs';
import readline from 'node:readline';
import { compact, writeOut, KEEP } from './build-data.mjs';

const dec = (s) => s.replace(/%([0-9a-fA-F]+)%/g, (_, h) => String.fromCodePoint(parseInt(h, 16)));
function tags(field) {
  const t = {};
  if (!field) return t;
  for (const kv of field.split(',')) {
    const i = kv.indexOf('=');
    if (i > 0) t[dec(kv.slice(0, i))] = dec(kv.slice(i + 1));
  }
  return t;
}

export async function readOpl(file) {
  const nodes = new Map(), ways = new Map(), names = new Map();
  const rl = readline.createInterface({ input: fs.createReadStream(file), crlfDelay: Infinity });
  for await (const line of rl) {
    if (!line) continue;
    const parts = line.split(' ');
    const type = parts[0][0], id = Number(parts[0].slice(1));
    let T = '', x, y, N = '';
    for (const p of parts.slice(1)) {
      const c = p[0], v = p.slice(1);
      if (c === 'T') T = v; else if (c === 'x') x = Number(v); else if (c === 'y') y = Number(v); else if (c === 'N') N = v;
    }
    if (type === 'n') {
      if (x !== undefined && !isNaN(x)) nodes.set(id, [y, x]);
      const t = tags(T);
      if (t.highway === 'motorway_junction' && t.name) names.set(id, t.name);
    } else if (type === 'w') {
      const t = tags(T), tg = {};
      for (const k of KEEP) if (t[k] !== undefined) tg[k] = t[k];
      if (tg.highway !== 'motorway' && tg.highway !== 'motorway_link') continue;
      ways.set(id, { t: tg, n: N.split(',').map((s) => Number(s.slice(1))) });
    }
  }
  return { nodes, ways, names };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { nodes, ways, names } = await readOpl(process.argv[2]);
  const { data, stats } = compact(nodes, ways, names);
  writeOut(data, stats);
}
