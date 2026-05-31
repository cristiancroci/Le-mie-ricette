// URL della tua Web App Apps Script
// GET  -> restituisce { ricette: [...] }
// POST -> salva { ricette: [...] } su Drive
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz4-v6YsBlqdJ7by9t793VuCXcunbQYvitdfU_j9XFXi1p2RIxqWs4r8wzSLHvaRJsR/exec";

let ricette = [];
let ricettaInModifica = null;

// frasi animate nel sottotitolo
const sottotitoli = [
  "sempre con te",
  "sincronizzate su tutti i dispositivi",
  "backup automatico ogni 10 secondi",
  "le tue idee in cucina",
  "mai più ricette perse"
];

window.addEventListener("load", () => {
  setupUI();
  animaSottotitolo();
  caricaDaDrive();
  setInterval(backupAutomatico, 10000); // ogni 10 secondi
});

function setupUI() {
  document.getElementById("addBtn").onclick = apriModalNuova;
  document.getElementById("cancelBtn").onclick = chiudiModal;
  document.getElementById("saveBtn").onclick = salvaDaModal;
  document.getElementById("searchInput").oninput = renderLista;
}

function animaSottotitolo() {
  const el = document.getElementById("titleSub");
  let i = 0;
  setInterval(() => {
    i = (i + 1) % sottotitoli.length;
    el.textContent = sottotitoli[i];
  }, 5000);
}

function setStatus(text, color = "rgba(0,0,0,0.25)") {
  const el = document.getElementById("syncStatus");
  el.textContent = text;
  el.style.background = color;
}

/* ====== DRIVE ====== */

async function caricaDaDrive() {
  try {
    setStatus("Sync…");
    const res = await fetch(SCRIPT_URL);
    const data = await res.json();
    ricette = data.ricette || [];
    renderLista();
    setStatus("Online", "rgba(46, 204, 113,0.9)");
  } catch (e) {
    console.error(e);
    setStatus("Offline", "rgba(231, 76, 60,0.9)");
  }
}

async function salvaSuDrive() {
  try {
    setStatus("Salvo…", "rgba(241, 196, 15,0.9)");
    await fetch(SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ricette })
    });
    setStatus("Salvato", "rgba(46, 204, 113,0.9)");
  } catch (e) {
    console.error(e);
    setStatus("Errore salvataggio", "rgba(231, 76, 60,0.9)");
  }
}

function backupAutomatico() {
  if (ricette.length > 0) {
    salvaSuDrive();
  }
}

/* ====== LISTA ====== */

function renderLista() {
  const lista = document.getElementById("lista");
  lista.innerHTML = "";

  const q = document.getElementById("searchInput").value.toLowerCase().trim();
  const filtrate = ricette.filter(r =>
    (r.nome || "").toLowerCase().includes(q)
  );

  if (filtrate.length === 0) {
    const p = document.createElement("p");
    p.textContent = "Nessuna ricetta trovata";
    lista.appendChild(p);
    return;
  }

  filtrate.forEach((r, index) => {
    const card = document.createElement("div");
    card.className = "card";

    const header = document.createElement("div");
    header.className = "card-header";

    const title = document.createElement("div");
    title.className = "card-title";
    title.textContent = r.nome;

    const meta = document.createElement("div");
    meta.className = "card-meta";
    meta.textContent = `${(r.ingredienti || []).length} ingredienti`;

    header.appendChild(title);
    header.appendChild(meta);

    const actions = document.createElement("div");
    actions.className = "card-actions";

    const btnEdit = document.createElement("button");
    btnEdit.className = "btn-edit";
    btnEdit.textContent = "Modifica";
    btnEdit.onclick = () => apriModalModifica(index);

    const btnDelete = document.createElement("button");
    btnDelete.className = "btn-delete";
    btnDelete.textContent = "Elimina";
    btnDelete.onclick = () => eliminaRicetta(index);

    actions.appendChild(btnEdit);
    actions.appendChild(btnDelete);

    card.appendChild(header);

    if (r.ingredienti && r.ingredienti.length > 0) {
      const ingr = document.createElement("div");
      ingr.className = "card-meta";
      ingr.textContent = r.ingredienti.slice(0, 3).join(" · ");
      card.appendChild(ingr);
    }

    card.appendChild(actions);
    lista.appendChild(card);
  });
}

/* ====== MODALE ====== */

function apriModalNuova() {
  ricettaInModifica = null;
  document.getElementById("modalTitle").textContent = "Nuova ricetta";
  document.getElementById("nomeInput").value = "";
  document.getElementById("ingredientiInput").value = "";
  document.getElementById("procedimentoInput").value = "";
  document.getElementById("modal").classList.remove("hidden");
}

function apriModalModifica(index) {
  ricettaInModifica = index;
  const r = ricette[index];

  document.getElementById("modalTitle").textContent = "Modifica ricetta";
  document.getElementById("nomeInput").value = r.nome || "";
  document.getElementById("ingredientiInput").value = (r.ingredienti || []).join("\n");
  document.getElementById("procedimentoInput").value = r.procedimento || "";
  document.getElementById("modal").classList.remove("hidden");
}

function chiudiModal() {
  document.getElementById("modal").classList.add("hidden");
}

function salvaDaModal() {
  const nome = document.getElementById("nomeInput").value.trim();
  const ingredientiText = document.getElementById("ingredientiInput").value.trim();
  const procedimento = document.getElementById("procedimentoInput").value.trim();

  if (!nome) {
    alert("Inserisci un nome per la ricetta");
    return;
  }

  const ingredienti = ingredientiText
    ? ingredientiText.split("\n").map(x => x.trim()).filter(x => x)
    : [];

  const obj = { nome, ingredienti, procedimento };

  if (ricettaInModifica === null) {
    ricette.push(obj);
  } else {
    ricette[ricettaInModifica] = obj;
  }

  chiudiModal();
  renderLista();
  salvaSuDrive();
}

function eliminaRicetta(index) {
  if (!confirm("Eliminare questa ricetta?")) return;
  ricette.splice(index, 1);
  renderLista();
  salvaSuDrive();
}
