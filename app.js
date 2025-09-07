// Configuração Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBDJYHlnohrbJf0OXMz4GxJi6Okaxnqlv4",
  authDomain: "controle-de-equipamentos-1776d.firebaseapp.com",
  databaseURL: "https://controle-de-equipamentos-1776d-default-rtdb.firebaseio.com",
  projectId: "controle-de-equipamentos-1776d",
  storageBucket: "controle-de-equipamentos-1776d.firebasestorage.app",
  messagingSenderId: "479485491711",
  appId: "1:479485491711:web:650ca173e97c24d10c0fca"
};

// Inicializa Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Elementos da interface
const loginScreen = document.getElementById("login-screen");
const userScreen = document.getElementById("user-screen");
const adminScreen = document.getElementById("admin-screen");
const loginError = document.getElementById("login-error");
const equipmentList = document.getElementById("equipment-list");
const adminEquipmentList = document.getElementById("admin-equipment-list");

let currentUser = null;

// Equipamentos cadastrados
const equipmentData = [
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
  { id: 31, name: "Detector de Tensão de Contato 1Kv-800KV", quantity: 2 }
];

// Inicializa dados no banco se vazio
db.ref("equipments").once("value", snapshot => {
  if (!snapshot.exists()) {
    equipmentData.forEach(item => {
      db.ref("equipments/" + item.id).set({
        name: item.name,
        quantity: item.quantity,
        available: item.quantity,
        responsible: "",
        borrowDate: "",
        deadline: ""
      });
    });
  }
});

// Funções de login
function enterAsUser() {
  currentUser = { role: "user" };
  loginScreen.classList.add("hidden");
  userScreen.classList.remove("hidden");
  loadEquipments();
}

function loginAsAdmin() {
  const name = document.getElementById("admin-name").value.trim();
  const pass = document.getElementById("admin-password").value.trim();

  if (name === "Gilberlen" && pass === "Klig") {
    currentUser = { role: "admin" };
    loginScreen.classList.add("hidden");
    adminScreen.classList.remove("hidden");
    loadEquipments();
  } else {
    loginError.textContent = "Nome ou senha incorretos!";
  }
}

function logout() {
  currentUser = null;
  loginScreen.classList.remove("hidden");
  userScreen.classList.add("hidden");
  adminScreen.classList.add("hidden");
}

// Carregar equipamentos
function loadEquipments() {
  db.ref("equipments").on("value", snapshot => {
    const data = snapshot.val();
    renderEquipments(data);
  });
}

function renderEquipments(data) {
  equipmentList.innerHTML = "";
  adminEquipmentList.innerHTML = "";

  for (let id in data) {
    const item = data[id];

    const div = document.createElement("div");
    div.className = "equipment";
    div.innerHTML = `
      <h3>${item.name}</h3>
      <p>Disponível: ${item.available}/${item.quantity}</p>
      <p>${item.responsible ? "Responsável: " + item.responsible : ""}</p>
      <button onclick="borrowItem(${id})" ${item.available === 0 ? "disabled" : ""}>Retirar</button>
      <button onclick="returnItem(${id})" ${item.responsible === "" ? "disabled" : ""}>Devolver</button>
    `;

    if (currentUser.role === "user") {
      equipmentList.appendChild(div);
    } else if (currentUser.role === "admin") {
      adminEquipmentList.appendChild(div);
    }
  }
}

// Retirada
function borrowItem(id) {
  const userName = prompt("Digite seu nome:");
  if (!userName) return;

  const ref = db.ref("equipments/" + id);
  ref.once("value", snap => {
    const item = snap.val();
    if (item.available > 0 && item.responsible === "") {
      const now = new Date();
      const deadline = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

      ref.update({
        available: item.available - 1,
        responsible: userName,
        borrowDate: now.toLocaleString(),
        deadline: deadline.toLocaleString()
      });
    } else {
      alert("Equipamento indisponível!");
    }
  });
}

// Devolução
function returnItem(id) {
  const ref = db.ref("equipments/" + id);
  ref.once("value", snap => {
    const item = snap.val();
    const userName = prompt("Confirme seu nome para devolver:");

    if (userName === item.responsible) {
      ref.update({
        available: item.available + 1,
        responsible: "",
        borrowDate: "",
        deadline: ""
      });
    } else {
      alert("Somente o responsável pode devolver este equipamento!");
    }
  });
}
