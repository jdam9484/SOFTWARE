// Registro.js
// Lógica para manejar el registro usando authService.js


// Registro adaptado a la colección 'user' y campos personalizados

import { registerUser } from "./services/authService.js";

// Inicialización de Firebase Auth y Firestore
const auth = firebase.auth();
const db = firebase.firestore();

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formRegistro");
  const mensaje = document.getElementById("mensaje");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    mensaje.textContent = "";
    const nombre = document.getElementById("nombre").value.trim();
    const correo = document.getElementById("email").value.trim();
    const clave = document.getElementById("password").value;
    const rol = "cliente";

    // Registro en Firebase Auth y Firestore (colección 'user')
    try {
      const cred = await auth.createUserWithEmailAndPassword(correo, clave);
      await db.collection("user").doc(cred.user.uid).set({
        nombre,
        correo,
        clave,
        rol
      });
      mensaje.style.color = "green";
      mensaje.textContent = "¡Registro exitoso! Ahora puedes iniciar sesión.";
      form.reset();
    } catch (error) {
      mensaje.style.color = "red";
      mensaje.textContent = error.message;
    }
  });
});
