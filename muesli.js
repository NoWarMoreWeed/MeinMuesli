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
  wechselgeld: "meinMuesliWechselgeld"
};

// Die Grunddaten stehen in produkte.js. Fehlt diese Datei (zum Beispiel durch einen
// veralteten Browser-Cache), darf das Skript nicht still abstürzen. Deshalb werden
// die Daten nur über diese Funktionen gelesen; sie liefern dann leere Ersatzwerte.
function produktDaten() {
  return typeof BASIS_SORTEN === "undefined" ? [] : BASIS_SORTEN;
}

function zutatenDaten() {
  return typeof ZUTATEN_SORTEN === "undefined"
    ? { verfeinerung: [], fruechte: [], nuesse: [], extras: [] }
    : ZUTATEN_SORTEN;
}

function zugangsDaten() {
  return typeof ZUGANGSDATEN === "undefined" ? {} : ZUGANGSDATEN;
}

function geldstueckDaten() {
  return typeof GELDSTUECKE === "undefined"
    ? [500, 200, 100, 50, 20, 10, 5, 2, 1, 0.5, 0.2, 0.1, 0.05, 0.02, 0.01]
    : GELDSTUECKE;
}

function bestandStandardWert() {
  return typeof BESTAND_STANDARD === "undefined" ? 15 : BESTAND_STANDARD;
}

function bestandWarnwert() {
  return typeof BESTAND_WARNGRENZE === "undefined" ? 5 : BESTAND_WARNGRENZE;
}

// Ohne die Grunddaten kann keine Seite des Kassensystems arbeiten.
function produktdatenFehlen() {
  return typeof BASIS_SORTEN === "undefined" || typeof ZUTATEN_SORTEN === "undefined";
}

// Die Zutaten werden nach ihren vier Auswahlseiten gruppiert.
function zutatenKategorien() {
  return Object.fromEntries(
    Object.entries(zutatenDaten()).map(([kategorie, liste]) => [
      kategorie,
      liste.map(zutat => zutat.name)
    ])
  );
}

// Diese Funktion liefert immer eine neue, leere Produktauswahl.
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

// Eine neue Zahlung ist noch nicht abgeschlossen und besitzt keine Bonnummer.
function neueZahlung() {
  return {
    abgeschlossen: false,
    zahlungsart: "",
    erhaltenerBetrag: 0,
    rueckgeld: 0,
    bonnummer: "",
    bonEntscheidung: ""
  };
}

// JSON-Daten werden sicher geladen. Bei einem Fehler gilt der Ersatzwert.
function ladeJSON(schluessel, ersatzwert) {
  try {
    const text = localStorage.getItem(schluessel);
    return text ? JSON.parse(text) : ersatzwert;
  } catch (fehler) {
    return ersatzwert;
  }
}

// Diese Funktion ergänzt fehlende Felder aus alten Speicherständen.
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

// Eine geänderte Preistabelle wird nur akzeptiert, wenn sie vollständig wirkt.
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

// Der Bestand wird pro Produktname gespeichert.
function ladeBestand() {
  if (!bestand || typeof bestand !== "object") bestand = {};
  return bestand;
}

// Der aktuelle Bestand eines Produkts; ohne eigener Eintrag gilt der Standard.
function bestandVon(name) {
  ladeBestand();
  const wert = Number(bestand[name]);
  return Number.isInteger(wert) && wert >= 0 ? wert : bestandStandardWert();
}

// Diese Funktion bucht verkaufte Portionen vom Bestand ab.
function reduziereBestand(name, anzahl) {
  ladeBestand();
  bestand[name] = Math.max(0, bestandVon(name) - anzahl);
  speichereBestand();
}

// Hinweistext für knappen oder fehlenden Bestand.
function bestandHinweis(anzahl) {
  if (anzahl <= 0) return "Ausverkauft";
  if (anzahl <= bestandWarnwert()) return "Nur noch " + anzahl + " verfügbar";
  return "";
}

// Nur die Rolle "chef" darf verwalten, löschen und stornieren.
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

// Die aktuelle Auswahl wird als JSON-Text gespeichert.
function speichereAuswahl() {
  localStorage.setItem(SPEICHER.auswahl, JSON.stringify(aktuelleAuswahl));
}

// Der Warenkorb wird als JSON-Text gespeichert.
function speichereWarenkorb() {
  localStorage.setItem(SPEICHER.warenkorb, JSON.stringify(warenkorb));
}

