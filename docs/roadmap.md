# FF Companion · Entwicklungs- und Änderungsliste

Stand: 26. Oktober 2026. Geprüfte Vorschläge, **noch nicht automatisch implementiert**.
Die Datei dient als gemeinsame Roadmap für unser öffentliches Repository.

## Verbindliche Projektregeln

- **Eine eigene JSON-Datei je Kapitel / eigenständigem Teilkapitel**, ein gemeinsames HTML/CSS/JS-Gerüst für alle Einzelspieler-Hauptteile FF I–XVI ohne XI und XIV.
- **Keine Dungeon-Karten** (ausdrücklicher Nutzerwunsch).
- Spielstände, Häkchen und Lesezeichen sind persönliche lokale Daten. Änderungen an Kapiteldateien dürfen die stabilen IDs und bestehenden Fortschritte nicht zerstören.
- Der Guide muss zwischen *Story beendet*, *dokumentierte Pflichten erfüllt* und *vollständige 100%-Sammlung* unterscheiden. Nicht verifizierte Kapitel als solche kennzeichnen.
- Keine zusätzlichen externen Bibliotheken oder Tracking-Dienste ohne triftigen Grund.

## Aktueller Stand

- [x] Öffentliche GitHub-Quellen; getrennte HTML-, CSS-, JavaScript- und JSON-Dateien.
- [x] FF I Pixel Remaster: Kapitel 1–5 als je eine eigene JSON-Datei im Manifest eingetragen.
- [x] Grundlegende Fortschrittsanzeigen und Checklisten; drei lokale Spielstände pro Spiel.
- [x] Speichern, JSON-Import/-Export, Bestiarium, „Du bist hier“, Kapitel vollständig abhaken.
- [x] Mobile Navigationsleiste und größerer Text inkl. Schriftgrößenregler.
- [ ] Alle fünf Kapitel inhaltlich gegen mehrere Pixel-Remaster-Quellen prüfen; nur dann „100% geprüft“ anzeigen.
- [ ] GitHub-Pages-Status, Mobilansicht, Slotwechsel und Import/Wiederherstellung im echten Browser prüfen.

## Geprüfte Änderungsvorschläge 01–12

