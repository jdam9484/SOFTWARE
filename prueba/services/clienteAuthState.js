// clienteAuthState.js
// Listener para mantener la sesión del cliente y actualizar la UI según el estado de autenticación

document.addEventListener('DOMContentLoaded', function() {
    if (typeof firebase === 'undefined' || typeof firebase.auth !== 'function') return;
    const auth = firebase.auth();
    const db = firebase.firestore();
    const userInfo = document.getElementById('user-info');
    const welcomeMsg = document.getElementById('welcome-msg');
    let currentUser = null;

    auth.onAuthStateChanged(async (user) => {
        if (user) {
            // Usuario autenticado, obtener datos de Firestore
            try {
                const userDoc = await db.collection('user').doc(user.uid).get();
                if (userDoc.exists) {
                    currentUser = userDoc.data();
                    userInfo.style.display = 'flex';
                    welcomeMsg.textContent = `Bienvenido ${currentUser.nombre} (${currentUser.rol})`;
                } else {
                    userInfo.style.display = 'none';
                    welcomeMsg.textContent = '';
                }
            } catch {
                userInfo.style.display = 'none';
                welcomeMsg.textContent = '';
            }
        } else {
            // No autenticado
            userInfo.style.display = 'none';
            welcomeMsg.textContent = '';
        }
    });
});
