# MeinMüsli

Eine statische, touchfreundliche Kassensystem-Demo zum Zusammenstellen mehrerer Müslis. Auswahl, Warenkorb, Bestand und Verkaufshistorie werden ausschließlich lokal im Browser mit `localStorage` verwaltet.

## Funktionen

- simulierte Mitarbeitenden-Anmeldung mit Demo-Zugangscodes
- zwei Rollen: `mitarbeiter` (kassieren) und `chef` (zusätzlich verwalten, stornieren, Tagesabschluss)
- Auswahl von Basis, Verfeinerungen, Früchten, Nüssen und Extras – jede Auswahl mit eigenem Bild
- laufender Bon, Gesamtpreis und Warenkorb mit Mengen (+/−), Bearbeiten und Löschen
- gleiche Zusammenstellungen werden zu einer Position mit Menge zusammengefasst
- Lagerbestand je Produkt mit Restmengenwarnung und Sperre bei „Ausverkauft"
- Bezahlung mit Karte oder Bar inklusive Rückgeldberechnung und Rückgeldvorschlag (Scheine und Münzen)
- Verzehrart per Knopf: "Zum Mitnehmen" (7 % MwSt) oder "Hier essen" (19 % MwSt)
- Zahlung erst möglich, wenn der Warenkorb gefüllt und die Verzehrart gewählt ist
- Mengenrabatt ab 3 Müslis (10 %) über den Knopf "Rabatt anwenden", mit Erinnerung vor dem Bezahlen
- Kassenbon in Bon-Optik (42 Zeichen, Monospace) mit Abholnummer, Zwischensumme, Rabattzeile, Steuerblock (Netto/MwSt/Brutto) und Hinweis "Demo-Kassenbon ohne steuerliche Gültigkeit"
- Bestellbestätigung mit Abholnummer, "fertig in ca. 3 Minuten" und Bon-Vorschau am Bildschirm
- Verkaufsverlauf mit Tagesübersicht (Bestellungen, Umsatz, Bar, Karte, Stornos)
- Filter im Verkaufsverlauf nach Zeitraum, Zahlungsart und Mitarbeiter
- Storno einzelner Verkäufe durch die Rolle Chef, Portionen kommen ins Lager zurück
- Tagesabschluss (Z-Bericht) als Textdatei
- Verwaltungsseite für Preise und Bestand ohne HTML-Kenntnisse
- Bestellung abbrechen und Mitarbeitende abmelden von jeder Auswahlseite
- responsive Bedienoberfläche ohne Backend

## Aufbau

| Datei | Aufgabe |
| --- | --- |
| `produkte.js` | Grunddaten: Basissorten, Zutaten, Preise, Bestandsgrenzen, Demo-Zugangsdaten |
| `muesli.js` | gesamte Logik des Kassensystems |
| `stylischermuesli.css` | gemeinsames Aussehen aller Seiten |
| `bilder/` | eigene SVG-Bilder für jede Basissorte und jede Zutat (unter 1 KB je Datei) |
| `*.html` | je eine Seite für Anmeldung, Auswahl, Kasse, Verlauf und Verwaltung |
| `FUNKTIONEN.md` | Erklärung aller JavaScript-Funktionen mit passenden W3Schools-Links |

Alle Produkt- und Preisdaten stehen in `produkte.js`. Änderungen sind auch direkt in der
Verwaltung möglich; sie werden im Browser gespeichert. Die ausführliche Erklärung der
Programmlogik steht in [FUNKTIONEN.md](FUNKTIONEN.md).

## Änderungen veröffentlichen

Die gemeinsamen Dateien werden mit Versionsanhang eingebunden (`muesli.js?v=3`). Bei jeder
Änderung an `muesli.js`, `produkte.js` oder `stylischermuesli.css` die Zahl in allen
HTML-Dateien erhöhen. Sonst kann ein Browser aus dem Cache eine alte Seite mit neuen
Skripten mischen, und die Anmeldung reagiert nicht mehr.

## Preise und Steuern

Alle Preise sind Endpreise in Euro. Die Umsatzsteuer wird aus dem Betrag herausgerechnet:
7 % beim Mitnehmen und 19 % beim Essen im Laden. Der Kassenbon weist Netto, Steuersatz und
Steuerbetrag getrennt aus. Der Rabatt von 10 % gilt ab 3 Müslis und wird vor der Steuer abgezogen.

## Sicherheitshinweis

Die Anmeldung ist nur Bestandteil der Demo. Es gibt keine serverseitige Authentifizierung; die
Demo-Codes stehen offen in `produkte.js` und werden nicht übertragen. Keine echten Passwörter
verwenden. Auch die Rollen sind reine Demo-Logik und kein Schutzmechanismus.

## Veröffentlichung

Die Seite wird über GitHub Pages unter <https://meinmuesli.maikel-schneider.de> bereitgestellt.

## Hinweis

Unabhängiges Lern- und Demonstrationsprojekt. Es besteht keine Verbindung zu gleichnamigen oder ähnlich benannten Unternehmen und Marken.