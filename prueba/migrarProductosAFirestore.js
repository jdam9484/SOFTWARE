// migrarProductosAFirestore.js
// Ejecuta este script una sola vez en la consola del navegador (en tu app con Firebase inicializado)
// para migrar los productos del array local a Firestore

const productosIniciales = [
    {
        nombre: "Cheesecake de Maracuya",
        categoria: "Postre",
        precio: 70.00,
        stock: 10,
        descripcion: "Suave y cremoso cheesecake bañado con una vibrante reducción de maracuyá natural. El equilibrio perfecto entre lo dulce y lo cítrico.",
        imagen: "assets/Postre_MussMara.jpg"
    },
    {
        nombre: "Torta Selva Negra",
        categoria: "Torta",
        precio: 70.00,
        stock: 10,
        descripcion: "Deliciosa torta de chocolate, ideal para cumpleaños y celebraciones especiales.",
        imagen: "assets/Torta_Selva_Negra.jpg"
    },
    {
        nombre: "Torta 3 Leches",
        categoria: "Torta",
        precio: 70.00,
        stock: 10,
        descripcion: "Exquisita torta bañada en tres leches con un sabor sin igual para degustar con amigos y familia.",
        imagen: "assets/Torta_3Leches.JPG"
    },
    {
        nombre: "Empanada de Queso",
        categoria: "Salado",
        precio: 5.00,
        stock: 20,
        descripcion: "Torta suave y húmeda con mezcla de tres tipos de leche.",
        imagen: "assets/Salado_EmpanadaQueso.jpg"
    },
    {
        nombre: "Papa Rellena",
        categoria: "Salado",
        precio: 5.00,
        stock: 20,
        descripcion: "Un clásico irresistible. Bola de puré de papa suave y dorada, con un sabroso relleno de carne de res, huevo duro y aceitunas.",
        imagen: "assets/Salado_PapaRellena.jpg"
    },
    {
        nombre: "Gelatina",
        categoria: "Postre",
        precio: 3.00,
        stock: 20,
        descripcion: "Postre clásico, ligero y refrescante. Una opción ideal de textura suave y temblorosa, disponible en nuestros sabores frutales favoritos.",
        imagen: "assets/Postre_Gelatina.jpg"
    },
    {
        nombre: "Torta Helada",
        categoria: "Torta",
        precio: 70.00,
        stock: 10,
        descripcion: "Disfruta de este postre nostálgico que combina texturas y sabor. Suave, cremosa y helada: la mejor manera de terminar cualquier comida.",
        imagen: "assets/Torta_Helada.jpg"
    },
    {
        nombre: "Bebidas Gaseosas",
        categoria: "Bebida",
        precio: 5.00,
        stock: 30,
        descripcion: "Bebidas refrescantes ideales para esta calor tropical.",
        imagen: "assets/Bebidas_CocaInkaAgua.jpg"
    }
];

async function migrarProductos() {
    const db = firebase.firestore();
    for (const prod of productosIniciales) {
        await db.collection('productos').add(prod);
        console.log(`Producto agregado: ${prod.nombre}`);
    }
    alert('¡Productos migrados a Firestore!');
}

// Ejecuta migrarProductos() en la consola para migrar
// migrarProductos();
