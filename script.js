function actualizarNombreArchivo() {
    const input = document.getElementById('imagen');
    const label = document.getElementById('label-text');
    if (input.files.length > 0) label.innerText = "Foto cargada";
}

function agregarReporte() {
    let descripcion = document.getElementById("descripcion").value;
    let ubicacion = document.getElementById("ubicacion").value;
    let archivo = document.getElementById("imagen").files[0];
    
    // Obtener fecha y hora actual
    let ahora = new Date();
    let fechaHora = ahora.toLocaleString('es-MX', { 
        day: '2-digit', month: '2-digit', year: 'numeric', 
        hour: '2-digit', minute: '2-digit' 
    });

    if (!descripcion || !ubicacion) {
        alert("Rellena los campos obligatorios.");
        return;
    }

    const procesarReporte = (imgData) => {
        let reporte = {
            id: Date.now(), // ID único para poder eliminarlo después
            descripcion,
            ubicacion,
            fecha: fechaHora,
            imagen: imgData
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

function guardarReporte(reporte) {
    let datos = JSON.parse(localStorage.getItem("reportes")) || [];
    datos.unshift(reporte);
    localStorage.setItem("reportes", JSON.stringify(datos));
    
    // Resetear formulario
    document.getElementById("descripcion").value = "";
    document.getElementById("ubicacion").value = "";
    document.getElementById("imagen").value = "";
    document.getElementById('label-text').innerText = "Añadir foto";

mostrarReportes();

function toggleMenu() {
    document.getElementById("headerMenu").classList.toggle("active");
}
}

function eliminarReporte(id) {
    if(confirm("¿Seguro que quieres borrar este reporte?")) {
        let datos = JSON.parse(localStorage.getItem("reportes")) || [];
        datos = datos.filter(r => r.id !== id);
        localStorage.setItem("reportes", JSON.stringify(datos));
mostrarReportes();

function iniciarSesion(e) {
    e.preventDefault();
    let email = document.getElementById("email").value;
    let telefono = document.getElementById("telefono").value;
    
    let usuario = { email, telefono };
    localStorage.setItem("usuario", JSON.stringify(usuario));
    
    window.location.href = "index.html";
}

function registrarUsuario(e) {
    e.preventDefault();
    let nombre = document.getElementById("nombre").value;
    let nacimiento = document.getElementById("nacimiento").value;
    let curp = document.getElementById("curp").value;
    let email = document.getElementById("email").value;
    let telefono = document.getElementById("telefono").value;
    
    let voluntario = { nombre, nacimiento, curp, email, telefono };
    localStorage.setItem("voluntario", JSON.stringify(voluntario));
    
    alert("¡Te has unido a nuestra causa!");
    window.location.href = "index.html";
}
    }
}

function mostrarReportes() {
    let lista = document.getElementById("listaReportes");
    lista.innerHTML = "";
    let datos = JSON.parse(localStorage.getItem("reportes")) || [];

    datos.forEach(r => {
        let card = document.createElement("div");
        card.className = "reporte-card";

        card.innerHTML = `
            <button class="btn-eliminar" onclick="eliminarReporte(${r.id})">×</button>
            <div class="reporte-info">
                <p><strong>${r.descripcion}</strong></p>
                <p class="txt-ubicacion">${r.ubicacion}</p>
                <span class="fecha-txt">${r.fecha}</span>
            </div>
            ${r.imagen ? `<img src="${r.imagen}" class="reporte-img">` : ''}
        `;
        lista.appendChild(card);
    });
}

mostrarReportes();

