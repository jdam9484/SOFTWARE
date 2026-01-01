
// --- Utilidades para simular reclamos en localStorage ---
const STORAGE_KEY = 'reclamos';

function obtenerReclamos() {
	// Simula obtener reclamos desde localStorage
	const reclamos = localStorage.getItem(STORAGE_KEY);
	return reclamos ? JSON.parse(reclamos) : [];
}

function guardarReclamos(reclamos) {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(reclamos));
}

function cambiarEstadoReclamo(idx, nuevoEstado) {
	const reclamos = obtenerReclamos();
	if (reclamos[idx]) {
		reclamos[idx].estado = nuevoEstado;
		reclamos[idx].fecha_resuelto = nuevoEstado === 'resuelto' ? new Date().toLocaleString() : null;
		guardarReclamos(reclamos);
	}
}

// --- Renderizado y gestión ---
function renderizarTabla() {
	const tbody = document.querySelector('#tabla-reclamos tbody');
	const mensajeVacio = document.getElementById('mensaje-vacio');
	let reclamos = obtenerReclamos();

	// Filtros
	const busqueda = document.getElementById('busqueda').value.toLowerCase();
	const filtroTipo = document.getElementById('filtro-tipo').value;
	const filtroEstado = document.getElementById('filtro-estado').value;

	reclamos = reclamos.filter(r => {
		const coincideBusqueda =
			r.nombre.toLowerCase().includes(busqueda) ||
			r.producto.toLowerCase().includes(busqueda) ||
			r.estado.toLowerCase().includes(busqueda);
		const coincideTipo = !filtroTipo || r.tipo === filtroTipo;
		const coincideEstado = !filtroEstado || r.estado === filtroEstado;
		return coincideBusqueda && coincideTipo && coincideEstado;
	});

	tbody.innerHTML = '';
	if (reclamos.length === 0) {
		mensajeVacio.style.display = 'block';
		return;
	} else {
		mensajeVacio.style.display = 'none';
	}

	reclamos.forEach((r, idx) => {
		const tr = document.createElement('tr');
		tr.innerHTML = `
			<td>${r.fecha || ''}</td>
			<td>${r.nombre}</td>
			<td>${r.dni}</td>
			<td>${r.email}</td>
			<td>${r.telefono || ''}</td>
			<td>${r.tipo}</td>
			<td>${r.producto}</td>
			<td>${r.detalle}</td>
			<td>${r.pedido}</td>
			<td><span class="estado-${r.estado}">${r.estado.charAt(0).toUpperCase() + r.estado.slice(1)}</span></td>
			<td>
				${r.estado === 'pendiente' ? `<button class="btn-accion" onclick="resolverReclamo(${idx})">Marcar como resuelto</button>` : `<span style='color:#1bbd36;font-weight:bold;'>✔</span>`}
			</td>
		`;
		tbody.appendChild(tr);
	});
}

function resolverReclamo(idx) {
	cambiarEstadoReclamo(idx, 'resuelto');
	renderizarTabla();
}

// --- Eventos de filtro ---
document.addEventListener('DOMContentLoaded', function() {
	document.getElementById('busqueda').addEventListener('input', renderizarTabla);
	document.getElementById('filtro-tipo').addEventListener('change', renderizarTabla);
	document.getElementById('filtro-estado').addEventListener('change', renderizarTabla);
	// Botón eliminar historial
	const btnEliminar = document.getElementById('btn-eliminar-historial');
	if (btnEliminar) {
		btnEliminar.addEventListener('click', function() {
			if (confirm('¿Estás seguro de eliminar todo el historial de reclamos? Esta acción no se puede deshacer.')) {
				localStorage.removeItem('reclamos');
				renderizarTabla();
			}
		});
	}
	// Botón volver al dashboard
	const btnVolver = document.getElementById('btn-volver-dashboard');
	if (btnVolver) {
		btnVolver.addEventListener('click', function() {
			window.location.href = 'Administrador.html';
		});
	}
	renderizarTabla();
});
