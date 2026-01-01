// =================== MOSTRAR PRODUCTOS FIRESTORE + ESTÁTICOS ===================
async function mostrarProductosCombinados() {
    const boxContainer = document.getElementById('lista-1');
    if (!boxContainer) return;
    // Limpiar contenedor
    boxContainer.innerHTML = '';
    // Renderizar productos estáticos
    products.forEach(p => {
        boxContainer.innerHTML += `
        <div class="box" id="producto-${p.id}">
            <img src="${p.image}" alt="">
            <div>
                <h3>${p.name}</h3>
                <p>Alta Calidad</p>
                <p class="precio">s/ ${p.price.toFixed(2)}</p>
                <p class="porciones">Porciones: ${p.porciones}</p>
                <p class="descripcion">${p.descripcion}</p>
                <div class="cantidad-control">
                    <button type="button" class="restar-cantidad" data-id="${p.id}">-</button>
                    <input type="number" min="1" max="10" value="1" class="cantidad" data-id="${p.id}" readonly>
                    <button type="button" class="sumar-cantidad" data-id="${p.id}">+</button>
                </div>
                <a href="#" class="agregar-carrito btn-3" data-id="${p.id}">Agregar al carrito</a>
            </div>
        </div>
        `;
    });
    // Renderizar productos de Firestore
    const snap = await firebase.firestore().collection('productos').orderBy('nombre').get();
    snap.forEach(doc => {
        const p = doc.data();
        boxContainer.innerHTML += `
        <div class="box" id="producto-fb-${doc.id}">
            <img src="${p.imagen || 'assets/default.png'}" alt="">
            <div>
                <h3>${p.nombre}</h3>
                <p>Alta Calidad</p>
                <p class="precio">s/ ${Number(p.precio).toFixed(2)}</p>
                <p class="porciones">Porciones: ${p.porciones || 1}</p>
                <p class="descripcion">${p.descripcion || ''}</p>
                <div class="cantidad-control">
                    <button type="button" class="restar-cantidad" data-id="${doc.id}">-</button>
                    <input type="number" min="1" max="10" value="1" class="cantidad" data-id="${doc.id}" readonly>
                    <button type="button" class="sumar-cantidad" data-id="${doc.id}">+</button>
                </div>
                <a href="#" class="agregar-carrito btn-3" data-id="${doc.id}">Agregar al carrito</a>
            </div>
        </div>
        `;
    });
}

