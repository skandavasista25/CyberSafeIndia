import { auth, db } from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {

  const loggedOutView = document.getElementById("logged-out-view");
  const loggedInView = document.getElementById("logged-in-view");

  // -------------------------
  // Show Logged In View
  // -------------------------
  async function showLoggedIn(user) {

    if (loggedOutView)
      loggedOutView.style.display = "none";

    if (loggedInView)
      loggedInView.style.display = "block";

    const welcome = document.getElementById("welcome-name");

    let name = user.displayName;

    if (!name) {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          name = snap.data().name;
        }
      } catch (e) {
        console.log(e);
      }
    }

    if (welcome)
      welcome.textContent = `Welcome, ${name || user.email}`;
  }

  // -------------------------
  // Show Logged Out View
  // -------------------------
  function showLoggedOut() {

    if (loggedOutView)
      loggedOutView.style.display = "block";

    if (loggedInView)
      loggedInView.style.display = "none";
  }

  // -------------------------
  // Check Login State
  // -------------------------
  onAuthStateChanged(auth, (user) => {

    if (user) {
      showLoggedIn(user);
    } else {
      showLoggedOut();
    }

  });

  // -------------------------
  // LOGIN
  // -------------------------
  const loginForm = document.getElementById("login-form");

  if (loginForm) {

    loginForm.addEventListener("submit", async (e) => {

      e.preventDefault();

      try {

        await signInWithEmailAndPassword(
          auth,
          loginForm.email.value.trim(),
          loginForm.password.value
        );

        alert("Login Successful!");

        // Redirect to Home Page
        window.location.href = "../index.html";

      } catch (err) {

        alert(err.message);

      }

    });

  }

  // -------------------------
  // REGISTER
  // -------------------------
  const registerForm = document.getElementById("register-form");

  if (registerForm) {

    registerForm.addEventListener("submit", async (e) => {

      e.preventDefault();

      try {

        const name = registerForm.name.value.trim();
        const email = registerForm.email.value.trim();
        const password = registerForm.password.value;

        const credential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        // Save display name in Authentication
        await updateProfile(credential.user, {
          displayName: name
        });

        // Save additional user info in Firestore
        await setDoc(doc(db, "users", credential.user.uid), {

          name,
          email,
          createdAt: new Date().toISOString()

        });

        alert("Registration Successful!");

        // Go to login page
        window.location.href = "login.html";

      } catch (err) {

        alert(err.message);

      }

    });

  }

  // -------------------------
  // LOGOUT
  // -------------------------
  const logoutBtn = document.getElementById("logout-btn");

  if (logoutBtn) {

    logoutBtn.addEventListener("click", async () => {

      await signOut(auth);

      alert("Logged Out Successfully!");

      window.location.href = "../index.html";

    });

  }

});