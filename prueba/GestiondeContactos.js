// GestiondeContactos.js
// Módulo para visualizar y gestionar mensajes de contacto en el panel admin

document.addEventListener('DOMContentLoaded', function() {
    const db = firebase.firestore();
    const lista = document.getElementById('contactos-lista');
    const detalle = document.getElementById('detalle-contacto');

    async function cargarContactos() {
        lista.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#aaa;">Cargando mensajes...</td></tr>';
        const snap = await db.collection('contacto').orderBy('fecha', 'desc').get();
        if (snap.empty) {
            lista.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#aaa;">Sin mensajes</td></tr>';
            return;
        }
        lista.innerHTML = '';
        snap.forEach(doc => {
            const c = doc.data();
            const fecha = c.fecha ? new Date(c.fecha).toLocaleString() : '-';
            lista.innerHTML += `
                <tr>
                    <td>${c.nombre}</td>
                    <td>${c.email}</td>
                    <td title="${c.mensaje}">${c.mensaje.length > 30 ? c.mensaje.slice(0,30)+'...' : c.mensaje}</td>
                    <td>${fecha}</td>
                    <td>
                        <button class="btn-ver" data-id="${doc.id}">Ver</button>
                        <button class="btn-eliminar" data-id="${doc.id}">Eliminar</button>
                    </td>
                </tr>
            `;
        });
        document.querySelectorAll('.btn-ver').forEach(btn => {
            btn.onclick = () => mostrarDetalle(btn.dataset.id);
        });
        document.querySelectorAll('.btn-eliminar').forEach(btn => {
            btn.onclick = () => eliminarContacto(btn.dataset.id);
        });
    }

    async function mostrarDetalle(id) {
        const doc = await db.collection('contacto').doc(id).get();
        if (!doc.exists) return;
        const c = doc.data();
        detalle.innerHTML = `
            <h3>Detalle del Mensaje</h3>
            <p><strong>Nombre:</strong> ${c.nombre}</p>
            <p><strong>Email:</strong> ${c.email}</p>
            <p><strong>Mensaje:</strong><br>${c.mensaje}</p>
            <p><strong>Fecha:</strong> ${c.fecha ? new Date(c.fecha).toLocaleString() : '-'}</p>
            <button onclick="this.parentNode.style.display='none'" style="margin-top:10px; background:#900C3F; color:#fff; border:none; border-radius:6px; padding:8px 18px; cursor:pointer;">Cerrar</button>
        `;
        detalle.style.display = 'block';
    }

    async function eliminarContacto(id) {
        if (confirm('¿Eliminar este mensaje de contacto?')) {
            await db.collection('contacto').doc(id).delete();
            cargarContactos();
            detalle.style.display = 'none';
        }
    }

    cargarContactos();
});
