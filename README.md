# Next Unlimited

Web-App (iPhone & Android), die auf der Autobahn per Kompassnadel zum nächsten Abschnitt ohne Tempolimit zeigt.

- `app/` – die App (wird von Netlify veröffentlicht)
- `app/data/` – Autobahndaten für Deutschland (wird automatisch erzeugt)
- `scripts/build-data.mjs` – holt die Daten von OpenStreetMap (Overpass) und bereitet sie auf
- `.github/workflows/data.yml` – aktualisiert die Daten jeden Montag automatisch (auch per Knopfdruck unter „Actions“ startbar)
- `test/` – Tests mit einem künstlichen Autobahnnetz (`node test/test-engine.js`, `node test/test-build.mjs`)

Datenquelle: © OpenStreetMap-Mitwirkende (ODbL).
