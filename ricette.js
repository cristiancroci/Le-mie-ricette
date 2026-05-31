let ricette = [];

window.onload = () => {
  carica();
  mostraLista();
};

function carica() {
  const salvate = localStorage.getItem("ricette");
  if (salvate) ricette = JSON.parse(salvate);
}

function salva() {
  localStorage.setItem("ricette", JSON.stringify(ricette));
}

function mostraLista() {
  const lista = document.getElementById("lista");
  lista.innerHTML = "";

  if (ricette.length === 0) {
    lista.innerHTML = "<p>Nessuna ricetta trovata</p>";
    return;
  }

  ricette.forEach((r, i) => {
    const div = document.createElement("div");
    div.className = "entry";
    div.onclick = () => mostraDettaglio(i);

    div.innerHTML = `
      <div class="entryTitle">${r.nome}</div>
      <div class="entryMeta">${r.ingredienti.length} ingredienti</div>
    `;

    lista.appendChild(div);
  });
}

document.getElementById("addBtn").onclick = mostraFormAggiunta;

function mostraFormAggiunta() {
  const nome = prompt("Nome ricetta:");
  if (!nome) return;

  const ingr = prompt("Ingredienti (separati da virgola):");
  const listaIngr = ingr ? ingr.split(",").map(x => x.trim()) : [];

  const proc = prompt("Procedimento:");
  
  ricette.push({
    nome: nome,
    ingredienti: listaIngr,
    procedimento: proc
  });

  salva();
  mostraLista();
}

function mostraDettaglio(i) {
  const r = ricette[i];
  alert(
    r.nome +
    "\n\nIngredienti:\n" +
    r.ingredienti.join("\n") +
    "\n\nProcedimento:\n" +
    r.procedimento
  );
}

function esportaRicette() {
  const blob = new Blob([JSON.stringify(ricette)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "ricette.json";
  a.click();
}

function importaRicette() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json";

  input.onchange = e => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      ricette = JSON.parse(reader.result);
      salva();
      mostraLista();
    };

    reader.readAsText(file);
  };

  input.click();
}

function filtraRicette() {
  const q = document.getElementById("searchInput").value.toLowerCase();
  const filtrate = ricette.filter(r => r.nome.toLowerCase().includes(q));

  const lista = document.getElementById("lista");
  lista.innerHTML = "";

  if (filtrate.length === 0) {
    lista.innerHTML = "<p>Nessuna ricetta trovata</p>";
    return;
  }

  filtrate.forEach((r, i) => {
    const div = document.createElement("div");
    div.className = "entry";
    div.innerHTML = `
      <div class="entryTitle">${r.nome}</div>
      <div class="entryMeta">${r.ingredienti.length} ingredienti</div>
    `;
    lista.appendChild(div);
  });
}
