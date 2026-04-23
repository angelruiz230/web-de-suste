function actualizarNombreArchivo() {
    const input = document.getElementById('imagen');
    const label = document.getElementById('label-text');
    if (input.files.length > 0) {
        label.innerText = "✅ Imagen lista";
    }
}

function agregarReporte() {
    let descripcion = document.getElementById("descripcion").value;
    let ubicacion = document.getElementById("ubicacion").value;
    let archivo = document.getElementById("imagen").files[0];

    if (!descripcion || !ubicacion) {
        alert("Por favor escribe una descripción y ubicación.");
        return;
    }

    if (archivo) {
        let reader = new FileReader();
        reader.onload = function(e) {
            guardarReporte({
                descripcion,
                ubicacion,
                imagen: e.target.result
            });
        };
        reader.readAsDataURL(archivo);
    } else {
        guardarReporte({ descripcion, ubicacion, imagen: null });
    }
}

function guardarReporte(reporte) {
    let datos = JSON.parse(localStorage.getItem("reportes")) || [];
    datos.unshift(reporte); // Los nuevos aparecen primero
    localStorage.setItem("reportes", JSON.stringify(datos));
    
    // Limpiar campos
    document.getElementById("descripcion").value = "";
    document.getElementById("ubicacion").value = "";
    document.getElementById("imagen").value = "";
    document.getElementById('label-text').innerText = "📸 Toca para subir foto";

    mostrarReportes();
}

function mostrarReportes() {
    let lista = document.getElementById("listaReportes");
    lista.innerHTML = "";
    let datos = JSON.parse(localStorage.getItem("reportes")) || [];

    datos.forEach(r => {
        let card = document.createElement("div");
        card.className = "reporte-card";

        let htmlContent = `
            <div class="reporte-info">
                <p><strong>${r.descripcion}</strong></p>
                <p class="txt-ubicacion">📍 ${r.ubicacion}</p>
            </div>
        `;

        if (r.imagen) {
            htmlContent += `<img src="${r.imagen}" class="reporte-img">`;
        }

        card.innerHTML = htmlContent;
        lista.appendChild(card);
    });
}

// Cargar al iniciar
mostrarReportes();