// Der Zahlungszustand bleibt auch nach einem Neuladen der Seite erhalten.
function speichereZahlung() {
  localStorage.setItem(SPEICHER.zahlung, JSON.stringify(zahlung));
}

// Abgeschlossene Verkäufe werden für Verlauf und Tagesübersicht gespeichert.
function speichereVerkaeufe() {
  localStorage.setItem(SPEICHER.verkaeufe, JSON.stringify(verkaeufe));
}

// Der Lagerbestand bleibt nach dem Schließen des Browsers erhalten.
function speichereBestand() {
  localStorage.setItem(SPEICHER.bestand, JSON.stringify(bestand));
}

// Die geänderte Preistabelle wird gespeichert.
function speichereProdukte() {
  localStorage.setItem(SPEICHER.produkte, JSON.stringify(produkte));
}

// Ältere Warenkörbe ohne Menge gelten als ein Stück.
function mengeVon(produkt) {
  const menge = Number(produkt.menge);
  return Number.isInteger(menge) && menge > 0 ? menge : 1;
}

// Zwei Müslis sind gleich, wenn Basis und Zutaten übereinstimmen.
function istGleichesMuesli(erstes, zweites) {
  if (erstes.basis.name !== zweites.basis.name) return false;

  const namenA = erstes.zutaten.map(zutat => zutat.name).sort();
  const namenB = zweites.zutaten.map(zutat => zutat.name).sort();

  return namenA.length === namenB.length &&
    namenA.every((name, index) => name === namenB[index]);
}

// Prüft, ob der Bestand für eine weitere Portion ausreicht.
function bestandReicht(produkt, gewuenschteMenge) {
  const nameDerBasis = produkt.basis.name;
  if (bestandVon(nameDerBasis) < gewuenschteMenge) return false;

  return produkt.zutaten.every(zutat =>
    bestandVon(zutat.name) >= gewuenschteMenge
  );
}

// Änderungen am Warenkorb machen eine noch nicht abgeschlossene Zahlung ungültig.
function setzeZahlungZurueck() {
  zahlung = neueZahlung();
  speichereZahlung();
}

// Diese Funktion leert eine Bestellung, behält aber Mitarbeiter und Verlauf.
function leereBestellung() {
  aktuelleAuswahl = neueAuswahl();
  warenkorb = [];
  speichereAuswahl();
  speichereWarenkorb();
  setzeZahlungZurueck();
}

// Geld wird immer mit zwei Nachkommastellen und deutschem Komma angezeigt.
function formatierePreis(preis) {
  return Number(preis).toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) + " €";
}

// Alle Zutaten der aktuellen Auswahl werden zu einer Liste verbunden.
function alleAktuellenZutaten() {
  return [
    ...aktuelleAuswahl.verfeinerung,
    ...aktuelleAuswahl.fruechte,
    ...aktuelleAuswahl.nuesse,
    ...aktuelleAuswahl.extras
  ];
}

// Der aktuelle Preis besteht aus Basispreis und allen Zutatenpreisen.
function berechneAktuellenPreis() {
  let preis = aktuelleAuswahl.basis ? Number(aktuelleAuswahl.basis.preis) : 0;

  for (const zutat of alleAktuellenZutaten()) {
    preis += Number(zutat.preis);
  }

  // Das Runden verhindert typische kleine JavaScript-Rechenfehler.
  return Math.round(preis * 100) / 100;
}

// Der Gesamtpreis addiert Einzelpreis mal Menge aller Warenkorbpositionen.
function berechneGesamtpreis() {
  const summe = warenkorb.reduce((gesamt, produkt) =>
    gesamt + Number(produkt.preis) * mengeVon(produkt), 0
  );
  return Math.round(summe * 100) / 100;
}

// Die Anzahl aller Müslis im Warenkorb (Menge berücksichtigt).
function anzahlImWarenkorb() {
  return warenkorb.reduce((anzahl, produkt) => anzahl + mengeVon(produkt), 0);
}

// Das Rückgeld wird in passende Scheine und Münzen zerlegt.
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

// Lesbarer Text für den Rückgeldvorschlag, zum Beispiel "5 € ×1, 1 € ×1".
function beschreibeRueckgeld(betrag) {
  const teile = zerlegeRueckgeld(betrag).map(stueck =>
    formatierePreis(stueck.wert) + " ×" + stueck.anzahl
  );

  return teile.length === 0 ? "" : "Rückgeld am besten: " + teile.join(", ");
}

