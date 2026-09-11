# MeinMüsli

Eine statische, touchfreundliche Kassensystem-Demo zum Zusammenstellen mehrerer Müslis. Auswahl, Warenkorb, Bestand und Verkaufshistorie werden ausschließlich lokal im Browser mit `localStorage` verwaltet.

## Funktionen

- simulierte Mitarbeitenden-Anmeldung mit Demo-Zugangscodes
- zwei Rollen: `mitarbeiter` (kassieren) und `chef` (zusätzlich verwalten, stornieren, Tagesabschluss)
- Auswahl von Basis, Verfeinerungen, Früchten, Nüssen und Extras
- laufender Bon, Gesamtpreis und Warenkorb mit Mengen (+/−), Bearbeiten und Löschen
- gleiche Zusammenstellungen werden zu einer Position mit Menge zusammengefasst
- Lagerbestand je Produkt mit Restmengenwarnung und Sperre bei „Ausverkauft"
- Bezahlung mit Karte oder Bar inklusive Rückgeldberechnung und Rückgeldvorschlag (Scheine und Münzen)
- Zahlung erst möglich, wenn der Warenkorb gefüllt ist
- optionaler Kassenbon mit fortlaufender Bonnummer
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
| `*.html` | je eine Seite für Anmeldung, Auswahl, Kasse, Verlauf und Verwaltung |

Alle Produkt- und Preisdaten stehen in `produkte.js`. Änderungen sind auch direkt in der
Verwaltung möglich; sie werden im Browser gespeichert.

## Sicherheitshinweis

Die Anmeldung ist nur Bestandteil der Demo. Es gibt keine serverseitige Authentifizierung; die
Demo-Codes stehen offen in `produkte.js` und werden nicht übertragen. Keine echten Passwörter
verwenden. Auch die Rollen sind reine Demo-Logik und kein Schutzmechanismus.

## Veröffentlichung

Die Seite wird über GitHub Pages unter <https://meinmuesli.maikel-schneider.de> bereitgestellt.

## Hinweis

Unabhängiges Lern- und Demonstrationsprojekt. Es besteht keine Verbindung zu gleichnamigen oder ähnlich benannten Unternehmen und Marken.