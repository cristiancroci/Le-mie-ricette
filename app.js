const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzFOREmrKqdwz3oah2DMxhS70mY7MEdjxUmLjWu4QoP-evmik4cQU28k3LTc6b9HWYX/exec";

// Stato globale
let ricette = [];
let modalAperta = false;

// ELEMENTI DOM
const lista = document.getElementById("lista");
const searchInput = document.getElementById("searchInput");
const addBtn = document.getElementById("addBtn");
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const nomeInput = document.getElementById("nomeInput");
const ingredientiInput = document.getElementById("ingredientiInput");
const procedimentoInput = document.getElementById("procedimentoInput");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");
const syncStatus = document.getElementById("syncStatus");

let indexDaModificare = null;

// -----------------------------
// CARICAMENTO DA DRIVE
// -----------------------------
async function caricaDaDrive() {
  try {
    syncStatus.textContent = "Online";
    syncStatus.className = "status online";

    const res = await fetch(SCRIPT_URL);
    const text = await res.text();

    ricette = text.trim() ? JSON.parse(text) : [];

    aggiornaLista();
  } catch (err) {
    syncStatus.textContent = "Offline";
    syncStatus.className = "status error";
  }
}

// -----------------------------
// SALVATAGGIO SU DRIVE
// -----------------------------
async function salvaSuDrive() {
  try {
    syncStatus.textContent = "Salvataggio…";
    syncStatus.className = "status saving";

    await fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify(ricette)
    });

    syncStatus.textContent = "Online";
    syncStatus.className = "status online";
  } catch (err) {
    syncStatus.textContent = "Errore";
    syncStatus.className = "status error";
  }
}


// -----------------------------
// AGGIORNA LISTA
// -----------------------------
function aggiornaLista() {
  const filtro = searchInput.value.toLowerCase();
  lista.innerHTML = "";

  ricette
    .filter(r => r.nome.toLowerCase().includes(filtro))
    .forEach((r, i) => {
      const card = document.createElement("div");
      card.className = "card";

     card.innerHTML = `
  <h3>${r.nome}</h3>
  <p><strong>Ingredienti:</strong><br>${r.ingredienti.replace(/\n/g, "<br>")}</p>
  <p><strong>Procedimento:</strong><br>${r.procedimento.replace(/\n/g, "<br>")}</p>

  <div class="card-actions">
    <button class="btn-modifica" onclick="modificaRicetta(${i})">✏️ Modifica</button>
    <button class="btn-elimina" onclick="eliminaRicetta(${i})">🗑️ Elimina</button>
  </div>
`;


      lista.appendChild(card);
    });
}

// -----------------------------
// MODALE
// -----------------------------
function apriModale(nuova = true) {
  modal.classList.remove("hidden");
  modalAperta = true;

  if (nuova) {
    modalTitle.textContent = "Nuova ricetta";
    nomeInput.value = "";
    ingredientiInput.value = "";
    procedimentoInput.value = "";
    indexDaModificare = null;
  }
}

function chiudiModale() {
  modal.classList.add("hidden");
  modalAperta = false;
}

// -----------------------------
// AGGIUNGI / MODIFICA
// -----------------------------
function salvaRicetta() {
  const nome = nomeInput.value.trim();
  const ingredienti = ingredientiInput.value.trim();
  const procedimento = procedimentoInput.value.trim();

  if (!nome) return;

  const nuovaRicetta = { nome, ingredienti, procedimento };

  if (indexDaModificare === null) {
    ricette.push(nuovaRicetta);
  } else {
    ricette[indexDaModificare] = nuovaRicetta;
  }

  aggiornaLista();
  salvaSuDrive();
  chiudiModale();
}

function modificaRicetta(i) {
  indexDaModificare = i;

  const r = ricette[i];
  nomeInput.value = r.nome;
  ingredientiInput.value = r.ingredienti;
  procedimentoInput.value = r.procedimento;

  modalTitle.textContent = "Modifica ricetta";
  apriModale(false);
}

// -----------------------------
// ELIMINA
// -----------------------------
function eliminaRicetta(i) {
  ricette.splice(i, 1);
  aggiornaLista();
  salvaSuDrive();
}

// -----------------------------
// EVENTI
// -----------------------------
addBtn.onclick = () => apriModale(true);
cancelBtn.onclick = chiudiModale;
saveBtn.onclick = salvaRicetta;
searchInput.oninput = aggiornaLista;

// Chiudi modale cliccando fuori
window.onclick = e => {
  if (modalAperta && e.target === modal) chiudiModale();
};

// -----------------------------
// AVVIO
// -----------------------------
caricaDaDrive();
