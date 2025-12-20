// utils-excel.js
// Utilidad para exportar datos a Excel (XLSX)

// Cargar SheetJS desde CDN si no existe
definirSheetJS();
function definirSheetJS() {
    if (!window.XLSX) {
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
        script.onload = function() { window.XLSX_CARGADO = true; };
        document.head.appendChild(script);
    }
}

function exportarVentasAExcel(ventas) {
    if (!window.XLSX) {
        alert('Cargando librería Excel, intenta de nuevo en unos segundos...');
        return;
    }
    // Preparar datos
    const data = ventas.map((v, i) => {
        let productos = '';
        if (v.items && Array.isArray(v.items)) {
            productos = v.items.map(item => `${item.titulo || item.producto || item.nombre || '-'} (x${item.cantidad || 1})`).join(', ');
        } else {
            productos = v.producto || '-';
        }
        return {
            '#': i + 1,
            'Usuario': v.usuario || '-',
            'Email': v.email || '-',
            'Fecha': v.fecha || '-',
            'Productos': productos,
            'Total (S/)': v.total || 0,
            'Método de pago': v.metodo || '-'
        };
    });
    // Crear hoja y libro
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ventas');
    // Descargar
    XLSX.writeFile(wb, 'ventas.xlsx');
}
