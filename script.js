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
        console.log('Leaflet NO está cargado!');
        return false;
    }
    
    if (window.mapaInicializado) {
        return true;
    }
    
    try {
        window.mapaInicializado = true;
        
        // Guadalajara coordinates
        const guadalajara = [20.6736, -103.3438];
        
        // Create map
        window.mapa = L.map('mapa', {
            center: guadalajara,
            zoom: 13,
            zoomControl: true,
            attributionControl: false
        });
        
        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19
        }).addTo(window.mapa);
        
        window.marker = null;
        
        console.log('Mapa creado exitosamente!');
        return true;
        
    } catch(e) {
        console.error('Error creando mapa:', e);
        window.mapaInicializado = false;
        return false;
    }
}
    
    window.mapa.on('click', function(e) {
        if (window.marker) {
            window.marker.setLatLng(e.latlng);
        } else {
            window.marker = L.marker(e.latlng).addTo(window.mapa);
        }
        
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}`)
            .then(response => response.json())
            .then(data => {
                const direccion = data.display_name || `Coords: ${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}`;
                document.getElementById('ubicacion').value = direccion;
                document.getElementById('ubicacion-texto').innerText = direccion;
            })
            .catch(() => {
                const coords = `Coords: ${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}`;
                document.getElementById('ubicacion').value = coords;
                document.getElementById('ubicacion-texto').innerText = coords;
            });
    });


// ======== LÍMITE DE REPORTES ========
const MAX_REPORTES_DIA = 3;

function verificarLimiteReportes() {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (!usuario) return;
    
    const keyReportes = 'reportes_' + usuario.email;
    const reportesHoy = JSON.parse(localStorage.getItem(keyReportes)) || [];
    
    const hoy = new Date().toDateString();
    const reportesDeHoy = reportesHoy.filter(r => new Date(r.fecha).toDateString() === hoy);
    const restantes = MAX_REPORTES_DIA - reportesDeHoy.length;
    
    const msg = document.getElementById('limite-msg');
    const btn = document.getElementById('btn-enviar');
    
    if (!msg || !btn) return;
    
    if (restantes > 0) {
        msg.className = 'limite-msg available';
        msg.textContent = `📊 Te quedan ${restantes} reporte${restantes !== 1 ? 's' : ''} de hoy`;
        btn.disabled = false;
    } else {
        msg.className = 'limite-msg warning';
        msg.textContent = '⚠️ Has alcanzado el límite de reportes hoy';
        btn.disabled = true;
    }
}

function contarReporteCreado() {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (!usuario) return;
    
    const keyReportes = 'reportes_' + usuario.email;
    let reportes = JSON.parse(localStorage.getItem(keyReportes)) || [];
    reportes.push({ fecha: new Date().toISOString() });
    localStorage.setItem(keyReportes, JSON.stringify(reportes));
    verificarLimiteReportes();
}

// ======== CERRAR SESIÓN ========
function cerrarSesion() {
    localStorage.removeItem('usuario');
    window.location.href = 'index.html';
}

// ======== AGREGAR REPORTE ========
function agregarReporte() {
    const descripcion = document.getElementById("descripcion").value.trim();
    const ubicacion = document.getElementById("ubicacion").value;
    const archivo = document.getElementById("imagen").files[0];
    
    // Validar descripción mínima
    if (descripcion.length < 10) {
        alert("Describe el problema con al menos 10 caracteres");
        return;
    }
    
    if (!ubicacion) {
        alert("Selecciona una ubicación en el mapa");
        return;
    }
    
    let ahora = new Date();
    let fechaHora = ahora.toLocaleString('es-MX', { 
        day: '2-digit', month: '2-digit', year: 'numeric', 
        hour: '2-digit', minute: '2-digit' 
    });

    const procesarReporte = (imgData) => {
        let reporte = {
            id: Date.now(),
            descripcion,
            ubicacion,
            fecha: fechaHora,
            imagen: imgData,
            votosUtil: 0,
            votosFalso: 0,
            votantes: {}
        };
        guardarReporte(reporte);
    };

    if (archivo) {
        let reader = new FileReader();
        reader.onload = (e) => procesarReporte(e.target.result);
        reader.readAsDataURL(archivo);
    } else {
        procesarReporte(null);
    }
}

// ======== GUARDAR REPORTE ========
function guardarReporte(reporte) {
    let datos = JSON.parse(localStorage.getItem("reportes")) || [];
    datos.unshift(reporte);
    localStorage.setItem("reportes", JSON.stringify(datos));
    
    document.getElementById("descripcion").value = "";
    document.getElementById("ubicacion").value = "";
    document.getElementById("imagen").value = "";
    document.getElementById('label-text').innerText = "Añadir foto";
    document.getElementById('ubicacion-texto').innerText = "";

    mostrarReportes();
}

// ======== ELIMINAR REPORTE ========
function eliminarReporte(id) {
    if(confirm("¿Seguro que quieres borrar este reporte?")) {
        let datos = JSON.parse(localStorage.getItem("reportes")) || [];
        datos = datos.filter(r => r.id !== id);
        localStorage.setItem("reportes", JSON.stringify(datos));
        mostrarReportes();
    }
}

// ======== VOTAR REPORTE ========
function votarReporte(id, tipo) {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (!usuario) {
        alert("Debes iniciar sesión para votar");
        return;
    }
    
    let datos = JSON.parse(localStorage.getItem("reportes")) || [];
    const reporte = datos.find(r => r.id === id);
    
    if (!reporte) return;
    
    if (!reporte.votantes) reporte.votantes = {};
    
    if (reporte.votantes[usuario.email]) {
        alert("Ya has votado este reporte");
        return;
    }
    
    if (tipo === 'util') {
        reporte.votosUtil = (reporte.votosUtil || 0) + 1;
    } else {
        reporte.votosFalso = (reporte.votosFalso || 0) + 1;
    }
    
    reporte.votantes[usuario.email] = tipo;
    
    // Ocultar si tiene 5+ votos falso
    if (reporte.votosFalso >= 5) {
        reporte.oculto = true;
    }
    
    localStorage.setItem("reportes", JSON.stringify(datos));
    mostrarReportes();
}

// ======== MOSTRAR REPORTES ========
function mostrarReportes() {
    let lista = document.getElementById("listaReportes");
    lista.innerHTML = "";
    let datos = JSON.parse(localStorage.getItem("reportes")) || [];
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const emailUser = usuario ? usuario.email : null;
    
    datos.forEach(r => {
        if (r.oculto) return;
        
        const votosUtil = r.votosUtil || 0;
        const votosFalso = r.votosFalso || 0;
        const misVotos = r.votantes ? r.votantes[emailUser] : null;
        
        let card = document.createElement("div");
        card.className = 'reporte-card';
        if (votosFalso >= 3) card.classList.add('voto-negativo');
        
        card.innerHTML = `
            <button class="btn-eliminar" onclick="eliminarReporte(${r.id})">×</button>
            ${r.imagen ? `<img src="${r.imagen}" class="reporte-img">` : ''}
            <div class="reporte-overlay">
                <p class="reporte-info-overlay">${r.descripcion}</p>
            </div>
            <div class="reporte-info">
                <p class="descripcion-texto"><strong>${r.descripcion}</strong></p>
                <p class="txt-ubicacion">📍 ${r.ubicacion}</p>
                <span class="fecha-txt">${r.fecha}</span>
            </div>
            <div class="votos-container">
                <button class="btn-votar util" onclick="votarReporte(${r.id}, 'util')" ${misVotos === 'util' ? 'disabled' : ''}>
                    👍 <span class="contador-votos">${votosUtil}</span>
                </button>
                <button class="btn-votar falso" onclick="votarReporte(${r.id}, 'falso')" ${misVotos === 'falso' ? 'disabled' : ''}>
                    👎 <span class="contador-votos">${votosFalso}</span>
                </button>
            </div>
        `;
        lista.appendChild(card);
    });
}

// ======== TOGGLE MENÚ ========
function toggleMenu() {
    document.getElementById("headerMenu").classList.toggle("active");
}

// ======== INICIAR SESIÓN ========
function iniciarSesion(e) {
    e.preventDefault();
    let email = document.getElementById("email").value;
    let telefono = document.getElementById("telefono").value;
    
    if (!email || !telefono) {
        alert("Por favor completa todos los campos");
        return;
    }
    
    let usuario = { email, telefono };
    localStorage.setItem("usuario", JSON.stringify(usuario));
    
    window.location.href = "index.html";
}

// ======== REGISTRAR USUARIO ========
function registrarUsuario(e) {
    e.preventDefault();
    let nombre = document.getElementById("nombre").value;
    let nacimiento = document.getElementById("nacimiento").value;
    let curp = document.getElementById("curp").value;
    let email = document.getElementById("email").value;
    let telefono = document.getElementById("telefono").value;
    
    if (!nombre || !email || !telefono) {
        alert("Por favor completa los campos obligatorios");
        return;
    }
    
    // Guardar voluntario
    let voluntario = { nombre, nacimiento, curp, email, telefono };
    localStorage.setItem("voluntario", JSON.stringify(voluntario));
    
    // Auto login
    let usuario = { email, telefono };
    localStorage.setItem("usuario", JSON.stringify(usuario));
    
    alert("¡Te has unido a nuestra causa!");
    window.location.href = "index.html";
}

// ======== INICIALIZAR ========
console.log('UrbeGDL inicializando...');
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM listo, iniciando mapa...');
    
    // Force init - Initialize map immediately
    setTimeout(function() {
        try {
            if (!window.mapaInicializado) {
                console.log('Forzando inicialización del mapa...');
                iniciarMapa();
            }
        } catch(e) {
            console.error('Error al iniciar mapa:', e);
        }
        
        mostrarReportes();
    }, 500);
    
    // Also try after images load
    window.addEventListener('load', function() {
        setTimeout(function() {
            if (!window.mapaInicializado) {
                console.log('Iniciando mapa en load...');
                iniciarMapa();
            }
        }, 500);
    });
});