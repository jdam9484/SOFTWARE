// ProcesodePago.js
// Mostrar carrito, procesar pago y guardar venta en Firestore

const db = firebase.firestore();
const carritoLista = document.getElementById('carrito-lista');
const totalPago = document.getElementById('total-pago');
const formPago = document.getElementById('form-pago');
const mensajePago = document.getElementById('mensaje-pago');

// Evitar cierre de sesión al volver al inicio
const btnVolverInicio = document.getElementById('btn-volver-inicio');
if (btnVolverInicio) {
	btnVolverInicio.onclick = function() {
		window.location.href = 'index.html';
	};
}

// Obtener carrito del localStorage (o de la sesión actual)
function obtenerCarrito() {
	let carrito = [];
	try {
		carrito = JSON.parse(localStorage.getItem('carrito')) || [];
	} catch {
		carrito = [];
	}
	return carrito;
}

function mostrarCarrito() {
	const items = obtenerCarrito();
	carritoLista.innerHTML = '';
	let total = 0;
	if (items.length === 0) {
		carritoLista.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#aaa;">Carrito vacío</td></tr>';
		totalPago.textContent = 'S/ 0.00';
		return;
	}
	items.forEach(item => {
		const subtotal = Number(item.precio) * Number(item.cantidad);
		total += subtotal;
		// Compatibilidad con diferentes nombres de campos
		const imagen = item.imagen || item.image || 'assets/LogoPasteleria.PNG';
		const nombre = item.titulo || item.name || item.producto || '-';
		const descripcion = item.descripcion || '';
		carritoLista.innerHTML += `
			<tr>
				<td><img src="${imagen}" alt=""></td>
				<td>
					<div style="font-weight:600;">${nombre}</div>
					<div style="font-size:12px; color:#888;">${descripcion}</div>
				</td>
				<td>S/ ${Number(item.precio).toFixed(2)}</td>
				<td>${item.cantidad}</td>
				<td>S/ ${subtotal.toFixed(2)}</td>
			</tr>
		`;
	});
	totalPago.textContent = `S/ ${total.toFixed(2)}`;
}

formPago.onsubmit = async function(e) {
	e.preventDefault();
	const items = obtenerCarrito();
	if (items.length === 0) {
		mensajePago.textContent = 'El carrito está vacío.';
		mensajePago.style.color = '#d7005f';
		return;
	}
	// Datos del formulario
	const nombre = document.getElementById('nombre-pago').value.trim();
	const email = document.getElementById('email-pago').value.trim();
	const metodo = document.getElementById('metodo-pago').value;
	try {
		await db.collection('ventas').add({
			usuario: nombre,
			email: email,
			metodo: metodo,
			items: items,
			total: items.reduce((sum, it) => sum + (Number(it.precio) * Number(it.cantidad)), 0),
			fecha: new Date().toISOString()
		});
		// Actualizar stock de cada producto vendido
		for (const item of items) {
			// Detectar el nombre real del producto en el carrito
			const nombreProducto = item.nombre || item.titulo || item.name || item.producto || null;
			if (!nombreProducto) {
				console.error('No se encontró el nombre del producto en el item:', item);
				continue;
			}
			const query = await db.collection('productos').where('nombre', '==', nombreProducto).get();
			if (query.empty) {
				console.error('No se encontró el producto en Firestore:', nombreProducto);
				continue;
			}
			query.forEach(async doc => {
				const data = doc.data();
				const nuevoStock = (data.stock || 0) - Number(item.cantidad);
				await db.collection('productos').doc(doc.id).update({ stock: nuevoStock });
			});
		}
		mensajePago.textContent = '¡Pago realizado con éxito!';
		mensajePago.style.color = '#27ae60';
		localStorage.removeItem('carrito');
		mostrarCarrito();
		formPago.reset();
	} catch (err) {
		console.error('Error en el proceso de pago:', err);
		mensajePago.textContent = 'Error al procesar el pago.';
		mensajePago.style.color = '#d7005f';
	}
};

// Inicializar
mostrarCarrito();
