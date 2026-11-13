/* Next Unlimited – App-Logik (Oberfläche, GPS, Daten) */
(function () {
  'use strict';
  var E = window.NUSEngine;
  var $ = function (id) { return document.getElementById(id); };

  // ---------- Texte ----------
  var T = {
    de: {
      subtitle: 'Dein Kompass zum nächsten Unbegrenzt-Schild',
      notice: 'HINWEIS',
      p1: 'Beachte immer die Verkehrsregeln und die Beschilderung vor Ort. Die App dient nur zur Information und ersetzt nicht deine Verantwortung als Fahrer.',
      p2: 'Bitte vor der Fahrt starten und das Handy in die Halterung stecken – während der Fahrt nicht bedienen.',
      dataCached: 'Autobahndaten offline gespeichert',
      asOf: 'Stand',
      dataLater: 'Autobahndaten werden nach dem Start geladen',
      demo: 'Demo-Fahrt mit Testdaten ansehen',
      demoEnd: 'Demo beenden',
      iosHint: 'Für Vollbild: Teilen-Symbol → „Zum Home-Bildschirm“, dann die App dort starten.',
      toNext: 'bis zum nächsten Unbegrenzt',
      unlimited: 'Unbegrenzt',
      still: 'noch',
      loading: 'Lade Autobahndaten (bis 2 Min.)',
      server: 'Server',
      waitGps: 'Warte auf GPS …',
      gpsDenied: 'Kein Standortzugriff – bitte in den Einstellungen erlauben',
      move: 'Losfahren, um die Richtung zu erkennen',
      offroad: 'Keine Autobahn erkannt',
      noTarget: 'Kein Unbegrenzt-Abschnitt in Reichweite',
      dataError: 'Daten konnten nicht geladen werden – Verbindung prüfen',
      kreuz: 'Autobahnkreuz',
      inDist: 'in',
      left: 'links', right: 'rechts', ahead: 'geradeaus',
      started: 'Beginn · {d} gefahren',
      endsIn: 'Ende in {d}',
      warn: 'Zeitweise begrenzt – Schilder beachten',
      dir: 'Richtung',
      winds: ['Norden', 'Nordosten', 'Osten', 'Südosten', 'Süden', 'Südwesten', 'Westen', 'Nordwesten'],
      demoTag: 'DEMO'
    },
    en: {
      subtitle: 'Your compass to the next unlimited sign',
      notice: 'NOTICE',
      p1: 'Always follow traffic rules and the signs on the road. This app is for information only and does not replace your responsibility as a driver.',
      p2: 'Start before you drive and put your phone in its mount – do not use it while driving.',
      dataCached: 'Autobahn data saved offline',
      asOf: 'as of',
      dataLater: 'Autobahn data loads after you start',
      demo: 'Watch a demo drive with test data',
      demoEnd: 'End demo',
      iosHint: 'For full screen: tap Share → “Add to Home Screen”, then open the app from there.',
      toNext: 'to the next unlimited section',
      unlimited: 'Unlimited',
      still: '',
      loading: 'Loading Autobahn data (up to 2 min)',
      server: 'server',
      waitGps: 'Waiting for GPS …',
      gpsDenied: 'No location access – please allow it in settings',
      move: 'Start driving to detect your direction',
      offroad: 'No Autobahn detected',
      noTarget: 'No unlimited section in range',
      dataError: 'Could not load data – check your connection',
      kreuz: 'Interchange',
      inDist: 'in',
      left: 'left', right: 'right', ahead: 'ahead',
      started: 'Start · {d} driven',
      endsIn: 'Ends in {d}',
      warn: 'Limits at times – watch the signs',
      dir: 'Heading',
      winds: ['north', 'northeast', 'east', 'southeast', 'south', 'southwest', 'west', 'northwest'],
      demoTag: 'DEMO'
    }
  };
  var lang = 'de';
  try { lang = localStorage.getItem('nus.lang') || (navigator.language || 'de').slice(0, 2); } catch (e) {}
  if (!T[lang]) lang = 'en';
  function t(k) { return T[lang][k]; }
  function applyLang() {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-t]').forEach(function (el) { el.textContent = t(el.getAttribute('data-t')); });
    document.querySelectorAll('.lang button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.lang === lang ? 'true' : 'false'); });
    updateDataState();
  }
  document.querySelectorAll('.lang button').forEach(function (b) {
    b.addEventListener('click', function () {
      lang = b.dataset.lang;
      try { localStorage.setItem('nus.lang', lang); } catch (e) {}
      applyLang();
    });
  });

  function fmtKm(m) {
    var km = m / 1000;
    var s = km < 10 ? km.toFixed(1) : String(Math.round(km));
    return lang === 'de' ? s.replace('.', ',') : s;
  }

  // ---------- Speicher (IndexedDB) ----------
  function idb() {
    return new Promise(function (res, rej) {
      if (!window.indexedDB) return rej(new Error('no idb'));
      var r = indexedDB.open('nus', 1);
      r.onupgradeneeded = function () { r.result.createObjectStore('kv'); };
      r.onsuccess = function () { res(r.result); };
      r.onerror = function () { rej(r.error); };
    });
  }
  function idbGet(k) {
    return idb().then(function (db) {
      return new Promise(function (res) {
        var q = db.transaction('kv').objectStore('kv').get(k);
        q.onsuccess = function () { res(q.result); }; q.onerror = function () { res(null); };
      });
    }).catch(function () { return null; });
  }
  function idbSet(k, v) {
    return idb().then(function (db) {
      return new Promise(function (res) {
        var tx = db.transaction('kv', 'readwrite'); tx.objectStore('kv').put(v, k);
        tx.oncomplete = function () { res(true); }; tx.onerror = function () { res(false); };
      });
    }).catch(function () { return false; });
  }

  var hasCache = false;
  function updateDataState() {
    var ver = S.dataVersion ? ' · ' + t('asOf') + ' ' + new Date(S.dataVersion).toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-GB') : '';
    $('dataState').textContent = DEMO ? t('demo') : (hasCache ? t('dataCached') + ver : t('dataLater'));
  }

  // ---------- Zustand ----------
  var DEMO = /[?&]demo/.test(location.search);
  // Lichtreflexe in Skala/Innenwand; Fallback: ?reflect=0 in der Adresse oder hier auf false setzen
  var REFLECT = !/[?&]reflect=0/.test(location.search);
  // Designstudie Unbegrenzt-Fortschritt: 'ticks' = Skalenstriche glühen nacheinander (Standard),
  // 'bezel' = Licht unter der Lünette (?ring=bezel)
  var RINGMODE = 'ticks';
  var S = {
    graph: null, region: null, loading: false, dataError: false,
    pos: null, heading: null, headingAt: 0, speed: null, gpsError: null,
    prevEdge: null, lastFix: null, res: null
  };

  // ---------- Daten laden ----------
  // kleinere Regionen (~65 km Umkreis) laden schneller; nach vorn wird rechtzeitig nachgeladen
  var REG = { dLat: 0.6, dLon: 0.9, reloadKm: 30, prefetchKm: 20, aheadKm: 35 };
  function regionFits(c, lat, lon, km) {
    return c && c.center && E.dist(lat, lon, c.center.lat, c.center.lon) < (km || REG.reloadKm) * 1000;
  }
  function useCompact(c) {
    S.region = c;
    S.graph = new E.Graph(c);
    S.prevEdge = null;
  }
  function aheadPoint(lat, lon, hd, km) {
    if (hd == null) return { lat: lat, lon: lon };
    var r = hd * Math.PI / 180, d = km * 1000;
    return { lat: lat + d * Math.cos(r) / 110540, lon: lon + d * Math.sin(r) / (111320 * Math.cos(lat * Math.PI / 180)) };
  }
  // ---------- Deutschland-Datensatz (vorab erstellt, liegt mit der App auf Netlify) ----------
  // Ablauf: gespeicherte Daten sofort nutzen, im Hintergrund prüfen, ob es eine neuere Version gibt.
  var DATA_URL = 'data/de.json', VERSION_URL = 'data/version.json';
  function useDataset(c) {
    S.dataset = c.version || 'x';
    useCompact(c);
    S.dataError = false;
  }
  function loadDataset() {
    if (DEMO) return Promise.resolve();
    return idbGet('de').then(function (c) {
      if (c) { useDataset(c); update(); }
      return fetch(VERSION_URL, { cache: 'no-store' }).then(function (r) {
        if (!r.ok) throw new Error('kein Datensatz');
        return r.json();
      }).then(function (v) {
        if (c && c.version === v.version) return; // schon aktuell
        if (!c) { S.loading = true; S.loadStart = Date.now(); S.loadServer = ''; update(); }
        return fetch(DATA_URL + '?v=' + encodeURIComponent(v.version)).then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.json();
        }).then(function (d) {
          d.version = v.version;
          useDataset(d);
          hasCache = true; S.dataVersion = v.version;
          S.loading = false;
          update();
          return idbSet('de', d);
        });
      }).catch(function () {
        S.loading = false;
        // kein vorab erstellter Datensatz erreichbar: zur Not live von OpenStreetMap laden
        if (!S.dataset && S.pos) ensureRegion(S.pos.lat, S.pos.lon);
      });
    });
  }
  function ensureRegion(lat, lon) {
    if (DEMO || S.loading || S.dataset) return;
    var hasData = S.region && regionFits(S.region, lat, lon);
    if (hasData && regionFits(S.region, lat, lon, REG.prefetchKm)) return;
    // ohne Daten: um die Position laden; mit Daten: rechtzeitig weiter vorn laden
    var c0 = hasData ? aheadPoint(lat, lon, S.heading, REG.aheadKm) : { lat: lat, lon: lon };
    S.loading = true; S.loadStart = Date.now();
    idbGet('region').then(function (c) {
      if (!hasData && c && regionFits(c, lat, lon) && Date.now() - (c.loadedAt || 0) < 30 * 864e5) {
        useCompact(c); S.dataError = false; return;
      }
      var bbox = { s: +(c0.lat - REG.dLat).toFixed(4), n: +(c0.lat + REG.dLat).toFixed(4), w: +(c0.lon - REG.dLon).toFixed(4), e: +(c0.lon + REG.dLon).toFixed(4) };
      return E.fetchOverpass(bbox, function (i, n) { S.loadServer = i + '/' + n; update(); }).then(function (osm) {
        var comp = E.compactFromOsm(osm, bbox);
        useCompact(comp);
        hasCache = true;
        S.dataError = false; S.dataErrorMsg = '';
        return idbSet('region', comp);
      });
    }).then(function () { S.loading = false; update(); }, function (err) {
      S.dataError = !S.graph;
      S.dataErrorMsg = err && err.message ? err.message : '';
      update();
      setTimeout(function () { S.loading = false; }, 30000); // nach 30 s neuer Versuch
    });
  }
  // Ladeanzeige jede Sekunde aktualisieren
  setInterval(function () { if (S.loading && !S.graph && $('drive').classList.contains('active')) update(); }, 1000);

  // ---------- GPS ----------
  function onFix(p) {
    var c = p.coords, now = p.timestamp || Date.now();
    var fix = { lat: c.latitude, lon: c.longitude, acc: c.accuracy, t: now };
    var spd = (c.speed != null && !isNaN(c.speed)) ? c.speed : null;
    var hd = (c.heading != null && !isNaN(c.heading)) ? c.heading : null;
    if (S.lastFix) {
      var d = E.dist(S.lastFix.lat, S.lastFix.lon, fix.lat, fix.lon);
      var dt = (now - S.lastFix.t) / 1000;
      if (spd == null && dt >= 1) spd = d / dt;
      if ((hd == null || (spd != null && spd < 2)) && d >= 12) hd = E.bearing(S.lastFix.lat, S.lastFix.lon, fix.lat, fix.lon);
      if (d >= 12 || hd != null) S.lastFix = fix;
    } else S.lastFix = fix;
    if (hd != null && (spd == null || spd >= 1.5)) { S.heading = hd; S.headingAt = now; }
    if (now - S.headingAt > 90000) S.heading = null;
    if (spd != null && spd > 110) spd = null; // unplausibel (> ~400 km/h)
    if (spd != null) S.speed = spd; else if (!S.lastFix || now - S.lastFix.t > 5000) S.speed = null;
    S.pos = fix;
    S.gpsError = null;
    if (!S.dataset && S.datasetChecked) ensureRegion(fix.lat, fix.lon);
    update();
  }
  function onGpsError(err) {
    S.gpsError = err && err.code === 1 ? 'denied' : 'wait';
    update();
  }

  // ---------- Bildschirm wach halten ----------
  var wakeLock = null;
  function keepAwake() {
    if (!('wakeLock' in navigator)) return;
    navigator.wakeLock.request('screen').then(function (l) { wakeLock = l; }).catch(function () {});
  }
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible' && $('drive').classList.contains('active')) keepAwake();
  });

  // ---------- Start ----------
  function isStandalone() {
    return (window.matchMedia && (matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches)) || navigator.standalone === true;
  }
  $('go').addEventListener('click', function () {
    keepAwake();
    var de = document.documentElement;
    if (!isStandalone() && de.requestFullscreen) { try { de.requestFullscreen({ navigationUI: 'hide' }).catch(function () {}); } catch (e) {} }
    $('start').classList.remove('active');
    $('drive').classList.add('active');
    if (!DEMO) loadDataset().then(function () { S.datasetChecked = true; if (!S.dataset && S.pos) ensureRegion(S.pos.lat, S.pos.lon); });
    if (DEMO) { startDemo(); }
    else if ('geolocation' in navigator) {
      navigator.geolocation.watchPosition(onFix, onGpsError, { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 });
    } else S.gpsError = 'denied';
    update();
    requestAnimationFrame(tick);
  });

  // ---------- Auswertung + Darstellung ----------
  var needles = [0, 1, 2].map(function (i) {
    return { g: $('nd' + i), glow: $('glow' + i), lbl: $('lbl' + i), cur: 0, target: 0, on: false, init: true,
      glowOp: [0.45, 0.28, 0.14][i],
      refl: REFLECT ? $('refl' + i) : null, reflGrad: REFLECT ? $('rg' + i) : null, reflOp: [0.7, 0.42, 0.22][i],
      floor: REFLECT ? $('floor' + i) : null, floorOp: [0.2, 0.12, 0.06][i] };
  });

  function update() {
    var res = null;
    if (S.graph && S.pos && S.heading != null) {
      res = S.graph.evaluate({ lat: S.pos.lat, lon: S.pos.lon, heading: S.heading, acc: S.pos.acc, date: S.pos.date || new Date() }, S.prevEdge);
      S.prevEdge = res.onMotorway ? res.edge : null;
    }
    S.res = res;
    render(res);
  }

  function setNeedle(i, show, angle, text, toTop) {
    var n = needles[i];
    var was = n.on;
    n.on = show;
    // Wie ein Analoginstrument: Nadeln verschwinden nie. Ausgeschaltet bleibt die Hauptnadel stehen,
    // die Ghost-Nadeln schieben sich unter die Hauptnadel zurück (siehe tick()).
    if (show) {
      n.target = angle;
      n.lbl.textContent = text;
    }
    n.g.classList.toggle('off', !show);
    n.lbl.parentNode.style.opacity = show ? 1 : 0;
    n.glow.style.opacity = show ? n.glowOp : 0;
    if (n.refl) n.refl.style.opacity = show ? n.reflOp : 0;
    if (n.floor) n.floor.style.opacity = show ? n.floorOp : 0;
  }

  function setStatus(msg) {
    $('bigPre').textContent = '';
    $('bigNum').textContent = '--';
    $('bigUnit').style.display = 'none';
    $('bigLabel').textContent = msg;
    $('bigLabel').className = 'label';
  }

  function sideOf(a) { return Math.abs(a) < 15 ? t('ahead') : (a < 0 ? t('left') : t('right')); }

  function render(res) {
    // Kopfzeile
    var acc = S.pos ? S.pos.acc : null;
    $('gpsDot').className = 'dot' + (acc == null ? '' : acc <= 25 ? ' ok' : acc <= 60 ? ' weak' : '');
    $('speed').textContent = S.speed != null ? Math.round(S.speed * 3.6) : '--';
    var winds = t('winds');
    $('dirText').textContent = S.heading != null ? t('dir') + ' ' + winds[Math.round(S.heading / 45) % 8] : '';
    var badge = $('ref');
    if (res && res.onMotorway && res.ref) { badge.textContent = res.ref; badge.classList.remove('off'); }
    else { badge.textContent = DEMO ? t('demoTag') : '–'; badge.classList.add('off'); }

    // Limit-Schild
    var ls = $('limitSign');
    var lim = res && res.onMotorway ? res.limit : -1;
    if (lim > 0) { ls.className = 'limitsign'; ls.textContent = lim; }
    else if (lim === 0) { ls.className = 'limitsign unl'; ls.innerHTML = '<svg viewBox="0 0 100 100" role="img" aria-label="' + t('unlimited') + '"><use href="#sign"/></svg>'; }
    else if (lim === -2) { ls.className = 'limitsign none-known'; ls.textContent = '?'; }
    else { ls.className = 'limitsign none-known'; ls.textContent = '–'; }

    var dial = $('dial');
    var warn = $('warn');
    var hideAll = function () {
      for (var i = 0; i < 3; i++) setNeedle(i, false);
      warn.classList.add('vh');
      $('ringGroup').classList.add('off');
      dial.classList.remove('is-unl');
      if (U.active) leaveUnl();
      S.mode = 'wait';
    };

    // Wartezustände
    var msg = null;
    if (S.gpsError === 'denied') msg = t('gpsDenied');
    else if (!S.pos) msg = t('waitGps');
    else if (S.dataError && !S.graph) msg = t('dataError') + (S.dataErrorMsg ? ' (' + S.dataErrorMsg + ')' : '');
    else if (!S.graph) {
      var sec = S.loadStart ? Math.floor((Date.now() - S.loadStart) / 1000) : 0;
      msg = t('loading') + ' ' + Math.floor(sec / 60) + ':' + ('0' + sec % 60).slice(-2) + (S.loadServer ? ' · ' + t('server') + ' ' + S.loadServer : '');
    }
    else if (S.heading == null) msg = t('move');
    else if (!res || !res.onMotorway) msg = t('offroad');
    if (msg) { hideAll(); dial.classList.add('dim'); setStatus(msg); return; }
    dial.classList.remove('dim');
    $('bigUnit').style.display = '';

    var H = S.heading;
    var newMode = res.inUnl ? 'unl' : 'drive';
    var modeChanged = S.mode !== newMode;
    S.mode = newMode;
    if (modeChanged) {
      var ro = document.querySelector('.readout');
      ro.classList.remove('swap'); void ro.offsetWidth; ro.classList.add('swap');
    }
    if (res.inUnl) {
      // ---- Unbegrenzt aktiv ----
      for (var k = 0; k < 3; k++) setNeedle(k, false, 0, '', true);
      dial.classList.add('is-unl');
      var total = res.unlRemaining + res.unlDriven;
      var frac = total > 0 ? res.unlDriven / total : 0;
      U.fracTarget = frac;
      if (modeChanged) {
        // Nadel bleibt stehen und dimmt aus; danach beginnen die Skalenstriche zu glühen
        U.active = true; U.t0 = performance.now(); U.frac = 0;
      }
      $('bigPre').textContent = t('still');
      $('bigNum').textContent = fmtKm(res.unlRemaining);
      $('bigLabel').textContent = t('unlimited');
      $('bigLabel').className = 'label hot';
      warn.classList.toggle('vh', !res.unlCond);
      $('warnText').textContent = t('warn');
      return;
    }

    // ---- Normale Fahrt ----
    dial.classList.remove('is-unl');
    $('ringGroup').classList.add('off');
    if (U.active) leaveUnl();
    if (res.main) {
      setNeedle(0, true, E.angDiff(H, res.main.brg), fmtKm(res.main.dist) + ' km');
      $('bigPre').textContent = '';
      $('bigNum').textContent = fmtKm(res.main.dist);
      $('bigLabel').textContent = t('toNext');
      $('bigLabel').className = 'label';
    } else {
      setNeedle(0, false);
      setStatus(t('noTarget'));
    }
    var gh = res.ghosts || [];
    for (var j = 0; j < 2; j++) {
      var g = gh[j];
      if (g) setNeedle(j + 1, true, E.angDiff(H, g.brg), fmtKm(g.dist) + ' km');
      else setNeedle(j + 1, false);
    }
    // Kreuz-Hinweis steht in der Kopfzeile statt der Himmelsrichtung
    if (gh.length && res.kreuz) $('dirText').textContent = fmtKm(res.kreuz.dist) + ' km · ' + (res.kreuz.name || t('kreuz'));
    var showWarn = !!(res.main && res.main.cond);
    warn.classList.toggle('vh', !showWarn);
    $('warnText').textContent = t('warn');
  }

  // ---------- Übergang in den Unbegrenzt-Modus ----------
  var U = { active: false, t0: 0, frac: 0, fracTarget: 0, startAngle: 0 };
  var C = 873.4;
  function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function easeInOut(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function easeOut(x) { return 1 - Math.pow(1 - x, 3); }
  function easeOutBack(x) { var c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); }
  function symDash(el, len, frac) {
    var L = len * frac;
    el.setAttribute('stroke-dasharray', L.toFixed(1) + ' ' + (len - L + 0.01).toFixed(1));
    el.setAttribute('stroke-dashoffset', (L / 2).toFixed(1));
  }
  function leaveUnl() {
    U.active = false;
    $('ringHead').classList.add('off');
    $('ringHead').style.opacity = '';
    $('ringConicWrap').style.transition = 'opacity .8s ease';
    $('ringConicWrap').style.opacity = 0;
    setTimeout(function () { $('ringConicWrap').style.transition = ''; }, 900);

  }
  // Ring + Spitze als EINE Form (Spitze so breit wie der Ring, Verlauf wie die Nadel)
  var TIP = 13.6 / 139, CAP = 6.5 / 139;
  function drawRing(th) {
    var cv = $('ringCanvas'), dpr = window.devicePixelRatio || 1;
    var W = Math.round(cv.clientWidth * dpr);
    if (!W) return;
    if (cv.width !== W) { cv.width = W; cv.height = W; }
    var ctx = cv.getContext('2d'), k = W / 340, c = 170 * k;
    // Licht unter der lichtdurchlässigen Lünette: etwas breiter und weich, darüber eine milchige Schicht
    var ro = 146.5 * k, ri = 131.5 * k, rm = 139 * k, hw = 7.5 * k, q = -Math.PI / 2;
    function X(r, a) { return c + r * Math.sin(a); }
    function Y(r, a) { return c - r * Math.cos(a); }
    ctx.clearRect(0, 0, W, W);
    ctx.beginPath();
    ctx.arc(c, c, ro, q, th + q, false);
    // rundes Ende (Kugel) statt Pfeilspitze
    ctx.arc(X(rm, th), Y(rm, th), hw, th + q, th + q + Math.PI, false);
    ctx.arc(c, c, ri, th + q, q, true);
    ctx.arc(c, c - rm, hw, Math.PI / 2, Math.PI * 1.5, false);
    ctx.closePath();
    var fill = '#ff7a26';
    if (ctx.createConicGradient) {
      var g = ctx.createConicGradient(q, c, c), full = 2 * Math.PI;
      g.addColorStop(0, '#e8480f');
      g.addColorStop(Math.min(0.998, th / full), '#ff7a26');
      var e = Math.min(0.9989, (th + CAP) / full);
      g.addColorStop(e, '#ffb056');
      g.addColorStop(e + 0.001, '#e8480f'); // runder Anfang oben bleibt dunkelorange
      g.addColorStop(1, '#e8480f');
      fill = g;
    }
    ctx.save();
    if ('filter' in ctx) ctx.filter = 'blur(' + (2.6 * k).toFixed(1) + 'px)';
    ctx.shadowColor = 'rgba(255,107,31,0.65)';
    ctx.shadowBlur = 16 * k;
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.restore();
    // milchige Oberfläche der Lünette über dem Licht (nur dort, wo Licht ist)
    ctx.save();
    ctx.globalCompositeOperation = 'source-atop';
    var fr = ctx.createRadialGradient(c - 40 * k, c - 50 * k, 20 * k, c, c, 152 * k);
    fr.addColorStop(0, 'rgba(255,240,225,0.10)');
    fr.addColorStop(0.85, 'rgba(19,20,22,0.22)');
    fr.addColorStop(1, 'rgba(10,10,11,0.35)');
    ctx.fillStyle = fr;
    ctx.fillRect(0, 0, W, W);
    ctx.restore();
  }
  function headPose(A, u, spin, kx, ky) {
    return 'rotate(' + A.toFixed(2) + ' 170 170) translate(0 ' + (-73.7 * u).toFixed(2) + ') translate(170 104.7) rotate(' +
      spin.toFixed(2) + ') scale(' + kx.toFixed(3) + ' ' + ky.toFixed(3) + ') translate(-170 -104.7)';
  }
  // Skalenstriche als Fortschritt: 72 Striche (alle 5°), die nacheinander zu glühen beginnen
  function drawTicks(f) {
    var cv = $('ringCanvas'), dpr = window.devicePixelRatio || 1;
    var W = Math.round(cv.clientWidth * dpr);
    if (!W) return;
    if (cv.width !== W) { cv.width = W; cv.height = W; }
    var ctx = cv.getContext('2d'), k = W / 340, c = 170 * k;
    ctx.clearRect(0, 0, W, W);
    var lit = Math.max(1, f * 72), full = Math.floor(lit);
    ctx.lineCap = 'round';
    for (var i = 0; i <= full && i < 72; i++) {
      var alpha = i < full ? 1 : lit - full;
      if (alpha <= 0.01) continue;
      var a = (i * 5 + 0.39) * Math.PI / 180, s = Math.sin(a), co = Math.cos(a);
      var head = i >= full - 1;
      var tt = full > 1 ? i / (full - 1) : 1;
      var col = head ? '255,176,86' : (Math.round(232 + 23 * tt) + ',' + Math.round(72 + 50 * tt) + ',' + Math.round(15 + 23 * tt));
      ctx.strokeStyle = 'rgba(' + col + ',' + alpha.toFixed(3) + ')';
      ctx.shadowColor = 'rgba(255,107,31,' + (0.9 * alpha).toFixed(3) + ')';
      ctx.shadowBlur = (head ? 12 : 7) * k;
      ctx.lineWidth = (head ? 2.8 : 2.2) * k;
      ctx.beginPath();
      ctx.moveTo(c + 113.6 * k * s, c - 113.6 * k * co);
      ctx.lineTo(c + 122.4 * k * s, c - 122.4 * k * co);
      ctx.stroke();
    }
  }
  function tickUnl(now) {
    var t = (now - U.t0) / 1000;
    if (RINGMODE === 'ticks') {
      var on = t > 1.1; // erst wenn die Nadel ausgedimmt ist
      if (on) { U.frac += (U.fracTarget - U.frac) * 0.06; drawTicks(U.frac); }
      $('ringConicWrap').style.opacity = on ? 1 : 0;
      return;
    }
    // Rille öffnet sich von oben symmetrisch nach beiden Seiten
    // 1) Nadel dreht nach oben  2) springt in die Rille und kippt in Fahrtrichtung
    var rot = easeInOut(clamp01(t / 0.35));
    var jump = clamp01((t - 0.3) / 0.55);
    var A = U.startAngle + E.angDiff(U.startAngle, 0) * rot;
    var landed = t > 0.85;
    if (landed) {
      U.frac += (U.fracTarget - U.frac) * 0.06;
      A = U.frac * 360;
    }
    var head = $('ringHead');
    var ej = easeInOut(jump);
    // in der Rille: Pfeil genau so breit wie der Ring (13 px), damit nichts übersteht
    if (RINGMODE === 'ticks') head.setAttribute('transform', headPose(A, easeOutBack(jump) * (52.7 / 73.7), 0, 1 - 0.65 * ej, 1 - 0.65 * ej));
    else head.setAttribute('transform', headPose(A, easeOutBack(jump), 90 * ej, 1 - 0.5 * ej, 1 - 0.5 * ej));
    // unterwegs verwandelt sich die Nadel in eine runde Kugel (Durchmesser = Ringbreite)
    var morph = clamp01((jump - 0.35) / 0.5);
    $('headTri').style.opacity = 1 - morph;
    $('headBall').style.opacity = morph;
    // gelandet: Pfeil wird zur exakten Dreiecksspitze am Ende des Rings
    head.style.opacity = landed ? 0 : '';
    if (landed) { if (RINGMODE === 'ticks') drawTicks(U.frac); else drawRing(Math.max(0.002, U.frac * 2 * Math.PI)); }
    $('ringConicWrap').style.opacity = landed ? 1 : 0;
  }

  // Sanfte Nadelbewegung + Beschriftung auf der Lünette
  function tick() {
    if (U.active) tickUnl(performance.now());
    for (var i = 0; i < 3; i++) {
      var n = needles[i];
      if (i > 0 && !n.on) n.target = needles[0].cur; // ausgeschaltete Ghost-Nadeln liegen unter der Hauptnadel
      if (n.init) {
        n.cur += E.angDiff(n.cur, n.target) * (i === 0 ? 0.1 : (n.on ? 0.06 : 0.045));
        var a = n.cur;
        var tr = 'rotate(' + a.toFixed(2) + ' 170 170)';
        n.g.setAttribute('transform', tr);
        n.glow.setAttribute('transform', tr);
        if (n.floor) n.floor.setAttribute('transform', tr);
        if (n.reflGrad) {
          var ra = a * Math.PI / 180;
          n.reflGrad.setAttribute('cx', (170 + 123 * Math.sin(ra)).toFixed(1));
          n.reflGrad.setAttribute('cy', (170 - 123 * Math.cos(ra)).toFixed(1));
        }
        var top = Math.abs(a) <= 100;
        var off = top ? ((a + 180 + 360) % 360) / 360 * 100 : ((360 - a) % 360) / 360 * 100;
        n.lbl.setAttribute('href', top ? '#bezTop' : '#bezBot');
        n.lbl.setAttribute('startOffset', off.toFixed(2) + '%');
      }
    }
    requestAnimationFrame(tick);
  }

  // ---------- Demo-Fahrt (Testdaten, kein GPS) ----------
  function startDemo() {
    var s = document.createElement('script');
    s.src = 'demo-data.js';
    s.onload = function () {
      var osm = window.NUS_SYNTH();
      var comp = E.compactFromOsm(osm, { s: 48.7, w: 10.5, n: 49.7, e: 11.5 });
      useCompact(comp);
      var g = S.graph;
      // Kurze Schleife: kurz vor dem Kreuz starten, nach dem Unbegrenzt-Abschnitt von vorn
      var START = 49.565, END = 49.035, SPEEDUP = 30;
      function reset() { var sn = g.snap(START, 11.0002, 180, 10, null); e = sn.edge; along = 0; }
      var e, along; reset();
      var last = Date.now();
      var demoDate = new Date(); demoDate.setHours(14, 0, 0, 0);
      function step() {
        var now = Date.now(), dt = Math.min(0.5, (now - last) / 1000); last = now;
        var kmh = g.isUnl(e) ? 230 : (g.lim[e] > 0 ? g.lim[e] - 2 : 128);
        along += (kmh / 3.6) * dt * SPEEDUP;
        while (along > g.len[e]) {
          along -= g.len[e];
          var nx = g.next(e);
          if (nx < 0) { reset(); break; }
          e = nx;
        }
        var f = along / g.len[e];
        var a = g.from[e], b = g.to[e];
        var la = g.lat[a] + (g.lat[b] - g.lat[a]) * f;
        if (la < END) { reset(); return; }
        S.pos = { lat: la, lon: g.lon[a] + (g.lon[b] - g.lon[a]) * f, acc: 8, date: demoDate };
        S.heading = g.brg[e]; S.headingAt = now; S.speed = kmh / 3.6;
        update();
      }
      setInterval(step, 250);
      step();
    };
    document.body.appendChild(s);
  }

  // ---------- Easter Egg ----------
  (function () {
    var taps = 0, last = 0, busy = false;
    var inner = $('medalInner');
    // Rand der Medaille: gestapelte Scheiben ergeben beim Drehen eine sichtbare Kante
    for (var k = 0; k < 12; k++) {
      var r = document.createElement('div');
      r.className = 'medal-rim';
      r.style.transform = 'translateZ(' + (-3.6 + k * 0.65).toFixed(2) + 'px) scale(0.93)';
      inner.insertBefore(r, inner.firstChild);
    }
    var front = inner.querySelector('.front'), back = inner.querySelector('.back');
    function pose(angle, lift) {
      inner.style.transform = 'translateZ(' + (lift * 46).toFixed(1) + 'px) rotateX(' + (lift * 12).toFixed(1) + 'deg) rotateY(' + angle.toFixed(1) + 'deg)';
      var c = Math.cos(angle * Math.PI / 180);
      var sh = ' drop-shadow(3px 4px 6px rgba(15,16,18,.85))';
      front.style.filter = 'brightness(' + (0.55 + 0.45 * Math.max(0, c)).toFixed(3) + ')' + sh;
      back.style.filter = 'brightness(' + (0.55 + 0.45 * Math.max(0, -c)).toFixed(3) + ')' + sh;
    }
    function turn(from, to, dur, done) {
      var t0 = performance.now();
      (function step(now) {
        var p = Math.min(1, (now - t0) / dur);
        var e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
        pose(from + (to - from) * e, Math.sin(Math.PI * p));
        if (p < 1) requestAnimationFrame(step); else done();
      })(t0);
    }
    $('medal').addEventListener('click', function () {
      var now = Date.now();
      taps = now - last < 900 ? taps + 1 : 1;
      last = now;
      if (taps < 5 || busy) return;
      taps = 0; busy = true;
      var dial = $('dial'), m = $('medal');
      pose(0, 0);
      dial.classList.add('egg'); m.classList.add('show');
      turn(0, 180, 1100, function () {
        setTimeout(function () {
          turn(180, 360, 1100, function () {
            pose(0, 0);
            m.classList.remove('show'); dial.classList.remove('egg'); busy = false;
          });
        }, 3000);
      });
    });
  })();

  // ---------- Init ----------
  var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (isIOS && !isStandalone()) $('iosHint').classList.remove('hidden');
  if (RINGMODE === 'ticks') $('dial').classList.add('ticks');
  if (!REFLECT) { $('reflect').style.display = 'none'; ['floor0', 'floor1', 'floor2'].forEach(function (id) { $(id).style.display = 'none'; }); }
  if (DEMO) { $('demoLink').classList.add('hidden'); $('demoEnd').classList.remove('hidden'); document.querySelector('.top').classList.add('demo'); }
  idbGet('de').then(function (c) {
    if (c) { hasCache = true; S.dataVersion = c.version; updateDataState(); }
    else idbGet('region').then(function (r) { hasCache = !!r; updateDataState(); });
  });
  applyLang();
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('sw.js').catch(function () {});
  }
  // Test-Hook
  window.NUS = { S: S, update: update, useCompact: useCompact };
})();
