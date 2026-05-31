const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzFOREmrKqdwz3oah2DMxhS70mY7MEdjxUmLjWu4QoP-evmik4cQU28k3LTc6b9HWYX/exec";

// Array principale
let ricette = [];

// Carica dati da Drive
async function caricaDaDrive() {
  try {
    const res = await fetch(SCRIPT_URL);
    const text = await res.text();

    // Se il file è vuoto → array vuoto
    ricette = text.trim() ? JSON.parse(text) : [];

    aggiornaLista();
    mostraStato("Online");
  } catch (err) {
    console.error(err);
    mostraStato("Offline");
  }
}

// Salva su Drive
async function salvaSuDrive() {
  try {
    await fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify(ricette)   // niente header → compatibile al 100%
    });

    mostraStato("Salvato");
  } catch (err) {
    console.error(err);
    mostraStato("Errore salvataggio");
  }
}

// Aggiungi ricetta
function aggiungiRicetta() {
  const nome = document.getElementById("nome").value.trim();
  const ingredienti = document.getElementById("ingredienti").value.trim();
  const procedimento = document.getElementById("procedimento").value.trim();

  if (!nome) return;

  ricette.push({ nome, ingredienti, procedimento });
  aggiornaLista();
  salvaSuDrive();
}

// Aggiorna lista ricette
function aggiornaLista() {
  const lista = document.getElementById("lista");
  lista.innerHTML = "";

  ricette.forEach((r, i) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${r.nome}</strong><br>
      <em>${r.ingredienti}</em><br>
      ${r.procedimento}<br>
      <button onclick="eliminaRicetta(${i})">Elimina</button>
    `;
    lista.appendChild(li);
  });
}

// Elimina ricetta
function eliminaRicetta(i) {
  ricette.splice(i, 1);
  aggiornaLista();
  salvaSuDrive();
}

// Mostra stato
function mostraStato(msg) {
  document.getElementById("stato").textContent = msg;
}

// Avvio
caricaDaDrive();
