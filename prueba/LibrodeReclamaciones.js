// Lógica para el formulario del Libro de Reclamaciones
document.addEventListener('DOMContentLoaded', function() {
	const form = document.getElementById('form-reclamacion');
	const mensajeExito = document.getElementById('mensaje-exito');

	if (form) {
		form.addEventListener('submit', function(e) {
			e.preventDefault();

			// Validación extra de campos (DNI y teléfono solo números)
			const dni = document.getElementById('dni').value.trim();
			const telefono = document.getElementById('telefono').value.trim();
			const dniValido = /^\d{8}$/.test(dni);
			const telValido = telefono === '' || /^\d{9}$/.test(telefono);

			if (!dniValido) {
				alert('El DNI debe tener 8 dígitos numéricos.');
				return;
			}
			if (!telValido) {
				alert('El teléfono debe tener 9 dígitos numéricos.');
				return;
			}

			// Guardar reclamo en localStorage para gestión de reclamos
			const nuevoReclamo = {
				fecha: new Date().toLocaleString(),
				nombre: document.getElementById('nombre').value.trim(),
				dni: dni,
				email: document.getElementById('email').value.trim(),
				telefono: telefono,
				tipo: document.getElementById('tipo').value,
				producto: document.getElementById('producto').value.trim(),
				detalle: document.getElementById('detalle').value.trim(),
				pedido: document.getElementById('pedido').value.trim(),
				estado: 'pendiente'
			};
			let reclamos = [];
			try {
				reclamos = JSON.parse(localStorage.getItem('reclamos')) || [];
			} catch (e) { reclamos = []; }
			reclamos.push(nuevoReclamo);
			localStorage.setItem('reclamos', JSON.stringify(reclamos));

			form.reset();
			mensajeExito.style.display = 'block';
			setTimeout(() => {
				mensajeExito.style.display = 'none';
			}, 3500);
		});
	}
});
