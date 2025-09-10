import { database } from "./firebase-config.js";
import { ref, set, get, child, update } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// DOM
const loginScreen = document.getElementById("login-screen");
const mainScreen = document.getElementById("main-screen");
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const welcomeMsg = document.getElementById("welcome");
const equipamentosList = document.getElementById("equipamentos-list");

// Variáveis
let currentUser = "";
const ADMIN_USER = "Gilberlen";
const ADMIN_PASS = "Klig";

// Função de login
loginBtn.addEventListener("click", () => {
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (!username) {
    alert("Digite seu nome!");
    return;
  }

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    currentUser = ADMIN_USER;
    welcomeMsg.textContent = `👑 Admin: ${currentUser}`;
  } else if (password === "") {
    currentUser = username;
    welcomeMsg.textContent = `👤 Usuário: ${currentUser}`;
  } else {
    alert("Senha incorreta!");
    return;
  }

  loginScreen.classList.add("hidden");
  mainScreen.classList.remove("hidden");

  carregarEquipamentos();
});

// Logout
logoutBtn.addEventListener("click", () => {
  location.reload();
});

// Carregar equipamentos
async function carregarEquipamentos() {
  equipamentosList.innerHTML = "";
  const dbRef = ref(database);
  const snapshot = await get(child(dbRef, "equipamentos"));

  if (snapshot.exists()) {
    const data = snapshot.val();
    Object.keys(data).forEach((id) => {
      const equip = data[id];
      renderEquipamento(id, equip);
    });
  } else {
    console.log("Nenhum equipamento encontrado.");
  }
}

// Renderizar equipamento
function renderEquipamento(id, equip) {
  const card = document.createElement("div");
  card.className = "equip-card";

  card.innerHTML = `
    <h3>${equip.name}</h3>
    <p>Disponível: ${equip.available} / ${equip.quantity}</p>
    <p>Status: ${equip.status}</p>
    <p>Responsável: ${equip.responsavel || "-"}</p>
    <p>Retirada: ${equip.retirada || "-"}</p>
    <p>Prazo: ${equip.prazo || "-"}</p>
    <p>Devolução: ${equip.devolucao || "-"}</p>
  `;

  const borrowBtn = document.createElement("button");
  borrowBtn.textContent = "Retirar";
  borrowBtn.className = "borrow-btn";
  borrowBtn.disabled = equip.available <= 0;
  borrowBtn.addEventListener("click", () => retirarEquipamento(id, equip));

  const returnBtn = document.createElement("button");
  returnBtn.textContent = "Devolver";
  returnBtn.className = "return-btn";
  returnBtn.disabled = equip.responsavel !== currentUser;
  returnBtn.addEventListener("click", () => devolverEquipamento(id, equip));

  card.appendChild(borrowBtn);
  card.appendChild(returnBtn);

  equipamentosList.appendChild(card);
}

// Retirar equipamento
async function retirarEquipamento(id, equip) {
  if (equip.available <= 0) {
    alert("Este item não está disponível!");
    return;
  }

  const now = new Date();
  const retirada = now.toLocaleString();
  const prazo = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toLocaleString();

  await update(ref(database, "equipamentos/" + id), {
    available: equip.available - 1,
    status: equip.available - 1 === 0 ? "indisponível" : "disponível",
    responsavel: currentUser,
    retirada,
    prazo,
    devolucao: ""
  });

  carregarEquipamentos();
}

// Devolver equipamento
async function devolverEquipamento(id, equip) {
  if (equip.responsavel !== currentUser) {
    alert("Você não pode devolver este equipamento!");
    return;
  }

  const devolucao = new Date().toLocaleString();

  await update(ref(database, "equipamentos/" + id), {
    available: equip.available + 1,
    status: "disponível",
    responsavel: "",
    retirada: "",
    prazo: "",
    devolucao
  });

  carregarEquipamentos();
}

