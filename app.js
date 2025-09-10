import { database } from './firebase.js';
import { ref, get, set, update, onValue } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

const loginContainer = document.getElementById('login-container');
const dashboardContainer = document.getElementById('dashboard-container');
const usernameInput = document.getElementById('username');
const adminPasswordInput = document.getElementById('adminPassword');
const loginBtn = document.getElementById('loginBtn');
const loginError = document.getElementById('loginError');
const welcomeUser = document.getElementById('welcomeUser');
const logoutBtn = document.getElementById('logoutBtn');
const equipmentTableBody = document.querySelector('#equipment-table tbody');
const generateReportBtn = document.getElementById('generateReport');

let currentUser = null;
const adminName = "Gilberlen";
const adminPassword = "Klig";
const adminPhone = "5585985691148";

const equipmentList = [
  { id:1,name:"ABB EKIP T&P",quantity:1,available:1,responsible:"",borrowDate:"",deadline:"" },
  { id:2,name:"Analisador de Energia Fluke 437-II",quantity:1,available:1,responsible:"",borrowDate:"",deadline:"" },
  { id:3,name:"Calibrador RTD Fluke 712B",quantity:1,available:1,responsible:"",borrowDate:"",deadline:"" },
  { id:4,name:"Câmera Termográfica Flir",quantity:1,available:1,responsible:"",borrowDate:"",deadline:"" },
  { id:5,name:"Certificador de Cabos Fluke",quantity:1,available:1,responsible:"",borrowDate:"",deadline:"" },
  { id:6,name:"Conprove CE-7012",quantity:1,available:1,responsible:"",borrowDate:"",deadline:"" },
  { id:7,name:"Detector de Alta Tensão 1Kv-800Kv",quantity:4,available:4,responsible:"",borrowDate:"",deadline:"" },
  { id:8,name:"Detector de Cabos Amprobe AT-8000",quantity:2,available:2,responsible:"",borrowDate:"",deadline:"" },
  { id:9,name:"Detector de Fase Fluke",quantity:1,available:1,responsible:"",borrowDate:"",deadline:"" },
  { id:10,name:"Detector Tensão de Contato 70Va-1Kv",quantity:2,available:2,responsible:"",borrowDate:"",deadline:"" },
  { id:11,name:"Luximetro Fluke 941",quantity:1,available:1,responsible:"",borrowDate:"",deadline:"" },
  { id:12,name:"Mala de Ensaios Omicron",quantity:1,available:1,responsible:"",borrowDate:"",deadline:"" },
  { id:13,name:"Megger Fluke 5Kv",quantity:2,available:2,responsible:"",borrowDate:"",deadline:"" },
  { id:14,name:"Megger Fluke 10Kv",quantity:1,available:1,responsible:"",borrowDate:"",deadline:"" },
  { id:15,name:"Microhmimetro Instrutemp Microhm 200",quantity:1,available:1,responsible:"",borrowDate:"",deadline:"" },
  { id:16,name:"Miliohmimetro Kocos Promet L100",quantity:2,available:2,responsible:"",borrowDate:"",deadline:"" },
  { id:17,name:"Osciloscopio Fluke 190-502 scopmetter",quantity:1,available:1,responsible:"",borrowDate:"",deadline:"" },
  { id:18,name:"Tacometro Monarch PLT200",quantity:1,available:1,responsible:"",borrowDate:"",deadline:"" },
  { id:19,name:"Terrometro Fluke 1625",quantity:1,available:1,responsible:"",borrowDate:"",deadline:"" },
  { id:20,name:"Alta Temperatura infravermelho Fluke 572",quantity:1,available:1,responsible:"",borrowDate:"",deadline:"" },
  { id:21,name:"Analizador de Bateria BT 521 Fluke",quantity:1,available:1,responsible:"",borrowDate:"",deadline:"" },
  { id:22,name:"Detector de Tensão de Contato 3,8Kv-36Kv",quantity:2,available:2,responsible:"",borrowDate:"",deadline:"" },
  { id:23,name:"Digital Ratiometer for Transformers DTR 8510 Fluke",quantity:1,available:1,responsible:"",borrowDate:"",deadline:"" },
  { id:24,name:"Interruptor a Vácuo Viddar Megger",quantity:1,available:1,responsible:"",borrowDate:"",deadline:"" },
  { id:25,name:"Medidor de irradiância Solar Fluke IRR2-BT",quantity:1,available:1,responsible:"",borrowDate:"",deadline:"" },
  { id:26,name:"Miliamperimetro",quantity:2,available:2,responsible:"",borrowDate:"",deadline:"" },
  { id:27,name:"Osciloscopio Fluke 125B",quantity:1,available:1,responsible:"",borrowDate:"",deadline:"" },
  { id:28,name:"Trena a Laser Fluke",quantity:1,available:1,responsible:"",borrowDate:"",deadline:"" },
  { id:29,name:"Detector de Tensão de Contato 180Kv-540Kv",quantity:2,available:2,responsible:"",borrowDate:"",deadline:"" },
  { id:30,name:"Termômetro Infravermelho Fluke 62 MAX IR",quantity:2,available:2,responsible:"",borrowDate:"",deadline:"" },
  { id:31,name:"Detector de Tensão de Contato 1Kv-800KV",quantity:2,available:2,responsible:"",borrowDate:"",deadline:"" }
];

