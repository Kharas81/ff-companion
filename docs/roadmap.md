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


## Ausbau vom 26. Oktober 2026: fünf Komfortfunktionen

- [x] 📊 **Globale 100-%-Übersicht** je ausgewähltem Spiel/Spielstand: veröffentlichte Pflichtaufgaben nach Truhen, Gegnern, Bossen, Schlüsselitems, Story und Sonstigem gegliedert, mit fehlenden Einträgen und Sprung zum Fundort. Gespiegelte Gegner werden anhand der kanonischen Aufgaben-ID dedupliziert.
- [x] 🎯 **Schritt-für-Schritt-Modus**: eine offene Pflichtaufgabe anzeigen und mit `Erledigt`, `Später` oder `Zum Abschnitt` bearbeiten. Aufgeschobene Aufgaben bleiben offen und sind spielstandbezogen gespeichert.
- [x] 📍 **Fortsetzen**: aus der mobilen Daumenleiste oder dem Hinweis im Kapitel zur zuletzt gesetzten Position springen; Speicherort ist spielstandbezogen.
- [x] 🛒 **Gruppenspezifische Shopempfehlungen**: vier editierbare Klassen je Spielstand für FF I; die in Kapitel 1 und 2 vorhandenen `shops[]`-Empfehlungen werden mit `classes[]` gefiltert. Weitere Kapitel und Spiele benötigen ergänzende Shop-Daten.
- [x] 🧙 **Erweiterbare Sammlungsansicht**: Bestiarium, Schatztruhen, Schlüsselgegenstände, Bosse sowie vorbereitete Kategorien für Jobs, Blaumagie, Beschwörungen und Minispiele. Leere Kategorien werden ausdrücklich als noch nicht veröffentlicht ausgewiesen.

**Tests vor produktiver Freigabe:** JavaScript-Syntax, GitHub-Dateizugriff und JSON-Parsing geprüft. Noch offen: Vollständiger Browser-/Mobiltest von Schrittmodus, Slotwechsel, Shop-Klassenauswahl, Offline-PWA und Import/Export. Kein Anspruch, dass alle Spielinhalte bereits 100 % vollständig redaktionell geprüft sind.



## Arbeitsstand 26.10.2026 – QA-Runde vor Kapitel 6

### Erledigt und technisch kontrolliert
- [x] GitHub Actions Workflow `.github/workflows/validate.yml` und eigenständiger Python-Prüfer `scripts/validate_guide.py` hinzugefügt. Prüft JSON-Formate, Kapitelreferenzen, eindeutige Aufgaben-IDs, zulässige Kategorien, Verweise und Kapitel-1–5-Truhenverteilung.
- [x] Gegenprüfung der bereits vorhandenen Kapitel 1–5 im Repository: 5 registrierte Dateien, 129 eindeutige Aufgaben-IDs, keine doppelten IDs, 3 kanonische Querverweise alle gültig, JS-Syntax gültig.
- [x] Fehler behoben: optionale Checklisten-Aufgaben (z. B. Schiffs-Puzzle) lassen sich wieder abhaken, ohne zum Pflichtfortschritt zu zählen.
- [x] Dokumentierter Nummernstand: Astos #033, Garland #012. Fehlender #024 Ghast bleibt *geplant*; nicht als bereits eingesammelt oder geprüft behaupten.

### Ausdrücklich weiterhin OFFEN
- [ ] **Redaktionelles Truhen-Audit**: Jede der 50 bisher erfassten Truhen mit exakter Pixel-Remaster-Referenz (Stockwerk, Richtung, Raum, Inhalt, Wächter) vergleichen. Die bisherige Verteilung [3,3,15,0,29] ist ein interner Konsistenz-Check, keine unabhängige Bestätigung jedes Schatzinhalts.
- [ ] **Redaktionelles Bestiarium-/Kampfaudit**: Reihenfolge, #024 Ghast, Monsterorte, Boss-Angriffe und Magieeffekte für Kapitel 1–5 vollständig belegen.
- [ ] **Shop-/Level- und Nebeninhalte-Audit**: verifizierte Shoppreise/Zauberstufen je Version, Levelspannen, Schiffs-Puzzle-Erfolg, Smyth-/Adamantit-Rückkehrmarker.
- [ ] **Automatische CI-Ausführung prüfen**: Workflow wurde angelegt; ein erfolgreicher GitHub-Actions-Lauf wurde hier noch nicht nachgewiesen.
- [ ] **End-to-end-Tests**: Browser, Handy, PWA/offline, drei Spielstände, Spielstandsicherung/-wiederherstellung, Schrittmodus, Klassenwahl und beide Kapitelabschlüsse.
- [ ] **Migrationstests**: Fortschritt und Häkchen aus älteren JSON-/App-Versionen darf nicht verloren gehen.
- [ ] **Guide vollständigkeitsabhängig markieren**: `contentStatus` erst nach fachlichem Audit auf `verified` stellen.

