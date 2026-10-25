# ✦ Final Fantasy 100% Companion

Ein **inoffizieller, deutschsprachiger Fan-Guide** für die Einzelspieler-Hauptteile von **Final Fantasy I bis XVI** – ohne XI und XIV, ohne Spin-offs. Ziel: konsistente, überschaubare 100%-Kapitel statt riesiger Codeblöcke.

> **Projektstatus:** Technisch nutzbare Version 0.1.0. Nur **FF I Pixel Remaster, Kapitel 1** ist mit tatsächlichem Guide-Inhalt befüllt. Die anderen Spiele sind als leere Platzhalter vorbereitet. Keine Behauptung, dass ein vollständiger 100%-Walkthrough bereits vorliegt.

## Verbindliche Kapitelregel

**Ein Kapitel = eine eigene JSON-Datei im Repository.** Es wird niemals ein vollständiges HTML-Dokument pro Kapitel angelegt. HTML (`index.html`), Design (`assets/styles.css`) und Logik (`assets/app.js`) werden von allen Kapiteln gemeinsam genutzt.

- Beispiel: `data/ff1/chapter-01.json`, `data/ff1/chapter-02.json`, `data/ff5/chapter-01.json`.
- Neue Kapitel einzeln hinzufügen und in `data/manifest.json` beim passenden Spiel unter `chapterFiles` registrieren.
- Große Dungeons können in mehrere eigenständige, chronologisch nummerierte Teilkapitel mit jeweils **eigener JSON-Datei** aufgeteilt werden.
- IDs bereits veröffentlichter Kapitel, Abschnitte und Aufgaben bleiben bei Überarbeitungen stabil, damit Häkchen erhalten bleiben.
- Nur Guide-Daten sind öffentlich. Spielstände und Checkbox-Fortschritt bleiben lokal im Browser und gehören nicht in GitHub.
- JSON-Import zum Testen möglich; **für die öffentliche Version wird eine Datei im Repository veröffentlicht**, damit alle Besucher sie automatisch bekommen.

## Funktionen

- Einheitliches Layout für alle 14 geplanten Hauptteile
- Kapitel und Teilabschnitte mit Routen, Tipps, Checklisten, Bossen, Bestiarium und Truhen
- Fortschritt nach Kapitel und Spiel, lokal im Browser gespeichert
- Nach offenen Aufgaben oder Checklisten-Kategorien filtern
- **Kapitelimport per JSON** ohne Änderungen am HTML-Code
- Sicherung und Wiederherstellung von Fortschritt **und** lokal importierten Kapiteln als JSON
- Funktioniert auf GitHub Pages ohne Server, Datenbank, Login, externe Libraries oder Tracking
- Startkapitel über `assets/offline-seed.js` auch beim lokalen Öffnen von `index.html` verfügbar

## GitHub Pages öffentlich schalten

1. Auf [github.com/new](https://github.com/new) ein **neues Repository** anlegen, z. B. `ff-companion`.
2. **Public** auswählen. Du kannst gleich eine README erstellen; falls du dieses Paket anschließend hochlädst, ersetzt du die Platzhalter-README.
3. Die Dateien und Ordner aus dem **entpackten Projektordner** ins Repository hochladen (`index.html` muss im Stammverzeichnis liegen), z. B. über `Add file` → `Upload files`, oder per Git.
4. `Settings` → `Pages` → bei `Build and deployment` als Quelle `Deploy from a branch` wählen, Branch `main`, Ordner `/(root)` → `Save`.
5. Nach erfolgreicher Veröffentlichung ist die Seite normalerweise unter `https://BENUTZERNAME.github.io/REPOSITORYNAME/` erreichbar. Die konkrete URL erst nach der Bereitstellung prüfen.

> Wenn ChatGPT Zugriff auf das neue Repository bekommt, können spätere Kapitel direkt als Dateien auf GitHub hinzugefügt werden. Es ist nicht nötig, HTML-Blöcke in den Chat zu kopieren.

## Wie füge ich Kapitel hinzu?

### A. Lokal importieren (ohne GitHub-Update)

1. Den Guide öffnen, auf **JSON importieren** klicken.
2. Eine Datei im Format `ff-companion-chapter` (oder ein Paket mit mehreren Kapiteln) auswählen.
3. Das Kapitel erscheint direkt im Guide, die importierten Daten werden im Browser gespeichert.
4. Für einen anderen Browser oder ein neues Gerät eine **Sicherung** exportieren und dort importieren.

**Wichtig:** Ein lokaler Import ändert nicht das öffentliche Repository. Andere Besucher erhalten das neue Kapitel erst, wenn es auf GitHub veröffentlicht wird.

### B. Öffentliches Kapitel veröffentlichen

1. Neue JSON-Datei unter `data/ff1/chapter-02.json` hochladen (analog andere Spiele).
2. Pfad im passenden Spiel unter `data/manifest.json` bei `chapterFiles` ergänzen.
3. GitHub Pages veröffentlicht die Änderung; Browser rufen die Kapitel über den Manifest-Pfad ab.

Für lokal direkt per Doppelklick geöffnete Dateien werden die Offline-Startdaten aus `assets/offline-seed.js` verwendet. Neue **öffentlich** hinzugefügte Kapitel sind ohne lokalen Import erst über GitHub Pages verfügbar. Bei späteren Releases kann die Offline-Seed-Datei aktualisiert werden.

## Fortschritt und Datenschutz

- Fortschritt wird unter dem Browser-Schlüssel `ff-companion-v1` in `localStorage` gespeichert.
- **Deine Häkchen gehen nicht an GitHub, Square Enix oder einen eigenen Server.**
- Nutzt du einen anderen Browser oder löschst Browserdaten, fehlen diese Häkchen ohne zuvor exportierte Sicherung.
- Kapiteländerungen sollen **bestehende IDs beibehalten**, um den Fortschritt nicht zu verlieren.
- Bitte keine privaten Spielstände in das öffentliche Repository committen.

## Verzeichnisstruktur

```text
ff-companion/
├─ index.html
├─ assets/
│  ├─ styles.css
│  ├─ app.js
│  └─ offline-seed.js
├─ data/
│  ├─ manifest.json
│  └─ ff1/
│     └─ chapter-01.json
├─ docs/
│  ├─ kapitel-schema.md
│  └─ roadmap.md
├─ README.md
├─ LICENSE
└─ .nojekyll
```

## Inhaltliche Genauigkeit

Die FF-I-Demo bezieht sich auf die **Pixel Remaster**-Version, nicht auf GBA-/PSP-Zusatzdungeons. Quellen und Abgleichseiten sind im Kapitel hinterlegt. Sprachfassungen können abweichende Namen verwenden. Kapitel, Truhen, Monster und Strategien werden schrittweise überprüft. Die Inhalte sind eigenständig formuliert; keine fremden Karten, Screenshots, Sprites oder Texte eingebunden.

## Lizenz und Marken

Quellcode: MIT-Lizenz (siehe `LICENSE`). Das Projekt ist **nicht offiziell**, steht in keiner Verbindung zu Square Enix, und **Final Fantasy** ist eine Marke ihrer jeweiligen Rechteinhaber. Für die Guide-Texte gilt bis zu einer ausdrücklichen separaten Freigabe: alle Rechte vorbehalten. Die MIT-Lizenz gestattet nicht die Übernahme fremder Grafiken oder Spielassets.