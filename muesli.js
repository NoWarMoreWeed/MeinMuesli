"use strict";

// Hier stehen die Namen aller Einträge im localStorage.
const SPEICHER = {
  mitarbeiter: "meinMuesliMitarbeiter",
  rolle: "meinMuesliRolle",
  auswahl: "meinMuesliAuswahl",
  warenkorb: "meinMuesliWarenkorb",
  zahlung: "meinMuesliZahlung",
  verkaeufe: "meinMuesliVerkaeufe",
  bonnummer: "meinMuesliNaechsteBonnummer",
  produkte: "meinMuesliProdukte",
  bestand: "meinMuesliBestand",
  wechselgeld: "meinMuesliWechselgeld",
  verzehrart: "meinMuesliVerzehrart",
  rabatt: "meinMuesliRabatt"
};

// Liefert die Grundsorten oder bei fehlenden Daten eine leere Liste.
// W3Schools: https://www.w3schools.com/js/js_arrays.asp
function produktDaten() {
  return typeof BASIS_SORTEN === "undefined" ? [] : BASIS_SORTEN;
}

// Liefert die Zutaten nach Kategorien oder leere Kategorien als Ersatz.
// W3Schools: https://www.w3schools.com/js/js_objects.asp
function zutatenDaten() {
  return typeof ZUTATEN_SORTEN === "undefined"
    ? { verfeinerung: [], fruechte: [], nuesse: [], extras: [] }
    : ZUTATEN_SORTEN;
}

// Liefert die hinterlegten Demo-Zugangsdaten oder ein leeres Objekt.
// W3Schools: https://www.w3schools.com/js/js_objects.asp
function zugangsDaten() {
  return typeof ZUGANGSDATEN === "undefined" ? {} : ZUGANGSDATEN;
}

// Liefert die verfügbaren Schein- und Münzwerte für das Rückgeld.
// W3Schools: https://www.w3schools.com/js/js_arrays.asp
function geldstueckDaten() {
  return typeof GELDSTUECKE === "undefined"
    ? [500, 200, 100, 50, 20, 10, 5, 2, 1, 0.5, 0.2, 0.1, 0.05, 0.02, 0.01]
    : GELDSTUECKE;
}

// Liefert den normalen Anfangsbestand eines Produkts.
// W3Schools: https://www.w3schools.com/js/js_operators.asp
function bestandStandardWert() {
  return typeof BESTAND_STANDARD === "undefined" ? 15 : BESTAND_STANDARD;
}

// Liefert die Grenze, ab der ein Bestand als niedrig gilt.
// W3Schools: https://www.w3schools.com/js/js_operators.asp
function bestandWarnwert() {
  return typeof BESTAND_WARNGRENZE === "undefined" ? 5 : BESTAND_WARNGRENZE;
}

// Prüft, ob die notwendigen Grunddaten für Produkte oder Zutaten fehlen.
// W3Schools: https://www.w3schools.com/js/js_operators.asp
function produktdatenFehlen() {
  return typeof BASIS_SORTEN === "undefined" || typeof ZUTATEN_SORTEN === "undefined";
}

// Erstellt aus den Zutatenlisten eine Übersicht mit den jeweiligen Namen.
// W3Schools: https://www.w3schools.com/jsref/jsref_object_fromentries.asp
function zutatenKategorien() {
  return Object.fromEntries(
    Object.entries(zutatenDaten()).map(([kategorie, liste]) => [
      kategorie,
      liste.map(zutat => zutat.name)
    ])
  );
}

// Erzeugt eine leere Auswahl für ein neues Müsli.
// W3Schools: https://www.w3schools.com/js/js_objects.asp
function neueAuswahl() {
  return {
    basis: null,
    verfeinerung: [],
    fruechte: [],
    nuesse: [],
    extras: [],
    hinzugefuegt: false
  };
}

// Erzeugt einen zurückgesetzten Zahlungszustand.
// W3Schools: https://www.w3schools.com/js/js_objects.asp
function neueZahlung() {
  return {
    abgeschlossen: false,
    zahlungsart: "",
    erhaltenerBetrag: 0,
    rueckgeld: 0,
    bonnummer: "",
    bonEntscheidung: "",
    abholnummer: ""
  };
}

// Liest einen JSON-Wert aus dem Browserspeicher und nutzt bei Bedarf den Ersatzwert.
// Parameter: `schluessel` bezeichnet den Speicherplatz; `ersatzwert` ist der sichere Ersatzwert.
// W3Schools: https://www.w3schools.com/js/js_json.asp
function ladeJSON(schluessel, ersatzwert) {
  try {
    const text = localStorage.getItem(schluessel);
    return text ? JSON.parse(text) : ersatzwert;
  } catch (fehler) {
    return ersatzwert;
  }
}

// Lädt die frühere Auswahl und ergänzt fehlende Teile mit leeren Standardwerten.
// W3Schools: https://www.w3schools.com/js/js_objects.asp
function ladeAuswahl() {
  const gespeichert = ladeJSON(SPEICHER.auswahl, neueAuswahl());
  const leer = neueAuswahl();

  return {
    basis: gespeichert.basis || leer.basis,
    verfeinerung: Array.isArray(gespeichert.verfeinerung) ? gespeichert.verfeinerung : [],
    fruechte: Array.isArray(gespeichert.fruechte) ? gespeichert.fruechte : [],
    nuesse: Array.isArray(gespeichert.nuesse) ? gespeichert.nuesse : [],
    extras: Array.isArray(gespeichert.extras) ? gespeichert.extras : [],
    hinzugefuegt: gespeichert.hinzugefuegt === true
  };
}

// Der aktuelle Zustand wird beim Laden jeder Seite bereitgestellt.
let aktuelleAuswahl = ladeAuswahl();
let warenkorb = ladeJSON(SPEICHER.warenkorb, []);
let zahlung = ladeJSON(SPEICHER.zahlung, neueZahlung());
let verkaeufe = ladeJSON(SPEICHER.verkaeufe, []);
let produkte = ladeProdukte();
let bestand = ladeJSON(SPEICHER.bestand, {});
// Wechselgeld in Euro, als Dezimalzahl gespeichert.
let wechselgeld = ladeJSON(SPEICHER.wechselgeld, 0);
if (typeof wechselgeld !== "number") wechselgeld = 0;

// Lädt die gespeicherte Produktliste oder verwendet die vorgegebenen Daten.
// W3Schools: https://www.w3schools.com/jsref/prop_win_localstorage.asp
function ladeProdukte() {
  const gespeichert = ladeJSON(SPEICHER.produkte, null);
  const quelle = gespeichert && typeof gespeichert === "object" ? gespeichert : {};

  return {
    basis: Array.isArray(quelle.basis) ? quelle.basis : produktDaten(),
    ...Object.fromEntries(Object.entries(zutatenDaten()).map(([kategorie, liste]) => [
      kategorie,
      Array.isArray(quelle[kategorie]) ? quelle[kategorie] : liste
    ]))
  };
}

// Stellt sicher, dass ein gültiges Bestandsobjekt vorhanden ist.
// W3Schools: https://www.w3schools.com/js/js_objects.asp
function ladeBestand() {
  if (!bestand || typeof bestand !== "object") bestand = {};
  return bestand;
}

// Gibt den aktuellen Bestand eines Produkts zurück oder den Standardwert.
// Parameter: `name` bezeichnet das Produkt.
// W3Schools: https://www.w3schools.com/jsref/jsref_number.asp
function bestandVon(name) {
  ladeBestand();
  const wert = Number(bestand[name]);
  return Number.isInteger(wert) && wert >= 0 ? wert : bestandStandardWert();
}

// Verringert den Bestand eines Produkts, aber nie unter null.
// Parameter: `name` bezeichnet das Produkt; `anzahl` ist die Portionenzahl.
// W3Schools: https://www.w3schools.com/jsref/jsref_max.asp
function reduziereBestand(name, anzahl) {
  ladeBestand();
  bestand[name] = Math.max(0, bestandVon(name) - anzahl);
  speichereBestand();
}

// Formuliert bei niedrigem oder leerem Bestand einen kurzen Hinweis.
// Parameter: `anzahl` ist die Portionenzahl.
// W3Schools: https://www.w3schools.com/js/js_if_else.asp
function bestandHinweis(anzahl) {
  if (anzahl <= 0) return "Ausverkauft";
  if (anzahl <= bestandWarnwert()) return "Nur noch " + anzahl + " verfügbar";
  return "";
}

// Prüft anhand der gespeicherten Rolle, ob ein Chef angemeldet ist.
// W3Schools: https://www.w3schools.com/jsref/prop_win_localstorage.asp
function istChef() {
  return localStorage.getItem(SPEICHER.rolle) === "chef";
}

// Ein beschädigter Warenkorb wird durch einen leeren Warenkorb ersetzt.
if (!Array.isArray(warenkorb)) {
  warenkorb = [];
}

if (!Array.isArray(verkaeufe)) {
  verkaeufe = [];
}

if (!zahlung || typeof zahlung !== "object") {
  zahlung = neueZahlung();
} else {
  zahlung = { ...neueZahlung(), ...zahlung };
}

// Speichert die aktuelle Müsliauswahl als JSON im Browser.
// Seiteneffekt: Die aktuellen Daten werden im Browser-Speicher abgelegt.
// W3Schools: https://www.w3schools.com/jsref/jsref_stringify.asp
function speichereAuswahl() {
  localStorage.setItem(SPEICHER.auswahl, JSON.stringify(aktuelleAuswahl));
}

// Speichert den Warenkorb als JSON im Browser.
// Seiteneffekt: Die aktuellen Daten werden im Browser-Speicher abgelegt.
// W3Schools: https://www.w3schools.com/jsref/jsref_stringify.asp
function speichereWarenkorb() {
  localStorage.setItem(SPEICHER.warenkorb, JSON.stringify(warenkorb));
}

// Speichert den Zahlungszustand als JSON im Browser.
// Seiteneffekt: Die aktuellen Daten werden im Browser-Speicher abgelegt.
// W3Schools: https://www.w3schools.com/jsref/jsref_stringify.asp
function speichereZahlung() {
  localStorage.setItem(SPEICHER.zahlung, JSON.stringify(zahlung));
}

// Speichert die bisherigen Verkäufe als JSON im Browser.
// Seiteneffekt: Die aktuellen Daten werden im Browser-Speicher abgelegt.
// W3Schools: https://www.w3schools.com/jsref/jsref_stringify.asp
function speichereVerkaeufe() {
  localStorage.setItem(SPEICHER.verkaeufe, JSON.stringify(verkaeufe));
}

// Speichert die Bestandszahlen als JSON im Browser.
// Seiteneffekt: Die aktuellen Daten werden im Browser-Speicher abgelegt.
// W3Schools: https://www.w3schools.com/jsref/jsref_stringify.asp
function speichereBestand() {
  localStorage.setItem(SPEICHER.bestand, JSON.stringify(bestand));
}

// Speichert die geänderten Produktdaten als JSON im Browser.
// Seiteneffekt: Die aktuellen Daten werden im Browser-Speicher abgelegt.
// W3Schools: https://www.w3schools.com/jsref/jsref_stringify.asp
// Die geänderte Preistabelle wird gespeichert.
// W3Schools: https://www.w3schools.com/jsref/prop_win_localstorage.asp
function speichereProdukte() {
  localStorage.setItem(SPEICHER.produkte, JSON.stringify(produkte));
}

// ---------------------------------------------------------------------------
// Verzehrart (Mitnehmen oder hier essen) und Mengenrabatt
// ---------------------------------------------------------------------------

// Liest die gespeicherte Verzehrart: "mitnehmen", "hier" oder "".
// W3Schools: https://www.w3schools.com/jsref/prop_win_localstorage.asp
function ladeVerzehrart() {
  const gespeichert = localStorage.getItem(SPEICHER.verzehrart);
  return gespeichert === "mitnehmen" || gespeichert === "hier" ? gespeichert : "";
}

// Die Verzehrart gilt für die ganze Bestellung.
let verzehrart = ladeVerzehrart();
// Der Rabatt ist entweder angewendet oder nicht.
let rabattAngewendet = ladeJSON(SPEICHER.rabatt, false) === true;
// Merkt sich, ob schon bewusst ohne Rabatt bezahlt werden sollte.
let ohneRabattBestaetigt = false;
// Merkt sich die Zahlungsart, die vor der Rabattfrage gewählt wurde.
let zahlungsartNachRabatt = "";

// Speichert die Verzehrart im Browserspeicher.
// Seiteneffekt: Die aktuellen Daten werden im Browser-Speicher abgelegt.
// W3Schools: https://www.w3schools.com/jsref/prop_win_localstorage.asp
function speichereVerzehrart() {
  localStorage.setItem(SPEICHER.verzehrart, verzehrart);
}

// Setzt die Verzehrart und aktualisiert die Anzeige der Kassenseite.
// Parameter: `neueVerzehrart` ist "mitnehmen", "hier" oder "".
// W3Schools: https://www.w3schools.com/js/js_functions.asp
function setzeVerzehrart(neueVerzehrart) {
  verzehrart = neueVerzehrart;
  speichereVerzehrart();
  setzeZahlungZurueck();
  zeigeVerzehrart();
  zeigeKasse();
  aktualisiereZahlungsbereich();
  zeigeBon();
}