| Nr. | Entscheidung | Priorität | Umsetzung und Akzeptanzkriterien |
| --- | --- | --- | --- |
| **01 Mobiles Menü** | **Übernehmen** | P1 | Sekundäraktionen (Import, Backup, Schriftgröße) mobil in zugängliches `<dialog>`-Bottom-Sheet verschieben. Desktop-Zugriff weiter ermöglichen. `showModal()`, Fokus/Rückgabe, ESC/Schließen, sichere Abstände zur unteren Fortschrittsleiste und virtuellen Tastatur testen. |
| **02 Dateieingabe A11y** | **Übernehmen** | P1 | `hidden` vom `input[type=file]` entfernen und durch `.sr-only` visuell ausblenden; eindeutiges Label, Tastaturbedienung und sichtbaren Fokus auf dem Auslöser gewährleisten. Import ohne Maus testbar. |
| **03 Unterer Sicherheitsabstand** | **Bereits größtenteils vorhanden** | P1-Test | Mobile `.main`-Abstände sind bereits gesetzt (derzeit mehr als 80 px). Bei kurzer/langer Bottom-Bar, gestapelten Gestenleisten und vergrößerter Schrift nochmals auf Überdeckung testen; **nicht blind auf 80 px verkleinern**. |
| **04 PWA** | **Übernehmen** | P1 | Eigenes `app.webmanifest`, Icons, `display: standalone`, Apple-spezifische Metadaten und Service Worker. **Alle** im Manifest veröffentlichten Kapitel inkl. CSS/JS offline nutzbar. Caches versionieren; Aktualisierung darf Spielstände nicht löschen. GitHub-Pages-Unterpfad `/ff-companion/` respektieren. |
| **05 Touch-Flächen** | **Bereits größtenteils vorhanden** | P1-Test | Checkbox ist in einer ganzen `<label>`-Kachel und mobile Höhe > 48 px. Auf 44–48 px Mindestzielgröße, Fokusmarkierung und Touch-Bedienung testen; keine verschachtelten Klickflächen. |
| **06 Status/Verpassbarkeit** | **Übernehmen** | P0 | Pro Check strukturierte **getrennte** Felder (z. B. `priority: normal/recommended/urgent/key`, `missable: boolean`, `available: now/later`, `requiredFor100: boolean`). Farben/Emojis nur als Darstellung, immer mit ausgeschriebenem Label. Zeitkritische Warnungen erklären, *wann* etwas endgültig verloren geht. Bestehendes `missable`-Flag weiter unterstützen. |
| **07 Kapitel-Dashboard** | **Angepasst übernehmen** | P1 | Optionale statische Kapitelmetadaten `recommendedLevel`, `chests.accessible`, `chests.totalLocal` erst nach Quellenprüfung. `progressPct` **nicht** als statischen JSON-Wert speichern: immer aus dem aktiven Spielstand berechnen. Optionale Aufgaben separat zählen; Truhen späterer Rückkehr nicht fälschlich als sofort offen melden. |
| **08 Shops/Kaufberatung** | **Übernehmen** | P2 | Struktur `shops[]` mit Stadt, Angeboten `mustBuy/optional/skip`, Preis, Klasse, Voraussetzung, Begründung und Alternativen. „Pflichtkauf“ nur dort, wo wirklich spielnotwendig; Geldbudget und Mönch-Ausrüstung editions- und levelabhängig behandeln. Listen ohne Shops weiterhin rendern. |
| **09 Akkordeons** | **Übernehmen (Erweiterung)** | P2 | Abschnitte sind bereits native `<details>`; ergänze optional `defaultOpen`, wobei gespeichertes „Du bist hier“ die Voreinstellung überschreibt. „Alle öffnen/schließen“ muss funktionieren. |
| **10 Gegner #013–015 früher anbieten** | **Angepasst übernehmen** | P0 | Cobra, Ogre, Ogre Chief auch beim Weg nach Pravoka in Kapitel 2 sichtbar/abhakbar machen. Im Bestiarium nur **ein kanonischer Eintrag** je Gegnernummer und Spiel; vorhandene Häkchen aus Kapitel 3 über stabile IDs bzw. Migration erhalten. Keine doppelten Pflichten für 100%. |
| **11 Taktiken Garland/Piraten** | **Übernehmen** | P0 | Garland: 212 HP, überwiegend physischer Angriff, **keine besondere Elementarschwäche** gemäß spezifischen PR-Quellen; Feuer/Blitz dennoch gut. Piraten: 9×24 HP in Pixel Remaster; Schlaf-Zauber auf ganze Gruppe, dann einzeln ausschalten. Daten nicht mit alten NES-Werten (Piraten 6 HP) vermischen. |
| **12 Diebstahl** | **Übernehmen** | P2 | Spielmechanik im Manifest/Spielprofil führen, z. B. `mechanics.supportsSteal: false` für FF I. Kein `steal`-Feld pro FF-I-Gegner nötig; andere FF-Teile können es aktivieren. |

### Weitere Einträge aus der bisherigen Roadmap

- [ ] **P0:** Bestiarium-Lücken #024 und #033 in der richtigen Spielphase mit Quellen abgleichen; Astos nummerieren. Vollständigkeit global statt nur je Kapitel prüfen.
- [ ] **P0:** Optionale Aufgaben (z. B. 15-Puzzle) dürfen den verpflichtenden Kapitelabschluss nicht blockieren; getrennte Anzeige „Story“, „Sammlung“, „Optional“.
- [ ] **P0:** „Story-Kapitel abschließen“ hinzufügen – offene Sammelaufgaben bleiben erhalten. Bestehenden bestätigten Befehl „Alles abhaken & weiter“ beibehalten.
- [ ] **P0:** Automatische JSON-Schema-/Datei-/Doppel-ID- und Bestiarium-Prüfung in GitHub Actions; Snapshot-/Migrationstests zum Fortschrittsschutz.
- [ ] **P1:** Schritt-für-Schritt-Spielmodus mit „Erledigt“, „Später“, „Weiter“; aktiven Checkpoint bei Wiedereinstieg priorisieren.
- [ ] **P1:** Spielübergreifende Sammlungsübersicht mit nachvollziehbaren Zählern und Fundorten; keine Karten.
- [ ] **P1:** Sicherung/Import/Wechsel zwischen drei Spielständen pro Spiel gründlich testen.
- [ ] **P2:** FF-spezifische Module nur bei passender Spielmechanik (z. B. Blaumagie, Jobs, Beschwörungen, Minispiele); großes Gebiet in kleine Teilkapitel aufteilen.

## Entwicklungsreihenfolge

