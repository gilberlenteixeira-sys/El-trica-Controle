import { database } from './firebase.js';
import { ref, get, set, update, onValue } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// Lista de equipamentos
const equipments = [
  { id: 1, name: "ABB EKIP T&P", quantity: 1, available: 1, status: "available", responsible: "", borrowDate: "", deadline: "" },
  { id: 2, name: "Analisador de Energia Fluke 437-II", quantity: 1, available: 1, status: "available", responsible: "", borrowDate: "", deadline: "" },
  { id: 3, name: "Calibrador RTD Fluke 712B", quantity: 1, available: 1, status: "available", responsible: "", borrowDate: "", deadline: "" },
  { id: 4, name: "Câmera Termográfica Flir", quantity: 1, available: 1, status: "available", responsible: "", borrowDate: "", deadline: "" },
  { id: 5, name: "Certificador de Cabos Fluke", quantity: 1, available: 1, status: "available", responsible: "", borrowDate: "", deadline: "" },
  { id: 6, name: "Conprove CE-7012", quantity: 1, available: 1, status: "available", responsible: "", borrowDate: "", deadline: "" },
  { id: 7, name: "Detector de Alta Tensão 1Kv-800Kv", quantity: 4, available: 4, status: "available", responsible: "", borrowDate: "", deadline: "" },
  { id: 8, name: "Detector de Cabos Amprobe AT-8000", quantity: 2, available: 2, status: "available", responsible: "", borrowDate: "", deadline: "" },
  { id: 9, name: "Detector de Fase Fluke", quantity: 1, available: 1, status: "available", responsible: "", borrowDate: "", deadline: "" },
  { id: 10, name: "Detector Tensão de Contato 70Va-1Kv", quantity: 2, available: 2, status: "available", responsible: "", borrowDate: "", deadline: "" },
  { id: 11, name: "Luximetro Fluke 941", quantity: 1, available: 1, status: "available", responsible: "", borrowDate: "", deadline: "" },
  { id: 12, name: "Mala de Ensaios Omicron", quantity: 1, available: 1, status: "available", responsible: "", borrowDate: "", deadline: "" },
  { id: 13, name: "Megger Fluke 5Kv", quantity: 2, available: 2, status: "available", responsible: "", borrowDate: "", deadline: "" },
  { id: 14, name: "Megger Fluke 10Kv", quantity: 1, available: 1, status: "available", responsible: "", borrowDate: "", deadline: "" },
  { id: 15, name: "Microhmimetro Instrutemp Microhm 200", quantity: 1, available: 1, status: "available", responsible: "", borrowDate: "", deadline: "" },
  { id: 16, name: "Miliohmimetro Kocos Promet L100", quantity: 2, available: 2, status: "available", responsible: "", borrowDate: "", deadline: "" },
  { id: 17, name: "Osciloscopio Fluke 190-502 scopmetter", quantity: 1, available: 1, status: "available", responsible: "", borrowDate: "", deadline: "" },
  { id: 18, name: "Tacometro Monarch PLT200", quantity: 1, available: 1, status: "available", responsible: "", borrowDate: "", deadline: "" },
  { id: 19, name: "Terrometro Fluke 1625", quantity: 1, available: 1, status: "available", responsible: "", borrowDate: "", deadline: "" },
  { id: 20, name: "Alta Temperatura infravermelho Fluke 572", quantity: 1, available: 1, status: "available", responsible: "", borrowDate: "", deadline: "" },
  { id: 21, name: "Analizador de Bateria BT 521 Fluke", quantity: 1, available: 1, status: "available", responsible: "", borrowDate: "", deadline: "" },
  { id: 22, name: "Detector de Tensão de Contato 3,8Kv-36Kv", quantity: 2, available: 2, status: "available", responsible: "", borrowDate: "", deadline: "" },
  { id: 23, name: "Digital Ratiometer for Transformers DTR 8510 Fluke", quantity: 1, available: 1, status: "available", responsible: "", borrowDate: "", deadline: "" },
  { id: 24, name: "Interruptor a Vácuo Viddar Megger", quantity: 1, available: 1, status: "available", responsible: "", borrowDate: "", deadline: "" },
  { id: 25, name: "Medidor de irradiância Solar Fluke IRR2-BT", quantity: 1, available: 1, status: "available", responsible: "", borrowDate: "", deadline: "" },
  { id: 26, name: "Miliamperimetro", quantity: 2, available: 2, status: "available", responsible: "", borrowDate: "", deadline: "" },
  { id: 27, name: "Osciloscopio Fluke 125B", quantity: 1, available: 1, status: "available", responsible: "", borrowDate: "", deadline: "" },
  { id: 28, name: "Trena a Laser Fluke", quantity: 1, available: 1, status: "available", responsible: "", borrowDate: "", deadline: "" },
  { id: 29, name: "Detector de Tensão de Contato 180Kv-540Kv", quantity: 2, available: 2, status: "available", responsible: "", borrowDate: "", deadline: "" },
  { id: 30, name: "Termômetro Infravermelho Fluke 62 MAX IR", quantity: 2, available: 2, status: "available", responsible: "", borrowDate: "", deadline: "" },
  { id: 31, name: "Detector de Tensão de Contato 1Kv-800KV", quantity: 2, available: 2, status: "available", responsible: "", borrowDate: "", deadline: "" }
];

