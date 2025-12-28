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
	const fecha = new Date().toLocaleString();
	let totalCompra = items.reduce((sum, it) => sum + (Number(it.precio) * Number(it.cantidad)), 0);
	try {
		await db.collection('ventas').add({
			usuario: nombre,
			email: email,
			metodo: metodo,
			items: items,
			total: totalCompra,
			fecha: new Date().toISOString()
		});
		// Actualizar stock de cada producto vendido
		for (const item of items) {
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
		// Generar boleta PDF automáticamente
		generarBoletaPDF({nombre, email, metodo, fecha, items, total: totalCompra});
		// Mostrar botón para descargar comprobante (asegurar que se muestre tras reset)
		setTimeout(() => {
			mostrarBotonDescargar({nombre, email, metodo, fecha, items, total: totalCompra});
		}, 300);
		localStorage.removeItem('carrito');
		mostrarCarrito();
		formPago.reset();
	} catch (err) {
		console.error('Error en el proceso de pago:', err);
		mensajePago.textContent = 'Error al procesar el pago.';
		mensajePago.style.color = '#d7005f';
	}
};

// Función para generar boleta PDF usando jsPDF
function generarBoletaPDF({nombre, email, metodo, fecha, items, total}) {
	const { jsPDF } = window.jspdf;
	const doc = new jsPDF();
	doc.setFontSize(16);
	doc.text('Boleta de Compra', 105, 18, { align: 'center' });
	doc.setFontSize(11);
	doc.text(`Cliente: ${nombre}`, 14, 32);
	doc.text(`Email: ${email}`, 14, 40);
	doc.text(`Método de pago: ${metodo}`, 14, 48);
	doc.text(`Fecha: ${fecha}`, 14, 56);
	doc.text('Detalle de la compra:', 14, 66);
	// Encabezados de tabla
	doc.setFont(undefined, 'bold');
	doc.text('Producto', 14, 76);
	doc.text('Cant.', 80, 76);
	doc.text('Precio', 100, 76);
	doc.text('Subtotal', 140, 76);
	doc.setFont(undefined, 'normal');
	let y = 84;
	items.forEach(item => {
		const nombreProd = item.titulo || item.name || item.producto || '-';
		doc.text(String(nombreProd), 14, y);
		doc.text(String(item.cantidad), 80, y);
		doc.text('S/ ' + Number(item.precio).toFixed(2), 100, y);
		doc.text('S/ ' + (Number(item.precio) * Number(item.cantidad)).toFixed(2), 140, y);
		y += 8;
		if (y > 270) {
			doc.addPage();
			y = 20;
		}
	});
	doc.setFont(undefined, 'bold');
	doc.text('Total:', 120, y + 8);
	doc.text('S/ ' + Number(total).toFixed(2), 140, y + 8);
	doc.save('boleta_compra.pdf');
}

// Mostrar botón para descargar comprobante nuevamente
function mostrarBotonDescargar(datos) {
	let btn = document.getElementById('btn-descargar-boleta');
	if (!btn) {
		btn = document.createElement('button');
		btn.id = 'btn-descargar-boleta';
		btn.textContent = 'Descargar comprobante';
		btn.className = 'btn-pagar';
		btn.style.margin = '12px auto 0 auto';
		btn.style.display = 'block';
		mensajePago.parentNode.insertBefore(btn, mensajePago.nextSibling);
	}
	btn.onclick = function() {
		generarBoletaPDF(datos);
	};
	btn.style.display = 'block';
	// Mejorar visibilidad y scroll si es necesario
	btn.scrollIntoView({behavior: 'smooth', block: 'center'});
}

// Inicializar
mostrarCarrito();
