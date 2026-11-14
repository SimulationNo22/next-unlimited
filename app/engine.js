/* Next Unlimited – Routing-Engine
 * Lädt Autobahn-Daten (OpenStreetMap / Overpass), baut einen gerichteten Graphen
 * und findet den nächsten Abschnitt ohne Tempolimit in Fahrtrichtung.
 * Läuft im Browser und (für Tests) in Node.
 */
(function (root) {
  'use strict';

  var R = 6371008.8;
  var D2R = Math.PI / 180;

  // ---------- Geometrie ----------
  function dist(lat1, lon1, lat2, lon2) {
    var p1 = lat1 * D2R, p2 = lat2 * D2R;
    var dp = p2 - p1, dl = (lon2 - lon1) * D2R;
    var a = Math.sin(dp / 2) * Math.sin(dp / 2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2);
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
  }
  function bearing(lat1, lon1, lat2, lon2) {
    var p1 = lat1 * D2R, p2 = lat2 * D2R, dl = (lon2 - lon1) * D2R;
    var y = Math.sin(dl) * Math.cos(p2);
    var x = Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl);
    return (Math.atan2(y, x) / D2R + 360) % 360;
  }
  function angDiff(a, b) { // signed b - a in (-180, 180]
    var d = ((b - a) % 360 + 540) % 360 - 180;
    return d === -180 ? 180 : d;
  }

  // ---------- Tempolimit-Auswertung ----------
  var DAYS = ['su', 'mo', 'tu', 'we', 'th', 'fr', 'sa'];
  function parseTimeRanges(s) {
    // "Mo-Fr 06:00-20:00" / "22:00-06:00" / "06:00-09:00,16:00-19:00"
    var m = s.trim().match(/^(?:([A-Za-z]{2})(?:\s*-\s*([A-Za-z]{2}))?\s+)?((?:\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}\s*,?\s*)+)$/);
    if (!m) return null;
    var days = null;
    if (m[1]) {
      var d1 = DAYS.indexOf(m[1].toLowerCase()), d2 = m[2] ? DAYS.indexOf(m[2].toLowerCase()) : d1;
      if (d1 < 0 || d2 < 0) return null;
      days = [];
      for (var i = d1; ; i = (i + 1) % 7) { days.push(i); if (i === d2) break; }
    }
    var ranges = [];
    m[3].split(',').forEach(function (r) {
      var t = r.trim().match(/^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/);
      if (t) ranges.push([+t[1] * 60 + +t[2], +t[3] * 60 + +t[4]]);
    });
    if (!ranges.length) return null;
    return { days: days, ranges: ranges };
  }
  function timeActive(tr, date) {
    var mins = date.getHours() * 60 + date.getMinutes();
    var day = date.getDay();
    for (var i = 0; i < tr.ranges.length; i++) {
      var a = tr.ranges[i][0], b = tr.ranges[i][1];
      if (a <= b) {
        if (mins >= a && mins < b && (!tr.days || tr.days.indexOf(day) >= 0)) return true;
      } else { // über Mitternacht
        if (mins >= a && (!tr.days || tr.days.indexOf(day) >= 0)) return true;
        if (mins < b && (!tr.days || tr.days.indexOf((day + 6) % 7) >= 0)) return true;
      }
    }
    return false;
  }
  // Ergebnis: lim = Zahl (km/h), 0 = unbegrenzt, -1 unbekannt, -2 Anzeigetafel; cond = zeitweise/unsicher
  function speedState(ms, cond, variable, date) {
    var lim;
    if (ms === 'none') lim = 0;
    else if (ms === 'signals' || ms === 'variable') lim = -2;
    else if (ms && /^\d+/.test(ms)) lim = parseInt(ms, 10);
    else lim = -1;
    var isCond = !!variable || lim === -2;
    if (cond) {
      isCond = true;
      var parts = cond.split(';');
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i].match(/^\s*([^@]+?)\s*@\s*\(?\s*(.*?)\s*\)?\s*$/);
        if (!p) continue;
        var val = p[1].trim(), c = p[2];
        var tr = parseTimeRanges(c);
        if (tr && timeActive(tr, date)) {
          if (/^\d+/.test(val)) lim = parseInt(val, 10);
          else if (val === 'none') lim = 0;
        }
      }
    }
    return { lim: lim, cond: isCond };
  }

  // ---------- Overpass ----------
  // overpass-api.de lehnt seit 2026 viele Anfragen ab (406/429) – daher zuerst private.coffee
  var ENDPOINTS = [
    'https://overpass.private.coffee/api/interpreter',
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter'
  ];
  function overpassQuery(b) {
    var bb = b.s + ',' + b.w + ',' + b.n + ',' + b.e;
    return '[out:json][timeout:150];' +
      '(way["highway"~"^(motorway|motorway_link)$"](' + bb + ');)->.w;' +
      '.w out body qt;' +
      'node(w.w)->.n;.n out skel qt;' +
      'node.n["highway"="motorway_junction"];out tags qt;';
  }
  function fetchOverpass(bbox, onStatus) {
    var q = overpassQuery(bbox);
    var i = 0, errs = [];
    function attempt() {
      if (i >= ENDPOINTS.length) return Promise.reject(new Error(errs.join(' / ') || 'overpass'));
      var url = ENDPOINTS[i++];
      if (onStatus) onStatus(i, ENDPOINTS.length);
      var ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
      var timer = ctl ? setTimeout(function () { ctl.abort(); }, 170000) : null;
      return fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'data=' + encodeURIComponent(q),
        signal: ctl ? ctl.signal : undefined
      }).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      }).then(function (j) {
        if (timer) clearTimeout(timer);
        if (j.remark && /error|timed out|out of memory/i.test(j.remark)) throw new Error('Server-Zeitlimit');
        return j;
      }).catch(function (e) {
        if (timer) clearTimeout(timer);
        errs.push(e && e.name === 'AbortError' ? 'Zeitüberschreitung' : (e && /HTTP|Zeitlimit/.test(e.message) ? e.message : 'keine Verbindung'));
        return attempt();
      });
    }
    return attempt();
  }

  // ---------- Kompakte Region (cachebar) ----------
  function refTokens(ref) {
    if (!ref) return [];
    return ref.split(';').map(function (s) { return s.replace(/\s+/g, '').toUpperCase(); }).filter(Boolean);
  }

  function compactFromOsm(osm, bbox) {
    var idx = new Map(), lat = [], lon = [], names = {};
    var els = osm.elements || [];
    var ways = [];
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.type === 'node') {
        var k = idx.get(el.id);
        if (k === undefined && el.lat !== undefined) {
          k = lat.length; idx.set(el.id, k); lat.push(+el.lat.toFixed(6)); lon.push(+el.lon.toFixed(6));
        }
        if (el.tags && k !== undefined) {
          var nm = el.tags.name || '';
          if (nm) names[k] = nm;
        }
      }
    }
    for (var j = 0; j < els.length; j++) {
      var w = els[j];
      if (w.type !== 'way' || !w.nodes) continue;
      var t = w.tags || {};
      var n = [];
      for (var q = 0; q < w.nodes.length; q++) {
        var ni = idx.get(w.nodes[q]);
        if (ni !== undefined) n.push(ni);
      }
      if (n.length < 2) continue;
      ways.push({
        k: t.highway === 'motorway' ? 'm' : 'l',
        r: t.ref || '',
        ow: t.oneway || '',
        ms: t.maxspeed || '', msf: t['maxspeed:forward'] || '', msb: t['maxspeed:backward'] || '',
        c: t['maxspeed:conditional'] || '', cf: t['maxspeed:forward:conditional'] || '', cb: t['maxspeed:backward:conditional'] || '',
        v: t['maxspeed:variable'] || '',
        d: t.destination || '', dr: t['destination:ref'] || '',
        n: n
      });
    }
    return {
      v: 1, bbox: bbox, loadedAt: Date.now(),
      center: { lat: (bbox.s + bbox.n) / 2, lon: (bbox.w + bbox.e) / 2 },
      lat: lat, lon: lon, names: names, ways: ways
    };
  }

  // ---------- Graph ----------
  var CELL = 0.005;
  function cellKey(a, b) { return a * 100000 + b; }

  function Graph(c) {
    this.c = c;
    var lat = this.lat = Float64Array.from(c.lat);
    var lon = this.lon = Float64Array.from(c.lon);
    this.names = c.names || {};
    var ways = c.ways;
    var from = [], to = [], wy = [], dir = [];
    for (var i = 0; i < ways.length; i++) {
      var w = ways[i];
      w.refs = refTokens(w.r);
      var fwd = true, bwd = false;
      if (w.ow === 'no' || w.ow === 'false' || w.ow === '0') bwd = true;
      if (w.ow === '-1' || w.ow === 'reverse') { fwd = false; bwd = true; }
      var n = w.n;
      for (var j = 0; j + 1 < n.length; j++) {
        if (n[j] === n[j + 1]) continue;
        if (fwd) { from.push(n[j]); to.push(n[j + 1]); wy.push(i); dir.push(1); }
        if (bwd) { from.push(n[j + 1]); to.push(n[j]); wy.push(i); dir.push(-1); }
      }
    }
    var E = this.E = from.length;
    this.from = Int32Array.from(from); this.to = Int32Array.from(to);
    this.way = Int32Array.from(wy); this.dir = Int8Array.from(dir);
    this.len = new Float32Array(E); this.brg = new Float32Array(E);
    for (var e = 0; e < E; e++) {
      var a = this.from[e], b = this.to[e];
      this.len[e] = dist(lat[a], lon[a], lat[b], lon[b]);
      this.brg[e] = bearing(lat[a], lon[a], lat[b], lon[b]);
    }
    // CSR Adjazenz
    var N = lat.length;
    this.outS = csr(N, this.from, E); this.inS = csr(N, this.to, E);
    // Raster für das Einrasten
    var grid = this.grid = new Map();
    for (e = 0; e < E; e++) {
      var la1 = lat[this.from[e]], lo1 = lon[this.from[e]], la2 = lat[this.to[e]], lo2 = lon[this.to[e]];
      var a0 = Math.floor(Math.min(la1, la2) / CELL), a1 = Math.floor(Math.max(la1, la2) / CELL);
      var b0 = Math.floor(Math.min(lo1, lo2) / CELL), b1 = Math.floor(Math.max(lo1, lo2) / CELL);
      for (var x = a0; x <= a1; x++) for (var y = b0; y <= b1; y++) {
        var key = cellKey(x, y), arr = grid.get(key);
        if (!arr) grid.set(key, arr = []);
        arr.push(e);
      }
    }
    this.lim = new Int16Array(E); this.cond = new Uint8Array(E);
    this.stateStamp = '';
    this.ghostCache = new Map();
    this.refreshSpeeds(new Date());
  }
  function csr(N, keyArr, E) {
    var start = new Int32Array(N + 1);
    for (var e = 0; e < E; e++) start[keyArr[e] + 1]++;
    for (var i = 0; i < N; i++) start[i + 1] += start[i];
    var pos = start.slice(0, N), list = new Int32Array(E);
    for (e = 0; e < E; e++) list[pos[keyArr[e]]++] = e;
    return { start: start, list: list };
  }

  Graph.prototype.refreshSpeeds = function (date) {
    var stamp = date.getDay() + '-' + date.getHours() + '-' + date.getMinutes();
    if (stamp === this.stateStamp) return;
    this.stateStamp = stamp;
    var ways = this.c.ways, cache = [], changed = false;
    for (var e = 0; e < this.E; e++) {
      var wi = this.way[e], d = this.dir[e], key = wi * 2 + (d > 0 ? 0 : 1);
      var st = cache[key];
      if (!st) {
        var w = ways[wi];
        var ms = (d > 0 ? w.msf : w.msb) || w.ms;
        var cd = (d > 0 ? w.cf : w.cb) || w.c;
        st = cache[key] = speedState(ms, cd, w.v, date);
      }
      if (this.lim[e] !== st.lim) changed = true;
      this.lim[e] = st.lim; this.cond[e] = st.cond ? 1 : 0;
    }
    if (changed || !this.uz) { this.smoothUnl(); this.ghostCache.clear(); }
  };
  // Für die Navigation: kurze Unbegrenzt-Stücke unter 500 m zwischen zwei Limits zählen nicht als
  // Unbegrenzt (kein Ziel, kein Unbegrenzt-Modus). Ein Limit mitten im Unbegrenzten wird dagegen NIE
  // überbrückt – egal wie kurz, es unterbricht den Abschnitt immer. Das angezeigte Limit bleibt unverändert.
  var MIN_RUN = 500;
  Graph.prototype.smoothUnl = function () {
    var E = this.E, lim = this.lim, uz = this.uz || (this.uz = new Uint8Array(E));
    var orig = new Uint8Array(E);
    for (var e = 0; e < E; e++) orig[e] = uz[e] = lim[e] === 0 ? 1 : 0;
    for (e = 0; e < E; e++) {
      var p = this.prev(e);
      if (p < 0 || orig[p] === orig[e]) continue;           // nur am Beginn eines Laufs
      var st = orig[e];
      if (st !== 1) continue;                                  // Limits werden nie überbrückt
      var len = this.len[e], run = [e], g = this.next(e);
      while (g >= 0 && orig[g] === st && len < MIN_RUN && run.length < 300) { run.push(g); len += this.len[g]; g = this.next(g); }
      if (len >= MIN_RUN || g < 0 || orig[g] === st) continue;
      for (var i = 0; i < run.length; i++) uz[run[i]] = 0;
    }
  };
  Graph.prototype.isUnl = function (e) { return this.uz[e] === 1; };
  Graph.prototype.kind = function (e) { return this.c.ways[this.way[e]].k; };
  Graph.prototype.refs = function (e) { return this.c.ways[this.way[e]].refs; };
  function shares(a, b) {
    for (var i = 0; i < a.length; i++) if (b.indexOf(a[i]) >= 0) return true;
    return false;
  }

  // Einrasten: nächste Fahrbahn, deren Richtung zur Fahrtrichtung passt
  Graph.prototype.snap = function (la, lo, heading, acc, prevEdge) {
    if (heading == null) return null;
    var ca = Math.floor(la / CELL), cb = Math.floor(lo / CELL);
    var kx = Math.cos(la * D2R) * 111320, ky = 110540;
    var maxD = Math.max(40, Math.min(acc || 0, 80));
    var best = null, bestScore = Infinity, seen = new Set();
    for (var x = ca - 1; x <= ca + 1; x++) for (var y = cb - 1; y <= cb + 1; y++) {
      var arr = this.grid.get(cellKey(x, y));
      if (!arr) continue;
      for (var i = 0; i < arr.length; i++) {
        var e = arr[i];
        if (seen.has(e)) continue; seen.add(e);
        var dh = Math.abs(angDiff(heading, this.brg[e]));
        if (dh > 60) continue;
        var a = this.from[e], b = this.to[e];
        var ax = (this.lon[a] - lo) * kx, ay = (this.lat[a] - la) * ky;
        var bx = (this.lon[b] - lo) * kx, by = (this.lat[b] - la) * ky;
        var dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy;
        var t = L2 > 0 ? Math.max(0, Math.min(1, -(ax * dx + ay * dy) / L2)) : 0;
        var px = ax + t * dx, py = ay + t * dy;
        var d = Math.sqrt(px * px + py * py);
        if (d > maxD) continue;
        var score = d + 0.6 * dh;
        if (prevEdge != null && (e === prevEdge || this.from[e] === this.to[prevEdge])) score -= 8;
        if (this.kind(e) === 'm') score -= 2;
        if (score < bestScore) { bestScore = score; best = { edge: e, t: t, d: d }; }
      }
    }
    return best;
  };

  // Weiterfahrt "geradeaus" an einem Knoten
  Graph.prototype.next = function (e) {
    var node = this.to[e], s = this.outS.start, l = this.outS.list;
    var kind = this.kind(e), refs = this.refs(e);
    var best = -1, bestScore = Infinity;
    for (var i = s[node]; i < s[node + 1]; i++) {
      var f = l[i];
      if (this.to[f] === this.from[e]) continue; // keine Wende
      var score = Math.abs(angDiff(this.brg[e], this.brg[f]));
      var fk = this.kind(f);
      if (kind === 'm' && fk !== 'm') score += 1000;
      if (refs.length && fk === 'm' && !shares(refs, this.refs(f))) score += 200;
      if (score < bestScore) { bestScore = score; best = f; }
    }
    return best;
  };
  Graph.prototype.prev = function (e) {
    var node = this.from[e], s = this.inS.start, l = this.inS.list;
    var kind = this.kind(e), refs = this.refs(e);
    var best = -1, bestScore = Infinity;
    for (var i = s[node]; i < s[node + 1]; i++) {
      var f = l[i];
      if (this.from[f] === this.to[e]) continue;
      var score = Math.abs(angDiff(this.brg[f], this.brg[e]));
      var fk = this.kind(f);
      if (kind === 'm' && fk !== 'm') score += 1000;
      if (refs.length && fk === 'm' && !shares(refs, this.refs(f))) score += 200;
      if (score < bestScore) { bestScore = score; best = f; }
    }
    return best;
  };

  // Vorausschau entlang der eigenen Autobahn
  Graph.prototype.walkAhead = function (snap, maxDist) {
    maxDist = maxDist || 300000;
    var e = snap.edge;
    var d = this.len[e] * (1 - snap.t);
    var res = {
      inUnl: this.isUnl(e), unlRemaining: 0, unlCond: !!this.cond[e],
      target: null, junctions: [], endOfData: false
    };
    var sectionOpen = res.inUnl;
    if (sectionOpen) res.unlRemaining = d;
    var visited = new Set([e]);
    var refs = this.refs(e);
    for (var guard = 0; guard < 60000; guard++) {
      var node = this.to[e];
      var nx = this.next(e);
      // abgehende Rampen merken (möglicher Kreuz-Abzweig)
      if (d < 25000) {
        var s = this.outS.start, l = this.outS.list, links = [];
        for (var i = s[node]; i < s[node + 1]; i++) {
          var f = l[i];
          if (f !== nx && this.kind(f) === 'l') links.push(f);
        }
        if (links.length) res.junctions.push({ node: node, dist: d, links: links });
      }
      if (nx < 0 || visited.has(nx)) { res.endOfData = nx < 0; break; }
      visited.add(nx);
      if (sectionOpen) {
        if (this.isUnl(nx)) { res.unlRemaining += this.len[nx]; if (this.cond[nx]) res.unlCond = true; }
        else sectionOpen = false;
      } else if (this.isUnl(nx)) {
        var tc = false, acc = 0, g = nx;
        for (var k = 0; k < 400 && g >= 0 && this.isUnl(g) && acc < 3000; k++) {
          if (this.cond[g]) tc = true; acc += this.len[g]; g = this.next(g);
        }
        res.target = { node: node, dist: d, lat: this.lat[node], lon: this.lon[node], cond: tc };
        break;
      }
      d += this.len[nx];
      e = nx;
      if (d > maxDist) break;
    }
    res.refs = refs;
    return res;
  };

  // Bereits gefahrener Teil des aktuellen Unbegrenzt-Abschnitts
  Graph.prototype.walkBack = function (snap) {
    var e = snap.edge, d = this.len[e] * snap.t, visited = new Set([e]);
    for (var guard = 0; guard < 20000; guard++) {
      var p = this.prev(e);
      if (p < 0 || visited.has(p) || !this.isUnl(p)) break;
      visited.add(p); d += this.len[p]; e = p;
      if (d > 300000) break;
    }
    return d;
  };

  // Suche über eine Rampe: wo wäre das nächste Unbegrenzt, wenn ich hier abbiege?
  Graph.prototype.ghost = function (link, mainRefs) {
    if (this.ghostCache.has(link)) return this.ghostCache.get(link);
    var self = this, best = null;
    var distArr = new Map(), entered = new Map();
    var heap = new Heap();
    distArr.set(link, 0); entered.set(link, null); heap.push(0, link);
    var pops = 0;
    while (heap.size && pops < 40000) {
      var top = heap.pop(), dd = top[0], e = top[1];
      pops++;
      if (dd > distArr.get(e)) continue;
      if (dd > 200000) break;
      var ent = entered.get(e);
      if (self.kind(e) === 'm' && self.isUnl(e)) {
        var a = self.from[e];
        best = { node: a, dist: dd, lat: self.lat[a], lon: self.lon[a], ref: ent ? ent.ref : '', enterNode: ent ? ent.node : a };
        break;
      }
      var node = self.to[e], s = self.outS.start, l = self.outS.list, nd = dd + self.len[e];
      for (var i = s[node]; i < s[node + 1]; i++) {
        var f = l[i];
        if (self.to[f] === self.from[e]) continue;
        var fk = self.kind(f);
        if (fk === 'm' && mainRefs.length && shares(mainRefs, self.refs(f))) continue;
        var cur = distArr.get(f);
        if (cur === undefined || nd < cur) {
          distArr.set(f, nd);
          var en = ent;
          if (!en && fk === 'm') en = { ref: (self.refs(f)[0] || ''), node: self.from[f] };
          entered.set(f, en);
          heap.push(nd, f);
        }
      }
    }
    if (best) {
      var w = this.c.ways[this.way[link]];
      best.label = refTokens(w.dr)[0] || best.ref || '';
      best.dest = (w.d || '').split(';')[0];
    }
    this.ghostCache.set(link, best);
    return best;
  };

  function Heap() { this.a = []; this.size = 0; }
  Heap.prototype.push = function (k, v) {
    var a = this.a, i = this.size++;
    a[i] = [k, v];
    while (i > 0) { var p = (i - 1) >> 1; if (a[p][0] <= a[i][0]) break; var t = a[p]; a[p] = a[i]; a[i] = t; i = p; }
  };
  Heap.prototype.pop = function () {
    var a = this.a, top = a[0], last = a[--this.size];
    if (this.size > 0) {
      a[0] = last; var i = 0;
      for (;;) {
        var l = 2 * i + 1, r = l + 1, m = i;
        if (l < this.size && a[l][0] < a[m][0]) m = l;
        if (r < this.size && a[r][0] < a[m][0]) m = r;
        if (m === i) break;
        var t = a[m]; a[m] = a[i]; a[i] = t; i = m;
      }
    }
    a.length = this.size;
    return top;
  };

  // Gesamte Auswertung für eine GPS-Position
  Graph.prototype.evaluate = function (pos, prevEdge) {
    this.refreshSpeeds(pos.date || new Date());
    var sn = this.snap(pos.lat, pos.lon, pos.heading, pos.acc, prevEdge);
    if (!sn) return { onMotorway: false };
    var e = sn.edge;
    var w = this.walkAhead(sn);
    var out = {
      onMotorway: true, edge: e, ref: (this.refs(e)[0] || ''), kind: this.kind(e),
      limit: this.lim[e], limitCond: !!this.cond[e],
      inUnl: w.inUnl, endOfData: w.endOfData
    };
    var snapLat = this.lat[this.from[e]] + (this.lat[this.to[e]] - this.lat[this.from[e]]) * sn.t;
    var snapLon = this.lon[this.from[e]] + (this.lon[this.to[e]] - this.lon[this.from[e]]) * sn.t;
    if (w.inUnl) {
      out.unlRemaining = w.unlRemaining;
      out.unlDriven = this.walkBack(sn);
      out.unlCond = w.unlCond;
    }
    if (w.target) {
      out.main = {
        dist: w.target.dist, lat: w.target.lat, lon: w.target.lon, cond: w.target.cond,
        brg: bearing(snapLat, snapLon, w.target.lat, w.target.lon)
      };
    }
    // Kreuz voraus? -> Ghost-Nadeln
    var ghosts = [], kreuz = null;
    var mainRefs = w.refs;
    for (var j = 0; j < w.junctions.length; j++) {
      var jn = w.junctions[j];
      if (kreuz && jn.dist > kreuz.dist + 2500) break;
      for (var q = 0; q < jn.links.length; q++) {
        var g = this.ghost(jn.links[q], mainRefs);
        if (!g) continue;
        if (!kreuz) kreuz = { dist: jn.dist, node: jn.node, name: this.names[jn.node] || '' };
        if (!kreuz.name && this.names[jn.node]) kreuz.name = this.names[jn.node];
        var total = jn.dist + this.len[jn.links[q]] * 0 + g.dist;
        if (out.main && Math.abs(g.lat - out.main.lat) < 1e-6 && Math.abs(g.lon - out.main.lon) < 1e-6) continue;
        var dup = false;
        for (var z = 0; z < ghosts.length; z++) if (ghosts[z].node === g.node) { dup = true; if (total < ghosts[z].dist) ghosts[z].dist = total; }
        if (!dup) ghosts.push({ node: g.node, dist: total, lat: g.lat, lon: g.lon, label: g.label, dest: g.dest,
          brg: bearing(snapLat, snapLon, g.lat, g.lon) });
      }
    }
    if (kreuz && kreuz.dist <= 15000 && ghosts.length) {
      ghosts.sort(function (a, b) { return a.dist - b.dist; });
      out.ghosts = ghosts.slice(0, 2);
      out.kreuz = kreuz;
    }
    return out;
  };

  var Engine = {
    dist: dist, bearing: bearing, angDiff: angDiff, speedState: speedState,
    overpassQuery: overpassQuery, fetchOverpass: fetchOverpass,
    compactFromOsm: compactFromOsm, Graph: Graph, refTokens: refTokens
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = Engine;
  else root.NUSEngine = Engine;
})(this);
