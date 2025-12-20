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
				<td>
					<select class="select-rol" data-id="${doc.id}">
						<option value="Cliente" ${u.rol === 'Cliente' ? 'selected' : ''}>Cliente</option>
						<option value="Administrador" ${u.rol === 'Administrador' ? 'selected' : ''}>Administrador</option>
					</select>
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
}

// Cambiar rol de usuario
async function cambiarRolUsuario(id, nuevoRol) {
	await db.collection('user').doc(id).update({ rol: nuevoRol });
	cargarUsuarios();
}

// Inicializar
cargarUsuarios();
