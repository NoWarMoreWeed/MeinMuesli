"use strict";

// Diese Datei enthält alle festen Grunddaten des Kassensystems.
// Dadurch müssen Preise, Zutaten und Zugangsdaten nicht im HTML geändert werden.
// W3Schools: https://www.w3schools.com/js/js_objects.asp

// Alle Basissorten mit Preis und Bild.
// W3Schools: https://www.w3schools.com/js/js_arrays.asp
const BASIS_SORTEN = [
  { name: "Tropic", preis: 3.50, bild: "bilder/tropic.svg" },
  { name: "Bircher", preis: 3.80, bild: "bilder/bircher.svg" },
  { name: "Chocolate", preis: 4.00, bild: "bilder/chocolate.svg" }
];

// Alle Zutaten, getrennt nach den vier Auswahlseiten.
// Jede Zutat hat einen Namen, einen Preis und ein eigenes Bild.
// W3Schools: https://www.w3schools.com/js/js_arrays.asp
const ZUTATEN_SORTEN = {
  verfeinerung: [
    { name: "Amaranth", preis: 0.50, bild: "bilder/amaranth.svg" },
    { name: "Dinkel", preis: 0.60, bild: "bilder/dinkel.svg" },
    { name: "Leinsamen", preis: 0.60, bild: "bilder/leinsamen.svg" },
    { name: "Quinoaflocken", preis: 0.60, bild: "bilder/quinoaflocken.svg" }
  ],
  fruechte: [
    { name: "Ananas", preis: 0.60, bild: "bilder/ananas.svg" },
    { name: "Apfelstücke", preis: 0.65, bild: "bilder/apfelstuecke.svg" },
    { name: "Cranberries", preis: 0.65, bild: "bilder/cranberries.svg" },
    { name: "Mango", preis: 0.70, bild: "bilder/mango.svg" },
    { name: "Gojibeeren", preis: 1.10, bild: "bilder/gojibeeren.svg" }
  ],
  nuesse: [
    { name: "Cashewkerne", preis: 0.55, bild: "bilder/cashewkerne.svg" },
    { name: "Kokoschips", preis: 0.25, bild: "bilder/kokoschips.svg" },
    { name: "Macadamia", preis: 0.95, bild: "bilder/macadamia.svg" }
  ],
  extras: [
    { name: "Cranberry-Chocs", preis: 0.60, bild: "bilder/cranberrychocs.svg" },
    { name: "Honigflocken", preis: 0.60, bild: "bilder/honigflocken.svg" },
    { name: "Schoko-Crunchy", preis: 0.50, bild: "bilder/schokocrunchy.svg" },
    { name: "Rosinen-Chocs", preis: 0.60, bild: "bilder/rosinenchocs.svg" }
  ]
};

// Die Reihenfolge der Zutaten-Seiten während einer Bestellung.
// W3Schools: https://www.w3schools.com/js/js_arrays.asp
const KATEGORIEN_REIHENFOLGE = ["verfeinerung", "fruechte", "nuesse", "extras"];

// Namen der Auswahlseiten im Browser (data-seite) für die Zuordnung der Zutaten.
// W3Schools: https://www.w3schools.com/js/js_arrays.asp
const KATEGORIE_SEITEN = {
  verfeinerung: "verfeinerung",
  fruechte: "fruechte",
  nuesse: "nuesse",
  extras: "extras"
};

// Lagerbestand je Portion. Der Wert gilt für jede Basis und jede Zutat.
// W3Schools: https://www.w3schools.com/js/js_const.asp
const BESTAND_STANDARD = 15;
// Ab dieser Menge wird auf den Auswahlseiten gewarnt.
// W3Schools: https://www.w3schools.com/js/js_const.asp
const BESTAND_WARNGRENZE = 5;

// Steuersätze in Deutschland: Speisen zum Mitnehmen und Essen im Lokal.
// Die Preise sind Endpreise, die Steuer wird also aus dem Betrag herausgerechnet.
// W3Schools: https://www.w3schools.com/js/js_numbers.asp
const STEUERSATZ_MITNAHME = 0.07;
const STEUERSATZ_IM_HAUS = 0.19;

// Mengenrabatt: ab dieser Menge zählt der Rabatt, mit diesem Prozentsatz.
// W3Schools: https://www.w3schools.com/js/js_numbers.asp
const RABATT_AB_MENGE = 3;
const RABATT_PROZENT = 10;

// Dieses Bild erscheint, wenn zu einer Zutat kein eigenes Bild hinterlegt ist.
// W3Schools: https://www.w3schools.com/js/js_strings.asp
const BILD_PLATZHALTER = "bilder/platzhalter.svg";

// Geldstücke und Geldscheine, die beim Rückgeld berücksichtigt werden.
// W3Schools: https://www.w3schools.com/js/js_arrays.asp
const GELDSTUECKE = [500, 200, 100, 50, 20, 10, 5, 2, 1, 0.5, 0.2, 0.1, 0.05, 0.02, 0.01];

// Demo-Zugangsdaten: Rolle steuert, was ein Mitarbeiter darf.
// "mitarbeiter" darf kassieren, "chef" zusätzlich verwalten und stornieren.
// W3Schools: https://www.w3schools.com/js/js_objects.asp
const ZUGANGSDATEN = {
  "Mitarbeiter 1": { code: "1111", rolle: "mitarbeiter" },
  "Mitarbeiter 2": { code: "2222", rolle: "mitarbeiter" },
  "Mitarbeiter 3": { code: "3333", rolle: "mitarbeiter" },
  "Mitarbeiter 4": { code: "4444", rolle: "mitarbeiter" },
  "Chef": { code: "9999", rolle: "chef" }
};