// Ejecutar al cargar la página principal
if (window.location.pathname.endsWith('index.html')) {
    document.addEventListener('DOMContentLoaded', mostrarProductosCombinados);
}
// ========== TOAST DE PRODUCTO AGREGADO ==========
function mostrarToastCarrito(mensaje = "Producto agregado al carrito") {
    const toast = document.getElementById('toast-carrito');
    if (!toast) return;
    toast.textContent = mensaje;
    toast.style.display = 'block';
    toast.style.opacity = '1';
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => { toast.style.display = 'none'; }, 400);
    }, 1400);
}
// ========== FUNCIONES DE AUTENTICACIÓN (LOGIN Y REGISTRO) ========== //
async function loginUser(email, password) {
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        // NOTA: En tu Firestore la colección es 'user', no 'users'
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

async function registerUser(email, password, nombre) {
    try {
        const cred = await auth.createUserWithEmailAndPassword(email, password);
        // NOTA: En tu Firestore la colección es 'user', no 'users'
        await db.collection("user").doc(cred.user.uid).set({
            correo: email,
            nombre: nombre,
            clave: password,
            rol: "cliente"
        });
        // Enviar notificación al administrador
        await db.collection('notificaciones').add({
            tipo: 'nuevo_registro',
            mensaje: `Nuevo usuario registrado: ${nombre} (${email})`,
            fecha: new Date().toISOString(),
            leido: false
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// =================== MOSTRAR/OCULTAR FORMULARIOS LOGIN Y REGISTRO ===================
const loginFormContainer = document.getElementById("login");
const registerFormContainer = document.getElementById("registro");
const mostrarLoginBtn = document.getElementById("mostrarLogin");
const cerrarBtns = document.querySelectorAll(".cerrar");

mostrarLoginBtn.addEventListener("click", () => {
    registerFormContainer.style.display = "none";
    loginFormContainer.style.display = "flex";
});

cerrarBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        loginFormContainer.style.display = "none";
        registerFormContainer.style.display = "none";
    });
});
// =================== VARIABLES GLOBALES ===================
// loginFormContainer y registerFormContainer ya están declaradas más abajo, eliminar estas líneas duplicadas.
const loginForm = document.querySelector("#login form");
const registerForm = document.querySelector("#registro form");
const loginUsuario = document.getElementById("loginUsuario");
const loginPass = document.getElementById("loginPass");
const regEmail = document.getElementById("regEmail");
const regUser = document.getElementById("regUser");
const regPass = document.getElementById("regPass");
const regPass2 = document.getElementById("regPass2");
// (Eliminada la declaración duplicada de errorLogin, ya está declarada más abajo para el modal login)
const errorRegistro = document.getElementById("errorRegistro");
const msgEmail = document.getElementById("msgEmail");
const adminPanel = document.getElementById('admin-panel');


// ================= PANEL ADMIN =================

const detalleProducto = document.getElementById('detalle-producto');
const carrito = document.getElementById('carrito');
const lista = document.querySelector('#lista-carrito tbody');
const vaciarCarritoBtn = document.getElementById('vaciar-carrito');
const elementos1 = document.getElementById('lista-1');
const searchInput = document.getElementById('search');
const suggestions = document.getElementById('suggestions');
const loadMoreBtn = document.getElementById('load-more');
const userInfo = document.getElementById('user-info');
const welcomeMsg = document.getElementById('welcome-msg');
const logoutBtn = document.getElementById('logout-btn');
const btnAbrir = document.querySelector('.btnAbrir');

let currentUser = null;
let currentItem = 4;


// =================== PRODUCTOS EN EL BUSCADOR ===================
const products = [
    { id: 1, name: "Cheesecake de Maracuya", price: 70.00, image: "assets/Postre_MussMara.jpg", porciones: "1", descripcion: "Suave y cremoso cheesecake bañado con una vibrante reducción de maracuyá natural. El equilibrio perfecto entre lo dulce y lo cítrico." },
    { id: 2, name: "Torta Selva Negra", price: 70.00, image: "assets/Torta_Selva_Negra.jpg", porciones: "1", descripcion: "Deliciosa torta de chocolate, ideal para cumpleaños y celebraciones especiales." },
    { id: 3, name: "Torta 3 Leches", price: 70.00, image: "assets/Torta_3Leches.JPG", porciones: "2", descripcion: "Exquisita torta bañada en tres leches con un sabor sin igual para degustar con amigos y familia." },
    { id: 4, name: "Empanada de Queso", price: 5.00, image: "assets/Salado_EmpanadaQueso.jpg", porciones: "1", descripcion: "Torta suave y húmeda con mezcla de tres tipos de leche." },
    { id: 5, name: "Papa Rellena", price: 5.00, image: "assets/Salado_PapaRellena.jpg", porciones: "1", descripcion: "Un clásico irresistible. Bola de puré de papa suave y dorada, con un sabroso relleno de carne de res, huevo duro y aceitunas." },
    { id: 6, name: "Gelatina", price: 3.00, image: "assets/Postre_Gelatina.jpg", porciones: "1", descripcion: "Postre clásico, ligero y refrescante. Una opción ideal de textura suave y temblorosa, disponible en nuestros sabores frutales favoritos." },
    { id: 7, name: "Torta Helada", price: 70.00, image: "assets/Torta_Helada.jpg", porciones: "1", descripcion: "Disfruta de este postre nostálgico que combina texturas y sabor. Suave, cremosa y helada: la mejor manera de terminar cualquier comida." },
    { id: 8, name: "Bebidas Gaseosas", price: 5.00, image: "assets/Bebidas_CocaInkaAgua.jpg", porciones: "1", descripcion: "Bebidas refrescantes ideales para esta calor tropical." },
    { id: 9, name: "Copa de Helado", price: 5.00, image: "assets/Copa_de_Helado.jpeg", porciones: "1", descripcion: "Deliciosa copa de helado con una mezcla de sabores cremosos y refrescantes, perfecta para disfrutar en cualquier momento del día.." },
    { id: 10, name: "Budín", price: 5.00, image: "assets/budin.jpeg", porciones: "1", descripcion: "Delicioso budín casero, suave y dulce, perfecto para acompañar tu café o té en cualquier momento del día." },
    { id: 11, name: "Empanada de Carne", price: 5.00, image: "assets/Empanada_de_Carne.jpeg", porciones: "1", descripcion: "Empanada rellena de carne sazonada, jugosa y sabrosa, envuelta en una masa dorada y crujiente. Ideal para cualquier momento del día." },
    { id: 12, name: "Muss de Algarrobina", price: 5.00, image: "assets/Muss_de_Algarrobina.jpeg", porciones: "1", descripcion: "Delicioso postre cremoso elaborado con auténtica algarrobina, de sabor suave y dulce natural. Su textura ligera y su alto valor nutritivo lo convierten en una opción ideal para disfrutar en cualquier momento del día, combinando tradición y placer en cada cucharada." }
    
];

// =================== FUNCIONES MOSTRAR/OCULTAR FORMULARIOS ===================


// BOTÓN LOGIN Y MODAL LOGIN CLÁSICO
function mostrarLogin() {
    if (registerFormContainer) registerFormContainer.style.display = "none";
    if (loginFormContainer) loginFormContainer.style.display = "flex";
}


// =================== VER/Ocultar contraseña ===================
function verPass(id) {
    const campo = document.getElementById(id);
    campo.type = campo.type === "password" ? "text" : "password";
}

// =================== VALIDACIÓN EMAIL TIEMPO REAL ===================
regEmail.addEventListener("input", () => {
    const email = regEmail.value.trim();
    const regex = /^[^\s@]+@(gmail\.com|hotmail\.com)$/i;
    msgEmail.textContent = regex.test(email) ? "✓ Correo válido" : "Debe terminar en @gmail.com o @hotmail.com";
});

// =================== COMPRAR ELEMENTO ===================
function comprarElemento(e) {
    // 1. Lógica para el botón MÁS (+)
    if (e.target.classList.contains('sumar-cantidad')) {
        // Buscamos el input vecino (el número '1' en medio)
        const input = e.target.parentElement.querySelector('.cantidad');
        let valor = parseInt(input.value) || 1;
        if (valor < 10) { // Límite máximo (opcional)
            input.value = valor + 1;
        }
        return; 
    }

    // 2. Lógica para el botón MENOS (-)
    if (e.target.classList.contains('restar-cantidad')) {
        const input = e.target.parentElement.querySelector('.cantidad');
        let valor = parseInt(input.value) || 1;
        if (valor > 1) { // Evita que baje de 1
            input.value = valor - 1;
        }
        return;
    }

    // 3. Lógica para el botón AGREGAR AL CARRITO
    if (e.target.classList.contains('agregar-carrito')) {
        e.preventDefault();
        if (!currentUser) { mostrarLogin(); return; }

        const elemento = e.target.closest('.box');
        
        // CAPTURAMOS EL NÚMERO ACTUAL DEL INPUT
        const inputCantidad = elemento.querySelector('.cantidad');
        const cantidadElegida = Number(inputCantidad.value) || 1;

        const infoProducto = {
            imagen: elemento.querySelector('img').src,
            titulo: elemento.querySelector('h3').textContent,
            precio: elemento.querySelector('.precio').textContent,
            id: e.target.dataset.id,
            cantidad: cantidadElegida // ¡Enviamos la cantidad correcta!
        };
        
        insertarCarrito(infoProducto);
        mostrarToastCarrito(`"${infoProducto.titulo}" agregado al carrito`);
    }
}

function comprarDetalle(e) {
    e.preventDefault();
    if (!currentUser) { mostrarLogin(); return; }
    if (e.target.classList.contains('agregar-carrito')) {
        const box = e.target.closest('.box-detalle');
        if (!box) return;
        const productName = box.querySelector('h3').textContent;
        const product = products.find(p => p.name === productName);
        insertarCarrito({
            imagen: product.image,
            titulo: product.name,
            precio: "S/ " + product.price.toFixed(2),
            id: product.id
        });
        mostrarToastCarrito(`"${product.name}" agregado al carrito`);
    }
}

// Evitar clicks sin sesión
document.querySelectorAll('.agregar-carrito').forEach(btn => {
    btn.addEventListener('click', e => { if (!currentUser) { e.preventDefault(); mostrarLogin(); } });
});


// =================== CARRITO ===================
// Manejo del carrito solo en memoria (o implementar con Firebase)
let cartKey = 'carrito_' + (currentUser && (currentUser.user || currentUser.usuario) ? (currentUser.user || currentUser.usuario) : 'guest');
let carritoItems = [];

function saveCart() {
    // Guardar el carrito en localStorage para el proceso de pago
    localStorage.setItem('carrito', JSON.stringify(carritoItems));
    renderCart();
}

function renderCart() {
    // Rellenar tabla
    lista.innerHTML = '';
    carritoItems.forEach(item => {
        const tr = document.createElement('tr');
        const importe = (Number(item.precio) * Number(item.cantidad)).toFixed(2);
        tr.innerHTML = `
            <td><img src="${item.imagen}" alt=""/></td>
            <td>${item.titulo}</td>
            <td>${item.descripcion || ''}</td>
            <td>S/ ${Number(item.precio).toFixed(2)}</td>
            <td><input class="cart-qty" type="number" min="1" value="${item.cantidad}" data-id="${item.id}"></td>
            <td>S/ ${importe}</td>
            <td><a href="#" class="borrar" data-id="${item.id}">X</a></td>
        `;
        lista.appendChild(tr);
    });
    // actualizar total y contador
    updateCartSummary();
}

function updateCartSummary() {
    const countEl = document.getElementById('cart-count');
    const totalEl = document.getElementById('cart-total');
    const total = carritoItems.reduce((sum, it) => sum + (Number(it.precio) * Number(it.cantidad)), 0);
    const count = carritoItems.reduce((c, it) => c + Number(it.cantidad), 0);
    if (countEl) countEl.textContent = count;
    if (totalEl) totalEl.textContent = 'S/ ' + total.toFixed(2);
}

function insertarCarrito(elemento) {
    const id = Number(elemento.id);
    const prod = products.find(p => p.id === id) || {};
    const price = prod.price || Number(String(elemento.precio || '').replace(/[^0-9\.]/g, '')) || 0;
    
    // Aquí recibimos la cantidad que viene del botón, o usamos 1 por defecto
    const cantidadAAgregar = elemento.cantidad || 1; 

    const existente = carritoItems.find(i => Number(i.id) === id);
    
    if (existente) {
        // Sumamos la cantidad real en lugar de solo +1
        existente.cantidad = Number(existente.cantidad) + cantidadAAgregar;
    } else {
        carritoItems.push({
            id: id,
            imagen: elemento.imagen || prod.image || '',
            titulo: elemento.titulo || prod.name || 'Producto',
            descripcion: prod.descripcion || '',
            precio: price,
            cantidad: cantidadAAgregar // Usamos la cantidad elegida
        });
    }
    saveCart();

}

function eliminarElemento(e) {
    if (e.target.classList.contains('borrar')) {
        e.preventDefault();
        const id = Number(e.target.dataset.id);
        carritoItems = carritoItems.filter(i => Number(i.id) !== id);
        saveCart();
    }
}

function handleQtyChange(e) {
    if (e.target.classList.contains('cart-qty')) {
        const id = Number(e.target.dataset.id);
        const val = Number(e.target.value) || 1;
        const item = carritoItems.find(i => Number(i.id) === id);
        if (item) {
            item.cantidad = val;
            saveCart();
        }
    }
}

function vaciarCarrito(e) {
    e && e.preventDefault();
    carritoItems = [];
    saveCart();
    localStorage.removeItem('carrito');
}

function cargarCarrito() {
    // Cargar el carrito desde localStorage si existe
    try {
        const guardado = JSON.parse(localStorage.getItem('carrito'));
        if (Array.isArray(guardado)) {
            carritoItems = guardado;
        }
    } catch {}
    renderCart();
}

// Eventos carrito
elementos1.addEventListener('click', comprarElemento);
detalleProducto.addEventListener('click', comprarDetalle);
lista.addEventListener('click', eliminarElemento);
lista.addEventListener('input', handleQtyChange);
vaciarCarritoBtn.addEventListener('click', vaciarCarrito);

// =================== BUSCADOR ===================
searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    suggestions.innerHTML = '';
    if (!query) { suggestions.style.display = 'none'; return; }

    const filtered = products.filter(p => p.name.toLowerCase().includes(query));
    filtered.forEach(product => {
        const item = document.createElement('div');
        item.classList.add('suggestion-item');
        item.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <div>
                <h4>${product.name}</h4>
                <p>S/ ${product.price.toFixed(2)}</p>
            </div>
        `;
        item.addEventListener('click', () => {
            suggestions.innerHTML = '';
            suggestions.style.display = 'none';
            detalleProducto.innerHTML = `
                <div class="box-detalle">
                    <img src="${product.image}" alt="${product.name}">
                    <div>
                        <h3>${product.name}</h3>
                        <p class="precio">S/ ${product.price.toFixed(2)}</p>
                        <p class="porciones">Porciones: ${product.porciones}</p>
                        <p class="descripcion">${product.descripcion}</p>
                        <input type="number" min="1" max="10" value="1" class="cantidad">
                        <a href="#" class="agregar-carrito btn-3">Agregar al carrito</a>
                    </div>
                </div>
            `;
            detalleProducto.scrollIntoView({ behavior: 'smooth' });
        });
        suggestions.appendChild(item);
    });
    suggestions.style.display = filtered.length ? 'block' : 'none';
});

document.addEventListener('click', e => {
    if (!searchInput.contains(e.target) && !suggestions.contains(e.target)) suggestions.style.display = 'none';
});

// =================== CARGAR MÁS PRODUCTOS ===================
loadMoreBtn.addEventListener('click', () => {
    let boxes = [...document.querySelectorAll('.box-container .box')];
    for (let i = currentItem; i < currentItem + 4 && i < boxes.length; i++) boxes[i].style.display = 'flex';
    currentItem += 4;
    if (currentItem >= boxes.length) loadMoreBtn.style.display = 'none';
});

// =================== USUARIO LOGUEADO ===================
function mostrarUsuario(usuario) {
    userInfo.style.display = 'flex';
    if (btnAbrir) btnAbrir.style.display = 'none';
    welcomeMsg.textContent = `Bienvenido ${usuario.nombre} (${usuario.rol})`;
}



// =================== INICIALIZAR ===================
cargarCarrito();
if (currentUser) mostrarUsuario(currentUser);
if (currentUser && currentUser.rol === 'Administrador') {
    adminPanel.style.display = 'block';
    cargarUsuarios();
} else adminPanel.style.display = 'none';

// =================== SLIDER AUTOMÁTICO ===================
const slides = document.querySelectorAll('.slide');
let currentSlide = 0;

function nextSlide() {
    // 1. Quitamos la clase 'active' de la imagen actual
    slides[currentSlide].classList.remove('active');
    
    // 2. Calculamos el índice de la siguiente (usando módulo % para volver a 0 al final)
    currentSlide = (currentSlide + 1) % slides.length;
    
    // 3. Agregamos la clase 'active' a la nueva imagen
    slides[currentSlide].classList.add('active');
}

// Cambiar imagen cada 4000 milisegundos (4 segundos)
if(slides.length > 0) {
    setInterval(nextSlide, 4000);
}




// LOGIN
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = loginUsuario.value.trim();
    const pass = loginPass.value;
    errorLogin.textContent = "";

    const result = await loginUser(email, pass);
    if (result.success) {
        // Redirección según el rol
        if (result.role === 'Administrador') {
            window.location.href = 'Administrador.html';
            return;
        }
        // Cliente: mostrar panel normal
        currentUser = result.userData;
        mostrarUsuario(result.userData);
        loginFormContainer.style.display = "none";
        // ...puedes agregar más lógica aquí si lo deseas...
    } else {
        errorLogin.textContent = result.error;
    }
});

//Formulario de registro

// REGISTRO
registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = regEmail.value.trim();
    const pass = regPass.value;
    const nombre = regUser.value.trim();
    errorRegistro.textContent = "";

    // ...validaciones aquí...

    const result = await registerUser(email, pass, nombre);
    if (result.success) {
        errorRegistro.textContent = "¡Registro exitoso!";
        errorRegistro.classList.add("success");
        mostrarLogin();
        registerForm.reset();
    } else {
        errorRegistro.textContent = result.error;
    }
});

// LOGOUT
logoutBtn.addEventListener('click', () => {
    // Cerrar sesión en Firebase
    auth.signOut().then(() => {
        // Limpiar usuario actual y ocultar info
        currentUser = null;
        userInfo.style.display = 'none';
        // Opcional: recargar la página para limpiar todo el estado
        window.location.reload();
    });
});

// Función para cerrar el modal de login/registro
function cerrarForm() {
    document.getElementById('login').style.display = 'none';
    document.getElementById('registro').style.display = 'none';
}

// Inicialización global de Firebase Auth y Firestore
window.addEventListener('DOMContentLoaded', function() {
    if (typeof firebase !== 'undefined') {
        window.auth = firebase.auth();
        window.db = firebase.firestore();
    }
});



