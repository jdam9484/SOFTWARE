
// Configuración de Firebase para uso con CDN (sin imports)
const firebaseConfig = {
  apiKey: "AIzaSyAfb5pCmLEbfST_78M5hBJbXofzp2zFDYU",
  authDomain: "pasteleria-f868c.firebaseapp.com",
  projectId: "pasteleria-f868c",
  storageBucket: "pasteleria-f868c.firebasestorage.app",
  messagingSenderId: "287443071922",
  appId: "1:287443071922:web:c92910b83cf275c244eaab"
};

// Inicializar Firebase solo si no está inicializado
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Exportar auth y db como globales (opcional, para compatibilidad)
window.auth = firebase.auth();
window.db = firebase.firestore();
