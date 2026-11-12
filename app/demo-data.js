// Künstliches Autobahnnetz im OSM/Overpass-Format für Tests und die Demo
// A9 Nord-Süd (lon 11.0), A3 Ost-West (lat 49.4), Kreuz mit Rampen.
function build() {
  var els = [], id = 1, wid = 1;
  function node(lat, lon, tags) { var n = { type: 'node', id: id++, lat: lat, lon: lon }; els.push(n); if (tags) els.push({ type: 'node', id: n.id, tags: tags }); return n.id; }
  function way(ids, tags) { els.push({ type: 'way', id: wid++, nodes: ids, tags: tags }); }
  function line(lat1, lon1, lat2, lon2, steps) { var ids = []; for (var i = 0; i <= steps; i++) ids.push(node(lat1 + (lat2 - lat1) * i / steps, lon1 + (lon2 - lon1) * i / steps)); return ids; }
  // Abschnittsweise Wege bauen: segs = [[fraction_end, maxspeed, cond]]
  function road(lat1, lon1, lat2, lon2, km, ref, segs) {
    var steps = Math.round(km / 0.5), ids = line(lat1, lon1, lat2, lon2, steps), start = 0;
    var out = { ids: ids };
    segs.forEach(function (s) {
      var end = Math.round(s[0] * steps);
      var t = { highway: 'motorway', ref: ref, maxspeed: s[1] };
      if (s[2]) t['maxspeed:conditional'] = s[2];
      way(ids.slice(start, end + 1), t); start = end;
    });
    return out;
  }
  // A9 Süd (49.6 -> 48.8, ~89 km): 0-30 km 120, 30-60 none, Rest 130
  var a9s = road(49.6, 11.0002, 48.8, 11.0002, 89, 'A 9', [[30 / 89, '120'], [60 / 89, 'none', '120 @ (22:00-06:00)'], [1, '130']]);
  // A9 Nord (umgekehrt)
  var a9n = road(48.8, 10.9998, 49.6, 10.9998, 89, 'A 9', [[0.5, '130'], [0.7, 'none'], [1, '120']]);
  // A3 Ost (lon 10.6 -> 11.4, ~58 km) unbegrenzt ab lon 11.25
  var a3e = road(49.3998, 10.6, 49.3998, 11.4, 58, 'A 3', [[0.8125, '120'], [1, 'none']]);
  // A3 West (11.4 -> 10.6) unbegrenzt ab lon 10.8
  var a3w = road(49.4002, 11.4, 49.4002, 10.6, 58, 'A 3', [[0.75, '120'], [1, 'none']]);
  function nearest(ids, lat, lon) {
    var best = null, bd = 1e9;
    els.forEach(function (e) { if (e.type === 'node' && e.lat !== undefined && ids.indexOf(e.id) >= 0) { var d = Math.abs(e.lat - lat) + Math.abs(e.lon - lon); if (d < bd) { bd = d; best = e.id; } } });
    return best;
  }
  // Kreuz: von A9 Süd nach A3 Ost (links) und A3 West (rechts)
  var j1 = nearest(a9s.ids, 49.4135, 11.0002);
  els.push({ type: 'node', id: j1, tags: { highway: 'motorway_junction', name: 'Kreuz Teststadt' } });
  var toE = nearest(a3e.ids, 49.3998, 11.02);
  var mid1 = node(49.405, 11.006);
  way([j1, mid1, toE], { highway: 'motorway_link', 'destination:ref': 'A 3', destination: 'Würzburg' });
  var j2 = nearest(a9s.ids, 49.409, 11.0002);
  var toW = nearest(a3w.ids, 49.4002, 10.98);
  var mid2 = node(49.404, 10.994);
  way([j2, mid2, toW], { highway: 'motorway_link', 'destination:ref': 'A 3', destination: 'Frankfurt' });
  // normale Ausfahrt (endet im Nichts)
  var j3 = nearest(a9s.ids, 49.5, 11.0002);
  way([j3, node(49.497, 11.004)], { highway: 'motorway_link' });
  return { elements: els };
}
if (typeof module !== 'undefined') module.exports = build;
else window.NUS_SYNTH = build;
