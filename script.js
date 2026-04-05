

let reportes = [];

function agregarReporte() {
    let descripcion = document.getElementById("descripcion").value;
    let ubicacion = document.getElementById("ubicacion").value;
    let archivo = document.getElementById("imagen").files[0];

   if (archivo) {
        let reader = new FileReader();

        reader.onload = function(e) {
            let imagenBase64 = e.target.result;

            let reporte = {
                descripcion: descripcion,
                ubicacion: ubicacion,
                imagen: imagenBase64
            };

            guardarReporte(reporte);
        };

        reader.readAsDataURL(archivo);
    } else {
        let reporte = {
            descripcion: descripcion,
            ubicacion: ubicacion,
            imagen: null
        };

        guardarReporte(reporte);
    }
}
function guardarReporte(reporte) {
    let datos = JSON.parse(localStorage.getItem("reportes")) || [];

    datos.push(reporte);

    localStorage.setItem("reportes", JSON.stringify(datos));

    mostrarReportes();
}


function mostrarReportes() {
    let lista = document.getElementById("listaReportes");
    lista.innerHTML = "";

    let datos = JSON.parse(localStorage.getItem("reportes")) || [];

    datos.forEach(r => {
        let li = document.createElement("li");

        let texto = document.createElement("p");
        texto.textContent = r.descripcion + " - " + r.ubicacion;

        li.appendChild(texto);

        if (r.imagen) {
            let img = document.createElement("img");
            img.src = r.imagen;
            img.style.width = "200px";
            li.appendChild(img);
        }

        lista.appendChild(li);
    });
}


mostrarReportes();
