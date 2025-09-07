// Configuração Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBDJYHlnohrbJf0OXMz4GxJi6Okaxnqlv4",
  authDomain: "controle-de-equipamentos-1776d.firebaseapp.com",
  databaseURL: "https://controle-de-equipamentos-1776d-default-rtdb.firebaseio.com",
  projectId: "controle-de-equipamentos-1776d",
  storageBucket: "controle-de-equipamentos-1776d.appspot.com",
  messagingSenderId: "479485491711",
  appId: "1:479485491711:web:650ca173e97c24d10c0fca"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Admin
const adminName = "Gilberlen";
const adminPass = "Klig";

// Equipamentos iniciais
const equipments = [
  { id:1, name:"ABB EKIP T&P", quantity:1, available:1, responsible:"", borrowDate:"", deadline:"" },
  { id:2, name:"Analisador de Energia Fluke 437-II", quantity:1, available:1, responsible:"", borrowDate:"", deadline:"" },
  { id:3, name:"Calibrador RTD Fluke 712B", quantity:1, available:1, responsible:"", borrowDate:"", deadline:"" },
  { id:4, name:"Câmera Termográfica Flir", quantity:1, available:1, responsible:"", borrowDate:"", deadline:"" },
  { id:5, name:"Certificador de Cabos Fluke", quantity:1, available:1, responsible:"", borrowDate:"", deadline:"" },
  { id:6, name:"Conprove CE-7012", quantity:1, available:1, responsible:"", borrowDate:"", deadline:"" },
  { id:7, name:"Detector de Alta Tensão 1Kv-800Kv", quantity:4, available:4, responsible:"", borrowDate:"", deadline:"" },
  { id:8, name:"Detector de Cabos Amprobe AT-8000", quantity:2, available:2, responsible:"", borrowDate:"", deadline:"" },
  { id:9, name:"Detector de Fase Fluke", quantity:1, available:1, responsible:"", borrowDate:"", deadline:"" },
  { id:10, name:"Detector Tensão de Contato 70Va-1Kv", quantity:2, available:2, responsible:"", borrowDate:"", deadline:"" },
  { id:11, name:"Luximetro Fluke 941", quantity:1, available:1, responsible:"", borrowDate:"", deadline:"" },
  { id:12, name:"Mala de Ensaios Omicron", quantity:1, available:1, responsible:"", borrowDate:"", deadline:"" },
  { id:13, name:"Megger Fluke 5Kv", quantity:2, available:2, responsible:"", borrowDate:"", deadline:"" },
  { id:14, name:"Megger Fluke 10Kv", quantity:1, available:1, responsible:"", borrowDate:"", deadline:"" },
  { id:15, name:"Microhmimetro Instrutemp Microhm 200", quantity:1, available:1, responsible:"", borrowDate:"", deadline:"" },
  { id:16, name:"Miliohmimetro Kocos Promet L100", quantity:2, available:2, responsible:"", borrowDate:"", deadline:"" },
  { id:17, name:"Osciloscopio Fluke 190-502 scopmetter", quantity:1, available:1, responsible:"", borrowDate:"", deadline:"" },
  { id:18, name:"Tacometro Monarch PLT200", quantity:1, available:1, responsible:"", borrowDate:"", deadline:"" },
  { id:19, name:"Terrometro Fluke 1625", quantity:1, available:1, responsible:"", borrowDate:"", deadline:"" },
  { id:20, name:"Alta Temperatura infravermelho Fluke 572", quantity:1, available:1, responsible:"", borrowDate:"", deadline:"" },
  { id:21, name:"Analizador de Bateria BT 521 Fluke", quantity:1, available:1, responsible:"", borrowDate:"", deadline:"" },
  { id:22, name:"Detector de Tensão de Contato 3,8Kv-36Kv", quantity:2, available:2, responsible:"", borrowDate:"", deadline:"" },
  { id:23, name:"Digital Ratiometer for Transformers DTR 8510 Fluke", quantity:1, available:1, responsible:"", borrowDate:"", deadline:"" },
  { id:24, name:"Interruptor a Vácuo Viddar Megger", quantity:1, available:1, responsible:"", borrowDate:"", deadline:"" },
  { id:25, name:"Medidor de irradiância Solar Fluke IRR2-BT", quantity:1, available:1, responsible:"", borrowDate:"", deadline:"" },
  { id:26, name:"Miliamperimetro", quantity:2, available:2, responsible:"", borrowDate:"", deadline:"" },
  { id:27, name:"Osciloscopio Fluke 125B", quantity:1, available:1, responsible:"", borrowDate:"", deadline:"" },
  { id:28, name:"Trena a Laser Fluke", quantity:1, available:1, responsible:"", borrowDate:"", deadline:"" },
  { id:29, name:"Detector de Tensão de Contato 180Kv-540Kv", quantity:2, available:2, responsible:"", borrowDate:"", deadline:"" },
  { id:30, name:"Termômetro Infravermelho Fluke 62 MAX IR", quantity:2, available:2, responsible:"", borrowDate:"", deadline:"" },
  { id:31, name:"Detector de Tensão de Contato 1Kv-800KV", quantity:2, available:2, responsible:"", borrowDate:"", deadline:"" }
];

