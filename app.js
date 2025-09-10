// app.js
import { database } from "./firebase.js";
import { ref, get, set, update } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

const loginSection = document.getElementById("loginSection");
const panelSection = document.getElementById("panelSection");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const reportBtn = document.getElementById("reportBtn");
const equipmentList = document.getElementById("equipmentList");
const reportArea = document.getElementById("report");

let currentUser = "";
let isAdmin = false;

// Lista de equipamentos (mesma que você forneceu)
const equipmentData = [
  { name: "ABB EKIP T&P", quantity: 1, available: 1, responsible: "", borrowDate: "", deadline: "" },
  { name: "Analisador de Energia Fluke 437-II", quantity: 1, available: 1, responsible: "", borrowDate: "", deadline: "" },
  { name: "Calibrador RTD Fluke 712B", quantity: 1, available: 1, responsible: "", borrowDate: "", deadline: "" },
  { name: "Câmera Termográfica Flir", quantity: 1, available: 1, responsible: "", borrowDate: "", deadline: "" },
  { name: "Certificador de Cabos Fluke", quantity: 1, available: 1, responsible: "", borrowDate: "", deadline: "" },
  { name: "Conprove CE-7012", quantity: 1, available: 1, responsible: "", borrowDate: "", deadline: "" },
  { name: "Detector de Alta Tensão 1Kv-800Kv", quantity: 4, available: 4, responsible: "", borrowDate: "", deadline: "" },
  { name: "Detector de Cabos Amprobe AT-8000", quantity: 2, available: 2, responsible: "", borrowDate: "", deadline: "" },
  { name: "Detector de Fase Fluke", quantity: 1, available: 1, responsible: "", borrowDate: "", deadline: "" },
  { name: "Detector Tensão de Contato 70Va-1Kv", quantity: 2, available: 2, responsible: "", borrowDate: "", deadline: "" },
  { name: "Luximetro Fluke 941", quantity: 1, available: 1, responsible: "", borrowDate: "", deadline: "" },
  { name: "Mala de Ensaios Omicron", quantity: 1, available: 1, responsible: "", borrowDate: "", deadline: "" },
  { name: "Megger Fluke 5Kv", quantity: 2, available: 2, responsible: "", borrowDate: "", deadline: "" },
  { name: "Megger Fluke 10Kv", quantity: 1, available: 1, responsible: "", borrowDate: "", deadline: "" },
  { name: "Microhmimetro Instrutemp Microhm 200", quantity: 1, available: 1, responsible: "", borrowDate: "", deadline: "" },
  { name: "Miliohmimetro Kocos Promet L100", quantity: 2, available: 2, responsible: "", borrowDate: "", deadline: "" },
  { name: "Osciloscopio Fluke 190-502 scopmetter", quantity: 1, available: 1, responsible: "", borrowDate: "", deadline: "" },
  { name: "Tacometro Monarch PLT200", quantity: 1, available: 1, responsible: "", borrowDate: "", deadline: "" },
  { name: "Terrometro Fluke 1625", quantity: 1, available: 1, responsible: "", borrowDate: "", deadline: "" },
  { name: "Alta Temperatura infravermelho Fluke 572", quantity: 1, available: 1, responsible: "", borrowDate: "", deadline: "" },
  { name: "Analizador de Bateria BT 521 Fluke", quantity: 1, available: 1, responsible: "", borrowDate: "", deadline: "" },
  { name: "Detector de Tensão de Contato 3,8Kv-36Kv", quantity: 2, available: 2, responsible: "", borrowDate: "", deadline: "" },
  { name: "Digital Ratiometer for Transformers DTR 8510 Fluke", quantity: 1, available: 1, responsible: "", borrowDate: "", deadline: "" },
  { name: "Interruptor a Vácuo Viddar Megger", quantity: 1, available: 1, responsible: "", borrowDate: "", deadline: "" },
  { name: "Medidor de irradiância Solar Fluke IRR2-BT", quantity: 1, available: 1, responsible: "", borrowDate: "", deadline: "" },
  { name: "Miliamperimetro", quantity: 2, available: 2, responsible: "", borrowDate: "", deadline: "" },
  { name: "Osciloscopio Fluke 125B", quantity: 1, available: 1, responsible: "", borrowDate: "", deadline: "" },
  { name: "Trena a Laser Fluke", quantity: 1, available: 1, responsible: "", borrowDate: "", deadline: "" },
  { name: "Detector de Tensão de Contato 180Kv-540Kv", quantity: 2, available: 2, responsible: "", borrowDate: "", deadline: "" },
  { name: "Termômetro Infravermelho Fluke 62 MAX IR", quantity: 2, available: 2, responsible: "", borrowDate: "", deadline: "" },
  { name: "Detector de Tensão de Contato 1Kv-800KV", quantity: 2, available: 2, responsible: "", borrowDate: "", deadline: "" }
];