**GitHub-Änderungen dieser Runde:** neue Validierungsdatei, GitHub-Actions-Workflow und Korrektur des optionalen Aufgaben-Häkchens. Andere als „offen“ benannte Aufgaben wurden ausdrücklich nicht als erledigt markiert.


## 26.10.2026 – Deutsche Spieldaten aus Cornelia

- [x] Von der deutschen Pixel-Remaster-Spielversion gemeldete **fünf Waffen** inkl. Gilpreis, Angriff und sofern angegeben Präzision erfasst.
- [x] **Drei Rüstungen** inkl. Preis, Abwehr und Gewicht erfasst.
- [x] **Acht Stufe-1-Zauber** inkl. deutscher Namen und jeweils 50 Gil erfasst.
- [x] Diese Daten als `chapter.shopCatalog` in `data/ff1/chapter-01.json` gespeichert und als aufklappbaren Katalog in der Webseite sichtbar gemacht.
- [x] Deutsche Namen Goblin, Wolf, Skeleton, Schwarze Witwe, Gigas-Wurm, Zombie und Garland mit bestehenden Bestiarium-Einträgen verknüpft; stabile Check-IDs unverändert.
- [ ] **Isegrim:** Name und Sprite bestätigt, aber englischen Gegner und genaue Bestiarium-Nummer anhand Bestiarium-Screenshot überprüfen; noch kein Mapping erfinden.
- [ ] **Blitz:** deutscher Name und Preis bestätigt; genaue Wirkung und Beschreibung noch vom Spiel überprüfen.
- [ ] **Waffen-/Rüstungs-Klassenzuordnung:** prüfen, wer was tragen kann; erst danach gezielte kaufbare Gegenstände je Vierergruppe empfehlen.
- [ ] **Übrige deutsche Gegnernamen** von Kapitel 1 und späteren Gebieten ergänzen.
- [ ] **Kaufkosten-Rechner** aus konkreter Vierergruppe und benötigten Zaubern erstellen; Budget und doppelte Käufe beachten.

**Vermerk:** Spielerbestätigte Daten sind direkte Ingame-Beobachtungen, aber ersetzen keine vollständige Truhen-/Bestiarium-Abnahme. `contentStatus` bleibt `needs-review`.


## 26.10.2026 – Cornelia-Einkaufsrechner

- [x] Acht Ausrüstungsgegenstände in `data/ff1/chapter-01.json` anhand der ermittelten Trageklassen mit `classes[]` ausgestattet (fünf Waffen, drei Rüstungen).
- [x] Acht Zauber der weißen/schwarzen Magiestufe 1 mit zulässigen Grundklassen annotiert.
- [x] **Kaufkosten-Rechner** für die vier ausgewählten FF-I-Figuren eingebaut: jeweils eine Waffe, eine Rüstung und auswählbare Zauber. Gesamtsumme berechnet sich aus den im Cornelia-Katalog hinterlegten Gilpreisen.
- [x] Auswahl getrennt pro Spielstand gespeichert; Klassenwechsel leert die betroffene Figurenauswahl, damit keine unpassende Ausrüstung erhalten bleibt.
- [x] Auswahl zurücksetzen und Mobil-Layout ergänzt; kein Kauf wird automatisch als im Spiel erfolgt betrachtet.
- [ ] Trageklassen und Magie-Zulassung einzelner Gegenstände zusätzlich im deutschen Pixel Remaster verifizieren und eventuelle Korrekturen vornehmen.
- [ ] Startausrüstung, schon erlernte Zauber, maximal drei Zauber je Stufe und verfügbares Gil als weitere Option einbauen; bisher ist der Betrag ein **Kaufplan**, keine automatische Geldbörsenrechnung.
- [ ] Browser-/Mobiltest des Rechners mit mehreren Gruppen und drei Spielständen durchführen.
- [ ] Isegrim-Zuordnung sowie noch unbekannte Beschreibung von Blitz ergänzen.