// Inicializar DB se vazio
db.ref('equipments').once('value', snapshot => {
  if(!snapshot.exists()) {
    db.ref('equipments').set(equipments);
  }
});

// Login
const loginBtn = document.getElementById('loginBtn');
loginBtn.addEventListener('click', () => {
  const username = document.getElementById('username').value.trim();
  const passInput = document.getElementById('adminPass');
  const mainScreen = document.querySelector('.main-screen');
  const loginScreen = document.querySelector('.login-screen');
  const loginError = document.getElementById('loginError');

  if(username === "") { loginError.textContent="Digite seu nome!"; return; }

  if(username === adminName) {
    passInput.style.display="block";
    const pass = passInput.value.trim();
    if(pass !== adminPass) { loginError.textContent="Senha incorreta!"; return; }
  }

  loginScreen.style.display="none";
  mainScreen.style.display="block";
  document.getElementById('welcome').textContent = "Bem-vindo, " + username;

  loadEquipments();
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
  location.reload();
});

// Carregar equipamentos
function loadEquipments() {
  const tbody = document.querySelector('#equipmentsTable tbody');
  tbody.innerHTML="";
  db.ref('equipments').on('value', snapshot => {
    snapshot.forEach(equipSnap => {
      const eq = equipSnap.val();
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${eq.name}</td>
        <td>${eq.available}</td>
        <td>${eq.quantity}</td>
        <td>
          <button ${eq.available===0?'disabled':''} onclick="borrow('${eq.name}')">Retirar</button>
          <button ${eq.available===eq.quantity?'disabled':''} onclick="returnEquipment('${eq.name}')">Devolver</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  });
}

// Retirar equipamento
window.borrow = function(name) {
  const username = document.getElementById('username').value.trim();
  const now = new Date();
  const borrowDate = now.toLocaleString();
  const deadline = new Date(now.getTime() + 2*24*60*60*1000).toLocaleString(); // 2 dias

  db.ref('equipments').once('value', snapshot => {
    snapshot.forEach(snap => {
      let eq = snap.val();
      if(eq.name === name && eq.available >0){
        eq.available--;
        eq.responsible = username;
        eq.borrowDate = borrowDate;
        eq.deadline = deadline;
        db.ref('equipments/' + snap.key).set(eq);
        alert(`${name} retirado com sucesso!`);
        sendWhatsApp(`${username} retirou o equipamento ${name}`);
      }
    });
  });
}

// Devolver equipamento
window.returnEquipment = function(name) {
  const username = document.getElementById('username').value.trim();
  db.ref('equipments').once('value', snapshot => {
    snapshot.forEach(snap => {
      let eq = snap.val();
      if(eq.name === name && eq.responsible === username){
        eq.available++;
        if(eq.available===eq.quantity) eq.responsible="";
        eq.borrowDate="";
        eq.deadline="";
        db.ref('equipments/' + snap.key).set(eq);
        alert(`${name} devolvido com sucesso!`);
        sendWhatsApp(`${username} devolveu o equipamento ${name}`);
      }
    });
  });
}

// WhatsApp notification
function sendWhatsApp(msg){
  const phone = "5585985691148";
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");
}