// Ein Element mit Text zu erzeugen ist sicherer als fremdes HTML einzufügen.
function erzeugeElement(tag, text, klasse) {
  const element = document.createElement(tag);
  if (text !== undefined) element.textContent = text;
  if (klasse) element.className = klasse;
  return element;
}

// Ohne Anmeldung werden geschützte Seiten zur Login-Seite umgeleitet.
function pruefeAnmeldung() {
  const mitarbeiter = localStorage.getItem(SPEICHER.mitarbeiter);
  const seite = document.body.dataset.seite;

  if (!mitarbeiter && seite !== "login") {
    window.location.replace("login.html");
    return false;
  }

  return true;
}

// Eine bezahlte Bestellung darf nicht über eine andere Seite verändert werden.
function pruefeZahlungssperre() {
  const auswahlseiten = ["basis", "verfeinerung", "fruechte", "nuesse", "extras"];
  const seite = document.body.dataset.seite;

  if (zahlung.abgeschlossen && auswahlseiten.includes(seite)) {
    window.location.replace("kasse.html");
    return false;
  }

  return true;
}

// Abbrechen und Abmelden werden auf mehreren Seiten gleich behandelt.
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

// Der Mitarbeitername wird auf den Auswahlseiten eingesetzt.
function zeigeMitarbeiter() {
  const ausgabe = document.getElementById("mitarbeiterAnzeige");
  if (ausgabe) {
    ausgabe.textContent = "Angemeldet: " + localStorage.getItem(SPEICHER.mitarbeiter);
  }
}

// Diese Hilfsfunktion hängt eine Liste mit Texten an ein Elternelement.
function fuegeTextlisteHinzu(eltern, eintraege) {
  const liste = erzeugeElement("ul");
  for (const eintrag of eintraege) {
    liste.appendChild(erzeugeElement("li", eintrag));
  }
  eltern.appendChild(liste);
}

// Der laufende Bon zeigt die aktuelle Auswahl und den Warenkorb.
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
}

// Nach einer Änderung werden Markierung, Speicher und Bon aktualisiert.
function aktualisiereAuswahlseite() {
  document.querySelectorAll(".auswahlkarte").forEach(karte => {
    const checkbox = karte.querySelector('input[type="checkbox"]');
    karte.classList.toggle("ausgewaehlt", checkbox.checked);
  });

  speichereAuswahl();
  zeigeBon();
}

// Die Basiskarten werden aus den Produktdaten aufgebaut.
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

    const bild = document.createElement("img");
    bild.src = sorte.bild;
    bild.alt = "Platzhalterbild für " + sorte.name + "-Müsli";
    karte.appendChild(bild);

    karte.appendChild(erzeugeElement("span", sorte.name, "basis-name"));
    karte.appendChild(erzeugeElement("span", formatierePreis(sorte.preis), "basis-preis"));

    const hinweis = bestandHinweis(anzahl);
    if (hinweis) karte.appendChild(erzeugeElement("span", hinweis, "bestand-hinweis"));
    if (anzahl <= 0) karte.disabled = true;

    raster.appendChild(karte);
  });
}

// Die Zutaten einer Kategorie werden aus den Produktdaten aufgebaut.
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

    karte.append(feld, text);

    const hinweis = bestandHinweis(anzahl);
    if (hinweis) karte.appendChild(erzeugeElement("span", hinweis, "bestand-hinweis"));

    raster.appendChild(karte);
  });
}

// Die gespeicherte Basis wird auf der Basisseite sichtbar markiert.
function markiereBasis() {
  document.querySelectorAll(".basis-karte").forEach(karte => {
    const istAusgewaehlt = aktuelleAuswahl.basis &&
      karte.dataset.name === aktuelleAuswahl.basis.name;
    karte.classList.toggle("ausgewaehlt", Boolean(istAusgewaehlt));
  });
}

// Klicks auf eine Basiskarte speichern die Basis und öffnen die nächste Seite.
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

// Die Zutaten einer Kategorie werden aus den gesetzten Checkboxen gelesen.
function liesKategorieAusFormular(kategorie) {
  return Array.from(document.querySelectorAll('input[name="zutat"]:checked')).map(feld => ({
    name: feld.dataset.name,
    preis: Number(feld.dataset.preis)
  }));
}

// Die gespeicherten Häkchen einer Kategorie werden wiederhergestellt.
function stelleCheckboxenWiederHer(kategorie) {
  const gespeicherteNamen = aktuelleAuswahl[kategorie].map(zutat => zutat.name);

  document.querySelectorAll('input[name="zutat"]').forEach(feld => {
    feld.checked = gespeicherteNamen.includes(feld.dataset.name);
  });
}