Hinweis: Originale Aufgaben-IDs/Spielstände bleiben unverändert; Kapitel 1 behält den Status `needs-review`.


## 27.10.2026 – Desktop-/Couch-Modus und Nachschlagewerk

- [x] **Ansichtsauswahl** Automatisch / Desktop / Couch-Modus in Desktop-Kopfzeile und mobilen Optionen eingebaut.
- [x] Auswahl wird unabhängig von Spielfortschritt im Browser gespeichert (`ff-companion-layout-v1`).
- [x] Desktop-Modus mit dauerhaft sichtbarer Seitenleiste sowie Couch-Modus mit einklappbarem Menü und größeren Bedienelementen gestaltet.
- [x] Menübereich **Nachschlagewerk** für Klassen, Waffen, Rüstungen, Magie, Schlüsselgegenstände und Shops ergänzt.
- [x] Sechs funktionsfähige Referenzansichten aus derzeit veröffentlichten JSON-Kapiteldaten erstellt. Waffen/Rüstungen/Zauber enthalten deutsche Cornelia-Daten; übrige Inhalte wachsen kapitelweise.
- [x] Bestehende Speicher- und Checklisten-IDs nicht verändert.
- [ ] Bedienung und responsive Darstellung beider erzwungener Ansichten am Desktop und auf tatsächlichem Smartphone testen.
- [ ] Navigations- und Shopreferenzen später um Suchfilter, Sortierung, Fundorte sowie klassenabhängige Vergleichsansichten erweitern.
- [ ] Die Klassenansicht um geprüfte Klassenfähigkeiten, Beförderungen und Ausrüstungsregeln erweitern; derzeit nur Grundklassenübersicht.
- [ ] Die Referenzsammlung für weitere Städte und FF-Teile mit verifizierten JSON-Daten füllen.
- [ ] PWA-Cache-Versionierung/Updates und Offline-Bedienung nach CSS-/JavaScript-Änderungen testen.

Hinweis: Zwei Darstellungsmodi nutzen dieselben Daten und Spielstände; keine separate zweite Website. Funktionell implementiert, vollständige End-to-End-Abnahme ausstehend.


## 27.10.2026 – Deutsche Klassenübersicht und Quellenstrategie

- [x] Sechs FF-I-Startklassen mit Kurzbeschreibung, Kampfschwerpunkt, Magietyp und Beförderung im Kapitel-JSON erfasst.
- [x] Klassenreferenz im Menü zeigt jetzt die neuen Beschreibungen statt nur sechs Klassennamen.
- [x] Erste deutschsprachige Quellenhinweise im JSON dokumentiert: Square Enix (deutsche Pixel-Remaster-Einsteigertipps) und deutscher Final-Fantasy-Almanach; englische Vorxu-Referenz zur Ergänzung.
- [x] Kettenhemd-Klassenliste konservativ korrigiert: vorläufig ausschließlich Krieger. Die Waffen-/Rüstungsregeln müssen später weiterhin im deutschen Spiel gegengeprüft werden.
- [ ] Die **exakte deutsche Schreibweise aller sechs Beförderungen** anhand der Spielmenüs oder einer Pixel-Remaster-Quelle überprüfen (aktuelle Begriffe teils traditionelle Übersetzungen).
- [ ] Vollständige Klassenprofile mit konkreten Werten, Level-Entwicklung, Zaubergrenzen und Ausrüstungslisten erstellen.
- [ ] Ausrüstungs-Kompatibilität in sämtlichen Geschäften aus mindestens zwei versionsspezifischen Quellen prüfen; besonders Hammer und schwere Rüstung.
- [ ] Gemeinsame, sprachen- und editionsbewusste Referenz-JSON-Datenbank aufbauen, statt nur Inhalte aus Kapitel 1 zu sammeln.
- [ ] Direktlinks aus der Kapitel-Wegführung auf passende Klassen-, Waffen- und Magie-Einträge einbauen.
- [ ] Die neue Klassenansicht sowie die Kaufberatung im Browser und auf dem Handy testen.

