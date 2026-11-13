# Next Unlimited

Web-App (iPhone & Android), die auf der Autobahn per Kompassnadel zum nächsten Abschnitt ohne Tempolimit zeigt.

- `app/` – die App (wird von Netlify veröffentlicht)
- `app/data/` – Autobahndaten für Deutschland (wird automatisch erzeugt)
- `.github/workflows/data-geofabrik.yml` – aktualisiert die Daten jeden Montag automatisch aus dem Geofabrik-Deutschland-Extrakt (auch per Knopfdruck unter „Actions“ startbar, mit Option „Nur testen“)
- `scripts/build-data-pbf.mjs` – bereitet den gefilterten Extrakt auf; `scripts/compare-data.mjs` vergleicht zwei Datensätze
- `.github/workflows/data.yml` + `scripts/build-data.mjs` – Reserve: alter Weg über Overpass-Server
- `test/` – Tests mit einem künstlichen Autobahnnetz (`node test/test-engine.js`, `node test/test-build.mjs`)

Datenquelle: © OpenStreetMap-Mitwirkende (ODbL).
