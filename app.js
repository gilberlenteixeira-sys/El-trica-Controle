import { database } from "./firebase-config.js";
import { ref, get, set, update } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// Lista de equipamentos
const equipments = [
  { id: 1, name: "ABB EKIP T&P", quantity: 1, available: 1 },
  { id: 2, name: "Analisador de Energia Fluke 437-II", quantity: 1, available: 1 },
  { id: 3, name: "Calibrador RTD Fluke 712B", quantity: 1, available: 1 },
  { id: 4, name: "Câmera Termográfica Flir", quantity: 1, available: 1 },
  { id: 5, name: "Certificador de Cabos Fluke", quantity: 1, available: 1 },
  { id: 6, name: "Conprove CE-7012", quantity: 1, available: 1 },
  { id: 7, name: "Detector de Alta Tensão 1Kv-800Kv", quantity: 4, available: 4 },
  { id: 8, name: "Detector de Cabos Amprobe AT-8000", quantity: 2, available: 2 },
  { id: 9, name: "Detector de Fase Fluke", quantity: 1, available: 1 },
  { id: 10, name: "Detector Tensão de Contato 70Va-1Kv", quantity: 2, available: 2 },
  { id: 11, name: "Luximetro Fluke 941", quantity: 1, available: 1 },
  { id: 12, name: "Mala de Ensaios Omicron", quantity: 1, available: 1 },
  { id: 13, name: "Megger Fluke 5Kv", quantity: 2, available: 2 },
  { id: 14, name: "Megger Fluke 10Kv", quantity: 1, available: 1 },
  { id: 15, name: "Microhmimetro Instrutemp Microhm 200", quantity: 1, available: 1 },
  { id: 16, name: "Miliohmimetro Kocos Promet L100", quantity: 2, available: 2 },
  { id: 17, name: "Osciloscopio Fluke 190-502 scopmetter", quantity: 1, available: 1 },
  { id: 18, name: "Tacometro Monarch PLT200", quantity: 1, available: 1 },
  { id: 19, name: "Terrometro Fluke 1625", quantity: 1, available: 1 },
  { id: 20, name: "Alta Temperatura infravermelho Fluke 572", quantity: 1, available: 1 },
  { id: 21, name: "Analizador de Bateria BT 521 Fluke", quantity: 1, available: 1 },
  { id: 22, name: "Detector de Tensão de Contato 3,8Kv-36Kv", quantity: 2, available: 2 },
  { id: 23, name: "Digital Ratiometer for Transformers DTR 8510 Fluke", quantity: 1, available: 1 },
  { id: 24, name: "Interruptor a Vácuo Viddar Megger", quantity: 1, available: 1 },
  { id: 25, name: "Medidor de irradiância Solar Fluke IRR2-BT", quantity: 1, available: 1 },
  { id: 26, name: "Miliamperimetro", quantity: 2, available: 2 },
  { id: 27, name: "Osciloscopio Fluke 125B", quantity: 1, available: 1 },
  { id: 28, name: "Trena a Laser Fluke", quantity: 1, available: 1 },
  { id: 29, name: "Detector de Tensão de Contato 180Kv-540Kv", quantity: 2, available: 2 },
  { id: 30, name: "Termômetro Infravermelho Fluke 62 MAX IR", quantity: 2, available: 2 },
  { id: 31, name: "Detector de Tensão de Contato 1Kv-800KV", quantity: 2, available: 2 }
];

// Elementos DOM
const loginContainer = document.getElementById("login-container");
const appContainer = document.getElementById("app-container");
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const usernameInput = document.getElementById("username");
const adminPasswordInput = document.getElementById("admin-password");
const loginError = document.getElementById("login-error");
const userInfo = document.getElementById("user-info");
const equipmentList = document.getElementById("equipment-list");

let currentUser = "";

// Inicializa Firebase DB se vazio
equipments.forEach(eq => {
  const eqRef = ref(database, 'equipments/' + eq.id);
  get(eqRef).then(snapshot => {
    if (!snapshot.exists()) {
      set(eqRef, { ...eq, responsible: "", borrowDate: "", deadline: "" });
    }
  });
});

// Função login
loginBtn.addEventListener("click", () => {
  const username = usernameInput.value.trim();
  const password = adminPasswordInput.value.trim();

  if (username === "") {
    loginError.textContent = "Digite seu nome!";
    return;
  }

  if (username === "Gilberlen") {
    if (password !== "Klig") {
      loginError.textContent = "Senha incorreta para admin!";
      return;
    }
  }

  currentUser = username;
  loginContainer.classList.add("hidden");
  appContainer.classList.remove("hidden");
  userInfo.textContent = `Olá, ${currentUser}!`;
  loadEquipments();
});

// Logout
logoutBtn.addEventListener("click", () => {
  currentUser = "";
  loginContainer.classList.remove("hidden");
  appContainer.classList.add("hidden");
  usernameInput.value = "";
  adminPasswordInput.value = "";
  equipmentList.innerHTML = "";
});

// Carrega equipamentos
function loadEquipments() {
  equipmentList.innerHTML = "";
  equipments.forEach(eq => {
    const eqRef = ref(database, 'equipments/' + eq.id);
    get(eqRef).then(snapshot => {
      const data = snapshot.val();
      const card = document.createElement("div");
      card.classList.add("equipment-card");
      card.innerHTML = `
        <h3>${data.name}</h3>
        <p>Disponível: ${data.available}/${data.quantity}</p>
        <p>Responsável: ${data.responsible || "-"}</p>
        <button ${data.available === 0 && currentUser !== "Gilberlen" ? "disabled" : ""} onclick="borrow(${eq.id})">
          Retirar
        </button>
        <button ${data.responsible === currentUser ? "" : "disabled"} onclick="returnEquipment(${eq.id})">
          Devolver
        </button>
      `;
      equipmentList.appendChild(card);
    });
  });
}

// Função retirar
window.borrow = function(id) {
  const eqRef = ref(database, 'equipments/' + id);
  get(eqRef).then(snapshot => {
    const data = snapshot.val();
    if (data.available > 0) {
      const now = new Date();
      const deadline = new Date(now);
      deadline.setDate(deadline.getDate() + 2); // +2 dias
      update(eqRef, {
        available: data.available - 1,
        responsible: currentUser,
        borrowDate: now.toISOString(),
        deadline: deadline.toISOString()
      });
      loadEquipments();
      alert(`${data.name} retirado com sucesso!`);
    }
  });
}

// Função devolver
window.returnEquipment = function(id) {
  const eqRef = ref(database, 'equipments/' + id);
  get(eqRef).then(snapshot => {
    const data = snapshot.val();
    if (data.responsible === currentUser) {
      update(eqRef, {
        available: data.available + 1,
        responsible: "",
        borrowDate: "",
        deadline: ""
      });
      loadEquipments();
      alert(`${data.name} devolvido com sucesso!`);
    }
  });
}