// Variáveis globais
let currentUser = "";
let isAdmin = false;

// Elementos DOM
const loginScreen = document.getElementById("login-screen");
const mainScreen = document.getElementById("main-screen");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userDisplay = document.getElementById("userDisplay");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginError = document.getElementById("loginError");
const equipmentTableBody = document.querySelector("#equipments-table tbody");
const exportCSVBtn = document.getElementById("exportCSV");

// Senha do admin
const adminName = "Gilberlen";
const adminPassword = "Klig";

// Inicializar Firebase
const equipmentsRef = ref(database, "equipments");

// Função de login
loginBtn.addEventListener("click", () => {
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (username === "") {
    loginError.textContent = "Digite seu nome";
    return;
  }

  if (username === adminName && password !== adminPassword) {
    loginError.textContent = "Senha incorreta para admin";
    return;
  }

  currentUser = username;
  isAdmin = username === adminName && password === adminPassword;

  loginScreen.style.display = "none";
  mainScreen.style.display = "block";
  userDisplay.textContent = currentUser;
  if (isAdmin) exportCSVBtn.style.display = "inline-block";

  loadEquipments();
});

// Logout
logoutBtn.addEventListener("click", () => {
  currentUser = "";
  isAdmin = false;
  usernameInput.value = "";
  passwordInput.value = "";
  loginScreen.style.display = "block";
  mainScreen.style.display = "none";
});

// Função para carregar equipamentos do Firebase
function loadEquipments() {
  get(equipmentsRef).then(snapshot => {
    if (!snapshot.exists()) {
      set(equipmentsRef, equipments);
    }
    onValue(equipmentsRef, (snapshot) => {
      const data = snapshot.val();
      renderTable(data);
    });
  });
}

// Renderizar tabela
function renderTable(data) {
  equipmentTableBody.innerHTML = "";
  data.forEach((eq, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${eq.name}</td>
      <td>${eq.quantity}</td>
      <td>${eq.available}</td>
      <td>${eq.status}</td>
      <td>
        <button ${eq.available === 0 ? "disabled" : ""} onclick="borrowEquipment(${index})">Retirar</button>
        <button ${eq.available === eq.quantity ? "disabled" : ""} onclick="returnEquipment(${index})">Devolver</button>
      </td>
    `;
    equipmentTableBody.appendChild(row);
  });
}

// Funções globais para HTML
window.borrowEquipment = function(index) {
  const eqRef = ref(database, `equipments/${index}`);
  get(eqRef).then(snapshot => {
    const eq = snapshot.val();
    if (eq.available > 0) {
      const now = new Date();
      const deadline = new Date(now.getTime() + 2*24*60*60*1000);
      update(eqRef, {
        available: eq.available - 1,
        status: eq.available - 1 === 0 ? "indisponível" : "disponível",
        responsible: currentUser,
        borrowDate: now.toISOString(),
        deadline: deadline.toISOString()
      });
      // Enviar WhatsApp apenas para admin
      window.open(`https://api.whatsapp.com/send?phone=5585985691148&text=${currentUser}%20retirou%20${eq.name}`);
    }
  });
};

window.returnEquipment = function(index) {
  const eqRef = ref(database, `equipments/${index}`);
  get(eqRef).then(snapshot => {
    const eq = snapshot.val();
    if (eq.available < eq.quantity && eq.responsible === currentUser) {
      update(eqRef, {
        available: eq.available + 1,
        status: "available",
        responsible: "",
        borrowDate: "",
        deadline: ""
      });
      // Enviar WhatsApp apenas para admin
      window.open(`https://api.whatsapp.com/send?phone=5585985691148&text=${currentUser}%20devolveu%20${eq.name}`);
    } else {
      alert("Somente quem retirou pode devolver.");
    }
  });
};

// Exportar CSV (apenas admin)
exportCSVBtn.addEventListener("click", () => {
  get(equipmentsRef).then(snapshot => {
    const data = snapshot.val();
    let csvContent = "data:text/csv;charset=utf-8,Nome,Quantidade,Disponível,Status,Responsável,Data Retirada,Data Devolução\n";
    data.forEach(eq => {
      csvContent += `${eq.name},${eq.quantity},${eq.available},${eq.status},${eq.responsible},${eq.borrowDate},${eq.deadline}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "equipamentos.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
});

