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
