const $ = id => document.getElementById(id);

let state = { ricette: [] };
let ricettaAperta = null;

/* SEMAFORO */
function backupStatus(color){
    const light = $("backupLight");
    light.style.background = color;
    light.style.boxShadow = `0 0 10px ${color}`;
    setTimeout(()=>{
        light.style.background = "#444";
        light.style.boxShadow = "0 0 6px rgba(0,0,0,0.4)";
    },1500);
}

/* LOAD / SAVE */
function load(){
    try{
        const s = localStorage.getItem("ricetteState");
        if(s) state = JSON.parse(s);
    }catch(e){}
}
function save(){
    localStorage.setItem("ricetteState", JSON.stringify(state));
    backupStatus("lime");
}
setInterval(()=>{ backupStatus("yellow"); save(); },10000);

/* APRI DETTAGLIO */
function apriDettaglio(index){
    ricettaAperta = index;
    const r = state.ricette[index];

    $("detTitle").textContent = r.nome;
    $("detIng").innerHTML = r.ingredienti.replace(/\n/g,"<br>");
    $("detProc").innerHTML = r.procedimento.replace(/\n/g,"<br>");
    $(".detMeta").textContent = "Categoria: " + r.categoria;

    if(r.foto){
        $("detFoto").src = r.foto;
        $("detFoto").style.display = "block";
    } else {
        $("detFoto").style.display = "none";
    }

    $("mainView").style.display = "none";
    $("dettaglioView").style.display = "block";
}

/* CHIUDI DETTAGLIO */
$("backBtn").onclick = ()=>{
    $("dettaglioView").style.display = "none";
    $("mainView").style.display = "block";
};

/* RENDER */
function render(){
    const lista = $("lista");
    const search = $("searchInput").value.trim().toLowerCase();

    lista.innerHTML = "";

    let ricette = state.ricette;

    if(search){
        ricette = ricette.filter(r =>
            r.nome.toLowerCase().includes(search) ||
            r.categoria.toLowerCase().includes(search)
        );
    }

    if(ricette.length === 0){
        lista.innerHTML = `<div class="empty">Nessuna ricetta trovata.</div>`;
        return;
    }

    ricette.forEach((r, idx) => {
        const div = document.createElement("div");
        div.className = "entry";
        div.dataset.index = idx;

        div.innerHTML = `
          <div class="entryTop">
            <div>
              <div class="entryTitle">🍽️ ${r.nome}</div>
              <div class="entryMeta">Categoria: ${r.categoria}</div>
            </div>
          </div>
        `;

        div.onclick = ()=>apriDettaglio(idx);

        lista.appendChild(div);
    });
}

/* AGGIUNTA */
function addRicetta(){
    const nome = $("nomeInput").value.trim();
    const cat  = $("catInput").value.trim();
    const ing  = $("ingInput").value.trim();
    const proc = $("procInput").value.trim();
    const foto = $("fotoInput").value.trim();

    if(!nome || !proc){
        alert("Nome e procedimento sono obbligatori.");
        return;
    }

    state.ricette.push({
        nome,
        categoria: cat || "Altro",
        ingredienti: ing,
        procedimento: proc,
        foto
    });

    $("nomeInput").value = "";
    $("catInput").value = "";
    $("ingInput").value = "";
    $("procInput").value = "";
    $("fotoInput").value = "";

    save();
    render();
}

/* EDIT */
$("editDetBtn").onclick = ()=>{
    const r = state.ricette[ricettaAperta];

    const nome = prompt("Nome ricetta:", r.nome);
    if(nome === null) return;

    const categoria = prompt("Categoria:", r.categoria);
    if(categoria === null) return;

    const ingredienti = prompt("Ingredienti (uno per riga):", r.ingredienti);
    if(ingredienti === null) return;

    const procedimento = prompt("Procedimento:", r.procedimento);
    if(procedimento === null) return;

    const foto = prompt("URL foto:", r.foto || "");
    if(foto === null) return;

    r.nome = nome.trim() || r.nome;
    r.categoria = categoria.trim() || r.categoria;
    r.ingredienti = ingredienti;
    r.procedimento = procedimento;
    r.foto = foto.trim();

    save();
    render();
    apriDettaglio(ricettaAperta);
};

/* DELETE */
$("deleteDetBtn").onclick = ()=>{
    if(!confirm("Eliminare questa ricetta?")) return;
    state.ricette.splice(ricettaAperta,1);
    save();
    $("dettaglioView").style.display = "none";
    $("mainView").style.display = "block";
    render();
};

/* EXPORT / IMPORT */
$("exportBtn").onclick = ()=>{
    const blob = new Blob([JSON.stringify(state)], {type:"application/json"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "ricette.json";
    a.click();
};

$("importBtn").onclick = ()=> $("fileInput").click();

$("fileInput").onchange = ()=>{
    const f = $("fileInput").files[0];
    if(!f) return;
    const r = new FileReader();
    r.onload = e=>{
        try{
            state = JSON.parse(e.target.result);
            save();
            render();
        }catch(err){
            alert("File non valido.");
        }
    };
    r.readAsText(f);
};

/* EVENTI */
$("addBtn").onclick = addRicetta;
$("searchInput").oninput = render;

/* AVVIO */
load();
render();