// Speichert, ob der Mengenrabatt angewendet wird.
// Parameter: `aktiv` ist true für angewendet und false für nicht angewendet.
// W3Schools: https://www.w3schools.com/jsref/jsref_boolean.asp
function setzeRabatt(aktiv) {
  rabattAngewendet = aktiv === true;
  localStorage.setItem(SPEICHER.rabatt, JSON.stringify(rabattAngewendet));
  setzeZahlungZurueck();
  zeigeRabatt();
  zeigeKasse();
  zeigeBon();
}

// Setzt Verzehrart und Rabatt für eine neue Bestellung zurück.
// W3Schools: https://www.w3schools.com/jsref/met_storage_removeitem.asp
function setzeVerzehrUndRabattZurueck() {
  verzehrart = "";
  rabattAngewendet = false;
  ohneRabattBestaetigt = false;
  zahlungsartNachRabatt = "";
  localStorage.removeItem(SPEICHER.verzehrart);
  localStorage.removeItem(SPEICHER.rabatt);
}

// Liefert den Steuersatz für das Mitnehmen (7 %).
// W3Schools: https://www.w3schools.com/js/js_numbers.asp
function steuersatzMitnahmeWert() {
  return typeof STEUERSATZ_MITNAHME === "undefined" ? 0.07 : STEUERSATZ_MITNAHME;
}

// Liefert den Steuersatz für das Essen im Laden (19 %).
// W3Schools: https://www.w3schools.com/js/js_numbers.asp
function steuersatzImHausWert() {
  return typeof STEUERSATZ_IM_HAUS === "undefined" ? 0.19 : STEUERSATZ_IM_HAUS;
}

// Liefert die Menge, ab der der Mengenrabatt möglich ist.
// W3Schools: https://www.w3schools.com/js/js_numbers.asp
function rabattAbMengeWert() {
  return typeof RABATT_AB_MENGE === "undefined" ? 3 : RABATT_AB_MENGE;
}

// Liefert den Mengenrabatt in Prozent.
// W3Schools: https://www.w3schools.com/js/js_numbers.asp
function rabattProzentWert() {
  return typeof RABATT_PROZENT === "undefined" ? 10 : RABATT_PROZENT;
}

// Liefert den Dateinamen des Ersatzbildes.
// W3Schools: https://www.w3schools.com/js/js_strings.asp
function bildPlatzhalterDatei() {
  return typeof BILD_PLATZHALTER === "undefined" ? "bilder/platzhalter.svg" : BILD_PLATZHALTER;
}

// Liefert den Steuersatz, der zur gewählten Verzehrart gehört.
// W3Schools: https://www.w3schools.com/jsref/jsref_operators.asp
function aktuellerSteuersatz() {
  return verzehrart === "hier" ? steuersatzImHausWert() : steuersatzMitnahmeWert();
}

// Schreibt die Verzehrart aus, zum Beispiel "Mitnahme".
// W3Schools: https://www.w3schools.com/js/js_if_else.asp
function verzehrartText() {
  if (verzehrart === "mitnehmen") return "Mitnahme";
  if (verzehrart === "hier") return "Hier essen";
  return "Noch nicht gewählt";
}

// Schreibt den Steuersatz als Text, zum Beispiel "7 %".
// W3Schools: https://www.w3schools.com/jsref/jsref_round.asp
function steuersatzProzentText() {
  return String(Math.round(aktuellerSteuersatz() * 100)) + " %";
}

// Prüft, ob die Menge für den Mengenrabatt reicht.
// W3Schools: https://www.w3schools.com/js/js_comparisons.asp
function rabattMoeglich() {
  return anzahlImWarenkorb() >= rabattAbMengeWert();
}

// Berechnet den Rabatt in Euro. Ohne angewendeten Rabatt sind es 0 Euro.
// W3Schools: https://www.w3schools.com/jsref/jsref_round.asp
function rabattBetrag() {
  if (!rabattAngewendet || !rabattMoeglich()) return 0;
  return Math.round(berechneGesamtpreis() * rabattProzentWert()) / 100;
}

// Der Betrag, den die Kundschaft nach dem Rabatt bezahlt.
// W3Schools: https://www.w3schools.com/jsref/jsref_round.asp
function zuZahlenderBetrag() {
  return Math.round((berechneGesamtpreis() - rabattBetrag()) * 100) / 100;
}

// Rechnet aus einem Bruttobetrag den Nettoanteil und die Steuer heraus.
// Brutto = Netto + Steuer; deshalb gilt Netto = Brutto / (1 + Steuersatz).
// W3Schools: https://www.w3schools.com/jsref/jsref_round.asp
function steuerAusBrutto(brutto) {
  const satz = aktuellerSteuersatz();
  const netto = Math.round(brutto / (1 + satz) * 100) / 100;
  const steuer = Math.round((brutto - netto) * 100) / 100;

  return { netto, steuer, brutto, satz };
}

// Erzeugt ein Bild mit Ersatzbild, falls die Datei fehlt.
// Parameter: `datei` ist der Dateiname; `altText` beschreibt das Bild;
// `klasse` ist die CSS-Klasse des Bildes.
// W3Schools: https://www.w3schools.com/jsref/met_element_addeventlistener.asp
function erzeugeBild(datei, altText, klasse) {
  const bild = document.createElement("img");
  bild.src = datei ? datei : bildPlatzhalterDatei();
  bild.alt = altText;
  bild.className = klasse;
  bild.loading = "lazy";
  // Fehlt die Bilddatei, wird einmal das Ersatzbild eingesetzt.
  bild.addEventListener("error", () => {
    if (bild.src.indexOf(bildPlatzhalterDatei()) === -1) {
      bild.src = bildPlatzhalterDatei();
    }
  });
  return bild;
}

// Markiert auf der Kassenseite die gewählte Verzehrart.
// W3Schools: https://www.w3schools.com/jsref/prop_element_classlist.asp
function zeigeVerzehrart() {
  const mitnehmen = document.getElementById("mitnehmenButton");
  const hier = document.getElementById("hierEssenButton");
  const hinweis = document.getElementById("verzehrartHinweis");
  if (!mitnehmen || !hier) return;

  mitnehmen.classList.toggle("verzehrart-ausgewaehlt", verzehrart === "mitnehmen");
  hier.classList.toggle("verzehrart-ausgewaehlt", verzehrart === "hier");

  if (hinweis) {
    hinweis.textContent = verzehrart
      ? verzehrartText() + " – " + steuersatzProzentText() + " MwSt im Kassenbon"
      : "Bitte wählen: Zum Mitnehmen (7 % MwSt) oder Hier essen (19 % MwSt).";
  }
}

// Zeigt den Rabattknopf und den Fortschritt bis zum Rabatt an.
// W3Schools: https://www.w3schools.com/jsref/prop_html_disabled.asp
function zeigeRabatt() {
  const button = document.getElementById("rabattButton");
  const hinweis = document.getElementById("rabattHinweis");
  if (!button) return;

  const anzahl = anzahlImWarenkorb();
  const fehlend = rabattAbMengeWert() - anzahl;

  // Der Rabatt zählt nur, solange genug Müslis im Warenkorb liegen.
  const rabattAktiv = rabattMoeglich() && rabattAngewendet;
  button.disabled = !rabattMoeglich();
  button.textContent = rabattAktiv
    ? "Rabatt aktiv (" + rabattProzentWert() + " %) – entfernen"
    : rabattProzentWert() + " % Rabatt anwenden";

  if (!hinweis) return;

  if (!rabattMoeglich()) {
    hinweis.textContent = "Ab " + rabattAbMengeWert() + " Müslis gibt es " +
      rabattProzentWert() + " % Rabatt. Noch " + fehlend +
      (fehlend === 1 ? " Müsli" : " Müslis") + " bis zum Rabatt.";
  } else if (rabattAktiv) {
    hinweis.textContent = "Rabatt " + rabattProzentWert() + " % ist angewendet: −" +
      formatierePreis(rabattBetrag());
  } else {
    hinweis.textContent = anzahl + " Müslis im Warenkorb – " + rabattProzentWert() +
      " % Rabatt möglich (" + formatierePreis(Math.round(berechneGesamtpreis() * rabattProzentWert()) / 100) + ").";
  }
}

// Blendet die Erinnerung an den noch nicht angewendeten Rabatt ein.
// Parameter: `neueZahlungsart` ist die Zahlungsart, die danach geöffnet wird.
// W3Schools: https://www.w3schools.com/tags/att_global_hidden.asp
function zeigeRabattErinnerung(neueZahlungsart) {
  const bereich = document.getElementById("rabattErinnerung");
  const text = document.getElementById("rabattErinnerungText");
  if (!bereich || !text) return;

  zahlungsartNachRabatt = neueZahlungsart;
  text.textContent = anzahlImWarenkorb() + " Müslis im Warenkorb – " +
    rabattProzentWert() + " % Rabatt ist noch nicht angewendet.";
  bereich.hidden = false;
  bereich.scrollIntoView({ behavior: "auto", block: "center" });
}

// Versteckt die Erinnerung wieder.
// W3Schools: https://www.w3schools.com/tags/att_global_hidden.asp
function versteckeRabattErinnerung() {
  const bereich = document.getElementById("rabattErinnerung");
  if (bereich) bereich.hidden = true;
}

// Richtet Verzehrart, Rabatt und Rabatt-Erinnerung auf der Kassenseite ein.
// Parameter: `oeffneZahlungsart` öffnet die gewählte Zahlungsart.
// W3Schools: https://www.w3schools.com/jsref/met_element_addeventlistener.asp
function richteVerzehrartUndRabattEin(oeffneZahlungsart) {
  const mitnehmen = document.getElementById("mitnehmenButton");
  const hier = document.getElementById("hierEssenButton");
  const rabattButton = document.getElementById("rabattButton");

  if (mitnehmen) {
    mitnehmen.addEventListener("click", () => {
      if (zahlung.abgeschlossen) return;
      setzeVerzehrart("mitnehmen");
    });
  }

  if (hier) {
    hier.addEventListener("click", () => {
      if (zahlung.abgeschlossen) return;
      setzeVerzehrart("hier");
    });
  }

  if (rabattButton) {
    rabattButton.addEventListener("click", () => {
      if (zahlung.abgeschlossen) return;
      // Ein zweiter Klick nimmt den Rabatt wieder weg.
      setzeRabatt(!rabattAngewendet);
      ohneRabattBestaetigt = false;
    });
  }

  const jetzt = document.getElementById("rabattJetztButton");
  if (jetzt) {
    jetzt.addEventListener("click", () => {
      setzeRabatt(true);
      versteckeRabattErinnerung();
      if (zahlungsartNachRabatt) oeffneZahlungsart(zahlungsartNachRabatt);
    });
  }

  const ohne = document.getElementById("rabattOhneButton");
  if (ohne) {
    ohne.addEventListener("click", () => {
      // Diese Entscheidung gilt für die laufende Bestellung.
      ohneRabattBestaetigt = true;
      versteckeRabattErinnerung();
      if (zahlungsartNachRabatt) oeffneZahlungsart(zahlungsartNachRabatt);
    });
  }

  zeigeVerzehrart();
  zeigeRabatt();
}

// Zeigt die Bestellbestätigung mit Abholnummer und Bon-Vorschau.
// W3Schools: https://www.w3schools.com/jsref/prop_html_innertext.asp
function zeigeBestaetigung() {
  const bereich = document.getElementById("bestellBestaetigung");
  if (!bereich) return;

  const nummer = document.getElementById("abholnummer");
  const text = document.getElementById("bestaetigungText");

  if (nummer) nummer.textContent = "Abholnummer " + (zahlung.abholnummer || "---");

  if (text) {
    const steuer = steuerAusBrutto(zuZahlenderBetrag());
    text.textContent = verzehrartText() + " – voraussichtlich fertig in ca. 3 Minuten. " +
      "Zu zahlen: " + formatierePreis(steuer.brutto) + " (" + steuersatzProzentText() + " MwSt: " +
      formatierePreis(steuer.steuer) + ") – Bon " + zahlung.bonnummer + ".";
  }

  zeigeBonVorschau();
  bereich.hidden = false;
}

// Schreibt den Bon als Vorschau auf den Bildschirm.
// W3Schools: https://www.w3schools.com/jsref/prop_node_textcontent.asp
function zeigeBonVorschau() {
  const vorschau = document.getElementById("bonVorschau");
  if (vorschau) vorschau.textContent = erstelleKassenbonText();
}

// Zentriert einen Text auf der Bonbreite.
// Parameter: `text` ist die Zeile, die mittig stehen soll.
// W3Schools: https://www.w3schools.com/jsref/jsref_padstart.asp
function bonMitte(text) {
  const platz = Math.max(0, Math.floor((BON_BREITE - text.length) / 2));
  return " ".repeat(platz) + text;
}

// Setzt links einen Text und rechts einen Betrag auf dieselbe Zeile.
// Parameter: `links` ist die Beschreibung; `rechts` ist der Betrag.
// W3Schools: https://www.w3schools.com/jsref/jsref_repeat.asp
function bonZeile(links, rechts) {
  const beschreibung = String(links);
  const betrag = String(rechts);
  const platz = BON_BREITE - betrag.length;

  if (beschreibung.length >= platz) return beschreibung + " " + betrag;
  return beschreibung + " ".repeat(platz - beschreibung.length) + betrag;
}

