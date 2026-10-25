## Verbindliche Strukturregel

**Eine physische JSON-Datei pro Kapitel oder eigenständigem Teilkapitel.** Die Webseite nutzt eine einzige gemeinsame HTML-/CSS-/JavaScript-Oberfläche; neue Kapitel werden nicht als kopierte HTML-Dateien umgesetzt. Das Datenformat ist verbindlich: `format: "ff-companion-chapter"`, `schemaVersion: 1`, `gameId`, `chapter`.

Dateinamen: `data/ff1/chapter-01.json`, `data/ff1/chapter-02.json` usw. Bei größeren Dungeons eigene fortlaufend nummerierte Teilkapitel anlegen. Jedes veröffentlichte Kapitel muss im `chapterFiles`-Array des richtigen Spiels in `data/manifest.json` stehen, sonst erscheint es nicht automatisch.

Inhalte des Beispiel-HTMLs mit `format: "FF-Companion-Chapter"` oder mit `sections[].tasks` müssen vor dem Import an dieses Schema angepasst werden; diese Formate sind nicht kompatibel. Für Checklisten `sections[].checks` nutzen und eindeutige stabile IDs vergeben.

# Datenformat für Kapitel (Schema v1)

Kapitel sind unabhängige JSON-Dateien. Jede Datei hat `format: "ff-companion-chapter"`, `schemaVersion: 1`, eine `gameId` aus `data/manifest.json` und ein `chapter`-Objekt.

`chapter` enthält `id`, `number`, `title`, optional `subtitle`, `summary`, `checkpoint`, `sources` und das Array `sections`.

Jeder Abschnitt enthält `id`, `title`, optional `location`, `intro`, `tips`, `later`, dazu `steps` (Texte) und `checks` (abhakbare Aufgaben).

Jede Aufgabe hat eine stabile `id`, eine `category`, `title` und optional `detail`. Erlaubte Kategorien: `story`, `preparation`, `chest`, `bestiary`, `boss`, `key-item`, `misc`.

## Importieren

Einzelne Kapiteldateien lassen sich im Guide über „JSON importieren“ auswählen. Ein Sammelpaket hat `format: "ff-companion-pack"`, `schemaVersion: 1` und `chapters` als Array vollständiger Kapiteldatei-Objekte.

## Veröffentlichen

Neue Kapitel als `data/<spiel>/chapter-XX.json` ablegen und im jeweiligen `chapterFiles`-Array in `data/manifest.json` referenzieren. Für vorhandene Aufgaben nie IDs ändern, sonst gehen ihre gespeicherten Häkchen verloren.

Persönliche Backups gehören nicht ins öffentliche GitHub-Repository.
