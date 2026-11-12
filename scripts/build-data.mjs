// Baut den Deutschland-Datensatz für Next Unlimited aus OpenStreetMap (Overpass).
// Läuft automatisch bei GitHub (siehe .github/workflows/data.yml), z. B. einmal pro Woche.
// Ergebnis: app/data/de.json (kompakter Graph) + app/data/version.json
import fs from 'node:fs';
import path from 'node:path';

const OUT_DIR = process.env.OUT_DIR || 'app/data';
const ENDPOINTS = (process.env.OVERPASS || 'https://overpass-api.de/api/interpreter,https://overpass.private.coffee/api/interpreter').split(',');
const UA = 'NextUnlimited-DataBuild/1.0 (weekly build of German motorway speed limits; contact via GitHub)';
const KEEP = ['highway', 'ref', 'oneway', 'maxspeed', 'maxspeed:forward', 'maxspeed:backward', 'maxspeed:conditional',
  'maxspeed:forward:conditional', 'maxspeed:backward:conditional', 'maxspeed:variable', 'destination', 'destination:ref'];
const BBOX = { s: 47.2, w: 5.8, n: 55.1, e: 15.1 };      // Deutschland (mit etwas Rand)
const STEP_LAT = 1.4, STEP_LON = 2.35;                     // ~24 Kacheln
const TOL_M = 5;                                           // Vereinfachung: max. 5 m Abweichung

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function query(bb) {
  return '[out:json][timeout:240];(way["highway"~"^(motorway|motorway_link)$"](' + bb + ');)->.w;' +
    '.w out body qt;node(w.w)->.n;.n out skel qt;node.n["highway"="motorway_junction"];out tags qt;';
}

