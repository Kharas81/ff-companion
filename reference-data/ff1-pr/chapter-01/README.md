# Final Fantasy I Pixel Remaster – Referenzpaket Kapitel 1 (Pilot)

Stand: 29. Oktober 2026. **Nur ein Kapitel-1-Pilot**, keine vollständige 128/249-Datenbank. Es wurden unabhängige Webseiten tatsächlich geöffnet und geprüft; dies ist keine direkte Auslesung von Spieldateien.

## Inhalt
- `sources.json`: genaue Quellen und Fundstellen.
- `bestiary.json`: IDs #001–#012, englische Namen und HP. Deutsche Ingame-Namen noch **nicht** verifiziert.
- `treasures.json`: alle 6 Chaos-Schrein-Truhen, Positionen, verschlossene Räume und Summen. Das Schloss enthält weitere 6 verschlossene Truhen; deren Einzelinhalte fehlen noch.
- `shops.json`: Cornelia-Händlerwerte mit zwei übereinstimmenden Quellen.
- `companion-identity.json`: echte vorhandene Kapitel-, Abschnitts- und Aufgaben-IDs aus GitHub.
- `mechanics.json`: offene bzw. nur einfach gestützte Aussagen (nicht blind übernehmen).
- `validate.py`: lokaler Validator für Gemini-Kapiteldateien.

## Was der Validator wirklich kann
Prüft JSON-Syntax, Schema-Basiselemente, enums, Original-IDs, wichtige Truhen-/Bestiariumwerte in strukturierten Titeln, und `needs-review` bei blockierten Daten. **Er beweist keine spielerische Korrektheit freier Fließtexte.** Eine ausführliche Quellenprüfung bleibt erforderlich. Der Validator markiert nicht vorhandene Aufgaben und geänderte Task-Keys als Fehler. Neue Aufgaben sind zulässig, wenn sie bestehende nicht ersetzen.

### Verwendung
`python validate.py /pfad/zu/neuem/chapter-01.json`

## Weiter ausstehend
Spielversion/build und deutsche Namen anhand realer Screenshots; Schloss-Cornelia-Einzeltruhen; sichere Daten zu Stufenaufstieg, weiteren Drops und Begegnungshäufigkeit. Das Pilotpaket darf nicht automatisch `VERIFIED_PRIMARY` beanspruchen.