**Quellenregel:** Deutsche Ingame-Screenshots/-Werte haben für die deutschen Bezeichnungen Vorrang. Versionenspezifische englische Fachreferenzen dürfen Mechaniken verifizieren. Offene Übersetzungen als solche markieren, nicht ungeprüft als offiziell ausgeben.


## 27.10.2026 – Schnellnavigation statt langer Seitenleiste

- [x] Sticky Schnellnavigation am oberen Bildschirmrand: direkte Spiel- und Kapitelwahl.
- [x] Direktzugriffe auf Guide, Schrittmodus, Bestiarium und Klassen-Nachschlagewerk.
- [x] Umfangreiche Spieleliste in einklappbare Sektion verschoben; lange Seitenleiste bleibt optional.
- [x] Auswahlfelder sind mit der bestehenden Navigation und dem aktiven Spielstand verbunden.
- [x] Für Handy kleinere, zweireihige Darstellung der Schnellnavigation ergänzt.
- [ ] Auf echten Handys bei kleinem Bildschirm sicherstellen, dass Schnellnavigation, mobile Fortschrittsleiste und Dialoge genug Platz lassen.
- [ ] UX-Option: Schnellzugriff für Shops oder eigene Favoriten, je nachdem wie häufig gebraucht.
- [ ] Zurück-/Vorwärtskapitel als Zusatzoption testen; ggf. mit Kapitelüberschrift kombinieren.
- [ ] Bei großen Kapitelzahlen nach Spiel/Abschnitt gruppieren; die bestehende Kapitelwahl soll übersichtlich bleiben.

**Qualitätsstand:** Auf GitHub implementiert; Browser- und mobile End-to-End-Abnahme weiterhin offen.


## 27.10.2026 – Direkt zum vorherigen/nächsten Kapitel

- [x] Schaltflächen „← Zurück“ und „Weiter →“ in der dauerhaft sichtbaren Schnellnavigation ergänzt.
- [x] Beide Schaltflächen mit den tatsächlich geladenen Kapiteln des gewählten Spiels verknüpft.
- [x] Schaltflächen am Kapitelanfang bzw. -ende deaktiviert; keine Navigation zu unveröffentlichten Kapiteln.
- [x] Mobile Anordnung der Kapitelpfeile ergänzt.
- [ ] **P0** Auf tatsächlichen Geräten prüfen, ob Schnellnavigation, Fortschrittsleiste und Kopfzeile den Lesebereich nicht überdecken.
- [ ] **P0** Funktionsprüfung im Browser für Kapitelwechsel, Häkchen und Speicherung über alle drei Spielstände.
- [ ] **P0** Offline/PWA-Neustart und Cacheaktualisierung mit neuen HTML/CSS/JS-Dateien prüfen.
- [ ] **P1** Kleine Bildschirmgrößen und Touch-Ziele im Couch-, Auto- und Desktop-Modus testen.
- [ ] **P1** Bei Bedarf eine kompaktere oder einblendbare Schnellnavigation für schmale Handys nach echten Tests gestalten.

**Stand:** Änderungen programmiert, kein echter Mobil- oder Browser-End-to-End-Test durchgeführt.


## 27.10.2026 – Klassenfilter in den Nachschlagewerken (ohne Handytest)

- [x] Waffen, Rüstungen und Magie im Nachschlagewerk nach sechs FF-I-Startklassen filterbar gemacht.
- [x] Cornelia-Ausrüstung mit Standort und Quellenverweisen im Kapitel-JSON hinterlegt.
- [x] Hammer-Trageklassen als **noch strittig** markiert, da PR-spezifische Internetquellen voneinander abweichen; keine endgültige Prüfung behaupten.
- [x] Klassenprofile weiterhin auf bestehende JSON-Einträge gestützt, keine Spielstände/Check-IDs geändert.
- [ ] Alle sechs Startklassen sowie Klassenbeförderungen anhand tatsächlich eindeutiger PR-Ausrüstungslisten verifizieren; widersprüchliche Quellen dokumentieren.
- [ ] Vollständige Waffen-/Rüstungskataloge (weitere Städte, Dungeons, Fundorte, Klassen, Preise) nach und nach füllen.
- [ ] Zauberkatalog und Klassenmagie detailliert mit deutschen Beschreibungen prüfen.
- [ ] In der Praxis Browser- und Handy-UI, Filterwechsel und Shop-Einkaufsplan testen (vom Nutzer aktuell verschoben).

