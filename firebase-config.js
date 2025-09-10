// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBDJYHlnohrbJf0OXMz4GxJi6Okaxnqlv4",
  authDomain: "controle-de-equipamentos-1776d.firebaseapp.com",
  databaseURL: "https://controle-de-equipamentos-1776d-default-rtdb.firebaseio.com",
  projectId: "controle-de-equipamentos-1776d",
  storageBucket: "controle-de-equipamentos-1776d.firebasestorage.app",
  messagingSenderId: "479485491711",
  appId: "1:479485491711:web:650ca173e97c24d10c0fca"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };
