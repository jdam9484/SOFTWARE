// GestiondeProductos.js
// Lógica para listar, agregar, editar y eliminar productos en Firestore

const db = firebase.firestore();

const productosLista = document.getElementById('productos-lista');
const btnNuevoProducto = document.getElementById('btn-nuevo-producto');
const modalProducto = document.getElementById('modal-producto');
const cerrarModal = document.getElementById('cerrar-modal');
const formProducto = document.getElementById('form-producto');
const modalTitulo = document.getElementById('modal-titulo');
const cancelarProducto = document.getElementById('cancelar-producto');

// Inputs del formulario
const inputId = document.getElementById('producto-id');
const inputNombre = document.getElementById('producto-nombre');
const inputCategoria = document.getElementById('producto-categoria');
const inputPrecio = document.getElementById('producto-precio');
const inputStock = document.getElementById('producto-stock');
const inputDescripcion = document.getElementById('producto-descripcion');
const inputImagen = document.getElementById('producto-imagen');

// Mostrar productos
async function cargarProductos() {
	productosLista.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#aaa;">Cargando productos...</td></tr>';
	const snap = await db.collection('productos').orderBy('nombre').get();
	if (snap.empty) {
		productosLista.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#aaa;">Sin productos</td></tr>';
		return;
	}
	productosLista.innerHTML = '';
	snap.forEach(doc => {
		const p = doc.data();
		productosLista.innerHTML += `
			<tr>
				<td>${p.nombre}</td>
				<td>${p.categoria}</td>
				<td>S/ ${Number(p.precio).toFixed(2)}</td>
				<td>${p.stock}</td>
				<td>
					<button class="btn-editar" data-id="${doc.id}">Editar</button>
					<button class="btn-eliminar" data-id="${doc.id}">Eliminar</button>
				</td>
			</tr>
		`;
	});
	// Asignar eventos a los botones
	document.querySelectorAll('.btn-editar').forEach(btn => {
		btn.onclick = () => abrirModalEditar(btn.dataset.id);
	});
	document.querySelectorAll('.btn-eliminar').forEach(btn => {
		btn.onclick = () => eliminarProducto(btn.dataset.id);
	});
}

// Abrir modal para agregar producto
btnNuevoProducto.onclick = () => {
	modalTitulo.textContent = 'Agregar Producto';
	formProducto.reset();
	inputId.value = '';
	modalProducto.style.display = 'flex';
};

// Cerrar modal
cerrarModal.onclick = cancelarProducto.onclick = () => {
	modalProducto.style.display = 'none';
};

// Guardar producto (agregar o editar)
formProducto.onsubmit = async (e) => {
	e.preventDefault();
	const id = inputId.value;
	let data = {
		nombre: inputNombre.value.trim(),
		categoria: inputCategoria.value,
		precio: parseFloat(inputPrecio.value),
		stock: parseInt(inputStock.value),
		descripcion: inputDescripcion.value.trim(),
	};
	if (id) {
		// Editar
		await db.collection('productos').doc(id).update(data);
	} else {
		// Agregar
		await db.collection('productos').add(data);
	}
	modalProducto.style.display = 'none';
	cargarProductos();
};

// Abrir modal para editar producto
async function abrirModalEditar(id) {
	const doc = await db.collection('productos').doc(id).get();
	if (!doc.exists) return;
	const p = doc.data();
	modalTitulo.textContent = 'Editar Producto';
	inputId.value = id;
	inputNombre.value = p.nombre;
	inputCategoria.value = p.categoria;
	inputPrecio.value = p.precio;
	inputStock.value = p.stock;
	inputDescripcion.value = p.descripcion || '';
	// No se puede precargar imagen por seguridad, pero podrías mostrar una miniatura si lo deseas
	modalProducto.style.display = 'flex';
}

// Eliminar producto
async function eliminarProducto(id) {
	if (confirm('¿Eliminar este producto?')) {
		await db.collection('productos').doc(id).delete();
		cargarProductos();
	}
}

// Cerrar modal al hacer click fuera del contenido
window.onclick = function(event) {
	if (event.target === modalProducto) {
		modalProducto.style.display = 'none';
	}
};

// Inicializar
cargarProductos();