async function fetchTile(bb, fetchImpl) {
  let lastErr;
  for (let attempt = 0; attempt < 4; attempt++) {
    const url = ENDPOINTS[attempt % ENDPOINTS.length];
    try {
      const r = await fetchImpl(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': UA, 'Accept': '*/*' },
        body: 'data=' + encodeURIComponent(query(bb)),
        signal: AbortSignal.timeout(300000)
      });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const j = await r.json();
      if (j.remark && /error|timed out|out of memory/i.test(j.remark)) throw new Error('remark: ' + j.remark.slice(0, 120));
      return j;
    } catch (e) {
      lastErr = e;
      console.log(`  Kachel ${bb}: Versuch ${attempt + 1} fehlgeschlagen (${e.message}) – warte 60 s`);
      await sleep(60000);
    }
  }
  throw new Error('Kachel ' + bb + ' fehlgeschlagen: ' + lastErr.message);
}

// Douglas-Peucker auf lokalen Metern
function simplify(idxs, lat, lon, keep) {
  if (idxs.length <= 2) return idxs;
  const out = [];
  let start = 0;
  for (let i = 1; i < idxs.length; i++) {
    if (i === idxs.length - 1 || keep.has(idxs[i])) { dp(start, i); start = i; }
  }
  out.push(idxs[idxs.length - 1]);
  return out;
  function dp(a, b) {
    const stack = [[a, b]], marks = new Set([a]);
    while (stack.length) {
      const [s, e] = stack.pop();
      const la0 = lat[idxs[s]], lo0 = lon[idxs[s]], kx = Math.cos(la0 * Math.PI / 180) * 111320, ky = 110540;
      const bx = (lon[idxs[e]] - lo0) * kx, by = (lat[idxs[e]] - la0) * ky, L2 = bx * bx + by * by;
      let maxD = -1, maxI = -1;
      for (let i = s + 1; i < e; i++) {
        const px = (lon[idxs[i]] - lo0) * kx, py = (lat[idxs[i]] - la0) * ky;
        let t = L2 ? (px * bx + py * by) / L2 : 0; t = Math.max(0, Math.min(1, t));
        const dx = px - t * bx, dy = py - t * by, d = Math.sqrt(dx * dx + dy * dy);
        if (d > maxD) { maxD = d; maxI = i; }
      }
      if (maxD > TOL_M) { marks.add(maxI); stack.push([s, maxI], [maxI, e]); }
    }
    [...marks].sort((x, y) => x - y).forEach((i) => out.push(idxs[i]));
  }
}

export async function build(fetchImpl = fetch, tiles = null) {
  const nodes = new Map(), ways = new Map(), names = new Map();
  if (!tiles) {
    tiles = [];
    for (let la = BBOX.s; la < BBOX.n; la += STEP_LAT)
      for (let lo = BBOX.w; lo < BBOX.e; lo += STEP_LON)
        tiles.push([la, lo, Math.min(la + STEP_LAT, BBOX.n), Math.min(lo + STEP_LON, BBOX.e)].map((x) => x.toFixed(2)).join(','));
  }
  for (let i = 0; i < tiles.length; i++) {
    const t0 = Date.now();
    const j = await fetchTile(tiles[i], fetchImpl);
    for (const el of j.elements) {
      if (el.type === 'node') {
        if (el.lat !== undefined) nodes.set(el.id, [el.lat, el.lon]);
        if (el.tags && el.tags.name) names.set(el.id, el.tags.name);
      } else if (el.type === 'way' && el.nodes) {
        const tg = {};
        for (const k of KEEP) if (el.tags && el.tags[k] !== undefined) tg[k] = el.tags[k];
        ways.set(el.id, { t: tg, n: el.nodes });
      }
    }
    console.log(`Kachel ${i + 1}/${tiles.length} ${tiles[i]}: ${j.elements.length} Elemente, ${((Date.now() - t0) / 1000).toFixed(0)} s`);
    if (i < tiles.length - 1 && fetchImpl === fetch) await sleep(10000); // Server schonen
  }

  // Knoten-Indizes, Knoten die mehrfach vorkommen (Verknüpfungen) bleiben immer erhalten
  const use = new Map();
  for (const w of ways.values()) for (const id of w.n) use.set(id, (use.get(id) || 0) + 1);
  const idOf = [], lat = [], lon = [], index = new Map();
  for (const [id, c] of nodes) { index.set(id, lat.length); idOf.push(id); lat.push(c[0]); lon.push(c[1]); }
  const keep = new Set();
  for (const [id, n] of use) if (n > 1 || names.has(id)) { const k = index.get(id); if (k !== undefined) keep.add(k); }
  for (const w of ways.values()) { const a = index.get(w.n[0]), b = index.get(w.n[w.n.length - 1]); if (a !== undefined) keep.add(a); if (b !== undefined) keep.add(b); }

  const outWays = [];
  const usedNodes = new Set();
  for (const w of ways.values()) {
    const idxs = w.n.map((id) => index.get(id)).filter((x) => x !== undefined);
    if (idxs.length < 2) continue;
    const simp = simplify(idxs, lat, lon, keep);
    simp.forEach((k) => usedNodes.add(k));
    const t = w.t, o = { k: t.highway === 'motorway' ? 'm' : 'l', n: simp };
    const map = { r: 'ref', ow: 'oneway', ms: 'maxspeed', msf: 'maxspeed:forward', msb: 'maxspeed:backward', c: 'maxspeed:conditional',
      cf: 'maxspeed:forward:conditional', cb: 'maxspeed:backward:conditional', v: 'maxspeed:variable', d: 'destination', dr: 'destination:ref' };
    for (const [short, long] of Object.entries(map)) if (t[long]) o[short] = t[long];
    outWays.push(o);
  }
  // Nur benutzte Knoten behalten, neu durchnummerieren
  const remap = new Map(), L = [], O = [], N = {};
  [...usedNodes].sort((a, b) => a - b).forEach((k) => {
    remap.set(k, L.length);
    L.push(+lat[k].toFixed(5)); O.push(+lon[k].toFixed(5));
    const nm = names.get(idOf[k]); if (nm) N[L.length - 1] = nm;
  });
  for (const w of outWays) w.n = w.n.map((k) => remap.get(k));

  const version = new Date().toISOString();
  return {
    data: { v: 1, version, bbox: BBOX, center: { lat: (BBOX.s + BBOX.n) / 2, lon: (BBOX.w + BBOX.e) / 2 }, lat: L, lon: O, names: N, ways: outWays },
    stats: { rawNodes: nodes.size, nodes: L.length, ways: outWays.length }
  };
}

async function main() {
  const { data, stats } = await build();
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const prevPath = path.join(OUT_DIR, 'version.json');
  if (fs.existsSync(prevPath)) {
    const prev = JSON.parse(fs.readFileSync(prevPath, 'utf8'));
    if (prev.ways && stats.ways < prev.ways * 0.8) {
      throw new Error(`Nur ${stats.ways} statt ~${prev.ways} Abschnitte – unvollständig, alter Stand bleibt.`);
    }
  }
  const json = JSON.stringify(data);
  fs.writeFileSync(path.join(OUT_DIR, 'de.json'), json);
  fs.writeFileSync(prevPath, JSON.stringify({ version: data.version, ways: stats.ways, nodes: stats.nodes, bytes: json.length }, null, 1));
  console.log('Fertig:', stats, (json.length / 1e6).toFixed(1) + ' MB');
}

if (import.meta.url === `file://${process.argv[1]}`) main().catch((e) => { console.error(e); process.exit(1); });
