var E = require('../app/engine.js');
var build = require('./synthetic.js');
var assert = require('assert');

var bbox = { s: 48.7, w: 10.5, n: 49.7, e: 11.5 };
var c = E.compactFromOsm(build(), bbox);
var g = new E.Graph(JSON.parse(JSON.stringify(c)));
var day = new Date(2026, 10, 12, 14, 0);
var night = new Date(2026, 10, 12, 23, 0);

function ev(lat, lon, h, date) { return g.evaluate({ lat: lat, lon: lon, heading: h, acc: 10, date: date || day }); }
function km(m) { return (m / 1000).toFixed(1); }

// 1) Südwärts, weit vor dem Kreuz
var r = ev(49.58, 11.0003, 180);
console.log('1', r.onMotorway, r.ref, r.limit, km(r.main.dist), r.ghosts);
assert(r.onMotorway && r.ref === 'A9' && r.limit === 120);
assert(Math.abs(r.main.dist / 1000 - 27.7) < 1.0, 'main dist');
assert(!r.ghosts, 'no ghosts beyond 15 km');
assert(Math.abs(E.angDiff(180, r.main.brg)) < 2);

// 2) Gegenrichtung auf derselben Stelle (andere Fahrbahn) -> Nordfahrbahn
r = ev(49.55, 10.9997, 0);
console.log('2', r.ref, r.limit, r.main && km(r.main.dist), r.endOfData);

// 3) 10 km vor dem Kreuz -> Ghosts links/rechts
r = ev(49.5, 11.0003, 180);
console.log('3', km(r.main.dist), r.kreuz, r.ghosts && r.ghosts.map(function (x) { return [x.label, x.dest, km(x.dist), Math.round(E.angDiff(180, x.brg))]; }));
assert(r.ghosts && r.ghosts.length === 2);

// 4) Im unbegrenzten Abschnitt
r = ev(49.2, 11.0003, 180);
console.log('4', r.inUnl, km(r.unlRemaining), km(r.unlDriven), r.unlCond, r.limit);
assert(r.inUnl && Math.abs(r.unlRemaining / 1000 - 15.5) < 1 && Math.abs(r.unlDriven / 1000 - 14.5) < 1);

// 5) Nachts gilt dort 120 -> kein Unbegrenzt, Ziel = nächster echter Abschnitt
r = ev(49.2, 11.0003, 180, night);
console.log('5 night', r.inUnl, r.limit, r.main && km(r.main.dist));
assert(!r.inUnl && r.limit === 120);

// 6) Abseits der Autobahn
r = ev(49.3, 10.8, 90);
console.log('6', r.onMotorway);
assert(!r.onMotorway);

// 7) Ohne Richtung kein Einrasten
r = g.evaluate({ lat: 49.5, lon: 11.0003, heading: null, acc: 10, date: day });
assert(!r.onMotorway);

// 8) Bedingungs-Parser
assert.deepStrictEqual(E.speedState('none', '120 @ (Mo-Fr 06:00-20:00)', '', new Date(2026, 10, 12, 8, 0)), { lim: 120, cond: true });
assert.deepStrictEqual(E.speedState('none', '120 @ (Mo-Fr 06:00-20:00)', '', new Date(2026, 10, 15, 8, 0)), { lim: 0, cond: true });
assert.deepStrictEqual(E.speedState('none', '100 @ wet', '', day), { lim: 0, cond: true });
assert.deepStrictEqual(E.speedState('signals', '', '', day), { lim: -2, cond: true });

// Performance
var t0 = Date.now();
for (var i = 0; i < 200; i++) ev(49.5 - i * 0.001, 11.0003, 180);
console.log('200 evals ms', Date.now() - t0);
console.log('ALL OK');