// Die Breite des Kassenbons in Zeichen, wie bei einem 58-mm-Bon.
// W3Schools: https://www.w3schools.com/js/js_const.asp
const BON_BREITE = 42;
// Eine Trennlinie über die ganze Bonbreite.
const BON_LINIE = "-".repeat(BON_BREITE);


// Liest eine gültige Produktmenge und verwendet sonst eins.
// Parameter: `produkt` ist die Warenkorbposition.
// W3Schools: https://www.w3schools.com/jsref/jsref_number.asp
function mengeVon(produkt) {
  const menge = Number(produkt.menge);
  return Number.isInteger(menge) && menge > 0 ? menge : 1;
}

// Vergleicht Basis und Zutaten von zwei Müslis unabhängig von der Reihenfolge.
// Parameter: `erstes` ist das erste Müsli; `zweites` ist das zweite Müsli.
// Rückgabe: Ein Wahrheitswert für die jeweilige Prüfung.
// W3Schools: https://www.w3schools.com/jsref/jsref_sort.asp
function istGleichesMuesli(erstes, zweites) {
  if (erstes.basis.name !== zweites.basis.name) return false;

  const namenA = erstes.zutaten.map(zutat => zutat.name).sort();
  const namenB = zweites.zutaten.map(zutat => zutat.name).sort();

  return namenA.length === namenB.length &&
    namenA.every((name, index) => name === namenB[index]);
}

// Prüft, ob Basis und alle Zutaten in der gewünschten Menge vorhanden sind.
// Parameter: `produkt` ist die Warenkorbposition; `gewuenschteMenge` ist die zusätzlich gewünschte Menge.
// Rückgabe: Ein Wahrheitswert für die jeweilige Prüfung.
// W3Schools: https://www.w3schools.com/jsref/jsref_every.asp
function bestandReicht(produkt, gewuenschteMenge) {
  const nameDerBasis = produkt.basis.name;
  if (bestandVon(nameDerBasis) < gewuenschteMenge) return false;

  return produkt.zutaten.every(zutat =>
    bestandVon(zutat.name) >= gewuenschteMenge
  );
}

// Setzt die Zahlung auf ihren leeren Ausgangszustand zurück.
// W3Schools: https://www.w3schools.com/js/js_functions.asp
function setzeZahlungZurueck() {
  zahlung = neueZahlung();
  speichereZahlung();
}

// Leert Auswahl und Warenkorb und speichert beide neuen Zustände.
// W3Schools: https://www.w3schools.com/js/js_arrays.asp
function leereBestellung() {
  aktuelleAuswahl = neueAuswahl();
  warenkorb = [];
  speichereAuswahl();
  speichereWarenkorb();
  setzeVerzehrUndRabattZurueck();
  setzeZahlungZurueck();
}

// Formatiert eine Zahl als Eurobetrag mit zwei Nachkommastellen.
// Parameter: `preis` ist der Preiswert.
// W3Schools: https://www.w3schools.com/jsref/jsref_tolocalestring_number.asp
function formatierePreis(preis) {
  return Number(preis).toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) + " €";
}

// Fasst die Zutaten aus allen Auswahlkategorien in einer Liste zusammen.
// W3Schools: https://www.w3schools.com/js/js_es6.asp
function alleAktuellenZutaten() {
  return [
    ...aktuelleAuswahl.verfeinerung,
    ...aktuelleAuswahl.fruechte,
    ...aktuelleAuswahl.nuesse,
    ...aktuelleAuswahl.extras
  ];
}

// Addiert die Preise der gewählten Basis und Zutaten.
// W3Schools: https://www.w3schools.com/js/js_loop_forof.asp
function berechneAktuellenPreis() {
  let preis = aktuelleAuswahl.basis ? Number(aktuelleAuswahl.basis.preis) : 0;

  for (const zutat of alleAktuellenZutaten()) {
    preis += Number(zutat.preis);
  }

  // Das Runden verhindert typische kleine JavaScript-Rechenfehler.
  return Math.round(preis * 100) / 100;
}

// Berechnet die Summe aller Warenkorbpositionen mit ihren Mengen.
// W3Schools: https://www.w3schools.com/jsref/jsref_reduce.asp
function berechneGesamtpreis() {
  const summe = warenkorb.reduce((gesamt, produkt) =>
    gesamt + Number(produkt.preis) * mengeVon(produkt), 0
  );
  return Math.round(summe * 100) / 100;
}

// Zählt die gesamte Stückzahl aller Warenkorbpositionen.
// W3Schools: https://www.w3schools.com/jsref/jsref_reduce.asp
function anzahlImWarenkorb() {
  return warenkorb.reduce((anzahl, produkt) => anzahl + mengeVon(produkt), 0);
}

// Teilt einen Rückgeldbetrag in möglichst passende Scheine und Münzen auf.
// Parameter: `betrag` ist der auszuzahlende Betrag.
// W3Schools: https://www.w3schools.com/jsref/jsref_round.asp
function zerlegeRueckgeld(betrag) {
  const stuecke = [];
  // In Cent rechnen verhindert Rundungsfehler.
  let rest = Math.round(betrag * 100);

  for (const geldstueck of geldstueckDaten()) {
    const wertInCent = Math.round(geldstueck * 100);
    const anzahl = Math.floor(rest / wertInCent);
    if (anzahl > 0) {
      stuecke.push({ wert: geldstueck, anzahl });
      rest -= anzahl * wertInCent;
    }
  }

  return stuecke;
}

// Erzeugt einen lesbaren Vorschlag für die Rückgabe des Wechselgelds.
// Parameter: `betrag` ist der auszuzahlende Betrag.
// W3Schools: https://www.w3schools.com/jsref/jsref_map.asp
function beschreibeRueckgeld(betrag) {
  const teile = zerlegeRueckgeld(betrag).map(stueck =>
    formatierePreis(stueck.wert) + " ×" + stueck.anzahl
  );

  return teile.length === 0 ? "" : "Rückgeld am besten: " + teile.join(", ");
}

// Erstellt ein HTML-Element und kann Text sowie CSS-Klasse setzen.
// Parameter: `tag` bestimmt die Elementart; `text` liefert den Text; `klasse` setzt optional die CSS-Klasse.
// W3Schools: https://www.w3schools.com/jsref/met_document_createelement.asp
function erzeugeElement(tag, text, klasse) {
  const element = document.createElement(tag);
  if (text !== undefined) element.textContent = text;
  if (klasse) element.className = klasse;
  return element;
}

// Leitet nicht angemeldete Personen von geschützten Seiten zur Anmeldung weiter.
// Seiteneffekt: Die Funktion wechselt oder lädt eine Browser-Seite.
// W3Schools: https://www.w3schools.com/jsref/prop_loc_href.asp
function pruefeAnmeldung() {
  const mitarbeiter = localStorage.getItem(SPEICHER.mitarbeiter);
  const seite = document.body.dataset.seite;

  if (!mitarbeiter && seite !== "login") {
    window.location.replace("login.html");
    return false;
  }

  return true;
}

// Verhindert nach einer abgeschlossenen Zahlung weitere Änderungen an der Auswahl.
// Seiteneffekt: Die Funktion wechselt oder lädt eine Browser-Seite.
// W3Schools: https://www.w3schools.com/jsref/met_loc_replace.asp
function pruefeZahlungssperre() {
  const auswahlseiten = ["basis", "verfeinerung", "fruechte", "nuesse", "extras"];
  const seite = document.body.dataset.seite;

  if (zahlung.abgeschlossen && auswahlseiten.includes(seite)) {
    window.location.replace("kasse.html");
    return false;
  }

  return true;
}

// Richtet Aktionen zum Abbrechen einer Bestellung und Abmelden ein; die zugehörigen Klick-Callbacks gehören dazu.
// Seiteneffekt: Die betreffenden gespeicherten Daten werden entfernt.
// W3Schools: https://www.w3schools.com/jsref/met_element_addeventlistener.asp
function richteSitzungsaktionenEin() {
  document.querySelectorAll(".bestellung-abbrechen").forEach(button => {
    button.addEventListener("click", () => {
      if (window.confirm("Soll die aktuelle Bestellung wirklich abgebrochen werden?")) {
        leereBestellung();
        window.location.href = "basis.html";
      }
    });
  });

  document.querySelectorAll(".mitarbeiter-abmelden").forEach(button => {
    button.addEventListener("click", () => {
      if (window.confirm("Möchten Sie sich wirklich abmelden?")) {
        leereBestellung();
        localStorage.removeItem(SPEICHER.mitarbeiter);
        window.location.href = "login.html";
      }
    });
  });
}

// Schreibt den Namen der angemeldeten Person in die vorgesehene Anzeige.
// W3Schools: https://www.w3schools.com/jsref/prop_node_textcontent.asp
function zeigeMitarbeiter() {
  const ausgabe = document.getElementById("mitarbeiterAnzeige");
  if (ausgabe) {
    ausgabe.textContent = "Angemeldet: " + localStorage.getItem(SPEICHER.mitarbeiter);
  }
}

// Fügt einer Stelle im Dokument eine Liste mit Texten hinzu.
// Parameter: `eltern` ist das Zielelement; `eintraege` enthält die Listentexte.
// Seiteneffekt: Die sichtbaren Elemente auf der Seite werden neu aufgebaut.
// W3Schools: https://www.w3schools.com/jsref/met_node_appendchild.asp
function fuegeTextlisteHinzu(eltern, eintraege) {
  const liste = erzeugeElement("ul");
  for (const eintrag of eintraege) {
    liste.appendChild(erzeugeElement("li", eintrag));
  }
  eltern.appendChild(liste);
}

// Baut die Vorschau des aktuellen Bestellstands im Bonbereich auf.
// Seiteneffekt: Die sichtbaren Elemente auf der Seite werden neu aufgebaut.
// W3Schools: https://www.w3schools.com/jsref/met_node_appendchild.asp
function zeigeBon() {
  const bon = document.getElementById("bon");
  if (!bon) return;

  bon.replaceChildren();
  bon.appendChild(erzeugeElement("h2", "Aktueller Bestellstand"));

  const basisText = aktuelleAuswahl.basis
    ? aktuelleAuswahl.basis.name + " – " + formatierePreis(aktuelleAuswahl.basis.preis)
    : "Noch keine Basis gewählt";
  bon.appendChild(erzeugeElement("h3", "Basis"));
  bon.appendChild(erzeugeElement("p", basisText));

  bon.appendChild(erzeugeElement("h3", "Zutaten"));
  const zutaten = alleAktuellenZutaten();
  if (zutaten.length === 0) {
    bon.appendChild(erzeugeElement("p", "Noch keine Zutaten gewählt"));
  } else {
    fuegeTextlisteHinzu(bon, zutaten.map(zutat =>
      zutat.name + " – " + formatierePreis(zutat.preis)
    ));
  }

  bon.appendChild(erzeugeElement(
    "p",
    "Aktueller Preis: " + formatierePreis(berechneAktuellenPreis()),
    "bon-preis"
  ));

  bon.appendChild(erzeugeElement("h3", "Bereits hinzugefügt"));
  if (warenkorb.length === 0) {
    bon.appendChild(erzeugeElement("p", "Noch keine Produkte im Warenkorb"));
  } else {
    const produkte = warenkorb.map((produkt, index) => {
      const menge = mengeVon(produkt);
      const preisText = menge > 1
        ? menge + "× " + formatierePreis(produkt.preis) + " = " +
          formatierePreis(produkt.preis * menge)
        : formatierePreis(produkt.preis);
      return (index + 1) + ". " + produkt.basis.name + " – " + preisText;
    });
    fuegeTextlisteHinzu(bon, produkte);
  }

  if (verzehrart) {
    bon.appendChild(erzeugeElement("h3", "Verzehrart"));
    bon.appendChild(erzeugeElement("p", verzehrartText() + " – " + steuersatzProzentText() + " MwSt"));
  }

  if (rabattBetrag() > 0) {
    bon.appendChild(erzeugeElement("h3", "Rabatt"));
    bon.appendChild(erzeugeElement("p", "Rabatt " + rabattProzentWert() + " %: −" +
      formatierePreis(rabattBetrag())));
    bon.appendChild(erzeugeElement("p", "Zu zahlen: " + formatierePreis(zuZahlenderBetrag())));
  }
}

// Passt die Markierung der Auswahlkarten an ihre Checkboxen an.
// W3Schools: https://www.w3schools.com/jsref/prop_element_classlist.asp
function aktualisiereAuswahlseite() {
  document.querySelectorAll(".auswahlkarte").forEach(karte => {
    const checkbox = karte.querySelector('input[type="checkbox"]');
    karte.classList.toggle("ausgewaehlt", checkbox.checked);
  });

  speichereAuswahl();
  zeigeBon();
}

