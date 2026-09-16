# Auftrag: Verzehrart, Rabatt-Button, Bilder und Bon-Ausbau für MeinMüsli

## Kontext

Repo: `NoWarMoreWeed/MeinMuesli` (lokal `/home/maikel/work/MeinMuesli`, Branch `main`).
Stack: statische Website, **nur HTML, CSS und Vanilla JavaScript** – kein Framework, kein Build, kein Backend, keine externen Bibliotheken oder CDN-Links. Alle Daten im Browser (`localStorage`).
Veröffentlichung: GitHub Pages unter <https://meinmuesli.maikel-schneider.de>.
Dateien: `produkte.js` (Grunddaten), `muesli.js` (Logik), `stylischermuesli.css` (Aussehen), `*.html` (Seiten: login, basis, verfeinerung, fruechte, nuesse, extras, kasse, verlauf, verwaltung).
Preise sind **Bruttopreise in Euro** (Endpreise für Kundinnen und Kunden).
Es ist ein Lern- und Schulprojekt: Der Code muss für eine Schülerin ohne Vorkenntnisse lesbar bleiben (deutsche Funktionsnamen, kurze Kommentare, keine verschachtelten Tricks).

## Ziel

Vier Ausbau-Punkte:

1. **Verzehrart** (Mitnehmen / hier essen) als Entscheidung mit Buttons, inklusive korrekter Umsatzsteuer.
2. **Rabatt ab 3 Müslis** über einen Button, mit Fortschrittsanzeige und Erinnerung vor dem Bezahlen.
3. **Bilder bei fast jeder Auswahl** – eigene SVGs, alle im Repo.
4. **Kassenbon wie ein echter deutscher Bon** (Vorschau + Druck) mit Abholnummer und Bestellbestätigung.

Alles, was dazugehört (Code, Bilder, Doku, README), wird am Ende committet und auf GitHub gepusht. Nichts liegt nur lokal.

## 1. Verzehrart mit zwei Buttons

- Auf der Kassenseite (`kasse.html`) oberhalb der Zahlungsart ein eigener Block „Wie wird gegessen?" mit zwei großen Buttons: **„Zum Mitnehmen"** und **„Hier essen"**. Keine Checkbox, kein Radio, kein Dropdown.
- Die Wahl wird im Browserspeicher abgelegt (neuer Schlüssel in `SPEICHER` in `muesli.js`, z. B. `verzehrart`) und beim Bestellabbruch, Abmelden und Demo-Reset gelöscht.
- Ohne gewählte Verzehrart darf nicht bezahlt werden: Zahlungsbuttons gesperrt und Hinweis im Bereich `#zahlungsFehler`. Die gewählte Verzehrart ist sichtbar markiert (aktiver Button) und im laufenden Bon (`zeigeBon()` in `zeigeKasse()`-Umfeld / rechte Bon-Fläche) sowie auf dem Kassenbon sichtbar.
- Umsatzsteuer fachlich korrekt: **Mitnahme 7 %**, **Hier essen 19 %** (Deutschland, Gastronomie). Die Preise bleiben Endpreise; die Steuer wird **nicht** aufgeschlagen, sondern aus dem Bruttobetrag herausgerechnet:
  - `Netto = Brutto / (1 + Satz)`, `MwSt = Brutto − Netto`
  - Kaufmännisch auf 2 Dezimalstellen runden, erst ganz am Ende (keine Zwischenrundung der Steuer).
  - Rechenbeispiel: 3 Müslis, Brutto 12,90 €, Rabatt 10 % = 1,29 €, zu zahlen 11,61 €; Mitnahme (7 %): Netto 10,85 €, MwSt 0,76 €; Hier essen (19 %): Netto 9,76 €, MwSt 1,85 €.

## 2. Rabatt ab 3 Müslis über einen Button

