# Funktionen in `muesli.js`

Die kurzen Kommentare bleiben im Code; ausführlichere Nachschlagehilfe steht hier. Anonyme Event-Callbacks werden bei den jeweiligen Einrichtungsfunktionen mit abgedeckt.

## Datenquellen, Standardwerte und Speicher

`function produktDaten()`
Liefert die Grundsorten oder bei fehlenden Daten eine leere Liste.
[W3Schools: JavaScript Arrays](https://www.w3schools.com/js/js_arrays.asp)

`function zutatenDaten()`
Liefert die Zutaten nach Kategorien oder leere Kategorien als Ersatz.
[W3Schools: JavaScript Objects](https://www.w3schools.com/js/js_objects.asp)

`function zugangsDaten()`
Liefert die hinterlegten Demo-Zugangsdaten oder ein leeres Objekt.
[W3Schools: JavaScript Objects](https://www.w3schools.com/js/js_objects.asp)

`function geldstueckDaten()`
Liefert die verfügbaren Schein- und Münzwerte für das Rückgeld.
[W3Schools: JavaScript Arrays](https://www.w3schools.com/js/js_arrays.asp)

`function bestandStandardWert()`
Liefert den normalen Anfangsbestand eines Produkts.
[W3Schools: JavaScript Operators](https://www.w3schools.com/js/js_operators.asp)

`function bestandWarnwert()`
Liefert die Grenze, ab der ein Bestand als niedrig gilt.
[W3Schools: JavaScript Operators](https://www.w3schools.com/js/js_operators.asp)

`function produktdatenFehlen()`
Prüft, ob die notwendigen Grunddaten für Produkte oder Zutaten fehlen.
[W3Schools: JavaScript Operators](https://www.w3schools.com/js/js_operators.asp)

`function zutatenKategorien()`
Erstellt aus den Zutatenlisten eine Übersicht mit den jeweiligen Namen.
[W3Schools: JavaScript Object.fromEntries()](https://www.w3schools.com/jsref/jsref_object_fromentries.asp)

`function neueAuswahl()`
Erzeugt eine leere Auswahl für ein neues Müsli.
[W3Schools: JavaScript Objects](https://www.w3schools.com/js/js_objects.asp)

`function neueZahlung()`
Erzeugt einen zurückgesetzten Zahlungszustand.
[W3Schools: JavaScript Objects](https://www.w3schools.com/js/js_objects.asp)

`function ladeJSON(schluessel, ersatzwert)`
Liest einen JSON-Wert aus dem Browserspeicher und nutzt bei Bedarf den Ersatzwert.
[W3Schools: JavaScript JSON](https://www.w3schools.com/js/js_json.asp)

`function ladeAuswahl()`
Lädt die frühere Auswahl und ergänzt fehlende Teile mit leeren Standardwerten.
[W3Schools: JavaScript Objects](https://www.w3schools.com/js/js_objects.asp)

`function ladeProdukte()`
Lädt die gespeicherte Produktliste oder verwendet die vorgegebenen Daten.
[W3Schools: JavaScript localStorage](https://www.w3schools.com/jsref/prop_win_localstorage.asp)

`function ladeBestand()`
Stellt sicher, dass ein gültiges Bestandsobjekt vorhanden ist.
[W3Schools: JavaScript Objects](https://www.w3schools.com/js/js_objects.asp)

`function bestandVon(name)`
Gibt den aktuellen Bestand eines Produkts zurück oder den Standardwert.
[W3Schools: JavaScript Number()](https://www.w3schools.com/jsref/jsref_number.asp)

`function reduziereBestand(name, anzahl)`
Verringert den Bestand eines Produkts, aber nie unter null.
[W3Schools: JavaScript Math.max()](https://www.w3schools.com/jsref/jsref_max.asp)

`function bestandHinweis(anzahl)`
Formuliert bei niedrigem oder leerem Bestand einen kurzen Hinweis.
[W3Schools: JavaScript if...else](https://www.w3schools.com/js/js_if_else.asp)

`function istChef()`
Prüft anhand der gespeicherten Rolle, ob ein Chef angemeldet ist.
[W3Schools: JavaScript localStorage](https://www.w3schools.com/jsref/prop_win_localstorage.asp)

`function speichereAuswahl()`
Speichert die aktuelle Müsliauswahl als JSON im Browser.
[W3Schools: JavaScript JSON.stringify()](https://www.w3schools.com/jsref/jsref_stringify.asp)

`function speichereWarenkorb()`
Speichert den Warenkorb als JSON im Browser.
[W3Schools: JavaScript JSON.stringify()](https://www.w3schools.com/jsref/jsref_stringify.asp)

`function speichereZahlung()`
Speichert den Zahlungszustand als JSON im Browser.
[W3Schools: JavaScript JSON.stringify()](https://www.w3schools.com/jsref/jsref_stringify.asp)

`function speichereVerkaeufe()`
Speichert die bisherigen Verkäufe als JSON im Browser.
[W3Schools: JavaScript JSON.stringify()](https://www.w3schools.com/jsref/jsref_stringify.asp)

`function speichereBestand()`
Speichert die Bestandszahlen als JSON im Browser.
[W3Schools: JavaScript JSON.stringify()](https://www.w3schools.com/jsref/jsref_stringify.asp)

`function speichereProdukte()`
Speichert die geänderten Produktdaten als JSON im Browser.
[W3Schools: JavaScript JSON.stringify()](https://www.w3schools.com/jsref/jsref_stringify.asp)

## Auswahl, Warenkorb und Preise

`function mengeVon(produkt)`
Liest eine gültige Produktmenge und verwendet sonst eins.
[W3Schools: JavaScript Number()](https://www.w3schools.com/jsref/jsref_number.asp)

`function istGleichesMuesli(erstes, zweites)`
Vergleicht Basis und Zutaten von zwei Müslis unabhängig von der Reihenfolge.
[W3Schools: JavaScript Array sort()](https://www.w3schools.com/jsref/jsref_sort.asp)

`function bestandReicht(produkt, gewuenschteMenge)`
Prüft, ob Basis und alle Zutaten in der gewünschten Menge vorhanden sind.
[W3Schools: JavaScript Array every()](https://www.w3schools.com/jsref/jsref_every.asp)

`function setzeZahlungZurueck()`
Setzt die Zahlung auf ihren leeren Ausgangszustand zurück.
[W3Schools: JavaScript Functions](https://www.w3schools.com/js/js_functions.asp)

`function leereBestellung()`
Leert Auswahl und Warenkorb und speichert beide neuen Zustände.
[W3Schools: JavaScript Arrays](https://www.w3schools.com/js/js_arrays.asp)

`function formatierePreis(preis)`
Formatiert eine Zahl als Eurobetrag mit zwei Nachkommastellen.
[W3Schools: JavaScript Number toLocaleString()](https://www.w3schools.com/jsref/jsref_tolocalestring_number.asp)

`function alleAktuellenZutaten()`
Fasst die Zutaten aus allen Auswahlkategorien in einer Liste zusammen.
[W3Schools: JavaScript Spread Operator](https://www.w3schools.com/js/js_es6.asp)

`function berechneAktuellenPreis()`
Addiert die Preise der gewählten Basis und Zutaten.
[W3Schools: JavaScript for...of](https://www.w3schools.com/js/js_loop_forof.asp)

`function berechneGesamtpreis()`
Berechnet die Summe aller Warenkorbpositionen mit ihren Mengen.
[W3Schools: JavaScript Array reduce()](https://www.w3schools.com/jsref/jsref_reduce.asp)

`function anzahlImWarenkorb()`
Zählt die gesamte Stückzahl aller Warenkorbpositionen.
[W3Schools: JavaScript Array reduce()](https://www.w3schools.com/jsref/jsref_reduce.asp)

`function zerlegeRueckgeld(betrag)`
Teilt einen Rückgeldbetrag in möglichst passende Scheine und Münzen auf.
[W3Schools: JavaScript Math.round()](https://www.w3schools.com/jsref/jsref_round.asp)

`function beschreibeRueckgeld(betrag)`
Erzeugt einen lesbaren Vorschlag für die Rückgabe des Wechselgelds.
[W3Schools: JavaScript Array map()](https://www.w3schools.com/jsref/jsref_map.asp)

## Allgemeine Anzeige und Sitzung

`function erzeugeElement(tag, text, klasse)`
Erstellt ein HTML-Element und kann Text sowie CSS-Klasse setzen.
[W3Schools: HTML DOM createElement()](https://www.w3schools.com/jsref/met_document_createelement.asp)

`function pruefeAnmeldung()`
Leitet nicht angemeldete Personen von geschützten Seiten zur Anmeldung weiter.
[W3Schools: Window location](https://www.w3schools.com/jsref/prop_loc_href.asp)

`function pruefeZahlungssperre()`
Verhindert nach einer abgeschlossenen Zahlung weitere Änderungen an der Auswahl.
[W3Schools: Window location](https://www.w3schools.com/jsref/prop_loc_href.asp)

`function richteSitzungsaktionenEin()`
Richtet Aktionen zum Abbrechen einer Bestellung und Abmelden ein; die zugehörigen Klick-Callbacks gehören dazu.
[W3Schools: HTML DOM addEventListener()](https://www.w3schools.com/jsref/met_element_addeventlistener.asp)

`function zeigeMitarbeiter()`
Schreibt den Namen der angemeldeten Person in die vorgesehene Anzeige.
[W3Schools: HTML DOM textContent](https://www.w3schools.com/jsref/prop_node_textcontent.asp)

`function fuegeTextlisteHinzu(eltern, eintraege)`
Fügt einer Stelle im Dokument eine Liste mit Texten hinzu.
[W3Schools: HTML DOM appendChild()](https://www.w3schools.com/jsref/met_node_appendchild.asp)

`function zeigeBon()`
Baut die Vorschau des aktuellen Bestellstands im Bonbereich auf.
[W3Schools: HTML DOM appendChild()](https://www.w3schools.com/jsref/met_node_appendchild.asp)

`function aktualisiereAuswahlseite()`
Passt die Markierung der Auswahlkarten an ihre Checkboxen an.
[W3Schools: HTML DOM classList](https://www.w3schools.com/jsref/prop_element_classlist.asp)

## Seiten für die Müsliauswahl

`function baueBasiskarten()`
Erstellt für jede verfügbare Grundsorte eine Auswahlkarte.
[W3Schools: JavaScript forEach()](https://www.w3schools.com/jsref/jsref_foreach.asp)

`function baueZutatenliste(kategorie)`
Erstellt die Zutatenkarten für die übergebene Kategorie.
[W3Schools: JavaScript forEach()](https://www.w3schools.com/jsref/jsref_foreach.asp)

`function markiereBasis()`
Markiert auf den Karten die aktuell gewählte Grundsorte.
[W3Schools: HTML DOM classList](https://www.w3schools.com/jsref/prop_element_classlist.asp)

`function richteBasisseiteEin()`
Baut die Basisseite auf und richtet ihre Klick-Callbacks für die Auswahl ein.
[W3Schools: HTML DOM addEventListener()](https://www.w3schools.com/jsref/met_element_addeventlistener.asp)

`function liesKategorieAusFormular(kategorie)`
Liest die angekreuzten Zutaten aus dem Formular aus.
[W3Schools: HTML DOM querySelectorAll()](https://www.w3schools.com/jsref/met_document_queryselectorall.asp)

`function stelleCheckboxenWiederHer(kategorie)`
Setzt Checkboxen entsprechend der bereits gespeicherten Zutaten.
[W3Schools: HTML DOM checked](https://www.w3schools.com/jsref/prop_checkbox_checked.asp)

`function richteZutatenseiteEin()`
Baut eine Zutatenseite auf und verarbeitet ihre Formular-Callbacks.
[W3Schools: HTML DOM addEventListener()](https://www.w3schools.com/jsref/met_element_addeventlistener.asp)

`function fuegeAktuellesMuesliHinzu()`
Übernimmt die vollständige Auswahl als neue Position in den Warenkorb.
[W3Schools: JavaScript Array push()](https://www.w3schools.com/jsref/jsref_push.asp)

`function richteExtraseiteEin()`
Richtet die letzte Auswahlseite mit ihren Schaltflächen-Callbacks ein.
[W3Schools: HTML DOM addEventListener()](https://www.w3schools.com/jsref/met_element_addeventlistener.asp)

## Anmeldung und Kasse

`function richteLoginEin()`
Richtet die Anmeldung ein und prüft im Submit-Callback die eingegebenen Daten.
[W3Schools: HTML DOM submit Event](https://www.w3schools.com/jsref/event_onsubmit.asp)

`function aktualisiereZahlungsbereich()`
Aktualisiert die Verfügbarkeit und Sichtbarkeit der Zahlungsbedienelemente.
[W3Schools: HTML DOM disabled](https://www.w3schools.com/tags/att_disabled.asp)

`function zeigeKasse()`
Füllt die Kasse mit Mitarbeiter, Warenkorb und Gesamtpreis.
[W3Schools: HTML DOM textContent](https://www.w3schools.com/jsref/prop_node_textcontent.asp)

`function ladeProduktZumBearbeiten(produkt)`
Überträgt ein Warenkorbprodukt zurück in die Auswahl zum Bearbeiten.
[W3Schools: JavaScript Object Spread](https://www.w3schools.com/js/js_es6.asp)

`function aenderWarenkorbNachMengenwechsel()`
Speichert eine Mengenänderung und aktualisiert danach Kasse und Zahlungsbereich.
[W3Schools: JavaScript Functions](https://www.w3schools.com/js/js_functions.asp)

`function richteProduktAktionenEin()`
Richtet die Klick-Callbacks für Menge, Bearbeiten und Entfernen im Warenkorb ein.
[W3Schools: HTML DOM addEventListener()](https://www.w3schools.com/jsref/met_element_addeventlistener.asp)

`function liesGeldbetrag(text)`
Wandelt eine Texteingabe mit Komma oder Punkt in einen gerundeten Geldbetrag um.
[W3Schools: JavaScript Number()](https://www.w3schools.com/jsref/jsref_number.asp)

`function heutigesDatum()`
Gibt das heutige Datum im Format Jahr-Monat-Tag zurück.
[W3Schools: JavaScript Date](https://www.w3schools.com/js/js_dates.asp)

`function erzeugeBonnummer()`
Erstellt die nächste Bonnummer und erhöht den gespeicherten Zähler.
[W3Schools: JavaScript String padStart()](https://www.w3schools.com/jsref/jsref_string_padstart.asp)

`function archiviereVerkauf()`
Speichert einen abgeschlossenen Verkauf, wenn er noch nicht im Verlauf steht.
[W3Schools: JavaScript Array some()](https://www.w3schools.com/jsref/jsref_some.asp)

`function erstelleKassenbonText()`
Setzt alle Angaben eines Kassenbons als mehrzeiligen Text zusammen.
[W3Schools: JavaScript Array join()](https://www.w3schools.com/jsref/jsref_join.asp)

`function ladeTextdateiHerunter(text, dateiname)`
Erstellt aus Text eine Datei und startet ihren Download.
[W3Schools: HTML DOM Blob](https://www.w3schools.com/js/js_api_intro.asp)

`function speichereKassenbon()`
Speichert den erzeugten Kassenbon als Textdatei.
[W3Schools: JavaScript Functions](https://www.w3schools.com/js/js_functions.asp)

`function sperreBezahlteBestellung()`
Deaktiviert nach dem Bezahlen alle Bedienelemente der Bestellung.
[W3Schools: HTML DOM disabled](https://www.w3schools.com/tags/att_disabled.asp)

`function druckeKassenbon()`
Bereitet den Bon im Druckbereich vor und öffnet den Druckdialog.
[W3Schools: Window print()](https://www.w3schools.com/jsref/met_win_print.asp)

`function zeigeBonEntscheidung(statusText)`
Zeigt den Zahlungsstatus und die Entscheidung über einen Bon an.
[W3Schools: HTML DOM hidden](https://www.w3schools.com/tags/att_global_hidden.asp)

`function richteKassenseiteEin()`
Richtet die Kassenseite und ihre Klick- sowie Eingabe-Callbacks ein.
[W3Schools: HTML DOM addEventListener()](https://www.w3schools.com/jsref/met_element_addeventlistener.asp)

`function waehleZahlungsart(neueZahlungsart)`
Schaltet zwischen Karten- und Barzahlung um und passt die Kassenbereiche an.
[W3Schools: HTML DOM classList](https://www.w3schools.com/jsref/prop_element_classlist.asp)

`function aktualisiereRueckgeld()`
Berechnet nach einer Bareingabe das Rückgeld und zeigt bei Bedarf einen Vorschlag.
[W3Schools: JavaScript Number isFinite()](https://www.w3schools.com/jsref/jsref_isfinite_number.asp)

## Verkaufsverlauf und Berichte

`function zeigeVerkaufsverlauf()`
Zeigt gefilterte Verkäufe und berechnet passende Umsatzangaben.
[W3Schools: JavaScript Array filter()](https://www.w3schools.com/jsref/jsref_filter.asp)

`function liesVerlaufsfilter()`
Liest die gewählten Filterwerte für Zeitraum, Zahlungsart und Mitarbeiter.
[W3Schools: HTML DOM value](https://www.w3schools.com/jsref/prop_option_value.asp)

`function filtereVerkaufe(filter)`
Gibt nur Verkäufe zurück, die zu allen gewählten Filterbedingungen passen.
[W3Schools: JavaScript Array filter()](https://www.w3schools.com/jsref/jsref_filter.asp)

`function fuelleMitarbeiterFilter()`
Füllt den Mitarbeiterfilter mit den im Verlauf vorkommenden Namen.
[W3Schools: JavaScript Set](https://www.w3schools.com/js/js_es6.asp)

`function storniereVerkauf(bonnummer)`
Markiert einen bestätigten Verkauf als storniert und speichert den Zeitpunkt.
[W3Schools: Window confirm()](https://www.w3schools.com/jsref/met_win_confirm.asp)

`function erstelleZBerichtText()`
Erstellt einen Textbericht über heutige gültige und stornierte Verkäufe.
[W3Schools: JavaScript Array filter()](https://www.w3schools.com/jsref/jsref_filter.asp)

`function richteVerlaufsseiteEin()`
Richtet die Filter- und Aktions-Callbacks der Verlaufsseite ein.
[W3Schools: HTML DOM addEventListener()](https://www.w3schools.com/jsref/met_element_addeventlistener.asp)

## Verwaltung und Navigation

`function erweitereKopfleiste()`
Ergänzt für Chefs einen Button zur Verwaltungsseite in der Kopfleiste.
[W3Schools: HTML DOM querySelector()](https://www.w3schools.com/jsref/met_document_queryselector.asp)

`function alleProdukte()`
Fasst Grundsorten und Zutaten zu einer gemeinsamen Produktliste zusammen.
[W3Schools: JavaScript Array map()](https://www.w3schools.com/jsref/jsref_map.asp)

`function zeigeVerwaltung()`
Erstellt die Tabellenzeilen für Produkte, Preise und Bestände.
[W3Schools: HTML DOM createElement()](https://www.w3schools.com/jsref/met_document_createelement.asp)

`function meldeVerwaltung(text, istFehler)`
Zeigt in der Verwaltung eine Erfolgs- oder Fehlermeldung an.
[W3Schools: HTML DOM className](https://www.w3schools.com/jsref/prop_html_classname.asp)

`function setzePreis(name, preis)`
Ändert den Preis eines Produkts in allen passenden Produktlisten.
[W3Schools: JavaScript Array find()](https://www.w3schools.com/jsref/jsref_find.asp)

`function uebernimmVerwaltungsEingaben()`
Prüft die Verwaltungsfelder und übernimmt gültige Preise und Bestände.
[W3Schools: HTML DOM querySelectorAll()](https://www.w3schools.com/jsref/met_document_queryselectorall.asp)

`function fuelleBestandAuf()`
Setzt den Bestand aller Produkte auf den Standardwert zurück.
[W3Schools: JavaScript forEach()](https://www.w3schools.com/jsref/jsref_foreach.asp)

`function setzeProdukteZurueck()`
Entfernt eigene Produktänderungen und lädt die Standardpreise erneut.
[W3Schools: JavaScript localStorage](https://www.w3schools.com/jsref/prop_win_localstorage.asp)

`function setzeDemoZurueck()`
Löscht nach einer Sicherheitsabfrage alle gespeicherten Demodaten.
[W3Schools: Window confirm()](https://www.w3schools.com/jsref/met_win_confirm.asp)

`function richteVerwaltungsseiteEin()`
Richtet die Schaltflächen-Callbacks für Speichern, Auffüllen und Zurücksetzen ein.
[W3Schools: HTML DOM addEventListener()](https://www.w3schools.com/jsref/met_element_addeventlistener.asp)

`function richteNavigationEin()`
Richtet die Klick-Callbacks ein, die zu den hinterlegten Seitenzielen wechseln.
[W3Schools: HTML DOM addEventListener()](https://www.w3schools.com/jsref/met_element_addeventlistener.asp)

`function zeigeProduktdatenFehler()`
Zeigt eine Fehlermeldung an, wenn die Produktdaten nicht geladen wurden.
[W3Schools: HTML DOM insertBefore()](https://www.w3schools.com/jsref/met_node_insertbefore.asp)

## Start des Programms

Beim Ereignis `DOMContentLoaded` prüft das Skript die Daten und richtet anschließend die passende Seite ein.
[W3Schools: DOM-Ereignisse mit addEventListener()](https://www.w3schools.com/jsref/met_element_addeventlistener.asp)
