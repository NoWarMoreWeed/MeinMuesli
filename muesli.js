"use strict";

// Hier stehen die Namen aller Einträge im localStorage.
const SPEICHER = {
  mitarbeiter: "meinMuesliMitarbeiter",
  auswahl: "meinMuesliAuswahl",
  warenkorb: "meinMuesliWarenkorb",
  zahlung: "meinMuesliZahlung",
  verkaeufe: "meinMuesliVerkaeufe",
  bonnummer: "meinMuesliNaechsteBonnummer"
};

// Diese Namen helfen beim späteren Bearbeiten eines Warenkorbprodukts.
const ZUTATEN_KATEGORIEN = {
  verfeinerung: ["Amaranth", "Dinkel", "Leinsamen", "Quinoaflocken"],
  fruechte: ["Ananas", "Apfelstücke", "Cranberries", "Mango", "Gojibeeren"],
  nuesse: ["Cashewkerne", "Kokoschips", "Macadamia"],
  extras: ["Cranberry-Chocs", "Honigflocken", "Schoko-Crunchy", "Rosinen-Chocs"]
};

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

// Der Gesamtpreis addiert die Einzelpreise aller Warenkorbpositionen.
function berechneGesamtpreis() {
  const summe = warenkorb.reduce((gesamt, produkt) => gesamt + Number(produkt.preis), 0);
  return Math.round(summe * 100) / 100;
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
    const produkte = warenkorb.map((produkt, index) =>
      (index + 1) + ". " + produkt.basis.name + " – " + formatierePreis(produkt.preis)
    );
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
  markiereBasis();

  document.querySelectorAll(".basis-karte").forEach(karte => {
    karte.addEventListener("click", () => {
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

  warenkorb.push({
    basis: { ...aktuelleAuswahl.basis },
    zutaten: alleAktuellenZutaten().map(zutat => ({ ...zutat })),
    preis: berechneAktuellenPreis()
  });

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

// Das Login akzeptiert jedes nicht leere Passwort.
function richteLoginEin() {
  const formular = document.getElementById("loginFormular");
  const mitarbeiterFeld = document.getElementById("mitarbeiter");
  const passwortFeld = document.getElementById("passwort");
  const fehlerAusgabe = document.getElementById("loginFehler");

  formular.addEventListener("submit", ereignis => {
    ereignis.preventDefault();

    // Die vorgeschriebene Passwortmeldung hat Vorrang.
    if (passwortFeld.value.trim() === "") {
      fehlerAusgabe.textContent = "Passwort muss eingetragen sein.";
      return;
    }

    if (mitarbeiterFeld.value === "") {
      fehlerAusgabe.textContent = "Bitte einen Mitarbeiter auswählen.";
      return;
    }

    // Eine neue Anmeldung beginnt auch eine neue Bestellung.
    localStorage.setItem(SPEICHER.mitarbeiter, mitarbeiterFeld.value);
    aktuelleAuswahl = neueAuswahl();
    warenkorb = [];
    speichereAuswahl();
    speichereWarenkorb();
    setzeZahlungZurueck();
    window.location.href = "basis.html";
  });
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
    const position = erzeugeElement("article", undefined, "kassen-position");
    position.appendChild(erzeugeElement("h2", "Müsli " + (index + 1)));
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

    // Nach der Zahlung werden keine Änderungsbuttons mehr erzeugt.
    if (!zahlung.abgeschlossen) {
      const aktionen = erzeugeElement("div", undefined, "positions-aktionen");
      const bearbeiten = erzeugeElement("button", "Bearbeiten");
      const loeschen = erzeugeElement("button", "Löschen", "button-grau");
      bearbeiten.type = "button";
      loeschen.type = "button";
      bearbeiten.classList.add("produkt-bearbeiten");
      loeschen.classList.add("produkt-loeschen");
      bearbeiten.dataset.index = index;
      loeschen.dataset.index = index;
      aktionen.append(bearbeiten, loeschen);
      position.appendChild(aktionen);
    }

    liste.appendChild(position);
  });

  gesamt.textContent = "Gesamtpreis: " + formatierePreis(berechneGesamtpreis());
}

// Beim Bearbeiten werden Zutaten wieder ihren vier Seiten zugeordnet.
function ladeProduktZumBearbeiten(produkt) {
  const auswahl = neueAuswahl();
  auswahl.basis = { ...produkt.basis };

  produkt.zutaten.forEach(zutat => {
    const kategorie = Object.keys(ZUTATEN_KATEGORIEN).find(name =>
      ZUTATEN_KATEGORIEN[name].includes(zutat.name)
    );
    if (kategorie) auswahl[kategorie].push({ ...zutat });
  });

  return auswahl;
}

// Diese Aktionen können nur vor dem Bezahlen verwendet werden.
function richteProduktAktionenEin() {
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
        preis: produkt.preis
      })),
      gesamtpreis: berechneGesamtpreis(),
      zahlungsart: zahlung.zahlungsart,
      erhaltenerBetrag: zahlung.erhaltenerBetrag,
      rueckgeld: zahlung.rueckgeld
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
    zeilen.push("Müsli " + (index + 1));
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
    zeilen.push("");
  });

  zeilen.push("--------------------------------");
  zeilen.push("Gesamtpreis: " + formatierePreis(berechneGesamtpreis()));
  zeilen.push("Zahlungsart: " + zahlung.zahlungsart);

  if (zahlung.zahlungsart === "Bar") {
    zeilen.push("Erhalten: " + formatierePreis(zahlung.erhaltenerBetrag));
    zeilen.push("Rückgeld: " + formatierePreis(zahlung.rueckgeld));
  }

  zeilen.push("Vielen Dank!");
  return zeilen.join("\n");
}

// Der fertige Bon wird als Textdatei im Download-Ordner gespeichert.
function speichereKassenbon() {
  const datei = new Blob([erstelleKassenbonText()], { type: "text/plain;charset=utf-8" });
  const link = document.createElement("a");
  const adresse = URL.createObjectURL(datei);
  link.href = adresse;
  link.download = "MeinMuesli-" + zahlung.bonnummer + ".txt";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(adresse), 1000);
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

  document.querySelectorAll("[data-schnellgeld], .mitarbeiter-abmelden").forEach(element => {
    element.disabled = true;
  });
}

// Nach Ja oder Nein darf die fertige Bestellung beendet werden.
function zeigeBonEntscheidung(statusText) {
  document.getElementById("bonStatus").textContent = statusText;
  document.getElementById("bestellungBeendenButton").hidden = false;
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

  let zahlungsart = "";
  let kartenErgebnis = "";
  let erhaltenerBetrag = 0;
  let rueckgeld = 0;

  richteProduktAktionenEin();

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
      return;
    }

    rueckgeld = Math.round((erhaltenerBetrag - berechneGesamtpreis()) * 100) / 100;
    rueckgeldAusgabe.textContent = rueckgeld >= 0
      ? "Rückgeld: " + formatierePreis(rueckgeld)
      : "Es fehlen: " + formatierePreis(Math.abs(rueckgeld));
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

// Die Verlaufsseite zeigt Tageszahlen und alle gespeicherten Verkäufe.
function zeigeVerkaufsverlauf() {
  const heute = verkaeufe.filter(verkauf => verkauf.datum === heutigesDatum());
  const summe = liste => liste.reduce((gesamt, verkauf) =>
    gesamt + Number(verkauf.gesamtpreis), 0
  );

  document.getElementById("anzahlHeute").textContent = heute.length;
  document.getElementById("umsatzHeute").textContent = formatierePreis(summe(heute));
  document.getElementById("barHeute").textContent = formatierePreis(
    summe(heute.filter(verkauf => verkauf.zahlungsart === "Bar"))
  );
  document.getElementById("karteHeute").textContent = formatierePreis(
    summe(heute.filter(verkauf => verkauf.zahlungsart === "Karte"))
  );

  const liste = document.getElementById("verkaufsListe");
  liste.replaceChildren();

  if (verkaeufe.length === 0) {
    liste.appendChild(erzeugeElement("p", "Noch keine abgeschlossenen Verkäufe gespeichert."));
    return;
  }

  [...verkaeufe].reverse().forEach(verkauf => {
    const eintrag = erzeugeElement("article", undefined, "verkauf");
    const basen = verkauf.produkte.map(produkt => produkt.basis.name).join(", ");
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
    liste.appendChild(eintrag);
  });
}

// Der Verlauf kann nach einer Sicherheitsabfrage vollständig gelöscht werden.
function richteVerlaufsseiteEin() {
  document.getElementById("verlaufLoeschenButton").addEventListener("click", () => {
    if (window.confirm("Soll der gesamte Verkaufsverlauf wirklich gelöscht werden?")) {
      verkaeufe = [];
      speichereVerkaeufe();
      zeigeVerkaufsverlauf();
    }
  });
}

// Einfache data-ziel-Attribute übernehmen die normale Seitennavigation.
function richteNavigationEin() {
  document.querySelectorAll("[data-ziel]:not(#ueberspringenButton)").forEach(button => {
    button.addEventListener("click", () => {
      window.location.href = button.dataset.ziel;
    });
  });
}

// Nach dem Laden wird nur die Logik der gerade geöffneten Seite gestartet.
document.addEventListener("DOMContentLoaded", () => {
  if (!pruefeAnmeldung()) return;
  if (!pruefeZahlungssperre()) return;

  const seite = document.body.dataset.seite;
  richteNavigationEin();
  richteSitzungsaktionenEin();

  if (seite === "login") {
    richteLoginEin();
    return;
  }

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
});
