"use strict";

// Diese Datei enthält alle festen Grunddaten des Kassensystems.
// Dadurch müssen Preise, Zutaten und Zugangsdaten nicht im HTML geändert werden.

// Alle Basissorten mit Preis und Bild.
const BASIS_SORTEN = [
  { name: "Tropic", preis: 3.50, bild: "bilder/tropic.svg" },
  { name: "Bircher", preis: 3.80, bild: "bilder/bircher.svg" },
  { name: "Chocolate", preis: 4.00, bild: "bilder/chocolate.svg" }
];

// Alle Zutaten, getrennt nach den vier Auswahlseiten.
const ZUTATEN_SORTEN = {
  verfeinerung: [
    { name: "Amaranth", preis: 0.50 },
    { name: "Dinkel", preis: 0.60 },
    { name: "Leinsamen", preis: 0.60 },
    { name: "Quinoaflocken", preis: 0.60 }
  ],
  fruechte: [
    { name: "Ananas", preis: 0.60 },
    { name: "Apfelstücke", preis: 0.65 },
    { name: "Cranberries", preis: 0.65 },
    { name: "Mango", preis: 0.70 },
    { name: "Gojibeeren", preis: 1.10 }
  ],
  nuesse: [
    { name: "Cashewkerne", preis: 0.55 },
    { name: "Kokoschips", preis: 0.25 },
    { name: "Macadamia", preis: 0.95 }
  ],
  extras: [
    { name: "Cranberry-Chocs", preis: 0.60 },
    { name: "Honigflocken", preis: 0.60 },
    { name: "Schoko-Crunchy", preis: 0.50 },
    { name: "Rosinen-Chocs", preis: 0.60 }
  ]
};

// Die Reihenfolge der Zutaten-Seiten während einer Bestellung.
const KATEGORIEN_REIHENFOLGE = ["verfeinerung", "fruechte", "nuesse", "extras"];

// Namen der Auswahlseiten im Browser (data-seite) für die Zuordnung der Zutaten.
const KATEGORIE_SEITEN = {
  verfeinerung: "verfeinerung",
  fruechte: "fruechte",
  nuesse: "nuesse",
  extras: "extras"
};

// Lagerbestand je Portion. Der Wert gilt für jede Basis und jede Zutat.
const BESTAND_STANDARD = 15;
// Ab dieser Menge wird auf den Auswahlseiten gewarnt.
const BESTAND_WARNGRENZE = 5;

// Geldstücke und Geldscheine, die beim Rückgeld berücksichtigt werden.
const GELDSTUECKE = [500, 200, 100, 50, 20, 10, 5, 2, 1, 0.5, 0.2, 0.1, 0.05, 0.02, 0.01];

// Demo-Zugangsdaten: Rolle steuert, was ein Mitarbeiter darf.
// "mitarbeiter" darf kassieren, "chef" zusätzlich verwalten und stornieren.
const ZUGANGSDATEN = {
  "Mitarbeiter 1": { code: "1111", rolle: "mitarbeiter" },
  "Mitarbeiter 2": { code: "2222", rolle: "mitarbeiter" },
  "Mitarbeiter 3": { code: "3333", rolle: "mitarbeiter" },
  "Mitarbeiter 4": { code: "4444", rolle: "mitarbeiter" },
  "Chef": { code: "9999", rolle: "chef" }
};