// Inicializa Firebase com os equipamentos se não existir
const dbRef = ref(database, 'equipments/');
get(dbRef).then(snapshot => {
    if(!snapshot.exists()){
        equipmentList.forEach(eq => {
            set(ref(database, `equipments/${eq.id}`), eq);
        });
    }
});

// Função de login
loginBtn.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    const password = adminPasswordInput.value.trim();

    if(!username) {
        loginError.textContent = "Digite seu nome.";
        return;
    }

    if(username === adminName && password !== adminPassword) {
        loginError.textContent = "Senha do admin incorreta.";
        return;
    }

    currentUser = username;
    loginContainer.classList.add('hidden');
    dashboardContainer.classList.remove('hidden');
    welcomeUser.textContent = `Bem-vindo, ${currentUser}${currentUser===adminName?" (Admin)":""}`;
    if(currentUser === adminName) generateReportBtn.classList.remove('hidden');

    renderEquipment();
});

// Logout
logoutBtn.addEventListener('click', () => {
    currentUser = null;
    loginContainer.classList.remove('hidden');
    dashboardContainer.classList.add('hidden');
    usernameInput.value = '';
    adminPasswordInput.value = '';
});

// Renderizar equipamentos
function renderEquipment(){
    equipmentTableBody.innerHTML = '';
    onValue(dbRef, snapshot => {
        snapshot.forEach(snap => {
            const eq = snap.val();
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${eq.name}</td>
                <td>${eq.available}</td>
                <td>${eq.quantity}</td>
                <td>
                    <button ${eq.available===0?'disabled':''} onclick="borrowEquipment(${eq.id})">Retirar</button>
                    <button ${eq.available===eq.quantity?'disabled':''} onclick="returnEquipment(${eq.id})">Devolver</button>
                </td>
            `;
            equipmentTableBody.appendChild(tr);
        });
    });
}

// Retirar equipamento
window.borrowEquipment = function(id){
    const eqRef = ref(database, `equipments/${id}`);
    get(eqRef).then(snapshot => {
        const eq = snapshot.val();
        if(eq.available>0){
            eq.available--;
            eq.responsible = currentUser;
            eq.borrowDate = new Date().toLocaleString();
            const d = new Date();
            d.setDate(d.getDate()+2);
            eq.deadline = d.toLocaleString();
            update(eqRef, eq);
            // Notificação admin
            window.open(`https://wa.me/${adminPhone}?text=${currentUser} retirou ${eq.name}`);
            renderEquipment();
        }
    });
}

// Devolver equipamento
window.returnEquipment = function(id){
    const eqRef = ref(database, `equipments/${id}`);
    get(eqRef).then(snapshot => {
        const eq = snapshot.val();
        if(eq.responsible === currentUser){
            eq.available++;
            eq.responsible = "";
            eq.borrowDate = "";
            eq.deadline = "";
            update(eqRef, eq);
            // Notificação admin
            window.open(`https://wa.me/${adminPhone}?text=${currentUser} devolveu ${eq.name}`);
            renderEquipment();
        } else {
            alert("Somente o usuário que retirou pode devolver este equipamento.");
        }
    });
}

// Gerar relatório CSV (apenas admin)
generateReportBtn.addEventListener('click', () => {
    get(dbRef).then(snapshot => {
        const equipments = [];
        snapshot.forEach(snap => equipments.push(snap.val()));
        let csvContent = "data:text/csv;charset=utf-8,Nome,Disponível,Quantidade Total,Responsável,Data Retirada,Data Devolução\n";
        equipments.forEach(eq=>{
            csvContent += `${eq.name},${eq.available},${eq.quantity},${eq.responsible},${eq.borrowDate},${eq.deadline}\n`;
        });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "relatorio_equipamentos.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
});