const equipmentRef = ref(database, "equipamentos");

// Inicializa Firebase caso esteja vazio
get(equipmentRef).then(snapshot => {
  if (!snapshot.exists()) set(equipmentRef, equipmentData);
});

// Mostra login inicialmente
loginSection.style.display = "block";

// LOGIN
loginBtn.addEventListener("click", () => {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username) { alert("Digite seu nome!"); return; }

  if (username === "Gilberlen" && password === "Klig") {
    isAdmin = true;
  } else {
    isAdmin = false;
  }

  currentUser = username;

  // Avança para painel
  loginSection.style.display = "none";
  panelSection.style.display = "block";

  loadEquipment();
});

// LOGOUT
logoutBtn.addEventListener("click", () => {
  currentUser = "";
  isAdmin = false;
  panelSection.style.display = "none";
  loginSection.style.display = "block";
});

// CARREGA EQUIPAMENTOS
function loadEquipment() {
  get(equipmentRef).then(snapshot => {
    if (!snapshot.exists()) return;
    const equipments = snapshot.val();
    equipmentList.innerHTML = "";

    Object.keys(equipments).forEach(key => {
      const eq = equipments[key];
      const card = document.createElement("div");
      card.className = "equipment-card";
      if (eq.available === 0) card.classList.add("unavailable");
      card.innerHTML = `
        <div class="flex-row">
          <strong>${eq.name}</strong>
          <span>${eq.available}/${eq.quantity}</span>
        </div>
        <div class="flex-row">
          <input type="date" id="borrowDate-${key}" value="${eq.borrowDate}">
          <button id="borrowBtn-${key}">${eq.available>0?"Retirar":"Indisponível"}</button>
          <button id="returnBtn-${key}">Devolver</button>
        </div>
      `;
      equipmentList.appendChild(card);

      document.getElementById(`borrowBtn-${key}`).addEventListener("click", () => borrowEquipment(key, eq));
      document.getElementById(`returnBtn-${key}`).addEventListener("click", () => returnEquipment(key, eq));
    });
  });
}

// RETIRADA
function borrowEquipment(key, eq) {
  if (eq.available === 0) { alert("Indisponível"); return; }
  const today = new Date().toISOString().split("T")[0];
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 2);
  const deadlineStr = deadline.toISOString().split("T")[0];

  eq.available -= 1;
  eq.responsible = currentUser;
  eq.borrowDate = today;
  eq.deadline = deadlineStr;

  update(ref(database, `equipamentos/${key}`), eq);
  alert(`Equipamento retirado!\nPrazo: ${deadlineStr}`);
  sendWhatsAppNotification(eq, "retirada");
  loadEquipment();
}

// DEVOLUÇÃO
function returnEquipment(key, eq) {
  if (eq.responsible !== currentUser && !isAdmin) { alert("Apenas quem retirou pode devolver!"); return; }

  eq.available += 1;
  eq.responsible = "";
  eq.borrowDate = "";
  eq.deadline = "";

  update(ref(database, `equipamentos/${key}`), eq);
  alert("Equipamento devolvido!");
  sendWhatsAppNotification(eq, "devolução");
  loadEquipment();
}

// WHATSAPP
function sendWhatsAppNotification(eq, action) {
  const adminNumber = "5585985691148";
  const msg = `Equipamento: ${eq.name}\nAção: ${action}\nUsuário: ${currentUser}`;
  window.open(`https://api.whatsapp.com/send?phone=${adminNumber}&text=${encodeURIComponent(msg)}`, "_blank");
}

// RELATÓRIO CSV
reportBtn.addEventListener("click", () => {
  get(equipmentRef).then(snapshot => {
    if (!snapshot.exists()) return;
    const equipments = snapshot.val();
    let csv = "Nome,Quantidade,Disponível,Responsável,Data Retirada,Data Devolução\n";
    Object.values(equipments).forEach(eq => {
      csv += `${eq.name},${eq.quantity},${eq.available},${eq.responsible},${eq.borrowDate},${eq.deadline}\n`;
    });
    reportArea.value = csv;
  });
});