// Erstellt für jede verfügbare Grundsorte eine Auswahlkarte.
// Seiteneffekt: Die sichtbaren Elemente auf der Seite werden neu aufgebaut.
// W3Schools: https://www.w3schools.com/jsref/jsref_foreach.asp
function baueBasiskarten() {
  const raster = document.getElementById("basisRaster");
  if (!raster) return;

  raster.replaceChildren();

  produkte.basis.forEach(sorte => {
    const anzahl = bestandVon(sorte.name);
    const karte = erzeugeElement("button", undefined, "basis-karte");
    karte.type = "button";
    karte.dataset.name = sorte.name;
    karte.dataset.preis = String(sorte.preis);

    karte.appendChild(erzeugeBild(sorte.bild, sorte.name + "-Müsli", "basis-bild"));

    karte.appendChild(erzeugeElement("span", sorte.name, "basis-name"));
    karte.appendChild(erzeugeElement("span", formatierePreis(sorte.preis), "basis-preis"));

    const hinweis = bestandHinweis(anzahl);
    if (hinweis) karte.appendChild(erzeugeElement("span", hinweis, "bestand-hinweis"));
    if (anzahl <= 0) karte.disabled = true;

    raster.appendChild(karte);
  });
}

// Erstellt die Zutatenkarten für die übergebene Kategorie.
// Parameter: `kategorie` bestimmt die Zutatenkategorie.
// Seiteneffekt: Die sichtbaren Elemente auf der Seite werden neu aufgebaut.
// W3Schools: https://www.w3schools.com/jsref/jsref_foreach.asp
function baueZutatenliste(kategorie) {
  const raster = document.getElementById("zutatenRaster");
  if (!raster) return;

  raster.replaceChildren();

  (produkte[kategorie] || []).forEach(zutat => {
    const anzahl = bestandVon(zutat.name);
    const karte = erzeugeElement("label", undefined, "auswahlkarte");

    const feld = document.createElement("input");
    feld.type = "checkbox";
    feld.name = "zutat";
    feld.dataset.name = zutat.name;
    feld.dataset.preis = String(zutat.preis);
    // Ausverkaufte Zutaten lassen sich nicht mehr auswählen.
    if (anzahl <= 0) feld.disabled = true;

    const text = erzeugeElement("span", undefined, "zutaten-text");
    text.appendChild(erzeugeElement("span", zutat.name));
    text.appendChild(erzeugeElement("span", formatierePreis(zutat.preis)));

    // Jede Zutat bekommt ein eigenes Bild; fehlt es, greift das Ersatzbild.
    karte.append(feld, erzeugeBild(zutat.bild, zutat.name, "zutaten-bild"), text);

    const hinweis = bestandHinweis(anzahl);
    if (hinweis) karte.appendChild(erzeugeElement("span", hinweis, "bestand-hinweis"));

    raster.appendChild(karte);
  });
}

// Markiert auf den Karten die aktuell gewählte Grundsorte.
// W3Schools: https://www.w3schools.com/jsref/prop_element_classlist.asp
function markiereBasis() {
  document.querySelectorAll(".basis-karte").forEach(karte => {
    const istAusgewaehlt = aktuelleAuswahl.basis &&
      karte.dataset.name === aktuelleAuswahl.basis.name;
    karte.classList.toggle("ausgewaehlt", Boolean(istAusgewaehlt));
  });
}

// Baut die Basisseite auf und richtet ihre Klick-Callbacks für die Auswahl ein.
// Seiteneffekt: Die Funktion wechselt oder lädt eine Browser-Seite.
// W3Schools: https://www.w3schools.com/jsref/met_element_addeventlistener.asp
function richteBasisseiteEin() {
  baueBasiskarten();
  markiereBasis();

  document.querySelectorAll(".basis-karte").forEach(karte => {
    karte.addEventListener("click", () => {
      if (karte.disabled) return;

      aktuelleAuswahl.basis = {
        name: karte.dataset.name,
        preis: Number(karte.dataset.preis)
      };
      aktuelleAuswahl.hinzugefuegt = false;
      speichereAuswahl();
      window.location.href = "verfeinerung.html";
    });
  });
}

// Liest die angekreuzten Zutaten aus dem Formular aus.
// Parameter: `kategorie` bestimmt die Zutatenkategorie.
// W3Schools: https://www.w3schools.com/jsref/met_document_queryselectorall.asp
function liesKategorieAusFormular(kategorie) {
  return Array.from(document.querySelectorAll('input[name="zutat"]:checked')).map(feld => ({
    name: feld.dataset.name,
    preis: Number(feld.dataset.preis)
  }));
}

// Setzt Checkboxen entsprechend der bereits gespeicherten Zutaten.
// Parameter: `kategorie` bestimmt die Zutatenkategorie.
// W3Schools: https://www.w3schools.com/jsref/prop_checkbox_checked.asp
function stelleCheckboxenWiederHer(kategorie) {
  const gespeicherteNamen = aktuelleAuswahl[kategorie].map(zutat => zutat.name);

  document.querySelectorAll('input[name="zutat"]').forEach(feld => {
    feld.checked = gespeicherteNamen.includes(feld.dataset.name);
  });
}

// Baut eine Zutatenseite auf und verarbeitet ihre Formular-Callbacks.
// Seiteneffekt: Die Funktion wechselt oder lädt eine Browser-Seite.
// W3Schools: https://www.w3schools.com/jsref/met_element_addeventlistener.asp
function richteZutatenseiteEin() {
  const kategorie = document.body.dataset.kategorie;
  baueZutatenliste(kategorie);

  // Zutaten, die inzwischen ausverkauft sind, fallen aus der Auswahl.
  const verfuegbar = aktuelleAuswahl[kategorie].filter(zutat => bestandVon(zutat.name) > 0);
  if (verfuegbar.length !== aktuelleAuswahl[kategorie].length) {
    aktuelleAuswahl[kategorie] = verfuegbar;
    speichereAuswahl();
  }

  stelleCheckboxenWiederHer(kategorie);
  aktualisiereAuswahlseite();

  document.querySelectorAll('input[name="zutat"]').forEach(feld => {
    feld.addEventListener("change", () => {
      aktuelleAuswahl[kategorie] = liesKategorieAusFormular(kategorie);
      aktuelleAuswahl.hinzugefuegt = false;
      aktualisiereAuswahlseite();
    });
  });

  const ueberspringen = document.getElementById("ueberspringenButton");
  if (ueberspringen) {
    ueberspringen.addEventListener("click", () => {
      aktuelleAuswahl[kategorie] = [];
      aktuelleAuswahl.hinzugefuegt = false;
      speichereAuswahl();
      window.location.href = ueberspringen.dataset.ziel;
    });
  }
}

// Übernimmt die vollständige Auswahl als neue Position in den Warenkorb.
// Seiteneffekt: Die Funktion wechselt oder lädt eine Browser-Seite.
// W3Schools: https://www.w3schools.com/jsref/jsref_push.asp
function fuegeAktuellesMuesliHinzu() {
  if (!aktuelleAuswahl.basis) {
    window.alert("Bitte zuerst eine Basis auswählen.");
    window.location.href = "basis.html";
    return false;
  }

  // Dieser Wert verhindert doppeltes Hinzufügen durch Doppelklicks.
  // Bereits hinzugefügt bedeutet ebenfalls: Der Warenkorb ist bereit.
  if (aktuelleAuswahl.hinzugefuegt) return true;

  const neuesProdukt = {
    basis: { ...aktuelleAuswahl.basis },
    zutaten: alleAktuellenZutaten().map(zutat => ({ ...zutat })),
    preis: berechneAktuellenPreis(),
    menge: 1
  };

  // Ohne Bestand darf kein Müsli verkauft werden.
  if (!bestandReicht(neuesProdukt, 1)) {
    window.alert("Diese Zusammenstellung ist nicht mehr vollständig auf Lager.");
    return false;
  }

  // Ein gleiches Müsli wird nicht doppelt gelistet, sondern erhöht die Menge.
  const vorhandenes = warenkorb.find(produkt => istGleichesMuesli(produkt, neuesProdukt));

  if (vorhandenes) {
    // Auch beim Zusammenfassen darf der Bestand nicht überschritten werden.
    if (!bestandReicht(vorhandenes, mengeVon(vorhandenes) + 1)) {
      window.alert("Für ein weiteres Stück dieser Zusammenstellung ist nicht genug Bestand vorhanden.");
      return false;
    }

    vorhandenes.menge = mengeVon(vorhandenes) + 1;
  } else {
    warenkorb.push(neuesProdukt);
  }

  aktuelleAuswahl.hinzugefuegt = true;
  speichereWarenkorb();
  speichereAuswahl();
  setzeZahlungZurueck();
  return true;
}

// Richtet die letzte Auswahlseite mit ihren Schaltflächen-Callbacks ein.
// Seiteneffekt: Die Funktion wechselt oder lädt eine Browser-Seite.
// W3Schools: https://www.w3schools.com/jsref/met_element_addeventlistener.asp
function richteExtraseiteEin() {
  const loeschen = document.getElementById("auswahlLoeschenButton");
  const weiteres = document.getElementById("weiteresProduktButton");
  const bezahlen = document.getElementById("bezahlenButton");

  // Die Schaltfläche löscht bewusst nur die Auswahl dieser Kategorie.
  loeschen.addEventListener("click", () => {
    aktuelleAuswahl.extras = [];
    aktuelleAuswahl.hinzugefuegt = false;
    document.querySelectorAll('input[name="zutat"]').forEach(feld => {
      feld.checked = false;
    });
    aktualisiereAuswahlseite();
  });

  weiteres.addEventListener("click", () => {
    if (fuegeAktuellesMuesliHinzu()) {
      aktuelleAuswahl = neueAuswahl();
      speichereAuswahl();
      window.location.href = "basis.html";
    }
  });

  bezahlen.addEventListener("click", () => {
    if (fuegeAktuellesMuesliHinzu()) {
      window.location.href = "kasse.html";
    }
  });
}

// Richtet die Anmeldung ein und prüft im Submit-Callback die eingegebenen Daten.
// Seiteneffekt: Die aktuellen Daten werden im Browser-Speicher abgelegt.
// W3Schools: https://www.w3schools.com/jsref/event_onsubmit.asp
function richteLoginEin() {
  const formular = document.getElementById("loginFormular");
  const mitarbeiterFeld = document.getElementById("mitarbeiter");
  const passwortFeld = document.getElementById("passwort");
  const fehlerAusgabe = document.getElementById("loginFehler");

  formular.addEventListener("submit", ereignis => {
    ereignis.preventDefault();

    const name = mitarbeiterFeld.value;
    const code = passwortFeld.value.trim();

    if (name === "") {
      fehlerAusgabe.textContent = "Bitte einen Mitarbeiter auswählen.";
      return;
    }

    if (code === "") {
      fehlerAusgabe.textContent = "Zugangscode muss eingetragen sein.";
      return;
    }

    // Der Code entscheidet, ob die Rolle "mitarbeiter" oder "chef" gilt.
    const zugang = zugangsDaten()[name];

    if (!zugang || zugang.code !== code) {
      fehlerAusgabe.textContent = "Der Zugangscode ist falsch.";
      return;
    }

    // Eine neue Anmeldung beginnt auch eine neue Bestellung.
    localStorage.setItem(SPEICHER.mitarbeiter, name);
    localStorage.setItem(SPEICHER.rolle, zugang.rolle);
    aktuelleAuswahl = neueAuswahl();
    warenkorb = [];
    speichereAuswahl();
    speichereWarenkorb();
    setzeVerzehrUndRabattZurueck();
    setzeZahlungZurueck();
    window.location.href = "basis.html";
  });
}

// Aktualisiert die Verfügbarkeit und Sichtbarkeit der Zahlungsbedienelemente.
// W3Schools: https://www.w3schools.com/tags/att_disabled.asp
function aktualisiereZahlungsbereich() {
  const karteButton = document.getElementById("karteButton");
  const barButton = document.getElementById("barButton");
  if (!karteButton || !barButton) return;

  const leer = warenkorb.length === 0;
  // Ohne Verzehrart lässt sich nicht bezahlen, weil die Steuer davon abhängt.
  const ohneVerzehrart = !verzehrart;
  karteButton.disabled = leer || ohneVerzehrart;
  barButton.disabled = leer || ohneVerzehrart;

  if (leer) {
    document.getElementById("karteBereich").hidden = true;
    document.getElementById("barBereich").hidden = true;
    document.getElementById("zahlungAbschliessenButton").hidden = true;
    document.getElementById("zahlungsFehler").textContent =
      "Bitte zuerst ein Müsli in den Warenkorb legen.";
  } else if (ohneVerzehrart) {
    document.getElementById("karteBereich").hidden = true;
    document.getElementById("barBereich").hidden = true;
    document.getElementById("zahlungAbschliessenButton").hidden = true;
    document.getElementById("zahlungsFehler").textContent =
      "Bitte zuerst wählen: Zum Mitnehmen oder Hier essen.";
  } else if (!zahlung.abgeschlossen) {
    document.getElementById("zahlungsFehler").textContent = "";
  }
}

