// Variables globals
let map, marker;

// ======== INIT MAP ========
window.onload = function() {
    console.log('Init map...');
    initMap();
    mostrarReportes();
};

function initMap() {
    // Check Leaflet
    if (typeof L === 'undefined') {
        console.error('Leaflet no carregat!');
        return;
    }
    
    const mapDiv = document.getElementById('mapa');
    if (!mapDiv) return;
    
    // Create map - Guadalajara
    map = L.map('mapa', {
        center: [20.6736, -103.3438],
        zoom: 13,
        zoomControl: true
    });
    
    // Add tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 18
    }).addTo(map);
    
    console.log('Mapa ready!');
    
    // Click handler
    map.on('click', function(e) {
        if (marker) marker.setLatLng(e.latlng);
        else marker = L.marker(e.latlng).addTo(map);
        
        // Get address
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}`)
            .then(res => res.json())
            .then(data => {
                const addr = data.display_name || `${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}`;
                document.getElementById('ubicacion').value = addr;
                document.getElementById('ubicacion-texto').textContent = addr;
            })
            .catch(() => {
                const c = `${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}`;
                document.getElementById('ubicacion').value = c;
                document.getElementById('ubicacion-texto').textContent = c;
            });
    });
}

// ======== ACTUALIZAR NOMBRE ARCHIVO ========
function actualizarNombreArchivo() {
    const input = document.getElementById('imagen');
    const label = document.getElementById('label-text');
    if (input.files[0]) label.textContent = "✓ Foto carregada";
}

// ======== AGREGAR REPORTE ========
function agregarReporte() {
    const desc = document.getElementById('descripcion').value.trim();
    const ubic = document.getElementById('ubicacion').value;
    const archivo = document.getElementById('imagen').files[0];
    
    if (desc.length < 10) {
        alert('Descriu el problema ( mín. 10 caràcters)');
        return;
    }
    if (!ubic) {
        alert('Selecciona una ubicació al mapa');
        return;
    }
    
    const fecha = new Date().toLocaleString('es-MX');
    
    const save = (img) => {
        let r = { id: Date.now(), descripcion: desc, ubicacion: ubic, fecha: fecha, imagen: img };
        let datos = JSON.parse(localStorage.getItem('reportes')) || [];
        datos.unshift(r);
        localStorage.setItem('reportes', JSON.stringify(datos));
        
        // Reset
        document.getElementById('descripcion').value = '';
        document.getElementById('ubicacion').value = '';
        document.getElementById('ubicacion-texto').textContent = '';
        document.getElementById('imagen').value = '';
        document.getElementById('label-text').textContent = '📷 Añadir foto';
        if (marker) { map.removeLayer(marker); marker = null; }
        
        mostrarReportes();
    };
    
    if (archivo) {
        let reader = new FileReader();
        reader.onload = e => save(e.target.result);
        reader.readAsDataURL(archivo);
    } else {
        save(null);
    }
}

// ======== MOSTRAR REPORTES ========
function mostrarReportes() {
    const lista = document.getElementById('listaReportes');
    lista.innerHTML = '';
    let datos = JSON.parse(localStorage.getItem('reportes')) || [];
    
    datos.forEach(r => {
        let card = document.createElement('div');
        card.className = 'reporte-card';
        card.innerHTML = `
            <button class="btn-eliminar" onclick="eliminarReporte(${r.id})">×</button>
            ${r.imagen ? `<img src="${r.imagen}" class="reporte-img">` : ''}
            <div class="reporte-overlay">
                <p class="reporte-info-overlay">${r.descripcion}</p>
            </div>
            <div class="reporte-info">
                <p class="descripcion-texto">${r.descripcion}</p>
                <p class="txt-ubicacion">📍 ${r.ubicacion}</p>
                <span class="fecha-txt">${r.fecha}</span>
            </div>
        `;
        lista.appendChild(card);
    });
}

// ======== ELIMINAR ========
function eliminarReporte(id) {
    if (confirm('Eliminar este reporte?')) {
        let datos = JSON.parse(localStorage.getItem('reportes')) || [];
        datos = datos.filter(r => r.id !== id);
        localStorage.setItem('reportes', JSON.stringify(datos));
        mostrarReportes();
    }
}

// ======== FILTRAR ========
function filtrarReportes() {
    const txt = document.getElementById('buscar').value.toLowerCase();
    document.querySelectorAll('.reporte-card').forEach(card => {
        const desc = card.querySelector('.descripcion-texto')?.textContent.toLowerCase() || '';
        card.style.display = (txt && !desc.includes(txt)) ? 'none' : '';
    });
}

// ======== TOGGLE MENU ========
function toggleMenu() {
    document.getElementById('headerMenu').classList.toggle('active');
}