1. **P0 – Datenintegrität und 100%-Korrektheit:** Inhalte prüfen, Pflicht/optional trennen, Bestiarium-/Truhen-Dubletten vermeiden, Abschlusslogik absichern.
2. **P1 – Mobile Benutzbarkeit und zuverlässiges Offline:** Bottom-Sheet und zugänglicher Import, PWA samt Service Worker, Fortschritt/Checkpoint, Test auf echten Geräten.
3. **P2 – Komfort:** Shop-Modell, flexible Default-Open-Regeln, spielabhängige Mechaniken.

## Technische und Spielquellen

- [MDN: Zugänglicher Dateiimport](https://developer.mozilla.org/en-US/docs/Web/API/File_API/Using_files_from_web_applications)
- [MDN: HTML dialog](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog)
- [MDN: Installierbare PWA](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable)
- [MDN: PWA offline](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation)
- [FF1 Pixel Remaster: Garland](https://vorxu.com/final-fantasy-1-pixel-remaster/bosses/garland)
- [FF1 Pixel Remaster: Pravoka und Piraten](https://vorxu.com/final-fantasy-1-pixel-remaster/walkthrough/pravoka-and-matoyas-cave)
- [FF1 Pixel Remaster: Bestiarium](https://www.soloplayguide.com/games/final-fantasy-pixel-remaster/bestiary)
- [Square Enix: Einsteigertipps für Pixel Remaster](https://www.square-enix-games.com/de_DE/news/final-fantasy-pixel-remaster-starter-tips)

**Wichtig:** Eine Markierung in dieser Roadmap ist keine Behauptung, dass die jeweilige Funktion bereits programmiert oder getestet ist.


## Implementierung am 26. Oktober 2026

Folgende Änderungen sind **im Repository programmiert**; einzelne Prüfungen auf realen Geräten und die redaktionelle Verifikation aller 100%-Details stehen weiter aus.

- [x] Mobiles `<dialog>`-Optionsmenü für Import, Backup und Schriftgröße; Desktop-Aktionen beibehalten.
- [x] Dateiimport ohne `hidden`-Attribut, über `.sr-only` visuell verborgen; tastaturfähiger Auslöser im Dialog.
- [x] Sicherheitsabstand und Touch-Kacheln im mobilen CSS nachjustiert.
- [x] PWA-Dateien, Manifest, SVG-Icon, Service Worker und Offline-Vorabcache aller im Manifest gelisteten Kapitel eingebaut. **Installation, iOS-Icon und Offline-Updates praktisch prüfen.**
- [x] Status-/Verpassbarkeitsattribute, Pflicht/optional und nachholbare Aufgaben als optionale Schemafelder.
- [x] Dashboard-Metadaten / empfohlene Level, dynamischer Fortschritt aus Pflicht-Häkchen.
- [x] Erste strukturierte Shopempfehlungen für Cornelia und Pravoka; weitere FF-I-Shops folgen nach Quellenprüfung.
- [x] `defaultOpen` für Abschnitte, vorhandene Akkordeons bleiben erhalten.
- [x] Cobra/Ogre/Ogre Chief in Kapitel 2 spiegelbar; kanonische Aufgaben-IDs zeigen denselben Haken auch in Kapitel 3. Spielweite Pflichtzählung dedupliziert.
- [x] Garland und Piraten-Taktik in Kapitel 1 und 2 ergänzt; `supportsSteal:false` in FF-I-Spielprofil.
- [x] Zweiter Kapitelabschluss `Story fertig & weiter`, ohne andere Pflichthäkchen anzutasten; `Alle Pflichtaufgaben abhaken & weiter` bleibt mit Bestätigung bestehen.
- [x] Bestiarium #033 Astos nachgetragen. #024 Ghast für späteres Gebiet vorgemerkt.

**Offene Qualitätsaufgaben:**
- [ ] Fachlicher Abgleich sämtlicher Bosswerte, Truhenpositionen, Shopangebote und Bestiarium-IDs gegen aktuelle Pixel-Remaster-Quellen.
- [ ] Kapitel 1–5 komplett im Browser und auf Handy testen (insbesondere Import, Fokussteuerung, Offline-Neustart, drei Speicherplätze).
- [ ] iOS-/Android-PWA-Installation, Fallback und Updateverhalten testen; wenn erforderlich PNG-Icons ergänzen.
- [ ] Automatische Daten-/UI-Tests per GitHub Actions ergänzen und inkonsistente Inhalte beheben.
- [ ] Globale 100%-Gesamtübersicht, Schritt-für-Schritt-Modus und Wiedereinstiegsdialog aus voriger Roadmap umsetzen.

---
