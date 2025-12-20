// Usar objetos globales de Firebase (CDN)
// Se asume que Firebase y sus servicios ya están cargados en el HTML vía <script src="https://www.gstatic.com/firebasejs/...">
// auth y db están disponibles como window.auth y window.db


// LOGIN
export async function loginUser(email, password) {
  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const user = userCredential.user;
    const userDoc = await db.collection("user").doc(user.uid).get();
    if (!userDoc.exists) {
      return { success: false, error: "Usuario no encontrado" };
    }
    return {
      success: true,
      user,
      userData: userDoc.data(),
      role: userDoc.data().rol
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}



// REGISTRO
export async function registerUser({ nombre, email, password, rol }) {
  try {
    const cred = await auth.createUserWithEmailAndPassword(email, password);
    await db.collection("user").doc(cred.user.uid).set({
      email,
      nombre,
      rol,
      fechaRegistro: new Date()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
  

// LOGOUT
export async function logoutUser() {
  await auth.signOut();
}

// OBTENER ROL
export async function getUserRole(uid) {
  const snap = await db.collection("user").doc(uid).get();
  return snap.exists ? snap.data().rol : "cliente";
}
