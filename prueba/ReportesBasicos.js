// ReportesBasicos.js
// Lógica para mostrar ventas por periodo y productos más vendidos

const db = firebase.firestore();
const filtroPeriodo = document.getElementById('filtro-periodo');
const graficaVentas = document.getElementById('grafica-ventas').getContext('2d');
const listaMasVendidos = document.getElementById('lista-mas-vendidos');
let chart;

// Cargar y graficar ventas
async function cargarReportes() {
	const periodo = filtroPeriodo.value;
	const ventasSnap = await db.collection('ventas').orderBy('fecha', 'desc').get();
	const ventas = ventasSnap.docs.map(doc => doc.data());
	ventasCache = ventas; // Guardar para exportar
	// Agrupar ventas por periodo
	let labels = [], data = [];
	let ventasPorPeriodo = {};
	let formatoLabel = '';
	let now = new Date();
	if (periodo === 'dia') {
		formatoLabel = 'YYYY-MM-DD';
		// Últimos 7 días
		for (let i = 6; i >= 0; i--) {
			let d = new Date(now);
			d.setDate(now.getDate() - i);
			let key = d.toISOString().slice(0, 10);
			ventasPorPeriodo[key] = 0;
			labels.push(key);
		}
		ventas.forEach(v => {
			let fecha = (v.fecha || '').slice(0, 10);
			if (ventasPorPeriodo[fecha] !== undefined) {
				ventasPorPeriodo[fecha] += v.total || 0;
			}
		});
	} else if (periodo === 'semana') {
		formatoLabel = 'YYYY-[sem]WW';
		// Últimas 6 semanas
		for (let i = 5; i >= 0; i--) {
			let d = new Date(now);
			d.setDate(now.getDate() - i * 7);
			let year = d.getFullYear();
			let week = getWeekNumber(d);
			let key = `${year}-S${week}`;
			ventasPorPeriodo[key] = 0;
			labels.push(key);
		}
		ventas.forEach(v => {
			let d = new Date(v.fecha);
			let year = d.getFullYear();
			let week = getWeekNumber(d);
			let key = `${year}-S${week}`;
			if (ventasPorPeriodo[key] !== undefined) {
				ventasPorPeriodo[key] += v.total || 0;
			}
		});
	} else if (periodo === 'mes') {
		formatoLabel = 'YYYY-MM';
		// Últimos 6 meses
		for (let i = 5; i >= 0; i--) {
			let d = new Date(now);
			d.setMonth(now.getMonth() - i);
			let key = d.toISOString().slice(0, 7);
			ventasPorPeriodo[key] = 0;
			labels.push(key);
		}
		ventas.forEach(v => {
			let fecha = (v.fecha || '').slice(0, 7);
			if (ventasPorPeriodo[fecha] !== undefined) {
				ventasPorPeriodo[fecha] += v.total || 0;
			}
		});
	}
	data = labels.map(l => ventasPorPeriodo[l]);
	// Graficar
	if (chart) chart.destroy();
	chart = new Chart(graficaVentas, {
		type: 'line',
		data: {
			labels: labels,
			datasets: [{
				label: 'Ventas (S/)',
				data: data,
				borderColor: '#900C3F',
				backgroundColor: '#900C3F22',
				fill: true,
				tension: 0.3
			}]
		},
		options: {
			responsive: true,
			plugins: {
				legend: { display: false }
			},
			scales: {
				y: { beginAtZero: true }
			}
		}
	});

	// Productos más vendidos
	let productos = {};
	ventas.forEach(v => {
		if (v.items && Array.isArray(v.items)) {
			v.items.forEach(item => {
				let nombre = item.titulo || item.producto || 'Producto';
				productos[nombre] = (productos[nombre] || 0) + (item.cantidad || 1);
			});
		} else if (v.producto) {
			productos[v.producto] = (productos[v.producto] || 0) + 1;
		}
	});
	let top = Object.entries(productos).sort((a, b) => b[1] - a[1]).slice(0, 5);
	listaMasVendidos.innerHTML = '';
	if (top.length === 0) {
		listaMasVendidos.innerHTML = '<li style="color:#aaa;">Sin ventas</li>';
	} else {
		top.forEach(([nombre, cantidad]) => {
			listaMasVendidos.innerHTML += `<li><span>${nombre}</span><span>x${cantidad}</span></li>`;
		});
	}
}

// Cambiar periodo
filtroPeriodo.onchange = cargarReportes;

// Utilidad: obtener número de semana
function getWeekNumber(d) {
	d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
	d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
	var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
	var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1)/7);
	return weekNo;
}

// Inicializar
cargarReportes();

// Botón para descargar ventas y reiniciar ingresos
const panel = document.querySelector('.reportes-panel');
const btnDescargar = document.createElement('button');
btnDescargar.textContent = 'Descargar ventas (Excel) y reiniciar ingresos';
btnDescargar.className = 'btn-descargar-excel';
btnDescargar.style = 'margin:20px 0 0 0; background:#900C3F; color:#fff; border:none; padding:10px 18px; border-radius:8px; font-weight:600; cursor:pointer;';
panel.appendChild(btnDescargar);

let ventasCache = [];

btnDescargar.onclick = async function() {
    // Descargar ventas
    if (ventasCache.length === 0) {
        alert('No hay ventas para exportar.');
        return;
    }
    exportarVentasAExcel(ventasCache);
    // Eliminar todas las ventas de Firestore
    if (confirm('¿Deseas reiniciar los ingresos y borrar todas las ventas? Esta acción no se puede deshacer.')) {
        const ventasSnap = await db.collection('ventas').get();
        const batch = db.batch();
        ventasSnap.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
        // Refrescar reportes
        setTimeout(() => { cargarReportes(); }, 1000);
    }
};
