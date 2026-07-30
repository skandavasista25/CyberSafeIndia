import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCZZP1uvn_mjTPuny9AVCxgRzn6dWbFor8",
  authDomain: "cybersafeindia-cfe20.firebaseapp.com",
  projectId: "cybersafeindia-cfe20",
  storageBucket: "cybersafeindia-cfe20.firebasestorage.app",
  messagingSenderId: "23433368096",
  appId: "1:23433368096:web:3e136a9bdeca7a98a06245"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);