**Wichtig:** Der Filter arbeitet auf bereits veröffentlichten Daten. Er behauptet keine vollständige FF-I-Datenbank.


## 27.10.2026 – Zentrale FF-I-Magiedatenbank

- [x] `data/ff1/magic.json` erstellt: 64 Zauber, 32 weiße + 32 schwarze, Stufen 1–8; maschinenlesbare Kennungen.
- [x] Ursprünglich vom Spieler bestätigte deutsche Namen (Cornelia) hervorgehoben; für übrige Zauber englische Originalnamen sichtbar und Übersetzungsstatus ausdrücklich offen.
- [x] Magie-Nachschlagewerk auf die zentrale JSON-Datei umgestellt; Filter nach Weiß-/Schwarzmagie, Stufe 1–8 und Startklasse.
- [x] Gilpreise, Ortsangaben und kurze deutsche Wirkungsbeschreibungen als Arbeitsdaten erfasst.
- [x] `service-worker.js` auf neue Cacheversion gesetzt, zentrale Magiedatei in Offline-Vorabcache aufgenommen.
- [ ] **P0: Fachliches Magieaudit** für alle 64 Zauber: Namen, exakt verfügbare Klassen (insbesondere Beförderungen), Verkaufspreise und Bezugsorte mit spezifischen PR-Quellen **einzeln** kontrollieren; aktuelle Felder oberhalb der acht bestätigten Spielnamen sind vorläufige Arbeitsdaten, keine endgültige 100%-Freigabe.
- [ ] **P0: Zaubergrenze** maximal 3 Sprüche je Stufe pro Figur im Einkaufsrechner berücksichtigen; schon bekannte Sprüche und verfügbares Gil ergänzen.
- [ ] **P1: Einzige Datenquelle** für den Kapitel-1-Shop und den Magiekatalog herstellen; bisher ist Cornelias Shop in Kapitel 1 separat geführt.
- [ ] **P1: Deutsche Originalnamen** der Stufen 2–8 mithilfe deutscher Ingame-Bilder oder verlässlicher deutscher Versionslisten vervollständigen.
- [ ] **P1: Links** vom Walkthrough/Shop direkt auf konkrete Magiedetails ermöglichen.
- [ ] Praktische Tests am Handy, im Browser und beim Offline-Neustart weiterhin verschoben.

**Abnahme:** Zählung 64 (32/32, Stufen 1–8) und JavaScript-Syntax technisch kontrolliert. Inhaltliche Vollprüfung aller Einträge und Live-Browser-Nutzung stehen noch aus.


## 27.10.2026 – Neue Nutzerrecherche: Waffen, Rüstungen und deutsche Magie

- [x] 64 deutsche Zaubernamens-Kandidaten in `data/ff1/magic.json` aufgenommen, die acht bisherigen Spielernamen als selbst bestätigt markiert; alle weiteren mit Status **Videohinweis/Quellenangabe noch nicht selbst geprüft**.
- [x] `data/ff1/equipment.json` mit 25 Waffen und 7 Rüstungen aus übermittelter Tabelle als **Rechercheentwurf** erstellt, keine vorgebliche Ingame-Bestätigung.
- [x] Referenzseiten für Waffen und Rüstungen um diese Einträge ergänzt, inklusive Vorsichtskennzeichnung und ohne Änderung bestehender Kapitel-Check-IDs.
- [x] Referenzfilter-Anzeige wieder angebunden und PWA-Cache für Magie/Ausrüstung aktualisiert.
- [ ] **P0:** Original-Screenshots und Video-Zeitmarken tatsächlich gegenlesen. Die im Chat eingefügten `[span_...]`-Marker sind keine Bildbelege.
- [ ] **P0:** Gemeldete Waffenklassenzuordnungen prüfen; `Mondschwert = Falchion (Truhe)` versus `Falchion (Shop)` ist besonders zweifelhaft. Keine ungesicherten Waffenklassenzuordnungen für automatische Kaufempfehlungen verwenden.
- [ ] **P0:** Magieziele und -effekte (u.a. NulAll, Dispel, Blind, Kill) sowie versteckte Gaia-Läden/Kauforte unabhängig prüfen.
- [ ] **P1:** Nach geprüften Pixel-Remaster-Daten fehlende Werte, Fundorte, Klassenfreigaben und Preise ergänzen und Doppelungen mit Cornelia-Kapitel bereinigen.
- [ ] **P1:** Zaubergrenze (drei Zauber je Stufe/Figur) und Zauberbesitz in Einkaufsplanung integrieren.
- [ ] **P2:** Praktische Browser-/Handytests weiterhin verschoben.

**Abnahme:** JSON erfolgreich angelegt und JavaScript-Syntax statisch geprüft; kein browserbasierter Funktionstest oder vollständige inhaltliche Verifikation.


## 28.10.2026 – Quellenvergleich der eingereichten Kapitel 1–5 und neue Kapitel 6–10

- [x] Beide Nutzeranhänge mit dem Stand unserer bestehenden Kapitel 1–5 verglichen. Die Anhänge enthalten Fehler (u. a. Garland fälschlich #020 statt #012, Astos #034 statt #033, Piraten #021 statt #017, Cornelia-Preise und Blitzra in Pravoka).
- [x] Die bestehenden Kapitel 1–5 **nicht überschrieben**, damit korrigierte Inhalte und gespeicherte Häkchen erhalten bleiben.
- [x] Kapitel 6–10 als **je eine eigenständige JSON-Datei** angelegt und im Manifest veröffentlicht: Melmond/Erdhöhle B1–B3; Titan/Sadda; Erdhöhle B4/B5/Lich; Halbmondsee/Kanu; Vulkan Gurgu/Marilith.
- [x] In den neuen Kapiteln einzelne Aufgaben für die 16 ersten Erdtruhen, vier Titanentruhen, acht späteren Erdtruhen und 37 Vulkantruhen angelegt; keine Karten.
- [x] Kapitel 1–10 auf doppelt widersprüchliche Bestiariumsnummern in den veröffentlichten Checklisten geprüft: keine gefunden.
- [ ] **P0:** Jede Truhe der Erd- und Vulkanetagen in Inhalt und genauer Position gegen PR-Ingame-Zähler und Quellen einzeln abnehmen. Vor allem 18 Vulkan-B2- und 15 Vulkan-B4-Einträge sind derzeit nummerierte Platzhalter, keine einzeln belegten Inhalte.
- [ ] **P0:** Neue Kapitel-Bestiariumsnamen, Begegnungsorte und Bossstatistiken einzeln gegen ein PR-Bestiarium prüfen; deutsche Übersetzungen nachtragen.
- [ ] **P0:** Kapitel 1–5 vollständiges Inhaltsaudit; im Nutzeranhang teilweise falsche Zahlen, Gegenstände und unzutreffende Stufe-2-Zauber.
- [ ] **P1:** Shop-Empfehlungen und Itempreise durch zentrale Datenbanken ersetzen, um alte Quellenmischung zu vermeiden.
- [ ] **P1:** GitHub Actions und praktische Browser-/PWA-Tests verifizieren; Handytest wie vereinbart verschoben.

Die Kapitel sind **spielbare Arbeitsfassungen**, bewusst `contentStatus: needs-review`, **nicht** abschließend als 100 % verifiziert zu bezeichnen.


## 30.10.2026 – Abgleich Kapitel 1–10 gegen Pixel-Remaster-Referenzen

- [x] Sechs Quellenlinks gesichtet; Vorxu und Solo Play Guide als Hauptreferenzen, aber teils voneinander abhängige Inhalte.
- [x] Kapitel 6–10 existierten **bereits** im GitHub-Repository. Bestehende kleinere Unterteilung bleibt absichtlich erhalten: 6 Melmond/Erdhöhle B1–B3, 7 Titan/Sarda, 8 Erdhöhle/Lich, 9 Halbmondsee/Kanu, 10 Vulkan Gurgu.
- [x] Kapitel 6–10 gezählt: 16 + 4 + 8 + 0 + 37 = **65** Truhen. Die Erdhöhle hat 24, Titanenhöhle vier, Vulkan Gurgu 37.
- [x] Kapitel 10: bislang 33 nur durchnummerierte B2/B4-Truhen mit Gegenstandsnamen aus PR-Referenz versehen. Check-IDs und Speicherstände unverändert.
- [ ] **P0:** Kapitel 1–5 Inhaltsschwankungen und widersprüchliche Truhenangaben einzeln klären; bestehende IDs *nicht* ändern.
- [ ] **P0:** Bestiarium-Liste für Kapitel 1–10 gegen eine zweite unabhängige PR-Quelle prüfen, einschließlich Nummern und Fundorten. Frühere Gemini-Texte enthalten offensichtlich falsche Nummern.
- [ ] **P0:** Truheninhalte Kapitel 1–9 mit zwei Quellen und deutschen Ingame-Texten einzeln überprüfen; Anzahl allein ist kein Vollbeweis.
- [ ] **P1:** Präzise B2/B4-Truhenpositionen (nicht nur Fundreihenfolge) für Vulkan Gurgu verifizieren.
- [ ] **P1:** Nach Kapitel 10 folgt logisch **Kapitel 11 Eishöhle / Luftschiff**, 12 Zitadelle/Bahamut, 13 Gaia/Onlak/Wasserfall. Die zunächst vorgeschlagene andere Nummerierung wird **nicht** auf bestehende Kapitel übertragen.
- [ ] Praktische Tests auf Mobilgerät, Browser, Offline/PWA wie vereinbart zurückgestellt.

**Quellen:** https://vorxu.com/final-fantasy-1-pixel-remaster/walkthrough ; https://www.soloplayguide.com/games/final-fantasy-pixel-remaster/guide ; https://videochums.com/article/final-fantasy-1-all-treasure-chests-checklist

**Abnahme:** Existierende Dateien/Truhenzahlen auf GitHub kontrolliert; keine vollständige manuelle Ingame-100%-Bestätigung behauptet.

## 30.10.2026 – FF I Kapitel 11–15 angelegt

- [x] Fünf neue kapitelweise JSON-Dateien angelegt und bestehende Kapitel 1–10 und ihre Check-IDs unverändert belassen.
- [x] Kapitel 11 Eishöhle/Luftschiff **15** Truhen; Kapitel 12 Zitadelle der Prüfungen **10**; Kapitel 13 Drachenhöhlen/Bahamut **13**; Kapitel 14 Gaia/Onlak/Wasserfall **6**; Kapitel 15 Meeresschrein/Kraken **32**. **76 neue Truhen-Checkboxen**.
- [x] Einzelne Truhen, Bosse, Schlüsselitems und relevante Gegner als Checklisteneinträge erfasst, Etagen insbesondere für Eishöhle und Meeresschrein getrennt.
- [x] JSON-Struktur und Truhenzahlen der Kapitel 11–15 programmgesteuert geprüft; GitHub-Manifest listet die fünf neuen Kapitel bereits auf.
- [ ] **P0:** Jede einzelne Truhenposition und jeder Schatzinhalt aus Kapitel 11–15 noch mit einer zweiten unabhängigen PR-Quelle und wenn möglich Ingame-Bildern verifizieren.
- [ ] **P0:** Bestiariumsnummern und deutsche Gegnernamen sowie Klassenausrüstung/Magie in Kapitel 11–15 gegentesten; unter Umständen sind einige gegenwärtige Einträge vorläufig.
- [ ] **P1:** Validator auf alle 15 Kapitel und gebietsübergreifende Duplikate erweitern; frühere festcodierte Prüfwerte nur ergänzen, nicht umgehen.
- [ ] **P1:** Kapitel 16 ff. auf Grundlage der verbleibenden PR-Storyroute und 100%-Truhenliste ausbauen.
- [ ] Browser-, Offline- und Mobiltests weiterhin zurückgestellt.

Quellenbasis: https://vorxu.com/final-fantasy-1-pixel-remaster/walkthrough ; https://www.soloplayguide.com/games/final-fantasy-pixel-remaster/guide ; https://ff1pixelwalkthrough.com/chests/

**Abnahme:** Technische Struktur-/Zählprüfung, keine vollständige Ingame-100%-Freigabe.

## 30.10.2026 – FF I Kapitel 16–19 bis zum Finale

- [x] Kapitel 16 Lufenia/Dr. Unne, 17 Mirageturm (18 Truhen), 18 Fliegende Festung (33 Truhen), 19 Chaos-Schrein Vergangenheit (7 Truhen) als eigenständige JSON-Dateien angelegt.
- [x] Manifest auf **alle 19** Kapitel in richtiger Reihenfolge erweitert; zuvor fehlten auch die Manifest-Einträge der bereits existierenden Kapitel 11–15.
- [x] Statische Zählung: **249 Truhen-Checkboxen** in Kapitel 1–19, ohne doppelte Aufgaben-IDs innerhalb der Sektionen.
- [ ] **P0: Bestiarium:** Erst **123 unterschiedliche Nummern** aus Kapitel-Checklisten erfasst; für nominell 128 Gegner fehlen noch fünf Nummern bzw. Referenzeinträge. Gegner-IDs/Versionen und Fundorte unabhängig prüfen.
- [ ] **P0: Truhen-Audit:** 249 Checkboxen belegen die Sollsumme, **nicht** die Richtigkeit jedes Inhalts und jeder Position. Die Quellen divergieren bei der Fliegenden Festung (33/34). Gegen Ingame-Zähler und unabhängige PR-Liste prüfen.
- [ ] **P0: Endgame:** Bossdaten, Warmech-Spawn, Kampfstrategien, Effekte und deutsche Gegenstandsnamen gegen eine weitere spezifische PR-Quelle einzeln prüfen.
- [ ] **P1:** Zentrale Zauber-/Ausrüstungsdatenbank gegen Kapitel-16–19-Kauf-/Fundhinweise verlinken.
- [ ] **P1:** Validator um Gesamtsoll von 249 sowie Bestiarium-Abdeckung/Nummerierungsfehler ergänzen; fehlerhafte Daten nie durch reine Zählwerte verdecken.
- [ ] Benutzer-Tests in echtem Browser, PWA, Offline und auf Handy wie vereinbart aufgeschoben.

**Status:** Gesamte Spielroute als 19 **quellenbasierte Entwurfskapitel** vorhanden; **noch keine geprüfte 100%-Freigabe**.

## 30.10.2026 – Erzählender Walkthrough-Stil

- [x] Nutzerbeispiel als Stilvorlage analysiert: klare Richtungsangaben, Nutzen-Erklärungen, Etagen-Zähler, Boss-Taktiken, 100%-Kontrollpunkte.
- [x] Kapitel 6 als Muster in lebendigerem Deutsch überarbeitet; bestehende Check-IDs und 16 Truhen bleiben erhalten.
- [ ] Kapitel 1–5 und 7–19 im gleichen Stil redaktionell überarbeiten, ohne Check-IDs umzubenennen.
- [ ] Exakte Himmelsrichtungen, Truheninhalte und Gegnerdaten nur nach PR-Quellenabgleich übernehmen; Widersprüche des Nutzerbeispiels nicht blind übernehmen.
- [ ] UI prüfen, ob längere `steps` und `intro` sowie `tips` lesefreundlich dargestellt werden.

## 30.10.2026 – Kapitel-6-Vergleich V2 (Original bleibt)

- [x] `data/ff1/chapter-06-v2.json` als separate alternative JSON-Fassung erstellt, gleiche Abschnitts- und Checkbox-IDs wie das Original.
- [x] `docs/vergleich-kapitel-06-v2.md` als angenehm lesbare, bildfreie GitHub-Vorschau erstellt.
- [x] Original `data/ff1/chapter-06.json` und Manifest unverändert, damit keine zweite Kapitelinstanz oder Spielstandkonflikte auftreten.
- [ ] Versionen nebeneinander beurteilen; erst nach Nutzerentscheidung die Darstellung im Companion umstellen.

## 30.10.2026 – Vergleich V1/V2 direkt auf GitHub Pages

- [x] `kapitel-06-vergleich.html` als direkt benutzbare, separate responsive Website mit Umschaltung zwischen V1 und V2 angelegt.
- [x] Deutlich sichtbaren Link in der Hauptseitenleiste ergänzt; Originalkapitel und Fortschritt bleiben unberührt.
- [x] Neue Datei sowie V2-JSON im Service-Worker-Cache vermerkt und Version erhöht.
- [ ] Test der GitHub-Pages-Bereitstellung auf echtem Gerät; die Vergleichshäkchen sind absichtlich nur temporär und nicht mit dem Spielstand verknüpft.
