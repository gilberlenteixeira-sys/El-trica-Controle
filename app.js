// Config Firebase
const firebaseConfig = {
    databaseURL: "https://controle-de-equipamentos-1776d-default-rtdb.firebaseio.com/"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Lista de equipamentos
const equipamentos = [
    { id: 1, name: "ABB EKIP T&P", quantity: 1 },
    { id: 2, name: "Analisador de Energia Fluke 437-II", quantity: 1 },
    { id: 3, name: "Calibrador RTD Fluke 712B", quantity: 1 },
    { id: 4, name: "Câmera Termográfica Flir", quantity: 1 },
    { id: 5, name: "Certificador de Cabos Fluke", quantity: 1 },
    { id: 6, name: "Conprove CE-7012", quantity: 1 },
    { id: 7, name: "Detector de Alta Tensão 1Kv-800Kv", quantity: 4 },
    { id: 8, name: "Detector de Cabos Amprobe AT-8000", quantity: 2 },
    { id: 9, name: "Detector de Fase Fluke", quantity: 1 },
    { id: 10, name: "Detector Tensão de Contato 70Va-1Kv", quantity: 2 },
    { id: 11, name: "Luximetro Fluke 941", quantity: 1 },
    { id: 12, name: "Mala de Ensaios Omicron", quantity: 1 },
    { id: 13, name: "Megger Fluke 5Kv", quantity: 2 },
    { id: 14, name: "Megger Fluke 10Kv", quantity: 1 },
    { id: 15, name: "Microhmimetro Instrutemp Microhm 200", quantity: 1 },
    { id: 16, name: "Miliohmimetro Kocos Promet L100", quantity: 2 },
    { id: 17, name: "Osciloscopio Fluke 190-502 scopmetter", quantity: 1 },
    { id: 18, name: "Tacometro Monarch PLT200", quantity: 1 },
    { id: 19, name: "Terrometro Fluke 1625", quantity: 1 },
    { id: 20, name: "Alta Temperatura infravermelho Fluke 572", quantity: 1 },
    { id: 21, name: "Analizador de Bateria BT 521 Fluke", quantity: 1 },
    { id: 22, name: "Detector de Tensão de Contato 3,8Kv-36Kv", quantity: 2 },
    { id: 23, name: "Digital Ratiometer for Transformers DTR 8510 Fluke", quantity: 1 },
    { id: 24, name: "Interruptor a Vácuo Viddar Megger", quantity: 1 },
    { id: 25, name: "Medidor de irradiância Solar Fluke IRR2-BT", quantity: 1 },
    { id: 26, name: "Miliamperimetro", quantity: 2 },
    { id: 27, name: "Osciloscopio Fluke 125B", quantity: 1 },
    { id: 28, name: "Trena a Laser Fluke", quantity: 1 },
    { id: 29, name: "Detector de Tensão de Contato 180Kv-540Kv", quantity: 2 },
    { id: 30, name: "Termômetro Infravermelho Fluke 62 MAX IR", quantity: 2 },
    { id: 31, name: "Detector de Tensão de Contato 1Kv-800KV", quantity: 2 },
];

// Login
let currentUser = "";
let isAdmin = false;

function login() {
    const name = document.getElementById("userName").value.trim();
    const pass = document.getElementById("adminPass").value.trim();
    if (!name) { alert("Digite seu nome"); return; }
    if (pass === "Klig") {
        if (name !== "Gilberlen") { alert("Nome incorreto para admin"); return; }
        isAdmin = true;
    }
    currentUser = name;
    document.getElementById("loginPage").style.display = "none";
    document.getElementById("mainPage").style.display = "block";
    loadEquipamentos();
}

function logout() {
    currentUser = "";
    isAdmin = false;
    document.getElementById("mainPage").style.display = "none";
    document.getElementById("loginPage").style.display = "block";
    document.getElementById("userName").value = "";
    document.getElementById("adminPass").value = "";
}

// Carregar equipamentos
function loadEquipamentos() {
    const listDiv = document.getElementById("equipList");
    listDiv.innerHTML = "";
    db.ref("equipamentos").once("value").then(snapshot => {
        let data = snapshot.val();
        if (!data) {
            equipamentos.forEach(e => {
                db.ref("equipamentos/"+e.id).set({
                    name: e.name,
                    quantity: e.quantity,
                    available: e.quantity,
                    status: "available",
                    responsible: "",
                    borrowDate: "",
                    deadline: ""
                });
            });
            data = {};
            equipamentos.forEach(e => data[e.id] = {
                name: e.name,
                quantity: e.quantity,
                available: e.quantity,
                status: "available",
                responsible: "",
                borrowDate: "",
                deadline: ""
            });
        }

        for (const id in data) {
            const eq = data[id];
            const div = document.createElement("div");
            div.className = "equipItem";
            div.innerHTML = `
                <div class="equipInfo">
                    <span>${eq.name}</span>
                    <small>${eq.available} / ${eq.quantity} disponível(s)</small>
                </div>
                <div class="equipButtons">
                    <button onclick='retirar(${id})' ${eq.available===0?"disabled":""}>Retirar</button>
                    ${isAdmin?`<button onclick='devolver(${id})'>Devolver</button>`:""}
                </div>
            `;
            listDiv.appendChild(div);
        }
    });
}

// Retirar equipamento
function retirar(id) {
    const now = new Date();
    const borrowDate = now.toLocaleString();
    const deadline = new Date(now.getTime() + 2*24*60*60*1000).toLocaleString();
    db.ref("equipamentos/"+id).once("value").then(snap => {
        const eq = snap.val();
        if(eq.available > 0) {
            db.ref("equipamentos/"+id).update({
                available: eq.available-1,
                responsible: currentUser,
                borrowDate: borrowDate,
                deadline: deadline,
                status: eq.available-1===0?"unavailable":"available"
            });
            window.open(`https://api.whatsapp.com/send?phone=5585985691148&text=${currentUser} retirou ${eq.name} em ${borrowDate}, devolução até ${deadline}`);
            loadEquipamentos();
        }
    });
}

// Devolver equipamento
function devolver(id) {
    db.ref("equipamentos/"+id).once("value").then(snap => {
        const eq = snap.val();
        if(eq.available < eq.quantity) {
            db.ref("equipamentos/"+id).update({
                available: eq.available+1,
                responsible: "",
                borrowDate: "",
                deadline: "",
                status: "available"
            });
            window.open(`https://api.whatsapp.com/send?phone=5585985691148&text=${currentUser} devolveu ${eq.name}`);
            loadEquipamentos();
        }
    });
}