// Diese Einrichtung wird auf allen vier Zutaten-Seiten verwendet.
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

// Ein aktuelles Müsli wird höchstens einmal in den Warenkorb gelegt.
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

// Auf der Extras-Seite gibt es besondere Warenkorb-Schaltflächen.
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

// Die Anmeldung prüft Mitarbeiter und Demo-Zugangscode und setzt die Rolle.
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
    setzeZahlungZurueck();
    window.location.href = "basis.html";
  });
}

// Ohne Warenkorb kann keine Zahlungsart gewählt werden.
function aktualisiereZahlungsbereich() {
  const karteButton = document.getElementById("karteButton");
  const barButton = document.getElementById("barButton");
  if (!karteButton || !barButton) return;

  const leer = warenkorb.length === 0;
  karteButton.disabled = leer;
  barButton.disabled = leer;

  if (leer) {
    document.getElementById("karteBereich").hidden = true;
    document.getElementById("barBereich").hidden = true;
    document.getElementById("zahlungAbschliessenButton").hidden = true;
    document.getElementById("zahlungsFehler").textContent =
      "Bitte zuerst ein Müsli in den Warenkorb legen.";
  } else if (!zahlung.abgeschlossen) {
    document.getElementById("zahlungsFehler").textContent = "";
  }
}

// Die Kassenseite baut Positionen und Bearbeitungsbuttons aus den Daten auf.
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
  gesamt.textContent = "Gesamtpreis: " + formatierePreis(berechneGesamtpreis()) +
    (anzahl > 1 ? " – " + anzahl + " Müslis" : "");
}

// Beim Bearbeiten werden Zutaten wieder ihren vier Seiten zugeordnet.
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

// Nach jeder Mengenänderung werden Speicher, Kasse und Zahlungsbereich erneuert.
function aenderWarenkorbNachMengenwechsel() {
  speichereWarenkorb();
  setzeZahlungZurueck();
  zeigeKasse();
  richteProduktAktionenEin();
  aktualisiereZahlungsbereich();
}

// Diese Aktionen können nur vor dem Bezahlen verwendet werden.
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
      richteProduktAktionenEin();
      aktualisiereZahlungsbereich();
    });
  });
}

// Texteingaben mit Komma oder Punkt werden in eine Zahl umgewandelt.
function liesGeldbetrag(text) {
  const bereinigt = text.trim().replace(",", ".");
  if (bereinigt === "") return NaN;
  const betrag = Number(bereinigt);
  return Number.isFinite(betrag) ? Math.round(betrag * 100) / 100 : NaN;
}

// Das heutige Datum wird ohne eine mögliche UTC-Verschiebung erzeugt.
function heutigesDatum() {
  const heute = new Date();
  const jahr = heute.getFullYear();
  const monat = String(heute.getMonth() + 1).padStart(2, "0");
  const tag = String(heute.getDate()).padStart(2, "0");
  return jahr + "-" + monat + "-" + tag;
}

// Jede abgeschlossene Bestellung erhält eine fortlaufende Bonnummer.
function erzeugeBonnummer() {
  let nummer = Number(localStorage.getItem(SPEICHER.bonnummer));
  if (!Number.isInteger(nummer) || nummer < 1) nummer = 1;
  localStorage.setItem(SPEICHER.bonnummer, String(nummer + 1));
  return "BON-" + String(nummer).padStart(4, "0");
}

// Ein Verkauf wird genau einmal in den Verlauf geschrieben.
function archiviereVerkauf() {
  if (!zahlung.bonnummer) zahlung.bonnummer = erzeugeBonnummer();

  const bereitsVorhanden = verkaeufe.some(verkauf =>
    verkauf.bonnummer === zahlung.bonnummer
  );

  if (!bereitsVorhanden) {
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
      gesamtpreis: berechneGesamtpreis(),
      zahlungsart: zahlung.zahlungsart,
      erhaltenerBetrag: zahlung.erhaltenerBetrag,
      rueckgeld: zahlung.rueckgeld,
      storniert: false
    });

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