// Füllt die Kasse mit Mitarbeiter, Warenkorb und Gesamtpreis.
// Seiteneffekt: Die sichtbaren Elemente auf der Seite werden neu aufgebaut.
// W3Schools: https://www.w3schools.com/jsref/prop_node_textcontent.asp
function zeigeKasse() {
  const mitarbeiter = document.getElementById("kassenMitarbeiter");
  const liste = document.getElementById("kassenListe");
  const gesamt = document.getElementById("gesamtpreis");

  mitarbeiter.textContent = "Mitarbeiter: " + localStorage.getItem(SPEICHER.mitarbeiter);
  liste.replaceChildren();

  if (warenkorb.length === 0) {
    liste.appendChild(erzeugeElement("p", "Der Warenkorb ist leer."));
  }

  warenkorb.forEach((produkt, index) => {
    const menge = mengeVon(produkt);
    const position = erzeugeElement("article", undefined, "kassen-position");
    position.appendChild(erzeugeElement(
      "h2",
      "Müsli " + (index + 1) + (menge > 1 ? " (" + menge + " Stück)" : "")
    ));
    position.appendChild(erzeugeElement(
      "p",
      "Basis: " + produkt.basis.name + " – " + formatierePreis(produkt.basis.preis)
    ));
    position.appendChild(erzeugeElement("h3", "Gewählte Zutaten"));

    if (produkt.zutaten.length === 0) {
      position.appendChild(erzeugeElement("p", "Keine zusätzlichen Zutaten"));
    } else {
      fuegeTextlisteHinzu(position, produkt.zutaten.map(zutat =>
        zutat.name + " – " + formatierePreis(zutat.preis)
      ));
    }

    position.appendChild(erzeugeElement(
      "p",
      "Einzelpreis: " + formatierePreis(produkt.preis),
      "bon-preis"
    ));

    // Bei mehreren Stück wird die Zeilensumme zusätzlich angezeigt.
    if (menge > 1) {
      position.appendChild(erzeugeElement(
        "p",
        "Zeilenpreis: " + menge + " × " + formatierePreis(produkt.preis) + " = " +
          formatierePreis(produkt.preis * menge),
        "zeilenpreis"
      ));
    }

    // Nach der Zahlung werden keine Änderungsbuttons mehr erzeugt.
    if (!zahlung.abgeschlossen) {
      const aktionen = erzeugeElement("div", undefined, "positions-aktionen");
      const weniger = erzeugeElement("button", "−", "button-grau produkt-weniger");
      const mehr = erzeugeElement("button", "+", "produkt-mehr");
      const bearbeiten = erzeugeElement("button", "Bearbeiten", "produkt-bearbeiten");
      const loeschen = erzeugeElement("button", "Löschen", "button-grau produkt-loeschen");

      [weniger, mehr, bearbeiten, loeschen].forEach(button => {
        button.type = "button";
        button.dataset.index = index;
      });

      weniger.disabled = menge <= 1;
      aktionen.append(weniger, mehr, bearbeiten, loeschen);
      position.appendChild(aktionen);
    }

    liste.appendChild(position);
  });

  const anzahl = anzahlImWarenkorb();
  // Zwischensumme, Rabatt und zu zahlender Betrag stehen untereinander.
  const summenZeilen = ["Zwischensumme: " + formatierePreis(berechneGesamtpreis()) +
    (anzahl > 1 ? " – " + anzahl + " Müslis" : "")];

  if (rabattBetrag() > 0) {
    summenZeilen.push("Rabatt " + rabattProzentWert() + " % ab " +
      rabattAbMengeWert() + " Müslis: −" + formatierePreis(rabattBetrag()));
  }

  summenZeilen.push("Zu zahlen: " + formatierePreis(zuZahlenderBetrag()) +
    (verzehrart ? " (" + steuersatzProzentText() + " MwSt)" : ""));

  gesamt.textContent = summenZeilen.join("\n");
}

// Überträgt ein Warenkorbprodukt zurück in die Auswahl zum Bearbeiten.
// Parameter: `produkt` ist die Warenkorbposition.
// W3Schools: https://www.w3schools.com/js/js_es6.asp
function ladeProduktZumBearbeiten(produkt) {
  const auswahl = neueAuswahl();
  auswahl.basis = { ...produkt.basis };

  produkt.zutaten.forEach(zutat => {
    const kategorien = zutatenKategorien();
    const kategorie = Object.keys(kategorien).find(name =>
      kategorien[name].includes(zutat.name)
    );
    if (kategorie) auswahl[kategorie].push({ ...zutat });
  });

  return auswahl;
}

// Speichert eine Mengenänderung und aktualisiert danach Kasse und Zahlungsbereich.
// W3Schools: https://www.w3schools.com/js/js_functions.asp
function aenderWarenkorbNachMengenwechsel() {
  speichereWarenkorb();
  setzeZahlungZurueck();
  zeigeKasse();
  // Nach jeder Mengenänderung wird der Rabattstand neu berechnet.
  zeigeRabatt();
  richteProduktAktionenEin();
  aktualisiereZahlungsbereich();
}

// Richtet die Klick-Callbacks für Menge, Bearbeiten und Entfernen im Warenkorb ein.
// Seiteneffekt: Die Funktion wechselt oder lädt eine Browser-Seite.
// W3Schools: https://www.w3schools.com/jsref/met_element_addeventlistener.asp
function richteProduktAktionenEin() {
  // Minus verringert die Menge einer Position.
  document.querySelectorAll(".produkt-weniger").forEach(button => {
    button.addEventListener("click", () => {
      const produkt = warenkorb[Number(button.dataset.index)];
      if (!produkt || mengeVon(produkt) <= 1) return;

      produkt.menge = mengeVon(produkt) - 1;
      aenderWarenkorbNachMengenwechsel();
    });
  });

  // Plus erhöht die Menge, wenn der Bestand reicht.
  document.querySelectorAll(".produkt-mehr").forEach(button => {
    button.addEventListener("click", () => {
      const produkt = warenkorb[Number(button.dataset.index)];
      if (!produkt) return;

      const neueMenge = mengeVon(produkt) + 1;

      if (!bestandReicht(produkt, neueMenge)) {
        window.alert("Für ein weiteres Stück ist nicht genug Bestand vorhanden.");
        return;
      }

      produkt.menge = neueMenge;
      aenderWarenkorbNachMengenwechsel();
    });
  });

  document.querySelectorAll(".produkt-bearbeiten").forEach(button => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.index);
      aktuelleAuswahl = ladeProduktZumBearbeiten(warenkorb[index]);
      warenkorb.splice(index, 1);
      speichereAuswahl();
      speichereWarenkorb();
      setzeZahlungZurueck();
      window.location.href = "basis.html";
    });
  });

  document.querySelectorAll(".produkt-loeschen").forEach(button => {
    button.addEventListener("click", () => {
      if (!window.confirm("Dieses Müsli wirklich aus dem Warenkorb löschen?")) return;
      warenkorb.splice(Number(button.dataset.index), 1);
      speichereWarenkorb();
      setzeZahlungZurueck();
      zeigeKasse();
      // Die Menge hat sich geändert, also gilt der Rabatt neu.
      zeigeRabatt();
      richteProduktAktionenEin();
      aktualisiereZahlungsbereich();
    });
  });
}

// Wandelt eine Texteingabe mit Komma oder Punkt in einen gerundeten Geldbetrag um.
// Parameter: `text` liefert den Text.
// W3Schools: https://www.w3schools.com/jsref/jsref_number.asp
function liesGeldbetrag(text) {
  const bereinigt = text.trim().replace(",", ".");
  if (bereinigt === "") return NaN;
  const betrag = Number(bereinigt);
  return Number.isFinite(betrag) ? Math.round(betrag * 100) / 100 : NaN;
}

// Gibt das heutige Datum im Format Jahr-Monat-Tag zurück.
// W3Schools: https://www.w3schools.com/js/js_dates.asp
function heutigesDatum() {
  const heute = new Date();
  const jahr = heute.getFullYear();
  const monat = String(heute.getMonth() + 1).padStart(2, "0");
  const tag = String(heute.getDate()).padStart(2, "0");
  return jahr + "-" + monat + "-" + tag;
}

// Erstellt die nächste Bonnummer und erhöht den gespeicherten Zähler.
// Seiteneffekt: Die aktuellen Daten werden im Browser-Speicher abgelegt.
// W3Schools: https://www.w3schools.com/jsref/jsref_string_padstart.asp
function erzeugeBonnummer() {
  let nummer = Number(localStorage.getItem(SPEICHER.bonnummer));
  if (!Number.isInteger(nummer) || nummer < 1) nummer = 1;
  localStorage.setItem(SPEICHER.bonnummer, String(nummer + 1));
  return "BON-" + String(nummer).padStart(4, "0");
}

// Speichert einen abgeschlossenen Verkauf, wenn er noch nicht im Verlauf steht.
// W3Schools: https://www.w3schools.com/jsref/jsref_some.asp
function archiviereVerkauf() {
  if (!zahlung.bonnummer) zahlung.bonnummer = erzeugeBonnummer();

  const bereitsVorhanden = verkaeufe.some(verkauf =>
    verkauf.bonnummer === zahlung.bonnummer
  );

  if (!bereitsVorhanden) {
    // Aus dem gezahlten Betrag werden Netto und Steuer herausgerechnet.
    const steuer = steuerAusBrutto(zuZahlenderBetrag());

    verkaeufe.push({
      bonnummer: zahlung.bonnummer,
      zeitpunkt: new Date().toISOString(),
      datum: heutigesDatum(),
      mitarbeiter: localStorage.getItem(SPEICHER.mitarbeiter),
      produkte: warenkorb.map(produkt => ({
        basis: { ...produkt.basis },
        zutaten: produkt.zutaten.map(zutat => ({ ...zutat })),
        preis: produkt.preis,
        menge: mengeVon(produkt)
      })),
      anzahl: anzahlImWarenkorb(),
      zwischensumme: berechneGesamtpreis(),
      rabattProzent: rabattBetrag() > 0 ? rabattProzentWert() : 0,
      rabattBetrag: rabattBetrag(),
      gesamtpreis: zuZahlenderBetrag(),
      netto: steuer.netto,
      mwst: steuer.steuer,
      steuersatz: Math.round(steuer.satz * 100),
      verzehrart: verzehrartText(),
      zahlungsart: zahlung.zahlungsart,
      erhaltenerBetrag: zahlung.erhaltenerBetrag,
      rueckgeld: zahlung.rueckgeld,
      storniert: false
    });

    // Die Abholnummer ist die laufende Nummer des heutigen Tages.
    const heuteAnzahl = verkaeufe.filter(verkauf => verkauf.datum === heutigesDatum()).length;
    zahlung.abholnummer = String(heuteAnzahl).padStart(3, "0");
    verkaeufe[verkaeufe.length - 1].abholnummer = zahlung.abholnummer;

    // Jede verkaufte Portion wird vom Lagerbestand abgebucht.
    warenkorb.forEach(produkt => {
      const menge = mengeVon(produkt);
      reduziereBestand(produkt.basis.name, menge);
      produkt.zutaten.forEach(zutat => reduziereBestand(zutat.name, menge));
    });

    speichereVerkaeufe();
  }

  speichereZahlung();
}

// Setzt alle Angaben eines Kassenbons als mehrzeiligen Text zusammen.
// W3Schools: https://www.w3schools.com/jsref/jsref_join.asp
function erstelleKassenbonText() {
  const steuer = steuerAusBrutto(zuZahlenderBetrag());
  const zeilen = [
    bonMitte("MeinMüsli"),
    bonMitte("Muesli-Laden (Demo)"),
    bonMitte("Musterweg 1, 25436 Uetersen"),
    BON_LINIE,
    bonZeile("Kassenbon", zahlung.bonnummer),
    bonZeile("Datum", new Date().toLocaleString("de-DE")),
    bonZeile("Mitarbeiter", localStorage.getItem(SPEICHER.mitarbeiter) || "-"),
    bonZeile("Verzehrart", verzehrartText()),
    bonZeile("Abholnummer", zahlung.abholnummer || "---"),
    BON_LINIE
  ];

  warenkorb.forEach((produkt, index) => {
    const menge = mengeVon(produkt);

    // Jede Position steht mit Menge, Bezeichnung und Zeilensumme im Bon.
    zeilen.push(bonZeile(menge + " x " + produkt.basis.name, formatierePreis(produkt.preis * menge)));
    zeilen.push(bonZeile("  Basis " + produkt.basis.name, formatierePreis(produkt.basis.preis)));

    produkt.zutaten.forEach(zutat => {
      zeilen.push(bonZeile("  + " + zutat.name, formatierePreis(zutat.preis)));
    });

    if (produkt.zutaten.length === 0) {
      zeilen.push("  (ohne Zutaten)");
    }

    if (menge > 1) {
      zeilen.push(bonZeile("  Einzelpreis", formatierePreis(produkt.preis)));
    }

    if (index < warenkorb.length - 1) zeilen.push("");
  });

  zeilen.push(BON_LINIE);
  zeilen.push(bonZeile("Anzahl", anzahlImWarenkorb() + " Müslis"));
  zeilen.push(bonZeile("Zwischensumme", formatierePreis(berechneGesamtpreis())));

  if (rabattBetrag() > 0) {
    zeilen.push(bonZeile("Rabatt " + rabattProzentWert() + " % ab " + rabattAbMengeWert() + " Müslis",
      "-" + formatierePreis(rabattBetrag())));
  }

  zeilen.push(bonZeile("Zu zahlen", formatierePreis(steuer.brutto)));
  zeilen.push(BON_LINIE);
  // Steuerblock wie auf einem echten Kassenbon.
  zeilen.push("Steuersatz   Netto    MwSt   Brutto");
  zeilen.push(bonZeile(
    String(Math.round(steuer.satz * 100)) + " %",
    formatierePreis(steuer.netto) + "  " + formatierePreis(steuer.steuer) + "  " + formatierePreis(steuer.brutto)
  ));
  zeilen.push(BON_LINIE);
  zeilen.push(bonZeile("Zahlungsart", zahlung.zahlungsart || "-"));

  if (zahlung.zahlungsart === "Bar") {
    zeilen.push(bonZeile("Erhalten", formatierePreis(zahlung.erhaltenerBetrag)));
    zeilen.push(bonZeile("Rückgeld", formatierePreis(zahlung.rueckgeld)));
    const vorschlag = beschreibeRueckgeld(zahlung.rueckgeld);
    if (vorschlag) zeilen.push(vorschlag);
  }

  zeilen.push(BON_LINIE);
  zeilen.push(bonMitte("Vielen Dank!"));
  zeilen.push(bonMitte("Demo-Kassenbon ohne steuerliche Gültigkeit"));
  return zeilen.join("\n");
}

