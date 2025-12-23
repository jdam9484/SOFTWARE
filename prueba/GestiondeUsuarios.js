// GestiondeUsuarios.js
// Lógica para listar usuarios y cambiar rol

const db = firebase.firestore();
const usuariosLista = document.getElementById('usuarios-lista');


// Mostrar usuarios y actualizar total en dashboard
async function cargarUsuarios() {
	usuariosLista.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#aaa;">Cargando usuarios...</td></tr>';
	const snap = await db.collection('user').orderBy('nombre').get();
	if (snap.empty) {
		usuariosLista.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#aaa;">Sin usuarios</td></tr>';
		localStorage.setItem('totalUsuarios', '0');
		return;
	}
	usuariosLista.innerHTML = '';
	let total = 0;
	snap.forEach(doc => {
		total++;
		const u = doc.data();
		// Mostrar el correo correcto (puede ser 'correo' o 'email' según cómo se guardó)
		const correo = u.correo || u.email || '-';
		usuariosLista.innerHTML += `
			<tr>
				<td>${u.nombre || '-'}</td>
				<td>${correo}</td>
				<td>
					<span class="badge-rol ${u.rol === 'Administrador' ? 'admin' : 'cliente'}">${u.rol || '-'}</span>
				</td>
				<td style="display:flex; gap:8px; align-items:center;">
					<select class="select-rol" data-id="${doc.id}">
						<option value="Cliente" ${u.rol === 'Cliente' ? 'selected' : ''}>Cliente</option>
						<option value="Administrador" ${u.rol === 'Administrador' ? 'selected' : ''}>Administrador</option>
					</select>
					<button class="btn-editar-usuario" data-id="${doc.id}" data-nombre="${u.nombre || ''}" data-email="${correo}" data-rol="${u.rol || 'Cliente'}">Editar</button>
				</td>
			</tr>
		`;
	});
	localStorage.setItem('totalUsuarios', total.toString());
	document.querySelectorAll('.select-rol').forEach(sel => {
		sel.onchange = function() {
			cambiarRolUsuario(sel.dataset.id, sel.value);
		};
	});

	// Botones editar usuario
	document.querySelectorAll('.btn-editar-usuario').forEach(btn => {
		btn.onclick = function() {
			abrirModalEditarUsuario({
				id: btn.dataset.id,
				nombre: btn.dataset.nombre,
				email: btn.dataset.email,
				rol: btn.dataset.rol
			});
		};
	});
}

// Cambiar rol de usuario
async function cambiarRolUsuario(id, nuevoRol) {
	await db.collection('user').doc(id).update({ rol: nuevoRol });
	cargarUsuarios();
}

// Inicializar
cargarUsuarios();

// Modal editar usuario
const modalEditar = document.getElementById('modal-editar-usuario');
const cerrarModalBtn = document.getElementById('cerrar-modal-usuario');
const formEditarUsuario = document.getElementById('form-editar-usuario');
const inputId = document.getElementById('edit-usuario-id');
const inputNombre = document.getElementById('edit-usuario-nombre');
const inputEmail = document.getElementById('edit-usuario-email');
const inputRol = document.getElementById('edit-usuario-rol');

function abrirModalEditarUsuario(usuario) {
	inputId.value = usuario.id;
	inputNombre.value = usuario.nombre;
	inputEmail.value = usuario.email;
	inputRol.value = usuario.rol;
	modalEditar.style.display = 'flex';
}

cerrarModalBtn.onclick = function() {
	modalEditar.style.display = 'none';
};

window.onclick = function(event) {
	if (event.target === modalEditar) {
		modalEditar.style.display = 'none';
	}
};

formEditarUsuario.onsubmit = async function(e) {
	e.preventDefault();
	const id = inputId.value;
	const nombre = inputNombre.value.trim();
	const email = inputEmail.value.trim();
	const rol = inputRol.value;
	if (!nombre || !email) return;
	await db.collection('user').doc(id).update({ nombre, correo: email, rol });
	modalEditar.style.display = 'none';
	cargarUsuarios();
};