// Diese Funktion erstellt den Inhalt eines einfachen Text-Kassenbons.
function erstelleKassenbonText() {
  const zeilen = [
    "MeinMüsli-Kassensystem",
    "Kassenbon " + zahlung.bonnummer,
    "Datum: " + new Date().toLocaleString("de-DE"),
    "Mitarbeiter: " + localStorage.getItem(SPEICHER.mitarbeiter),
    "--------------------------------"
  ];

  warenkorb.forEach((produkt, index) => {
    const menge = mengeVon(produkt);
    zeilen.push("Müsli " + (index + 1) + (menge > 1 ? " – " + menge + " Stück" : ""));
    zeilen.push("Basis: " + produkt.basis.name + " – " + formatierePreis(produkt.basis.preis));

    if (produkt.zutaten.length === 0) {
      zeilen.push("Zutaten: keine");
    } else {
      zeilen.push("Zutaten:");
      produkt.zutaten.forEach(zutat => {
        zeilen.push("  " + zutat.name + " – " + formatierePreis(zutat.preis));
      });
    }

    zeilen.push("Einzelpreis: " + formatierePreis(produkt.preis));

    if (menge > 1) {
      zeilen.push("Zeilenpreis: " + formatierePreis(produkt.preis * menge));
    }

    zeilen.push("");
  });

  zeilen.push("--------------------------------");
  zeilen.push("Anzahl: " + anzahlImWarenkorb() + " Müslis");
  zeilen.push("Gesamtpreis: " + formatierePreis(berechneGesamtpreis()));
  zeilen.push("Zahlungsart: " + zahlung.zahlungsart);

  if (zahlung.zahlungsart === "Bar") {
    zeilen.push("Erhalten: " + formatierePreis(zahlung.erhaltenerBetrag));
    zeilen.push("Rückgeld: " + formatierePreis(zahlung.rueckgeld));
    const vorschlag = beschreibeRueckgeld(zahlung.rueckgeld);
    if (vorschlag) zeilen.push(vorschlag);
  }

  zeilen.push("Vielen Dank!");
  return zeilen.join("\n");
}

// Ein Text wird als Datei im Download-Ordner gespeichert.
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

// Der fertige Bon wird als Textdatei im Download-Ordner gespeichert.
function speichereKassenbon() {
  ladeTextdateiHerunter(
    erstelleKassenbonText(),
    "MeinMuesli-" + zahlung.bonnummer + ".txt"
  );
}

// Eine vollständig bezahlte Bestellung wird auf der Kasse gesperrt.
function sperreBezahlteBestellung() {
  const zuSperren = [
    "karteButton", "barButton", "karteErfolgreichButton", "karteAbgelehntButton",
    "erhaltenerBetrag", "zahlungAbschliessenButton", "zurueckZuExtrasButton",
    "weiteresProduktKasseButton", "bestellungAbbrechenButton"
  ];

  zuSperren.forEach(id => {
    const element = document.getElementById(id);
    if (element) element.disabled = true;
  });

  document.querySelectorAll("[data-schnellgeld], .mitarbeiter-abmelden, .verkaufsverlauf-link").forEach(element => {
    element.disabled = true;
  });
}

// Der Kassenbon wird zusätzlich zum Download auch gedruckt.
function druckeKassenbon() {
  const inhalt = document.getElementById("druckInhalt");
  if (!inhalt) return;
  inhalt.textContent = erstelleKassenbonText();
  inhalt.classList.add("druck-aktiv");
  window.print();
  inhalt.classList.remove("druck-aktiv");
}

// Nach Ja oder Nein darf die fertige Bestellung beendet und der Bon gedruckt werden.
function zeigeBonEntscheidung(statusText) {
  document.getElementById("bonStatus").textContent = statusText;
  document.getElementById("bestellungBeendenButton").hidden = false;
  document.getElementById("bonDruckenButton").hidden = false;
  document.getElementById("bonJaButton").disabled = true;
  document.getElementById("bonNeinButton").disabled = true;
}

// Alle Bedienelemente der Kassenseite werden hier eingerichtet.
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

  // Diese Funktion markiert die gerade gewählte Zahlungsart.
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

  karteButton.addEventListener("click", () => waehleZahlungsart("Karte"));
  barButton.addEventListener("click", () => waehleZahlungsart("Bar"));

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

  // Diese Funktion aktualisiert Rückgeld oder noch fehlenden Betrag.
  function aktualisiereRueckgeld() {
    erhaltenerBetrag = liesGeldbetrag(betragFeld.value);

    if (!Number.isFinite(erhaltenerBetrag)) {
      rueckgeldAusgabe.textContent = "";
      if (vorschlagAusgabe) vorschlagAusgabe.textContent = "";
      return;
    }

    rueckgeld = Math.round((erhaltenerBetrag - berechneGesamtpreis()) * 100) / 100;
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
        ? berechneGesamtpreis()
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
      rueckgeld = Math.round((erhaltenerBetrag - berechneGesamtpreis()) * 100) / 100;

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
      bonEntscheidung: ""
    };
    archiviereVerkauf();
    zahlungsFehler.textContent = "Zahlung abgeschlossen – " + zahlung.bonnummer;
    bonFrage.hidden = false;
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
    if (zahlung.bonEntscheidung === "ja") {
      zeigeBonEntscheidung("Der Kassenbon " + zahlung.bonnummer + " wurde gespeichert.");
    }
    if (zahlung.bonEntscheidung === "nein") {
      zeigeBonEntscheidung("Es wurde kein Kassenbon gespeichert.");
    }
  }
}