// Erstellt aus Text eine Datei und startet ihren Download.
// Parameter: `text` liefert den Text; `dateiname` bestimmt den Download-Namen.
// Seiteneffekt: Die sichtbaren Elemente auf der Seite werden neu aufgebaut.
// W3Schools: https://www.w3schools.com/js/js_api_intro.asp
function ladeTextdateiHerunter(text, dateiname) {
  const datei = new Blob([text], { type: "text/plain;charset=utf-8" });
  const link = document.createElement("a");
  const adresse = URL.createObjectURL(datei);
  link.href = adresse;
  link.download = dateiname;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(adresse), 1000);
}

// Speichert den erzeugten Kassenbon als Textdatei.
// W3Schools: https://www.w3schools.com/js/js_functions.asp
function speichereKassenbon() {
  ladeTextdateiHerunter(
    erstelleKassenbonText(),
    "MeinMuesli-" + zahlung.bonnummer + ".txt"
  );
}

// Deaktiviert nach dem Bezahlen alle Bedienelemente der Bestellung.
// W3Schools: https://www.w3schools.com/tags/att_disabled.asp
function sperreBezahlteBestellung() {
  const zuSperren = [
    "karteButton", "barButton", "karteErfolgreichButton", "karteAbgelehntButton",
    "erhaltenerBetrag", "zahlungAbschliessenButton", "zurueckZuExtrasButton",
    "weiteresProduktKasseButton", "bestellungAbbrechenButton",
    "mitnehmenButton", "hierEssenButton", "rabattButton",
    "rabattJetztButton", "rabattOhneButton"
  ];

  zuSperren.forEach(id => {
    const element = document.getElementById(id);
    if (element) element.disabled = true;
  });

  document.querySelectorAll("[data-schnellgeld], .mitarbeiter-abmelden, .verkaufsverlauf-link").forEach(element => {
    element.disabled = true;
  });
}

// Bereitet den Bon im Druckbereich vor und öffnet den Druckdialog.
// Seiteneffekt: Der Browser-Druckdialog wird geöffnet.
// W3Schools: https://www.w3schools.com/jsref/met_win_print.asp
function druckeKassenbon() {
  const inhalt = document.getElementById("druckInhalt");
  if (!inhalt) return;
  zeigeBonVorschau();
  inhalt.textContent = erstelleKassenbonText();
  inhalt.classList.add("druck-aktiv");
  window.print();
  inhalt.classList.remove("druck-aktiv");
}

// Zeigt den Zahlungsstatus und die Entscheidung über einen Bon an.
// Parameter: `statusText` ist die Zahlungsnachricht.
// W3Schools: https://www.w3schools.com/tags/att_global_hidden.asp
function zeigeBonEntscheidung(statusText) {
  document.getElementById("bonStatus").textContent = statusText;
  document.getElementById("bestellungBeendenButton").hidden = false;
  document.getElementById("bonDruckenButton").hidden = false;
  document.getElementById("bonJaButton").disabled = true;
  document.getElementById("bonNeinButton").disabled = true;
}

// Richtet die Kassenseite und ihre Klick- sowie Eingabe-Callbacks ein.
// Seiteneffekt: Die Funktion wechselt oder lädt eine Browser-Seite.
// W3Schools: https://www.w3schools.com/jsref/met_element_addeventlistener.asp
function richteKassenseiteEin() {
  const weiteresProdukt = document.getElementById("weiteresProduktKasseButton");
  const abbrechen = document.getElementById("bestellungAbbrechenButton");
  const karteButton = document.getElementById("karteButton");
  const barButton = document.getElementById("barButton");
  const karteBereich = document.getElementById("karteBereich");
  const kartenStatus = document.getElementById("kartenStatus");
  const barBereich = document.getElementById("barBereich");
  const betragFeld = document.getElementById("erhaltenerBetrag");
  const rueckgeldAusgabe = document.getElementById("rueckgeldAusgabe");
  const zahlungsFehler = document.getElementById("zahlungsFehler");
  const abschliessen = document.getElementById("zahlungAbschliessenButton");
  const bonFrage = document.getElementById("bonFrage");
  const vorschlagAusgabe = document.getElementById("rueckgeldVorschlag");

  let zahlungsart = "";
  let kartenErgebnis = "";
  let erhaltenerBetrag = 0;
  let rueckgeld = 0;

  richteProduktAktionenEin();
  // Ohne Warenkorb bleiben die Zahlungsarten gesperrt.
  aktualisiereZahlungsbereich();

  // Ein weiteres Produkt leert die Auswahl, aber nicht den Warenkorb.
  weiteresProdukt.addEventListener("click", () => {
    aktuelleAuswahl = neueAuswahl();
    speichereAuswahl();
    setzeZahlungZurueck();
    window.location.href = "basis.html";
  });

  // Vor einem Abbruch wird zur Sicherheit nachgefragt.
  abbrechen.addEventListener("click", () => {
    if (window.confirm("Soll die gesamte Bestellung wirklich abgebrochen werden?")) {
      leereBestellung();
      window.location.href = "basis.html";
    }
  });

  // Schaltet zwischen Karten- und Barzahlung um und passt die Kassenbereiche an.
  // Parameter: `neueZahlungsart` ist die gewählte Zahlungsart.
    // W3Schools: https://www.w3schools.com/jsref/prop_element_classlist.asp
  function waehleZahlungsart(neueZahlungsart) {
    zahlungsart = neueZahlungsart;
    kartenErgebnis = "";
    karteButton.classList.toggle("zahlungsart-ausgewaehlt", zahlungsart === "Karte");
    barButton.classList.toggle("zahlungsart-ausgewaehlt", zahlungsart === "Bar");
    karteBereich.hidden = zahlungsart !== "Karte";
    barBereich.hidden = zahlungsart !== "Bar";
    abschliessen.hidden = false;
    bonFrage.hidden = true;
    zahlungsFehler.textContent = "";
    kartenStatus.textContent = "";

    if (zahlungsart === "Bar") betragFeld.focus();
  }

  // Wer genug Müslis hat, wird vor dem Bezahlen an den Rabatt erinnert.
  function starteZahlungsart(neueZahlungsart) {
    if (rabattMoeglich() && rabattBetrag() === 0 && !ohneRabattBestaetigt) {
      zeigeRabattErinnerung(neueZahlungsart);
      return;
    }
    waehleZahlungsart(neueZahlungsart);
  }

  karteButton.addEventListener("click", () => starteZahlungsart("Karte"));
  barButton.addEventListener("click", () => starteZahlungsart("Bar"));

  document.getElementById("karteErfolgreichButton").addEventListener("click", () => {
    kartenErgebnis = "erfolgreich";
    kartenStatus.textContent = "Das Kartenterminal meldet: Zahlung erfolgreich.";
    kartenStatus.className = "karten-status status-erfolgreich";
  });

  document.getElementById("karteAbgelehntButton").addEventListener("click", () => {
    kartenErgebnis = "abgelehnt";
    kartenStatus.textContent = "Das Kartenterminal meldet: Zahlung abgelehnt.";
    kartenStatus.className = "karten-status status-fehler";
  });

  // Berechnet nach einer Bareingabe das Rückgeld und zeigt bei Bedarf einen Vorschlag.
    // W3Schools: https://www.w3schools.com/jsref/jsref_isfinite_number.asp
  function aktualisiereRueckgeld() {
    erhaltenerBetrag = liesGeldbetrag(betragFeld.value);

    if (!Number.isFinite(erhaltenerBetrag)) {
      rueckgeldAusgabe.textContent = "";
      if (vorschlagAusgabe) vorschlagAusgabe.textContent = "";
      return;
    }

    rueckgeld = Math.round((erhaltenerBetrag - zuZahlenderBetrag()) * 100) / 100;
    rueckgeldAusgabe.textContent = rueckgeld >= 0
      ? "Rückgeld: " + formatierePreis(rueckgeld)
      : "Es fehlen: " + formatierePreis(Math.abs(rueckgeld));

    // Der Vorschlag nennt die passenden Scheine und Münzen.
    if (vorschlagAusgabe) {
      vorschlagAusgabe.textContent = rueckgeld > 0 ? beschreibeRueckgeld(rueckgeld) : "";
    }
  }

  betragFeld.addEventListener("input", aktualisiereRueckgeld);

  document.querySelectorAll("[data-schnellgeld]").forEach(button => {
    button.addEventListener("click", () => {
      const betrag = button.dataset.schnellgeld === "passend"
        ? zuZahlenderBetrag()
        : Number(button.dataset.schnellgeld);
      betragFeld.value = betrag.toFixed(2).replace(".", ",");
      aktualisiereRueckgeld();
    });
  });

  // Erst eine gültige Zahlung sperrt und archiviert die Bestellung.
  abschliessen.addEventListener("click", () => {
    if (warenkorb.length === 0) {
      zahlungsFehler.textContent = "Der Warenkorb ist leer.";
      return;
    }

    if (zahlungsart === "Karte" && kartenErgebnis !== "erfolgreich") {
      zahlungsFehler.textContent = kartenErgebnis === "abgelehnt"
        ? "Die Kartenzahlung wurde abgelehnt."
        : "Bitte zuerst das Ergebnis des Kartenterminals auswählen.";
      return;
    }

    if (zahlungsart === "Bar") {
      erhaltenerBetrag = liesGeldbetrag(betragFeld.value);
      rueckgeld = Math.round((erhaltenerBetrag - zuZahlenderBetrag()) * 100) / 100;

      if (!Number.isFinite(erhaltenerBetrag)) {
        zahlungsFehler.textContent = "Bitte einen erhaltenen Betrag eingeben.";
        return;
      }
      if (rueckgeld < 0) {
        zahlungsFehler.textContent = "Der erhaltene Betrag reicht nicht aus.";
        return;
      }
    }

    zahlung = {
      abgeschlossen: true,
      zahlungsart,
      erhaltenerBetrag,
      rueckgeld,
      bonnummer: "",
      bonEntscheidung: "",
      abholnummer: ""
    };
    archiviereVerkauf();
    zahlungsFehler.textContent = "Zahlung abgeschlossen – " + zahlung.bonnummer;
    bonFrage.hidden = false;
    zeigeBestaetigung();
    sperreBezahlteBestellung();
    zeigeKasse();
    bonFrage.scrollIntoView({ behavior: "auto", block: "center" });
  });

  // Nur bei Ja wird wirklich eine Datei erzeugt.
  document.getElementById("bonJaButton").addEventListener("click", () => {
    speichereKassenbon();
    zahlung.bonEntscheidung = "ja";
    speichereZahlung();
    zeigeBonEntscheidung("Der Kassenbon " + zahlung.bonnummer + " wurde gespeichert.");
  });

  document.getElementById("bonNeinButton").addEventListener("click", () => {
    zahlung.bonEntscheidung = "nein";
    speichereZahlung();
    zeigeBonEntscheidung("Es wurde kein Kassenbon gespeichert.");
  });

  document.getElementById("bestellungBeendenButton").addEventListener("click", () => {
    leereBestellung();
    window.location.href = "basis.html";
  });

  // Verzehrart, Rabattknopf und Rabatt-Erinnerung gehören zur Kassenseite.
  richteVerzehrartUndRabattEin(waehleZahlungsart);

  // Drucken des Bons klappt auch nach der Bon-Entscheidung.
  const druckenButton = document.getElementById("bonDruckenButton");
  if (druckenButton) {
    druckenButton.addEventListener("click", druckeKassenbon);
  }

  // Nach einem Neuladen wird eine bereits bezahlte Bestellung wieder gesperrt.
  if (zahlung.abgeschlossen) {
    zahlungsart = zahlung.zahlungsart;
    erhaltenerBetrag = zahlung.erhaltenerBetrag;
    rueckgeld = zahlung.rueckgeld;
    karteButton.classList.toggle("zahlungsart-ausgewaehlt", zahlungsart === "Karte");
    barButton.classList.toggle("zahlungsart-ausgewaehlt", zahlungsart === "Bar");
    karteBereich.hidden = zahlungsart !== "Karte";
    barBereich.hidden = zahlungsart !== "Bar";
    abschliessen.hidden = false;
    bonFrage.hidden = false;
    zahlungsFehler.textContent = "Zahlung abgeschlossen – " + zahlung.bonnummer;

    if (zahlungsart === "Karte") {
      kartenStatus.textContent = "Das Kartenterminal meldet: Zahlung erfolgreich.";
      kartenStatus.className = "karten-status status-erfolgreich";
    } else {
      betragFeld.value = formatierePreis(erhaltenerBetrag).replace(" €", "");
      rueckgeldAusgabe.textContent = "Rückgeld: " + formatierePreis(rueckgeld);
      if (vorschlagAusgabe) {
        vorschlagAusgabe.textContent = rueckgeld > 0 ? beschreibeRueckgeld(rueckgeld) : "";
      }
    }

    sperreBezahlteBestellung();
    zeigeBestaetigung();
    if (zahlung.bonEntscheidung === "ja") {
      zeigeBonEntscheidung("Der Kassenbon " + zahlung.bonnummer + " wurde gespeichert.");
    }
    if (zahlung.bonEntscheidung === "nein") {
      zeigeBonEntscheidung("Es wurde kein Kassenbon gespeichert.");
    }
  }
}

