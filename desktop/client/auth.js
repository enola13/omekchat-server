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
  apiKey: "AIzaSyC9dObTgWdquVxDoWadHsNQXGG5RNRaltQ",
  authDomain: "omekchat.firebaseapp.com",
  projectId: "omekchat",
  storageBucket: "omekchat.appspot.com",
  messagingSenderId: "676046409566",
  appId: "1:676046409566:web:66d61118c3d275231bc9cf",
  measurementId: "G-6WG78XDYVQ",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

// Fungsi login Google
export function loginWithGoogle() {
  const checkbox = document.getElementById("agreeCheckbox");
  if (!checkbox.checked) {
    alert("Harap centang konfirmasi sebelum masuk.");
    return;
  }

  signInWithPopup(auth, googleProvider)
    .then(() => (window.location.href = "chat.html"))
    .catch((error) => alert("Login Google gagal: " + error.message));
}

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

// Cek apakah user sudah login (untuk dipanggil dari chat.html)
export function requireAuth() {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "index.html";
    }
  });
}

// Logout (opsional)
export function logout() {
  signOut(auth)
    .then(() => (window.location.href = "index.html"))
    .catch((error) => alert("Logout gagal: " + error.message));
}
