// Administrador.js
// Lógica de acceso y panel para el administrador

// Inicialización de Firebase
const auth = firebase.auth();
const db = firebase.firestore();

const adminPanel = document.getElementById('admin-panel');
const deniedDiv = document.getElementById('denied');
const adminContent = document.getElementById('admin-content');


// Verificar autenticación y rol
function checkAdmin() {
    auth.onAuthStateChanged(async (user) => {
        if (!user) {
            adminPanel.style.display = 'none';
            deniedDiv.style.display = 'block';
            return;
        }
        // Consultar Firestore para obtener el rol
        const userDoc = await db.collection('user').doc(user.uid).get();
        if (userDoc.exists && userDoc.data().rol === 'Administrador') {
            adminPanel.style.display = 'block';
            deniedDiv.style.display = 'none';
            // Asignar eventos a los botones de la barra lateral (solo cuando el panel está visible)
            var btnGestion = document.getElementById('btn-gestion-productos');
            if (btnGestion) {
                btnGestion.onclick = function() {
                    window.location.href = 'GestiondeProductos.html';
                };
            }
            var btnUsuarios = document.getElementById('btn-gestion-usuarios');
            if (btnUsuarios) {
                btnUsuarios.onclick = function() {
                    window.location.href = 'GestiondeUsuarios.html';
                };
            }
            var btnReportes = document.getElementById('btn-reportes-basicos');
            if (btnReportes) {
                btnReportes.onclick = function() {
                    window.location.href = 'ReportesBasicos.html';
                };
            }
            loadAdminDashboard();
        } else {
            adminPanel.style.display = 'none';
            deniedDiv.style.display = 'block';
        }
    });
}



// Cargar datos del dashboard tipo admin
async function loadAdminDashboard() {
    // Total usuarios
    // Intentar ordenar por fechaRegistro, si no existe, ordenar por nombre
    let usuarios = [];
    try {
        const usersSnap = await db.collection('user').orderBy('fechaRegistro', 'desc').get();
        usuarios = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Si todos los usuarios no tienen fechaRegistro, volver a ordenar por nombre
        if (usuarios.every(u => !u.fechaRegistro)) {
            const snapNombre = await db.collection('user').orderBy('nombre').get();
            usuarios = snapNombre.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
    } catch {
        // Si falla el orden por fechaRegistro, usar nombre
        const snapNombre = await db.collection('user').orderBy('nombre').get();
        usuarios = snapNombre.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    const totalUsuarios = usuarios.length;
    document.getElementById('total-usuarios').textContent = totalUsuarios;

    // Escuchar cambios de totalUsuarios desde otros módulos (por ejemplo, Gestión de Usuarios)
    window.addEventListener('storage', function(e) {
        if (e.key === 'totalUsuarios') {
            document.getElementById('total-usuarios').textContent = e.newValue || '0';
        }
    });
    // Si ya hay un valor en localStorage, actualizarlo al cargar
    if (localStorage.getItem('totalUsuarios')) {
        document.getElementById('total-usuarios').textContent = localStorage.getItem('totalUsuarios');
    }

    // Mostrar usuarios recientes (máx 6)
    const tbodyUsuarios = document.querySelector('#tabla-usuarios tbody');
    tbodyUsuarios.innerHTML = '';
    usuarios.slice(0, 6).forEach(u => {
        const badgeClass = u.rol === 'Administrador' ? 'role-admin' : 'role-cliente';
        tbodyUsuarios.innerHTML += `
            <tr>
                <td><div style="font-weight:600">${u.nombre || '-'}</div></td>
                <td>${u.email || '-'}</td>
                <td><span class="role-badge ${badgeClass}">${u.rol || '-'}</span></td>
            </tr>`;
    });
    if (usuarios.length === 0) {
        tbodyUsuarios.innerHTML = '<tr><td colspan="3" style="text-align:center; color:#aaa;">Sin usuarios</td></tr>';
    }

    // Total ventas y registro de ventas
    let totalVentas = 0;
    let totalIngresos = 0;
    let ventas = [];
    try {
        const ventasSnap = await db.collection('ventas').orderBy('fecha', 'desc').get();
        ventas = ventasSnap.docs.map(doc => doc.data());
        // Total de productos vendidos (suma cantidades de items)
        totalVentas = ventas.reduce((acc, v) => acc + (v.items ? v.items.reduce((s, i) => s + (i.cantidad || 0), 0) : 1), 0);
        // Total de ingresos
        totalIngresos = ventas.reduce((sum, v) => sum + (v.total || 0), 0);
    } catch (e) {
        // Si no existe la colección, dejar en 0
    }
    document.getElementById('total-ventas').textContent = totalVentas;
    document.getElementById('total-ingresos').textContent = `S/ ${totalIngresos.toFixed(2)}`;

    // Mostrar registro de ventas (máx 6)
    const tbodyVentas = document.querySelector('#tabla-ventas tbody');
    tbodyVentas.innerHTML = '';
    ventas.slice(0, 6).forEach(v => {
        let resumen = '';
        if (v.items && Array.isArray(v.items)) {
            v.items.forEach(item => {
                resumen += `<div>• ${item.titulo || item.producto || '-'} (x${item.cantidad || 1})</div>`;
            });
        } else {
            resumen = v.producto || '-';
        }
        tbodyVentas.innerHTML += `
            <tr>
                <td><strong>${v.usuario || '-'}</strong><br><small style="color:#888">${v.fecha || ''}</small></td>
                <td style="font-size:13px">${resumen}</td>
                <td style="color:#27ae60; font-weight:bold">S/ ${v.total ? v.total.toFixed(2) : '0.00'}</td>
            </tr>`;
    });
    if (ventas.length === 0) {
        tbodyVentas.innerHTML = '<tr><td colspan="3" style="text-align:center; color:#aaa;">Sin ventas</td></tr>';
    }
}


// Sidebar logout
const logoutBtn = document.getElementById('logout-admin');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        auth.signOut().then(() => {
            window.location.href = 'index.html';
        });
    });
}

// Iniciar verificación al cargar
checkAdmin();