- Bedingung: **mindestens 3 Müslis** im Warenkorb. Gezählt wird die Menge über alle Positionen (`anzahlImWarenkorb()`), unterschiedlich zusammengestellte Müslis zählen einzeln mit.
- Rabatt: **10 % auf den Warenwert** (Brutto-Zwischensumme vor Steuer), als eigene Zeile im Bon („Rabatt 10 % ab 3 Müslis").
- Auf der Kassenseite ein Button **„10 % Rabatt anwenden"**:
  - Vor Erreichen der 3 Müslis: gesperrt (disabled), darunter ein Fortschrittstext, z. B. „Noch 1 Müsli bis 10 % Rabatt".
  - Ab 3 Müslis: aktiv, Klick wendet den Rabatt an (Zustand speichern, z. B. `rabatt` mit Prozentwert).
  - Ist der Rabatt angewendet, zeigt der Button den Zustand („Rabatt aktiv – entfernen").
- **Erinnerung vor dem Bezahlen:** Wer 3 oder mehr Müslis im Warenkorb hat und den Rabatt nicht angewendet hat, bekommt beim Klick auf „Karte"/„Bar" (oder „Zahlung abschließen") einen Hinweis: „3 Müslis im Warenkorb – 10 % Rabatt ist noch nicht angewendet." mit den Möglichkeiten **„Rabatt anwenden"** und **„Ohne Rabatt bezahlen"**. Ohne bewusste Antwort wird nicht bezahlt.
- Reihenfolge der Rechnung: Zwischensumme (Brutto) → Rabatt → zu zahlender Betrag → daraus Netto und MwSt.
- Der Rabatt wirkt sich überall aus: laufender Bon, Gesamtpreis, Kassenbon, Verkaufsverlauf und Tagesabschluss (`erstelleZBerichtText()`), Storno (`storniereVerkauf()`).

## 3. Bilder bei fast jeder Auswahl

- Für **jede Zutat** (Verfeinerung, Früchte, Nüsse, Extras) ein eigenes Bild in `bilder/`, zusätzlich zu den drei Basissorten.
- Vorgabe für die Dateien: selbst erstellte, **handgeschriebene SVG** – `viewBox="0 0 100 100"`, einfache Formen, keine eingebetteten Rasterbilder, keine Filter, kein Illustrator-Export-Ballast, pro Datei **unter 5 KB**, sprechende Dateinamen (`amarant.svg`, `apfelstuecke.svg`, `cashewkerne.svg`, `honigflocken.svg`, …).
- Die bestehenden drei Basisbilder sind Illustrator-Exporte (`tropic.svg` allein 2,8 MB, `bircher.svg` 172 KB). Sie werden durch gleichartige, kompakte SVGs ersetzt (gleiche Optik, deutlich kleiner).
- `produkte.js` bekommt bei jedem Eintrag das Feld `bild: "bilder/....svg"`. Fehlt ein Bild, wird ein Platzhalter-Symbol verwendet – kein defektes Bild (404) und kein leerer Rahmen.
- Darstellung: auf den Zutaten-Auswahlseiten Bild + Name + Preis je Karte (`baueZutatenliste()`), Bilder mit `alt`-Text (echte Bezeichnung, nicht „Platzhalterbild") und `loading="lazy"`; Optik wie `.basis-karte img`, `object-fit: contain`. Layout muss auf Handy und Desktop passen (Kartenraster in `stylischermuesli.css` anpassen).
- Alle Bilder gehören ins Repo und werden mitgepusht – keine Verweise auf fremde Websites.

## 4. Kassenbon wie ein echter deutscher Bon

- Neuer Aufbau von `erstelleKassenbonText()` (und Druck-CSS): **Monospace, 40–42 Zeichen breit**, wie ein 58-mm-Thermobon.
- Inhalt von oben nach unten:
  - Kopf: „MeinMüsli", Filialzeile (Demo-Adresse), „Kassenbon", **Bonnummer**, Datum und Uhrzeit
  - **Abholnummer** deutlich sichtbar (z. B. „Abholnummer 042")
  - **Verzehrart** inklusive Steuersatz („Mitnahme 7 %" / „Hier essen 19 %")
  - Positionen: `Menge × Bezeichnung`, Einzelpreis, Zeilensumme; gewählte Zutaten eingerückt darunter
  - `Zwischensumme`, `Rabatt 10 % ab 3 Müslis −x,xx €`, `Zu zahlen`
  - Steuerblock wie auf echten Bons: `Netto 7 % …` / `MwSt 7 % …` / `Brutto …` (bei 19 % analog, Tabelle Satz | Netto | MwSt | Brutto)
  - Zahlungsart, bei Bar zusätzlich `Erhalten` und `Rückgeld` inklusive Schein-/Münzaufteilung
  - Fußzeile: „Vielen Dank!" und der klare Hinweis **„Demo-Kassenbon – kein steuerlicher Beleg"** (die Anmeldung ist eine Simulation, das muss auf dem Bon stehen)
- Nach erfolgreicher Zahlung erscheint eine **Bestellbestätigung**: Abholnummer groß, „fertig in ca. 3 Minuten", Verzehrart und Gesamtbetrag.
- Der Bon ist auf dem Bildschirm als Vorschau sichtbar (gleiche Optik wie der Ausdruck) und lässt sich über den bestehenden Knopf „Kassenbon drucken" über `window.print()` mit Print-CSS drucken. Der Textdatei-Download bleibt erhalten.
- Bonnummern fortlaufend (`erzeugeBonnummer()`), Verlauf und Z-Bericht zeigen Verzehrart und Rabatt mit.

## Verständlichkeit (Schulprojekt)

- Deutsche Funktionsnamen wie im Bestand (`berechneGesamtpreis`, `zeigeKasse`, …).
- Kurze Kommentare in der bestehenden Schreibweise, jeder neue Block in `muesli.js` bekommt eine einzeilige Erklärung.
- `FUNKTIONEN.md` (Nachschlagehilfe mit W3Schools-Links) um alle neuen Funktionen ergänzen: Name, ein Satz Erklärung, passender Link (z. B. `Number.toFixed()`, `Math.round()`, `Array.prototype.reduce()`, `localStorage`, `window.print()`).
- `README.md` aktualisieren: Verzehrart mit 7 %/19 %, Rabatt ab 3 Müslis, Bilder in `bilder/`, Bon mit Abholnummer.
- Keine neue Abhängigkeit, kein Framework, keine ausgelagerten Fremddateien.

## Veröffentlichen (Pflicht)

- Cache-Version in allen HTML-Dateien erhöhen (`muesli.js?v=3`, `produkte.js?v=3`, `stylischermuesli.css?v=3`) – sonst mischt der Browser alte Skripte mit neuen Seiten.
- Alles liegt im Repo (Code, Bilder, Doku) und wird committet; Commit-Nachrichten auf Deutsch im bestehenden Stil (`feat:`, `fix:`, `docs:`).
- Push auf `main`, danach GitHub Pages prüfen: <https://meinmuesli.maikel-schneider.de> (Startseite lädt, Bilddateien erreichbar, kein 404 in der Konsole).

## Prüfen vor der Abgabe

1. 1 Müsli: kein Rabatt, Rabatt-Button gesperrt, Bezahlen ohne Verzehrart verhindert.
2. 3 verschiedene Müslis: Fortschrittstext verschwindet, Rabatt-Button aktiv, Erinnerung erscheint beim Bezahlen ohne Rabatt, Rabattzeile im Bon.
3. Beide Verzehrarten: Netto/MwSt im Bon mit Taschenrechner nachrechnen (7 % und 19 %).
4. Barzahlung mit Rückgeld, Kartenzahlung, Bon drucken, Abholnummer in Bestätigung und Bon.
5. Bestand, Storno, Verkaufsverlauf, Z-Bericht, Verwaltung und Demo-Reset funktionieren unverändert; Demo-Reset löscht auch Verzehrart und Rabatt.
6. Handy-Ansicht: Auswahlseiten mit Bildern, Kassenseite, Bon-Vorschau.
7. Alle Bilder laden (`bilder/`), keine Konsolenfehler, keine externen Links.

Ergebnis am Ende kurz berichten: geänderte Dateien, Prüfpunkte 1–7 mit Ergebnis, Commit-Hash und der Stand auf GitHub Pages.