// Zeigt gefilterte Verkäufe und berechnet passende Umsatzangaben.
// Seiteneffekt: Die sichtbaren Elemente auf der Seite werden neu aufgebaut.
// W3Schools: https://www.w3schools.com/jsref/jsref_filter.asp
function zeigeVerkaufsverlauf() {
  const summe = liste => liste.reduce((gesamt, verkauf) =>
    gesamt + Number(verkauf.gesamtpreis), 0
  );

  // Stornierte Verkäufe zählen nicht mehr zum Umsatz.
  const heute = verkaeufe.filter(verkauf =>
    verkauf.datum === heutigesDatum() && !verkauf.storniert
  );
  const stornoHeute = verkaeufe.filter(verkauf =>
    verkauf.datum === heutigesDatum() && verkauf.storniert
  );

  document.getElementById("anzahlHeute").textContent = heute.length;
  document.getElementById("umsatzHeute").textContent = formatierePreis(summe(heute));
  document.getElementById("barHeute").textContent = formatierePreis(
    summe(heute.filter(verkauf => verkauf.zahlungsart === "Bar"))
  );
  document.getElementById("karteHeute").textContent = formatierePreis(
    summe(heute.filter(verkauf => verkauf.zahlungsart === "Karte"))
  );
  document.getElementById("stornoHeute").textContent = stornoHeute.length;

  const filter = liesVerlaufsfilter();
  const gefiltert = filtereVerkaufe(filter);
  const liste = document.getElementById("verkaufsListe");
  const ergebnis = document.getElementById("verlaufAnzahl");

  liste.replaceChildren();

  if (ergebnis) {
    ergebnis.textContent = gefiltert.length === 1
      ? "1 Verkauf gefunden"
      : gefiltert.length + " Verkäufe gefunden";
  }

  if (gefiltert.length === 0) {
    liste.appendChild(erzeugeElement("p", "Keine Verkäufe für diese Auswahl gefunden."));
    return;
  }

  [...gefiltert].reverse().forEach(verkauf => {
    const eintrag = erzeugeElement(
      "article",
      undefined,
      verkauf.storniert ? "verkauf verkauf-storniert" : "verkauf"
    );
    const basen = verkauf.produkte.map(produkt => {
      const menge = Number(produkt.menge) > 0 ? Number(produkt.menge) : 1;
      return menge > 1 ? produkt.basis.name + " " + menge + "×" : produkt.basis.name;
    }).join(", ");

    eintrag.appendChild(erzeugeElement("h2", verkauf.bonnummer));
    eintrag.appendChild(erzeugeElement(
      "p",
      new Date(verkauf.zeitpunkt).toLocaleString("de-DE") + " – " + verkauf.mitarbeiter
    ));
    eintrag.appendChild(erzeugeElement("p", "Produkte: " + basen));
    eintrag.appendChild(erzeugeElement(
      "p",
      "Zahlung: " + verkauf.zahlungsart + " – " + formatierePreis(verkauf.gesamtpreis),
      "bon-preis"
    ));
    eintrag.appendChild(erzeugeElement(
      "p",
      "Verzehrart: " + (verkauf.verzehrart || "unbekannt") +
        (verkauf.steuersatz ? " – " + verkauf.steuersatz + " % MwSt: " + formatierePreis(verkauf.mwst) : "")
    ));

    if (Number(verkauf.rabattBetrag) > 0) {
      eintrag.appendChild(erzeugeElement(
        "p",
        "Rabatt " + verkauf.rabattProzent + " %: −" + formatierePreis(verkauf.rabattBetrag) +
          " (Zwischensumme " + formatierePreis(verkauf.zwischensumme) + ")"
      ));
    }

    if (verkauf.storniert) {
      eintrag.appendChild(erzeugeElement(
        "p",
        "Storniert von " + (verkauf.stornoMitarbeiter || "Chef") + " am " +
          new Date(verkauf.stornoZeitpunkt).toLocaleString("de-DE"),
        "storno-hinweis"
      ));
    } else if (istChef()) {
      const stornoButton = erzeugeElement("button", "Stornieren", "button-grau verkauf-stornieren");
      stornoButton.type = "button";
      stornoButton.dataset.bonnummer = verkauf.bonnummer;
      eintrag.appendChild(stornoButton);
    }

    liste.appendChild(eintrag);
  });
}

// Liest die gewählten Filterwerte für Zeitraum, Zahlungsart und Mitarbeiter.
// W3Schools: https://www.w3schools.com/jsref/prop_option_value.asp
function liesVerlaufsfilter() {
  const zeitraum = document.getElementById("filterZeitraum");
  const zahlungsart = document.getElementById("filterZahlungsart");
  const mitarbeiter = document.getElementById("filterMitarbeiter");

  return {
    zeitraum: zeitraum ? zeitraum.value : "heute",
    zahlungsart: zahlungsart ? zahlungsart.value : "alle",
    mitarbeiter: mitarbeiter ? mitarbeiter.value : "alle"
  };
}

// Gibt nur Verkäufe zurück, die zu allen gewählten Filterbedingungen passen.
// Parameter: `filter` enthält die Filterwerte.
// Rückgabe: Eine neue Liste mit allen passenden Verkäufen.
// W3Schools: https://www.w3schools.com/jsref/jsref_filter.asp
function filtereVerkaufe(filter) {
  return verkaeufe.filter(verkauf => {
    if (filter.zeitraum === "heute" && verkauf.datum !== heutigesDatum()) return false;
    if (filter.zahlungsart !== "alle" && verkauf.zahlungsart !== filter.zahlungsart) return false;
    if (filter.mitarbeiter !== "alle" && verkauf.mitarbeiter !== filter.mitarbeiter) return false;
    return true;
  });
}

// Füllt den Mitarbeiterfilter mit den im Verlauf vorkommenden Namen.
// Seiteneffekt: Die sichtbaren Elemente auf der Seite werden neu aufgebaut.
// W3Schools: https://www.w3schools.com/js/js_es6.asp
function fuelleMitarbeiterFilter() {
  const auswahl = document.getElementById("filterMitarbeiter");
  if (!auswahl) return;

  const bisher = auswahl.value;
  const namen = [...new Set(verkaeufe.map(verkauf => verkauf.mitarbeiter).filter(Boolean))].sort();

  auswahl.replaceChildren();
  auswahl.appendChild(new Option("Alle Mitarbeiter", "alle"));
  namen.forEach(name => auswahl.appendChild(new Option(name, name)));
  auswahl.value = namen.includes(bisher) ? bisher : "alle";
}

// Markiert einen bestätigten Verkauf als storniert und speichert den Zeitpunkt.
// Parameter: `bonnummer` bezeichnet den Verkauf.
// W3Schools: https://www.w3schools.com/jsref/met_win_confirm.asp
function storniereVerkauf(bonnummer) {
  const verkauf = verkaeufe.find(eintrag => eintrag.bonnummer === bonnummer);
  if (!verkauf || verkauf.storniert) return;

  if (!window.confirm("Verkauf " + bonnummer + " wirklich stornieren?")) return;

  verkauf.storniert = true;
  verkauf.stornoZeitpunkt = new Date().toISOString();
  verkauf.stornoMitarbeiter = localStorage.getItem(SPEICHER.mitarbeiter);

  ladeBestand();
  verkauf.produkte.forEach(produkt => {
    const menge = Number(produkt.menge) > 0 ? Number(produkt.menge) : 1;
    bestand[produkt.basis.name] = bestandVon(produkt.basis.name) + menge;
    (produkt.zutaten || []).forEach(zutat => {
      bestand[zutat.name] = bestandVon(zutat.name) + menge;
    });
  });

  speichereBestand();
  speichereVerkaeufe();
  zeigeVerkaufsverlauf();
}

// Erstellt einen Textbericht über heutige gültige und stornierte Verkäufe.
// W3Schools: https://www.w3schools.com/jsref/jsref_filter.asp
function erstelleZBerichtText() {
  const heute = verkaeufe.filter(verkauf => verkauf.datum === heutigesDatum());
  const gueltig = heute.filter(verkauf => !verkauf.storniert);
  const storniert = heute.filter(verkauf => verkauf.storniert);
  const summe = liste => liste.reduce((gesamt, verkauf) =>
    gesamt + Number(verkauf.gesamtpreis), 0
  );
  const barUmsatz = summe(gueltig.filter(verkauf => verkauf.zahlungsart === "Bar"));

  const zeilen = [
    "MeinMüsli-Kassensystem",
    "Tagesabschluss (Z-Bericht)",
    "Datum: " + heutigesDatum(),
    "Erstellt: " + new Date().toLocaleString("de-DE"),
    "Erstellt von: " + localStorage.getItem(SPEICHER.mitarbeiter),
    "--------------------------------",
    "Bons gesamt: " + heute.length,
    "davon storniert: " + storniert.length,
    "Müslis verkauft: " + gueltig.reduce((anzahl, verkauf) =>
      anzahl + Number(verkauf.anzahl || 1), 0),
    "--------------------------------",
    "Umsatz gesamt: " + formatierePreis(summe(gueltig)),
    "  Bar: " + formatierePreis(barUmsatz),
    "  Karte: " + formatierePreis(summe(gueltig.filter(verkauf => verkauf.zahlungsart === "Karte"))),
    "Stornierter Betrag: " + formatierePreis(summe(storniert)),
    "--------------------------------",
    "Rabatte gesamt: " + formatierePreis(gueltig.reduce((gesamt, verkauf) =>
      gesamt + Number(verkauf.rabattBetrag || 0), 0)),
    "Mitnahme: " + gueltig.filter(verkauf => verkauf.verzehrart === "Mitnahme").length + " Bons, " +
      formatierePreis(summe(gueltig.filter(verkauf => verkauf.verzehrart === "Mitnahme"))),
    "Hier essen: " + gueltig.filter(verkauf => verkauf.verzehrart === "Hier essen").length + " Bons, " +
      formatierePreis(summe(gueltig.filter(verkauf => verkauf.verzehrart === "Hier essen"))),
    "MwSt 7 %: " + formatierePreis(gueltig.filter(verkauf => Number(verkauf.steuersatz) === 7)
      .reduce((gesamt, verkauf) => gesamt + Number(verkauf.mwst || 0), 0)),
    "MwSt 19 %: " + formatierePreis(gueltig.filter(verkauf => Number(verkauf.steuersatz) === 19)
      .reduce((gesamt, verkauf) => gesamt + Number(verkauf.mwst || 0), 0)),
    "--------------------------------",
    "Kassenbestand Bar: " + formatierePreis(wechselgeld + barUmsatz) +
      " (Wechselgeld " + formatierePreis(wechselgeld) +
      " + Bar-Umsatz " + formatierePreis(barUmsatz) + ")",
    "--------------------------------",
    "Aufstellung je Mitarbeiter:"
  ];

  const namen = [...new Set(heute.map(verkauf => verkauf.mitarbeiter).filter(Boolean))].sort();

  namen.forEach(name => {
    const liste = gueltig.filter(verkauf => verkauf.mitarbeiter === name);
    zeilen.push("  " + name + ": " + liste.length + " Bons, " + formatierePreis(summe(liste)));
  });

  zeilen.push("--------------------------------");
  zeilen.push("Ende des Berichts");
  return zeilen.join("\n");
}

