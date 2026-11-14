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
      kreuz: 'Autobahnkreuz', in: 'in',
      inDist: 'in',
      left: 'links', right: 'rechts', ahead: 'geradeaus',
      started: 'Beginn · {d} gefahren',
      endsIn: 'Ende in {d}',
      warn: 'Zeitweise begrenzt – Schilder beachten', warnShort: 'Zeitweise begrenzt', demoItem: 'Demo-Fahrt', langItem: 'Sprache', menu: 'Menü',
      gpsOk: 'GPS', gpsWeak: 'GPS schwach', gpsNone: 'Kein GPS',
      dir: 'Richtung',
      winds: ['Norden', 'Nordosten', 'Osten', 'Südosten', 'Süden', 'Südwesten', 'Westen', 'Nordwesten'],
      demoTag: 'DEMO',
      tut: 'Tutorial', tutEnd: 'Tutorial beenden', next: 'Weiter', done: 'Fertig', skip: 'Beenden',
      tutSteps: [
        ['Nadel & Entfernung', 'Die Nadel zeigt entlang der Autobahn zum nächsten Abschnitt ohne Tempolimit. Darunter steht, wie viele Kilometer es noch sind.'],
        ['Autobahn & Richtung', 'Oben siehst du, auf welcher Autobahn du bist und in welche Richtung du fährst. Vor einem Kreuz steht hier, wie weit es noch bis dorthin ist.'],
        ['Am Kreuz', 'Führt über ein Kreuz ein anderer Weg zu einem unbegrenzten Abschnitt, erscheinen bis zu zwei schwächere Nadeln mit ihrer Entfernung.'],
        ['Kontrollleuchten & Tempo', 'Links leuchtet „Zeitweise begrenzt“, wenn nur zeitweise ein Limit gilt – nachts, bei Nässe oder per Anzeigetafel. Rechts der GPS-Empfang: grün gut, gelb schwach, rot kein Signal. Unten: dein Tempo und das Limit laut Karte.'],
        ['Unbegrenzt!', 'Die Nadel geht aus, die Striche füllen sich mit der gefahrenen Strecke. Darunter: wie viele Kilometer es noch unbegrenzt geht.'],
        ['Menü', 'Hier oben findest du jederzeit dieses Tutorial, die Demo-Fahrt und die Sprache. Starte die App vor der Fahrt und bediene sie unterwegs nicht. Gute Fahrt!']
      ]
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
      kreuz: 'Interchange', in: 'in',
      inDist: 'in',
      left: 'left', right: 'right', ahead: 'ahead',
      started: 'Start · {d} driven',
      endsIn: 'Ends in {d}',
      warn: 'Limits at times – watch the signs', warnShort: 'Temporary limit', demoItem: 'Demo drive', langItem: 'Language', menu: 'Menu',
      gpsOk: 'GPS', gpsWeak: 'Weak GPS', gpsNone: 'No GPS',
      dir: 'Heading',
      winds: ['north', 'northeast', 'east', 'southeast', 'south', 'southwest', 'west', 'northwest'],
      demoTag: 'DEMO',
      tut: 'Tutorial', tutEnd: 'End tutorial', next: 'Next', done: 'Done', skip: 'Exit',
      tutSteps: [
        ['Needle & distance', 'The needle points along the motorway to the next section without a speed limit. Below: how many kilometres are left.'],
        ['Motorway & direction', 'At the top you see which motorway you are on and which way you are heading. Before an interchange it shows how far away it is.'],
        ['At an interchange', 'If another route via an interchange leads to an unlimited section, up to two fainter needles appear with their distance.'],
        ['Lamps & speed', 'On the left, “Temporary limit” lights up when a limit applies only at times – at night, in the wet or via electronic signs. On the right, GPS reception: green good, amber weak, red no signal. Below: your speed and the map’s limit.'],
        ['Unlimited!', 'The needle goes dark and the ticks fill up as you drive through. Below: how many unlimited kilometres are left.'],
        ['Menu', 'Up here you can always find this tutorial, the demo drive and the language. Start the app before you drive and don’t use it on the move. Have a good drive!']
      ]
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
    document.querySelectorAll('.lang').forEach(function (lg) {
      if (lg.classList.contains('en') !== (lang === 'en')) {
        var kn = lg.querySelector('.lang-knob'), first = !lg.dataset.ready;
        if (first) kn.style.transition = 'none';
        lg.classList.toggle('en', lang === 'en');
        if (first) { void kn.offsetWidth; kn.style.transition = ''; }
        else { lg.classList.remove('sliding'); void lg.offsetWidth; lg.classList.add('sliding'); }
      }
      lg.dataset.ready = '1';
    });
    var mb = $('menuBtn'); if (mb) mb.setAttribute('aria-label', t('menu'));
    updateDataState();
  }
  function setLang(l) {
    if (l === lang) return;
    lang = l;
    try { localStorage.setItem('nus.lang', lang); } catch (e) {}
    applyLang();
  }
  var langDragged = false;
  document.querySelectorAll('.lang button').forEach(function (b) {
    b.addEventListener('click', function () { if (langDragged) return; setLang(b.dataset.lang); });
  });
  // Wischen: der Knopf folgt dem Finger und rastet auf der näheren Seite ein
  document.querySelectorAll('.lang').forEach(function (lg) {
    var kn = lg.querySelector('.lang-knob'), bs = lg.querySelectorAll('button');
    var x0 = 0, base = 0, max = 0, active = false, moved = false, pos = 0;
    lg.addEventListener('pointerdown', function (e) {
      active = true; moved = false; langDragged = false; x0 = e.clientX;
      max = bs[1].offsetLeft - bs[0].offsetLeft;
      base = lang === 'en' ? max : 0; pos = base;
    });
    lg.addEventListener('pointermove', function (e) {
      if (!active) return;
      var dx = e.clientX - x0;
      if (!moved && Math.abs(dx) < 6) return;
      if (!moved) { moved = true; kn.style.transition = 'none'; try { lg.setPointerCapture(e.pointerId); } catch (er) {} }
      pos = Math.max(0, Math.min(max, base + dx));
      kn.style.transform = 'translateX(' + pos + 'px)';
    });
    function end(cancel) {
      if (!active) return; active = false;
      if (!moved) return;
      langDragged = true; setTimeout(function () { langDragged = false; }, 50);
      var target = pos > max / 2 ? 'en' : 'de';
      void kn.offsetWidth; kn.style.transition = '';
      if (!cancel && target !== lang) setLang(target);
      void kn.offsetWidth; kn.style.transform = '';   // gleitet von der Fingerposition aus in die Raste
    }
    lg.addEventListener('pointerup', function () { end(false); });
    lg.addEventListener('pointercancel', function () { end(true); });
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
    $('dataState').textContent = DEMO ? t(TUT ? 'tut' : 'demo') : (hasCache ? t('dataCached') + ver : t('dataLater'));
  }

  // ---------- Zustand ----------
  var TUT = /[?&]tutorial/.test(location.search);
  var DEMO = TUT || /[?&]demo/.test(location.search);
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

  // ---------- Kopfzeile: Kreuz als „AK in 3,9 km“ + Name, sonst Himmelsrichtung ----------
  var DIRTXT = '', KREUZ_ON = false, lastKreuzKey = '';
  function kreuzParts(name) {
    var n = (name || '').trim(), ab = 'AK';
    var m = n.match(/^(Autobahn)?(kreuz|dreieck)\s+/i);
    if (m) { ab = /dreieck/i.test(m[2]) ? 'AD' : 'AK'; n = n.slice(m[0].length); }
    else if (/^(AK|AD)\s+/.test(n)) { ab = n.slice(0, 2); n = n.slice(3); }
    return { ab: ab, name: n };
  }
  function setKreuz(k) {
    var p = kreuzParts(k.name), sub = p.ab + ' ' + t('in') + ' ' + fmtKm(k.dist) + ' km';
    var key = sub + '|' + p.name;
    if (key === lastKreuzKey) return;
    lastKreuzKey = key;
    var el = $('dirText');
    if (!p.name) { el.innerHTML = ''; el.textContent = sub; KREUZ_ON = true; el.classList.remove('two', 'small'); return; }
    el.innerHTML = '<span class="dt-sub"></span><span class="dt-main"></span>';
    el.querySelector('.dt-sub').textContent = sub;
    el.querySelector('.dt-main').textContent = p.name;
    el.classList.add('two'); el.classList.remove('small');
    var main = el.querySelector('.dt-main');
    if (main.scrollWidth > main.clientWidth + 1) el.classList.add('small');
    if (main.scrollWidth > main.clientWidth + 1) {
      // passt auch verkleinert nicht: nur Autobahn + Fahrtrichtung zeigen
      el.classList.remove('two', 'small'); el.textContent = DIRTXT; KREUZ_ON = false; return;
    }
    KREUZ_ON = true;
  }
  function clearKreuz() {
    if (!KREUZ_ON && !lastKreuzKey) return;
    KREUZ_ON = false; lastKreuzKey = '';
    var el = $('dirText'); el.classList.remove('two', 'small'); el.textContent = DIRTXT;
  }

  // ---------- Druckschalter: Klang + Haptik ----------
  var AC = null;
  function audio() {
    if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { AC = null; } }
    if (AC && AC.state === 'suspended') AC.resume();
    return AC;
  }
  // kurzer, gefilterter Rauschimpuls (Kunststoff/Metall-Anschlag)
  function burst(ac, t, freq, q, dur, gain) {
    var len = Math.ceil(ac.sampleRate * dur), buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 4);
    var src = ac.createBufferSource(); src.buffer = buf;
    var bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = freq; bp.Q.value = q;
    var g = ac.createGain(); g.gain.value = gain;
    src.connect(bp); bp.connect(g); g.connect(ac.destination); src.start(t);
  }
  // gedämpfter Körper des Schalters (tiefes „Tock“)
  function body(ac, t, f0, f1, dur, gain) {
    var o = ac.createOscillator(), g = ac.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.003); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + dur + 0.02);
  }
  // sehr kurzer, klarer Ton-Anteil (der „Tick“ eines feinen Rastwerks)
  function ping(ac, t, f, dur, gain) {
    var o = ac.createOscillator(), g = ac.createGain();
    o.type = 'triangle'; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 0.82, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.0008); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + dur + 0.01);
  }
  function clickSound(down) {
    var ac = audio(); if (!ac) return;
    var t = ac.currentTime + 0.003;
    if (down) {
      // knackiger Klick: harter, heller Anschlag, kaum Körper – Richtung Timer-Rädchen
      burst(ac, t, 4200, 1.6, 0.007, 1.0);
      ping(ac, t, 2900, 0.012, 0.28);
      body(ac, t, 420, 300, 0.012, 0.12);
    } else {
      // Loslassen: feiner, leiserer Tick
      burst(ac, t, 5200, 2, 0.005, 0.55);
      ping(ac, t, 3400, 0.008, 0.14);
    }
  }
  function haptic(strong) {
    try { if (navigator.vibrate) { navigator.vibrate(strong ? 6 : 4); return; } } catch (e) {}
    // iOS (ab 18): Umschalter-Haptik über verstecktes Schalter-Feld
    try { var l = $('hapt'); if (l) l.click(); } catch (e) {}
  }
  function pressable(el, cls, target, onUp) {
    var on = false, tgt = target || el;
    function down(e) { if (on) return; on = true; tgt.classList.add(cls); clickSound(true); haptic(true); }
    function up(e, cancel) { if (!on) return; on = false; tgt.classList.remove(cls); if (!cancel) { clickSound(false); if (onUp) onUp(e); } }
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointerup', function (e) { up(e); });
    el.addEventListener('pointercancel', function (e) { up(e, true); });
    el.addEventListener('pointerleave', function (e) { up(e, true); });
  }
  pressable($('go'), 'pressed');
  pressable($('lang'), 'pressed');
  pressable($('lang2'), 'pressed');
  // Demo beenden: kurz warten, damit der Klick hörbar ist und das Eindrücken sichtbar wird
  pressable($('demoEnd'), 'pressed');
  $('demoEnd').addEventListener('click', function (e) {
    e.preventDefault(); if (TUT) markTutDone(); var href = this.href; setTimeout(function () { location.href = href; }, 160);
  });

  // ---------- Menü ----------
  function setMenu(open) {
    document.body.classList.toggle('menu-open', open);
    $('menuBtn').classList.toggle('open', open);
    $('menuBtn').setAttribute('aria-expanded', open ? 'true' : 'false');
    $('menu').setAttribute('aria-hidden', open ? 'false' : 'true');
  }
  pressable($('menuBtn'), 'pressed');
  $('menuBtn').addEventListener('click', function () { setMenu(!document.body.classList.contains('menu-open')); });
  $('menuScrim').addEventListener('click', function () { setMenu(false); });
  ['miTut', 'miDemo'].forEach(function (id) {
    pressable($(id), 'pressed');
    $(id).addEventListener('click', function (e) { e.preventDefault(); var href = this.href; setTimeout(function () { location.href = href; }, 160); });
  });

  // Tutorial nur beim ersten Start automatisch
  function tutDone() { try { return localStorage.getItem('nus.tutDone') === '1'; } catch (e) { return true; } }
  function markTutDone() { try { localStorage.setItem('nus.tutDone', '1'); } catch (e) {} }
  function leave() { if (TUT) markTutDone(); setTimeout(function () { location.href = './?start'; }, 120); }

  // ---------- Start ----------
  function isStandalone() {
    return (window.matchMedia && (matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches)) || navigator.standalone === true;
  }
  $('go').addEventListener('click', function () {
    if (!DEMO && !tutDone()) { TUT = DEMO = true; enterDemoUI(); }
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
    if (was && !show) { n.g.classList.remove('cooling'); void n.g.getBoundingClientRect(); n.g.classList.add('cooling'); }
    if (show) n.g.classList.remove('cooling');
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
    var gs = acc == null || acc > 60 ? 'off' : acc <= 25 ? 'ok' : 'weak';
    $('gpsLamp').className = 'tt gps-' + gs;
    $('gpsText').textContent = t(gs === 'ok' ? 'gpsOk' : gs === 'weak' ? 'gpsWeak' : 'gpsNone');
    $('speed').textContent = S.speed != null ? Math.round(S.speed * 3.6) : '--';
    var winds = t('winds');
    DIRTXT = S.heading != null ? t('dir') + ' ' + winds[Math.round(S.heading / 45) % 8] : '';
    if (!KREUZ_ON) $('dirText').textContent = DIRTXT;
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
      warn.classList.add('idle'); $('warnText').textContent = t('warnShort');
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
        U.active = true; U.t0 = performance.now(); U.frac = 0; lastTicks = -1;
      }
      $('bigPre').textContent = t('still');
      $('bigNum').textContent = fmtKm(res.unlRemaining);
      $('bigLabel').textContent = t('unlimited');
      $('bigLabel').className = 'label hot';
      warn.classList.toggle('idle', !res.unlCond);
      $('warnText').textContent = t('warnShort');
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
    if (gh.length && res.kreuz) setKreuz(res.kreuz); else clearKreuz();
    var showWarn = !!(res.main && res.main.cond);
    warn.classList.toggle('idle', !showWarn);
    $('warnText').textContent = t('warnShort');
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
  // Skalenstriche als Fortschritt: 72 Striche (alle 5°), die nacheinander zu glühen beginnen.
  // Alles Licht (Striche mit Schein, Bodenlicht, Reflexion an der Innenkante) wird EINMAL vorgerendert;
  // pro Bild werden nur Ausschnitte davon kopiert – kein Neuberechnen von Schatten/Verläufen, daher kein Flackern.
  var lastTicks = -1, tickCache = null;
  function buildTickCache(W) {
    var k = W / 340, c = 170 * k;
    function mk() { var x = document.createElement('canvas'); x.width = W; x.height = W; return x; }
    var G = mk(), T = mk(), H = mk();
    // Licht: Boden der Hohlkehle + gebrochene Innenkante zur Lünette (wie die Nadel-Reflexion), nichts auf der Lünette selbst
    var g = G.getContext('2d');
    g.save();
    g.beginPath(); g.arc(c, c, 128 * k, 0, 2 * Math.PI); g.clip();
    for (var s2 = 0; s2 < 72; s2++) {
      var aa = (s2 * 5 + 0.39) * Math.PI / 180;
      var gx = c + 110 * k * Math.sin(aa), gy = c - 110 * k * Math.cos(aa);
      var rg = g.createRadialGradient(gx, gy, 0, gx, gy, 30 * k);
      rg.addColorStop(0, 'rgba(255,107,31,0.075)');
      rg.addColorStop(0.5, 'rgba(255,107,31,0.025)');
      rg.addColorStop(1, 'rgba(255,107,31,0)');
      g.fillStyle = rg; g.fillRect(gx - 30 * k, gy - 30 * k, 60 * k, 60 * k);
    }
    // weicher Lichtsaum vor der Wand (wie die Streu-Reflexion der Nadeln), radial auslaufend
    for (var r = 116; r <= 126; r += 1) {
      var d = (r - 123) / 3.2;
      g.strokeStyle = 'rgba(255,130,50,' + (0.05 * Math.exp(-d * d)).toFixed(4) + ')';
      g.lineWidth = 1.1 * k; g.beginPath(); g.arc(c, c, r * k, 0, 2 * Math.PI); g.stroke();
    }
    // dünne helle Linie auf der gebrochenen Kante
    g.strokeStyle = 'rgba(255,176,112,0.42)'; g.lineWidth = 1.6 * k;
    g.beginPath(); g.arc(c, c, 127 * k, 0, 2 * Math.PI); g.stroke();
    g.restore();
    // Striche (normal) und Striche in Frontfarbe (heller, für die vordersten)
    function strokes(ctx, hot) {
      ctx.lineCap = 'round';
      for (var i = 0; i < 72; i++) {
        var a = (i * 5 + 0.39) * Math.PI / 180, sn = Math.sin(a), co = Math.cos(a), tt = i / 71;
        ctx.strokeStyle = hot ? 'rgb(255,176,86)' : 'rgb(' + Math.round(232 + 23 * tt) + ',' + Math.round(72 + 50 * tt) + ',' + Math.round(15 + 23 * tt) + ')';
        ctx.shadowColor = 'rgba(255,107,31,0.9)';
        ctx.shadowBlur = (hot ? 11 : 7) * k;
        ctx.lineWidth = (hot ? 2.7 : 2.2) * k;
        ctx.beginPath();
        ctx.moveTo(c + 113.6 * k * sn, c - 113.6 * k * co);
        ctx.lineTo(c + 122.4 * k * sn, c - 122.4 * k * co);
        ctx.stroke();
      }
    }
    strokes(T.getContext('2d'), false);
    strokes(H.getContext('2d'), true);
    return { W: W, k: k, c: c, G: G, T: T, H: H };
  }
  function wedge(ctx, C, img, a0, a1, alpha) {
    if (a1 <= a0 || alpha <= 0.003) return;
    var q = -Math.PI / 2, R = C.W;
    ctx.save();
    ctx.globalAlpha = Math.min(1, alpha);
    ctx.beginPath(); ctx.moveTo(C.c, C.c);
    ctx.arc(C.c, C.c, R, q + a0 * Math.PI / 180, q + a1 * Math.PI / 180, false);
    ctx.closePath(); ctx.clip();
    ctx.drawImage(img, 0, 0);
    ctx.restore();
  }
  function drawTicks(f) {
    if (Math.abs(f - lastTicks) < 0.00005) return;
    lastTicks = f;
    var cv = $('ringCanvas'), dpr = window.devicePixelRatio || 1;
    var W = Math.round(cv.clientWidth * dpr);
    if (!W) return;
    if (cv.width !== W) { cv.width = W; cv.height = W; }
    if (!tickCache || tickCache.W !== W) tickCache = buildTickCache(W);
    var C = tickCache, ctx = cv.getContext('2d');
    ctx.clearRect(0, 0, W, W);
    var lit = Math.min(72, Math.max(1, f * 72)), full = Math.floor(lit), part = lit - full;
    var end = lit * 5 - 2.1; // Winkel der Lichtfront
    // Licht: gleitet stufenlos mit, läuft an beiden Enden über ~20° bzw. ~10° sanft aus
    if (lit >= 72) wedge(ctx, C, C.G, -180, 180, 1);
    else {
      // Licht strahlt auch nach vorn: Auslauf beginnt kurz vor der Front und reicht ~12° über sie hinaus
      var FD = 20, N = 10, F0 = end - 8;
      wedge(ctx, C, C.G, 0, F0, 1);
      for (var n = 0; n < N; n++) {
        var b0 = F0 + n * FD / N, b1 = b0 + FD / N;
        wedge(ctx, C, C.G, Math.max(0, b0), b1, 1 - (n + 0.5) / N);
      }
      for (var m = 0; m < 5; m++) wedge(ctx, C, C.G, -(m + 1) * 2, -m * 2, 1 - (m + 0.5) / 5);
    }
    // Striche: alle vollen, dazu der gerade angehende anteilig
    wedge(ctx, C, C.T, -2.1, full * 5 - 2.1, 1);
    if (full < 72) wedge(ctx, C, C.T, full * 5 - 2.1, full * 5 + 2.9, part);
    // vorderste Striche heller (fließend)
    for (var j = Math.max(0, full - 3); j <= full && j < 72; j++) {
      var hot = Math.max(0, 1 - (lit - j - 0.5) / 3) * (j === full ? part : 1);
      wedge(ctx, C, C.H, j * 5 - 2.1, j * 5 + 2.9, hot);
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
  var DemoCtl = { jump: function () {} };
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
      function kmhOf() { return g.isUnl(e) ? 230 : (g.lim[e] > 0 ? g.lim[e] - 2 : 128); }
      function moveBy(m) {
        along += m;
        while (along > g.len[e]) {
          along -= g.len[e];
          var nx = g.next(e);
          if (nx < 0) { reset(); return; }
          e = nx;
        }
      }
      function emit() {
        var f = along / g.len[e];
        var a = g.from[e], b = g.to[e];
        var la = g.lat[a] + (g.lat[b] - g.lat[a]) * f;
        if (la < END) { reset(); return emit(); }
        S.pos = { lat: la, lon: g.lon[a] + (g.lon[b] - g.lon[a]) * f, acc: 8, date: demoDate };
        S.heading = g.brg[e]; S.headingAt = Date.now(); S.speed = kmhOf() / 3.6;
        update();
      }
      function step() {
        var now = Date.now(), dt = Math.min(0.5, (now - last) / 1000); last = now;
        if (TUT) return;                       // im Tutorial steht die Fahrt, bis „Weiter“ gedrückt wird
        moveBy((kmhOf() / 3.6) * dt * SPEEDUP);
        emit();
      }
      // Tutorial: sofort zur nächsten passenden Stelle der Strecke springen
      DemoCtl.jump = function (pred) {
        for (var n = 0; n < 4000 && !pred(S.res); n++) { moveBy(100); emit(); }
      };
      setInterval(step, 250);
      step();
      if (TUT) Tut.start();
    };
    document.body.appendChild(s);
  }

  // ---------- Tutorial: Overlay mit Spotlight, weiter per Tippen ----------
  var Tut = (function () {
    // Jeder Schritt: was hervorgehoben wird und welcher Fahrzustand dafür erreicht sein muss
    var STEPS = [
      { sel: ['#dial', '.readout'], until: function (r) { return r && r.main && !r.inUnl; } },
      { sel: ['.top .road'], until: function (r) { return r && r.main && !r.inUnl; } },
      { sel: ['#dial'], round: true, until: function (r) { return r && !r.inUnl && r.ghosts && r.ghosts.length > 0; }, settle: 1300 },
      { sel: ['#lamps', '.bottom'], until: function (r) { return r && !r.inUnl && r.main && r.main.cond; } },
      { sel: ['#dial', '.readout'], until: function (r) { return r && r.inUnl && r.unlDriven > 0.3 * (r.unlDriven + r.unlRemaining); }, settle: 350 },
      { sel: ['#menuBtn'], round: true, until: function () { return true; } }
    ];
    var i = -1, waiting = false, readyAt = 0, ov, spot, card;
    function build() {
      ov = document.createElement('div'); ov.className = 'tut pre wait'; document.documentElement.classList.add('tut-on'); ov.innerHTML =
        '<div class="tut-spot"></div><div class="tut-card raised"><div class="tut-top"><h3 class="tut-h"></h3><div class="tut-k"></div></div><p class="tut-p"></p>' +
        '<div class="tut-row"><button type="button" class="tut-skip"></button><button type="button" class="tut-next"></button></div></div>';
      document.body.appendChild(ov);
      spot = ov.querySelector('.tut-spot'); card = ov.querySelector('.tut-card');
      pressable(ov.querySelector('.tut-next'), 'pressed');
      ov.querySelector('.tut-next').addEventListener('click', next);
      ov.querySelector('.tut-skip').addEventListener('click', leave);
      window.addEventListener('resize', place);
    }
    function place() {
      if (i < 0 || waiting) return;
      var st = STEPS[i], vh = window.innerHeight, r = null;
      // Spotlight umschließt alle genannten Elemente
      (st.sel || []).forEach(function (q) {
        var b = document.querySelector(q).getBoundingClientRect();
        r = r ? { left: Math.min(r.left, b.left), top: Math.min(r.top, b.top), right: Math.max(r.right, b.right), bottom: Math.max(r.bottom, b.bottom) } : { left: b.left, top: b.top, right: b.right, bottom: b.bottom };
      });
      if (r) {
        r.width = r.right - r.left; r.height = r.bottom - r.top;
        var pad = st.round ? 6 : 10;
        spot.style.left = (r.left - pad) + 'px'; spot.style.top = (r.top - pad) + 'px';
        spot.style.width = (r.width + 2 * pad) + 'px'; spot.style.height = (r.height + 2 * pad) + 'px';
        spot.style.borderRadius = st.round ? '50%' : '22px';
        spot.classList.remove('none');
        // Karte auf die Seite, auf der mehr Platz ist (immer über „top“, damit sie gleitet statt springt)
        var ch = card.offsetHeight, spaceB = vh - r.bottom - pad, spaceT = r.top - pad, need = ch + 26;
        var top;
        if (spaceB >= need) top = r.bottom + pad + 14;
        else if (spaceT >= need) top = r.top - pad - 14 - ch;
        else top = Math.max(r.bottom - 6, vh - ch - 12);   // kein Platz: Karte unten, möglichst ohne das Hervorgehobene zu verdecken
        card.style.top = Math.max(12, top) + 'px';
      } else {
        spot.classList.add('none');
        var cx = window.innerWidth / 2, cy = vh * 0.4;
        spot.style.left = cx + 'px'; spot.style.top = cy + 'px'; spot.style.width = '0px'; spot.style.height = '0px';
        card.style.top = Math.round(vh * 0.64 - card.offsetHeight) + 'px';
      }
    }
    function show() {
      var txt = t('tutSteps')[i];
      ov.querySelector('.tut-k').textContent = (i + 1) + ' / ' + STEPS.length;
      ov.querySelector('.tut-h').textContent = txt[0];
      ov.querySelector('.tut-p').textContent = txt[1];
      ov.querySelector('.tut-next').textContent = i === STEPS.length - 1 ? t('done') : t('next');
      ov.querySelector('.tut-skip').textContent = t('skip');
      ov.querySelector('.tut-skip').style.visibility = i === STEPS.length - 1 ? 'hidden' : '';
      place();
      if (ov.classList.contains('pre')) { card.style.transition = 'none'; void card.offsetHeight; card.style.transition = ''; ov.classList.remove('pre'); }
      ov.classList.remove('wait');
    }
    function next() {
      if (waiting) return;
      if (i === STEPS.length - 1) { leave(); return; }
      i++; waiting = true;
      ov.classList.add('wait');           // Karte blendet aus, die Anzeige springt sofort zur passenden Stelle
      var st = STEPS[i];
      setTimeout(function () {
        DemoCtl.jump(st.until);
        setTimeout(function () { waiting = false; show(); }, st.settle == null ? 700 : st.settle);
      }, 250);
    }
    return { start: function () { build(); next(); } };
  })();

  // ---------- Easter Egg ----------
  // 5× aufs Schild tippen: unter dem Schild flackert eine kleine orange 22 auf wie eine Kontrollleuchte
  (function () {
    var taps = 0, last = 0, busy = false, lamp = $('egg22');
    function set(v) { lamp.style.opacity = v; }
    function flicker(seq, done) {
      var i = 0;
      (function f() { set(seq[i][0]); var d = seq[i][1]; i++; if (i < seq.length) setTimeout(f, d); else if (done) setTimeout(done, d); })();
    }
    $('medal').addEventListener('click', function () {
      var now = Date.now();
      taps = now - last < 900 ? taps + 1 : 1;
      last = now;
      if (taps < 5 || busy) return;
      taps = 0; busy = true;
      // Glühlämpchen: zögerndes Angehen, 3 s an mit leichtem Unruhe-Flimmern, dann flackernd aus
      flicker([[0.5, 60], [0.05, 80], [0.8, 50], [0.3, 70], [1, 0]], function () {
        var t0 = performance.now();
        (function hold(now) {
          var p = now - t0;
          if (p < 3000) { set((0.9 + 0.1 * Math.sin(p / 37) * Math.sin(p / 91)).toFixed(3)); requestAnimationFrame(hold); }
          else flicker([[0.35, 70], [0.85, 50], [0.1, 90], [0.4, 60], [0, 0]], function () { busy = false; });
        })(t0);
      });
    });
  })();

  // ---------- Init ----------
  var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (isIOS && !isStandalone()) $('iosHint').classList.remove('hidden');
  if (RINGMODE === 'ticks') $('dial').classList.add('ticks');
  if (!REFLECT) { $('reflect').style.display = 'none'; ['floor0', 'floor1', 'floor2'].forEach(function (id) { $(id).style.display = 'none'; }); }
  function enterDemoUI() {
    $('demoEnd').classList.remove('hidden'); document.querySelector('.top').classList.add('demo');
    if (TUT) { document.querySelector('.top').classList.add('is-tut'); $('demoEnd').setAttribute('data-t', 'tutEnd'); $('demoEnd').textContent = t('tutEnd'); }
  }
  if (DEMO) { enterDemoUI(); if (TUT) $('dataState').textContent = t('tut'); }
  // aus dem Menü oder nach Demo/Tutorial: direkt losfahren, ohne erneuten Hinweis
  if (/[?&]start/.test(location.search)) {
    try { history.replaceState(null, '', DEMO ? location.pathname + (TUT ? '?tutorial' : '?demo') : location.pathname); } catch (e) {}
    setTimeout(function () { $('go').click(); }, 0);
  }
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
