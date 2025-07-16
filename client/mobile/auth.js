// auth.js (dipakai oleh index.html dan chat.html)

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

// Firebase config Anda
const firebaseConfig = {
  apiKey: "AIzaSyD5v1T6vbwHCa_y6BIwXO8qCvJuo-hQD60",
  authDomain: "omekchatweb.firebaseapp.com",
  projectId: "omekchatweb",
  storageBucket: "omekchatweb.firebasestorage.app",
  messagingSenderId: "1002312804738",
  appId: "1:1002312804738:web:ca7b2149d3f30d6566079b",
  measurementId: "G-B2BTJYE1M5",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

// Fungsi login Facebook
export function loginWithFacebook() {
  const checkbox = document.getElementById("agreeCheckbox");
  if (!checkbox.checked) {
    alert("Harap centang konfirmasi sebelum masuk.");
    return;
  }

  signInWithPopup(auth, facebookProvider)
    .then(() => (window.location.href = "chat.html"))
    .catch((error) => alert("Login Facebook gagal: " + error.message));
}
// Fungsi login Google
export function loginWithGoogle() {
  const checkbox = document.getElementById("agreeCheckbox");
  if (!checkbox.checked) {
    alert("Harap centang konfirmasi sebelum masuk.");
    return;
  }

  signInWithPopup(auth, googleProvider)
    .then(() => (window.location.href = "/mobile/chat.html"))
    .catch((error) => alert("Login Google gagal: " + error.message));
}

// Cek apakah user sudah login (untuk dipanggil dari chat.html)
export function requireAuth() {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "/mobile/index.html";
    }
  });
}

// Logout (opsional)
export function logout() {
  signOut(auth)
    .then(() => (window.location.href = "/mobile/index.html"))
    .catch((error) => alert("Logout gagal: " + error.message));
}
