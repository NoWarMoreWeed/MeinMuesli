"use strict";

// Hier stehen die Namen der drei Einträge im localStorage.
const SPEICHER = {
  mitarbeiter: "meinMuesliMitarbeiter",
  auswahl: "meinMuesliAuswahl",
  warenkorb: "meinMuesliWarenkorb"
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

// Ein beschädigter Warenkorb wird durch einen leeren Warenkorb ersetzt.
if (!Array.isArray(warenkorb)) {
  warenkorb = [];
}

// Die aktuelle Auswahl wird als JSON-Text gespeichert.
function speichereAuswahl() {
  localStorage.setItem(SPEICHER.auswahl, JSON.stringify(aktuelleAuswahl));
}

// Der Warenkorb wird als JSON-Text gespeichert.
function speichereWarenkorb() {
  localStorage.setItem(SPEICHER.warenkorb, JSON.stringify(warenkorb));
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
    fuegeTextlisteHinzu(bon, zutaten.map(zutat => zutat.name));
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
  const zurueckButton = document.getElementById("loginZurueckButton");

  // Der Login besitzt ebenfalls den geforderten großen Zurück-Button.
  zurueckButton.addEventListener("click", () => window.history.back());

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
    window.location.href = "basis.html";
  });
}

// Die Kassenseite baut die Positionen aus den gespeicherten Daten auf.
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
    position.appendChild(erzeugeElement("p", "Basis: " + produkt.basis.name));
    position.appendChild(erzeugeElement("h3", "Gewählte Zutaten"));

    if (produkt.zutaten.length === 0) {
      position.appendChild(erzeugeElement("p", "Keine zusätzlichen Zutaten"));
    } else {
      fuegeTextlisteHinzu(position, produkt.zutaten.map(zutat => zutat.name));
    }

    position.appendChild(erzeugeElement(
      "p",
      "Einzelpreis: " + formatierePreis(produkt.preis),
      "bon-preis"
    ));
    liste.appendChild(position);
  });

  gesamt.textContent = "Gesamtpreis: " + formatierePreis(berechneGesamtpreis());
}

// Eine neue Bestellung behält nur den angemeldeten Mitarbeiter.
function richteNeueBestellungEin() {
  document.getElementById("neueBestellungButton").addEventListener("click", () => {
    aktuelleAuswahl = neueAuswahl();
    warenkorb = [];
    speichereAuswahl();
    speichereWarenkorb();
    window.location.href = "basis.html";
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

  const seite = document.body.dataset.seite;
  richteNavigationEin();

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
    richteNeueBestellungEin();
  }
});