// Richtet die Filter- und Aktions-Callbacks der Verlaufsseite ein.
// Seiteneffekt: Die zugehörigen Klicks oder Eingaben erhalten ihre Aktionen.
// W3Schools: https://www.w3schools.com/jsref/met_element_addeventlistener.asp
function richteVerlaufsseiteEin() {
  fuelleMitarbeiterFilter();

  ["filterZeitraum", "filterZahlungsart", "filterMitarbeiter"].forEach(id => {
    const feld = document.getElementById(id);
    if (feld) feld.addEventListener("change", zeigeVerkaufsverlauf);
  });

  const zuruecksetzen = document.getElementById("filterZuruecksetzenButton");
  if (zuruecksetzen) {
    zuruecksetzen.addEventListener("click", () => {
      document.getElementById("filterZeitraum").value = "heute";
      document.getElementById("filterZahlungsart").value = "alle";
      document.getElementById("filterMitarbeiter").value = "alle";
      zeigeVerkaufsverlauf();
    });
  }

  // Stornieren, Bericht und Löschen sind nur für die Rolle Chef erlaubt.
  const loeschen = document.getElementById("verlaufLoeschenButton");
  const bericht = document.getElementById("zBerichtButton");

  if (loeschen) {
    loeschen.hidden = !istChef();
    loeschen.addEventListener("click", () => {
      if (window.confirm("Soll der gesamte Verkaufsverlauf wirklich gelöscht werden?")) {
        verkaeufe = [];
        speichereVerkaeufe();
        fuelleMitarbeiterFilter();
        zeigeVerkaufsverlauf();
      }
    });
  }

  if (bericht) {
    bericht.hidden = !istChef();
    bericht.addEventListener("click", () => {
      ladeTextdateiHerunter(
        erstelleZBerichtText(),
        "MeinMuesli-Z-Bericht-" + heutigesDatum() + ".txt"
      );
    });
  }

  // Storno-Klicks werden über die Liste abgefangen, damit sie nach jedem
  // Neuaufbau der Einträge weiter funktionieren.
  document.getElementById("verkaufsListe").addEventListener("click", ereignis => {
    const button = ereignis.target.closest(".verkauf-stornieren");
    if (button) storniereVerkauf(button.dataset.bonnummer);
  });
}

// Ergänzt für Chefs einen Button zur Verwaltungsseite in der Kopfleiste.
// Seiteneffekt: Die Funktion wechselt oder lädt eine Browser-Seite.
// W3Schools: https://www.w3schools.com/jsref/met_document_queryselector.asp
function erweitereKopfleiste() {
  const aktionen = document.querySelector(".kopf-aktionen");
  if (!aktionen || !istChef()) return;
  if (aktionen.querySelector(".verwaltung-link")) return;

  const link = erzeugeElement("button", "Verwaltung", "button-grau verwaltung-link");
  link.type = "button";
  link.addEventListener("click", () => {
    window.location.href = "verwaltung.html";
  });
  aktionen.prepend(link);
}

// Fasst Grundsorten und Zutaten zu einer gemeinsamen Produktliste zusammen.
// W3Schools: https://www.w3schools.com/jsref/jsref_map.asp
function alleProdukte() {
  const liste = produkte.basis.map(sorte => ({
    name: sorte.name,
    kategorie: "Basis",
    preis: sorte.preis
  }));

  Object.entries(zutatenDaten()).forEach(([kategorie, sorten]) => {
    (produkte[kategorie] || []).forEach(zutat => {
      liste.push({ name: zutat.name, kategorie, preis: zutat.preis });
    });
  });

  return liste;
}

// Erstellt die Tabellenzeilen für Produkte, Preise und Bestände.
// Seiteneffekt: Die sichtbaren Elemente auf der Seite werden neu aufgebaut.
// W3Schools: https://www.w3schools.com/jsref/met_document_createelement.asp
function zeigeVerwaltung() {
  const zeilen = document.getElementById("produktZeilen");
  if (!zeilen) return;

  zeilen.replaceChildren();

  alleProdukte().forEach(produkt => {
    const zeile = document.createElement("tr");
    zeile.appendChild(erzeugeElement("td", produkt.name));
    zeile.appendChild(erzeugeElement("td", produkt.kategorie));

    const preisFeld = document.createElement("input");
    preisFeld.type = "text";
    preisFeld.inputMode = "decimal";
    preisFeld.className = "verwaltung-eingabe preis-eingabe";
    preisFeld.dataset.name = produkt.name;
    preisFeld.value = formatierePreis(produkt.preis).replace(" €", "");
    const preisZelle = document.createElement("td");
    preisZelle.appendChild(preisFeld);

    const bestandFeld = document.createElement("input");
    bestandFeld.type = "number";
    bestandFeld.min = "0";
    bestandFeld.className = "verwaltung-eingabe bestand-eingabe";
    bestandFeld.dataset.name = produkt.name;
    bestandFeld.value = String(bestandVon(produkt.name));
    const bestandZelle = document.createElement("td");
    bestandZelle.appendChild(bestandFeld);

    zeile.append(preisZelle, bestandZelle);
    zeilen.appendChild(zeile);
  });

  // Der Wechselgeld-Anfangsbestand wird vorgeblendet.
  const wechselfeld = document.getElementById("wechselgeldFeld");
  if (wechselfeld && wechselgeld !== undefined) {
    wechselfeld.value = formatierePreis(wechselgeld).replace(" €", "");
  }
}

// Zeigt in der Verwaltung eine Erfolgs- oder Fehlermeldung an.
// Parameter: `text` liefert den Text; `istFehler` legt die Fehlerdarstellung fest.
// W3Schools: https://www.w3schools.com/jsref/prop_html_classname.asp
function meldeVerwaltung(text, istFehler) {
  const meldung = document.getElementById("verwaltungsMeldung");
  if (!meldung) return;
  meldung.textContent = text;
  meldung.className = istFehler ? "meldung-fehler" : "meldung-erfolg";
}

// Ändert den Preis eines Produkts in allen passenden Produktlisten.
// Parameter: `name` bezeichnet das Produkt; `preis` ist der Preiswert.
// W3Schools: https://www.w3schools.com/jsref/jsref_find.asp
function setzePreis(name, preis) {
  const listen = [produkte.basis, ...Object.keys(zutatenDaten()).map(kategorie => produkte[kategorie])];

  listen.forEach(liste => {
    const produkt = liste.find(eintrag => eintrag.name === name);
    if (produkt) produkt.preis = preis;
  });
}

// Prüft die Verwaltungsfelder und übernimmt gültige Preise und Bestände.
// Seiteneffekt: Die aktuellen Daten werden im Browser-Speicher abgelegt.
// W3Schools: https://www.w3schools.com/jsref/met_document_queryselectorall.asp
function uebernimmVerwaltungsEingaben() {
  const preise = [];
  const mengen = [];
  let fehler = "";

  document.querySelectorAll(".preis-eingabe").forEach(feld => {
    const wert = liesGeldbetrag(feld.value);
    if (!Number.isFinite(wert) || wert <= 0) {
      fehler = "Bitte alle Preise als Zahl größer 0 eintragen.";
    }
    preise.push({ name: feld.dataset.name, wert });
  });

  document.querySelectorAll(".bestand-eingabe").forEach(feld => {
    const wert = Number(feld.value);
    if (!Number.isInteger(wert) || wert < 0) {
      fehler = "Bitte den Bestand als ganze Zahl ab 0 eintragen.";
    }
    mengen.push({ name: feld.dataset.name, wert });
  });

  if (fehler) {
    meldeVerwaltung(fehler, true);
    return;
  }

  preise.forEach(eintrag => setzePreis(eintrag.name, eintrag.wert));

  ladeBestand();
  mengen.forEach(eintrag => {
    bestand[eintrag.name] = eintrag.wert;
  });

  // Wechselgeld ist keine Spalte der Produkttabelle, sondern ein eigener Wert.
  const wechselfeld = document.getElementById("wechselgeldFeld");
  if (wechselfeld) {
    const wert = liesGeldbetrag(wechselfeld.value);
    if (Number.isFinite(wert) && wert >= 0) {
      wechselgeld = wert;
      localStorage.setItem(SPEICHER.wechselgeld, JSON.stringify(wechselgeld));
    }
  }

  speichereProdukte();
  speichereBestand();
  zeigeVerwaltung();
  meldeVerwaltung("Preise und Bestand wurden gespeichert.", false);
}

// Setzt den Bestand aller Produkte auf den Standardwert zurück.
// W3Schools: https://www.w3schools.com/jsref/jsref_foreach.asp
function fuelleBestandAuf() {
  ladeBestand();
  alleProdukte().forEach(produkt => {
    bestand[produkt.name] = bestandStandardWert();
  });

  speichereBestand();
  zeigeVerwaltung();
  meldeVerwaltung("Bestand wurde auf " + bestandStandardWert() + " Portionen je Produkt aufgefüllt.", false);
}

// Entfernt eigene Produktänderungen und lädt die Standardpreise erneut.
// Seiteneffekt: Die betreffenden gespeicherten Daten werden entfernt.
// W3Schools: https://www.w3schools.com/jsref/prop_win_localstorage.asp
function setzeProdukteZurueck() {
  localStorage.removeItem(SPEICHER.produkte);
  produkte = ladeProdukte();
  zeigeVerwaltung();
  meldeVerwaltung("Die Standardpreise sind wieder aktiv.", false);
}

// Löscht nach einer Sicherheitsabfrage alle gespeicherten Demodaten.
// Seiteneffekt: Die Funktion wechselt oder lädt eine Browser-Seite.
// W3Schools: https://www.w3schools.com/jsref/met_win_confirm.asp
function setzeDemoZurueck() {
  if (!window.confirm(
    "ALLE gespeicherten Daten werden gelöscht " +
    "(Verkäufe, Bestand, Preise, Wechselgeld, Anmeldung). Sicher?"
  )) return;

  localStorage.clear();
  window.location.reload();
}

// Richtet die Schaltflächen-Callbacks für Speichern, Auffüllen und Zurücksetzen ein.
// Seiteneffekt: Die zugehörigen Klicks oder Eingaben erhalten ihre Aktionen.
// W3Schools: https://www.w3schools.com/jsref/met_element_addeventlistener.asp
function richteVerwaltungsseiteEin() {
  const speichern = document.getElementById("speichernButton");
  const auffuellen = document.getElementById("bestandAuffuellenButton");
  const zuruecksetzen = document.getElementById("zuruecksetzenButton");
  const demoReset = document.getElementById("demoZuruecksetzenButton");

  if (speichern) speichern.addEventListener("click", uebernimmVerwaltungsEingaben);
  if (auffuellen) auffuellen.addEventListener("click", fuelleBestandAuf);
  if (zuruecksetzen) zuruecksetzen.addEventListener("click", setzeProdukteZurueck);
  if (demoReset) demoReset.addEventListener("click", setzeDemoZurueck);
}

// Richtet die Klick-Callbacks ein, die zu den hinterlegten Seitenzielen wechseln.
// Seiteneffekt: Die Funktion wechselt oder lädt eine Browser-Seite.
// W3Schools: https://www.w3schools.com/jsref/met_element_addeventlistener.asp
function richteNavigationEin() {
  document.querySelectorAll("[data-ziel]:not(#ueberspringenButton)").forEach(button => {
    button.addEventListener("click", () => {
      window.location.href = button.dataset.ziel;
    });
  });
}

// Zeigt eine Fehlermeldung an, wenn die Produktdaten nicht geladen wurden.
// Seiteneffekt: Die sichtbaren Elemente auf der Seite werden neu aufgebaut.
// W3Schools: https://www.w3schools.com/jsref/met_node_insertbefore.asp
function zeigeProduktdatenFehler() {
  const meldung = erzeugeElement("p", "Die Produktdaten (produkte.js) wurden nicht geladen. " +
    "Bitte die Seite neu laden, auf Windows mit Strg+F5.", "meldung-fehler");
  meldung.id = "produktdatenFehler";

  const formular = document.getElementById("loginFormular");
  const ziel = formular ? formular.parentNode : document.querySelector("main");
  if (!ziel) return;

  ziel.insertBefore(meldung, formular || ziel.firstChild);

  // Ohne Grunddaten darf das Formular nicht normal abgeschickt werden.
  const knopf = formular ? formular.querySelector('button[type="submit"]') : null;
  if (knopf) knopf.disabled = true;
}

// Nach dem Laden wird nur die Logik der gerade geöffneten Seite gestartet.
document.addEventListener("DOMContentLoaded", () => {
  // Ohne Grunddaten ist keine Seite bedienbar: klare Meldung statt Absturz.
  if (produktdatenFehlen()) {
    zeigeProduktdatenFehler();
    return;
  }

  if (!pruefeAnmeldung()) return;
  if (!pruefeZahlungssperre()) return;

  const seite = document.body.dataset.seite;
  richteNavigationEin();
  richteSitzungsaktionenEin();

  if (seite === "login") {
    richteLoginEin();
    return;
  }

  // Die Verwaltung ist ausschließlich der Rolle Chef zugänglich.
  if (seite === "verwaltung" && !istChef()) {
    window.location.replace("basis.html");
    return;
  }

  erweitereKopfleiste();
  zeigeMitarbeiter();
  zeigeBon();

  if (seite === "basis") richteBasisseiteEin();
  if (["verfeinerung", "fruechte", "nuesse", "extras"].includes(seite)) {
    richteZutatenseiteEin();
  }
  if (seite === "extras") richteExtraseiteEin();
  if (seite === "kasse") {
    zeigeKasse();
    richteKassenseiteEin();
  }
  if (seite === "verlauf") {
    zeigeVerkaufsverlauf();
    richteVerlaufsseiteEin();
  }
  if (seite === "verwaltung") {
    zeigeVerwaltung();
    richteVerwaltungsseiteEin();
  }
});