// Die Verlaufsseite zeigt Tageszahlen und die gefilterten Verkäufe.
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

// Die aktuelle Filterauswahl der Verlaufsseite wird aus den Feldern gelesen.
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

// Diese Verkäufe passen zur aktuellen Filterauswahl.
function filtereVerkaufe(filter) {
  return verkaeufe.filter(verkauf => {
    if (filter.zeitraum === "heute" && verkauf.datum !== heutigesDatum()) return false;
    if (filter.zahlungsart !== "alle" && verkauf.zahlungsart !== filter.zahlungsart) return false;
    if (filter.mitarbeiter !== "alle" && verkauf.mitarbeiter !== filter.mitarbeiter) return false;
    return true;
  });
}

// Die Mitarbeiterauswahl wird aus den gespeicherten Verkäufen gefüllt.
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

// Ein Verkauf wird storniert; die Portionen kommen zurück ins Lager.
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

// Der Z-Bericht fasst einen Kassen-Tag für die Abrechnung zusammen.
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

// Der Verlauf kann nach einer Sicherheitsabfrage vollständig gelöscht werden.
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

// Die Rolle Chef bekommt in der Kopfleiste einen Zugang zur Verwaltung.
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

// Alle Produkte werden für die Verwaltung in einer Liste zusammengefasst.
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

// Die Verwaltungsseite baut die Tabelle für Preise und Bestand auf.
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

// Eine Meldung auf der Verwaltungsseite wird gesetzt.
function meldeVerwaltung(text, istFehler) {
  const meldung = document.getElementById("verwaltungsMeldung");
  if (!meldung) return;
  meldung.textContent = text;
  meldung.className = istFehler ? "meldung-fehler" : "meldung-erfolg";
}

// Ein Preis wird in der geladenen Preistabelle ersetzt.
function setzePreis(name, preis) {
  const listen = [produkte.basis, ...Object.keys(zutatenDaten()).map(kategorie => produkte[kategorie])];

  listen.forEach(liste => {
    const produkt = liste.find(eintrag => eintrag.name === name);
    if (produkt) produkt.preis = preis;
  });
}

// Erst prüfen, dann speichern: so gibt es keine halben Änderungen.
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

// Alle Bestände werden wieder auf den Standardwert gesetzt.
function fuelleBestandAuf() {
  ladeBestand();
  alleProdukte().forEach(produkt => {
    bestand[produkt.name] = bestandStandardWert();
  });

  speichereBestand();
  zeigeVerwaltung();
  meldeVerwaltung("Bestand wurde auf " + bestandStandardWert() + " Portionen je Produkt aufgefüllt.", false);
}

// Die geänderte Preistabelle kann komplett verworfen werden.
function setzeProdukteZurueck() {
  localStorage.removeItem(SPEICHER.produkte);
  produkte = ladeProdukte();
  zeigeVerwaltung();
  meldeVerwaltung("Die Standardpreise sind wieder aktiv.", false);
}

// Die gesamten Demo-Daten werden gelöscht und die Seite neu geladen.
function setzeDemoZurueck() {
  if (!window.confirm(
    "ALLE gespeicherten Daten werden gelöscht " +
    "(Verkäufe, Bestand, Preise, Wechselgeld, Anmeldung). Sicher?"
  )) return;

  localStorage.clear();
  window.location.reload();
}

// Die Bedienelemente der Verwaltungsseite werden eingerichtet.
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

// Einfache data-ziel-Attribute übernehmen die normale Seitennavigation.
function richteNavigationEin() {
  document.querySelectorAll("[data-ziel]:not(#ueberspringenButton)").forEach(button => {
    button.addEventListener("click", () => {
      window.location.href = button.dataset.ziel;
    });
  });
}

// Fehlen die Grunddaten, wird das sichtbar gemeldet statt still zu scheitern.
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
