const API = "https://analisis-y-diseno-de-sistemas-2-backend.onrender.com";
const { jsPDF } = window.jspdf;

// Auxiliar para cargar imágenes en el PDF
const getImgBase64 = (url) => {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = url;
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
    });
};

async function login() {
    const email = document.getElementById("login_email").value.trim().toLowerCase();
    const password = document.getElementById("login_password").value;
    try {
        const res = await fetch(`${API}/login`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({email, password})
        });
        if(res.ok) {
            document.getElementById("auth-section").style.display = "none";
            document.getElementById("dashboard").style.display = "block";
            listarDenuncias();
        } else alert("Credenciales Incorrectas");
    } catch(e) { alert("Error de servidor"); }
}

async function registrar() {
    const email = document.getElementById("reg_email").value.trim().toLowerCase();
    const password = document.getElementById("reg_password").value;
    await fetch(`${API}/registro`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({email, password})
    });
    alert("Oficial Registrado");
}

// FUNCION SARGENTO: CREAR DENUNCIA
async function crearDenuncia() {
    const nombre = document.getElementById("den_nombre").value;
    const ci = document.getElementById("den_ci").value;
    const desc = document.getElementById("den_desc").value;

    if(!nombre || !ci || !desc) return alert("Complete los datos");

    const res = await fetch(`${API}/denuncias`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({nombre, ci, descripcion: desc})
    });

    if(res.ok) {
        alert("Denuncia Registrada en Sistema");
        descargarDenunciaPDF(nombre, ci, desc); // El sargento descarga la denuncia
        listarDenuncias();
        document.getElementById("den_nombre").value = "";
        document.getElementById("den_ci").value = "";
        document.getElementById("den_desc").value = "";
    }
}

async function listarDenuncias() {
    const res = await fetch(`${API}/denuncias`);
    const datos = await res.json();
    const tabla = document.getElementById("tabla_denuncias");
    tabla.innerHTML = "";
    datos.forEach(d => {
        tabla.innerHTML += `
            <tr>
                <td><b>${d[1]}</b></td>
                <td>${d[2]}</td>
                <td>
                    <button class="btn-sm btn-citacion" onclick="abrirCitacion(${d[0]}, '${d[1]}')">Emitir Citación</button>
                    <button class="btn-sm btn-danger" onclick="descargarCapturaPDF('${d[1]}', '${d[2]}', '${d[3]}')">Mandamiento Captura</button>
                </td>
            </tr>`;
    });
}

// FUNCIONES DE PDF CON IMÁGENES
async function descargarDenunciaPDF(nombre, ci, hecho) {
    const doc = new jsPDF();
    const img = await getImgBase64('denuncia.png');
    if(img) doc.addImage(img, 'PNG', 10, 10, 35, 35);

    doc.setFontSize(18);
    doc.text("ACTA DE REGISTRO DE DENUNCIA", 105, 30, null, null, "center");
    doc.setFontSize(10);
    doc.text("POLICÍA NACIONAL DE BOLIVIA - DP-8", 105, 38, null, null, "center");
    
    doc.setFontSize(12);
    doc.text(`SUJETO DENUNCIADO: ${nombre}`, 20, 60);
    doc.text(`C.I.: ${ci}`, 20, 70);
    doc.text("RELATO DEL HECHO:", 20, 85);
    doc.text(hecho, 20, 95, {maxWidth: 170});
    
    doc.text("__________________________", 105, 160, null, null, "center");
    doc.text("SARGENTO DE TURNO - PD8", 105, 168, null, null, "center");
    doc.save(`Denuncia_${ci}.pdf`);
}

async function descargarCapturaPDF(nombre, ci, hecho) {
    const doc = new jsPDF();
    const img = await getImgBase64('denuncia.png');
    if(img) doc.addImage(img, 'PNG', 85, 10, 40, 40);

    doc.setFontSize(22);
    doc.setTextColor(150, 0, 0);
    doc.text("MANDAMIENTO DE APREHENSIÓN", 105, 65, null, null, "center");
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text(`ORDEN CONTRA: ${nombre}`, 20, 90);
    doc.text(`CÉDULA IDENTIDAD: ${ci}`, 20, 100);
    doc.text(`DELITO IMPUTADO: ${hecho}`, 20, 115, {maxWidth: 170});
    
    doc.setFontSize(10);
    doc.text("DE CUMPLIMIENTO OBLIGATORIO POR CUALQUIER OFICIAL", 105, 150, null, null, "center");
    doc.save(`Captura_${ci}.pdf`);
}

// FUNCIONES FISCAL: CITACIÓN
function abrirCitacion(id, nombre) {
    document.getElementById("modal_id").value = id;
    document.getElementById("modal_nombre").value = nombre;
    document.getElementById("modal-citacion").style.display = "block";
}

function cerrarModal() { document.getElementById("modal-citacion").style.display = "none"; }

async function guardarCitacion() {
    const id = document.getElementById("modal_id").value;
    const nombre = document.getElementById("modal_nombre").value;
    const fechaRaw = document.getElementById("modal_fecha").value;
    const fiscal = document.getElementById("modal_fiscal").value;

    if(!fechaRaw || !fiscal) return alert("Llene los datos");

    const fecha = new Date(fechaRaw).toLocaleString();

    await fetch(`${API}/citaciones`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({denuncia_id: parseInt(id), fecha, fiscal})
    });

    // GENERAR PDF DE CITACIÓN
    const doc = new jsPDF();
    const img = await getImgBase64('citacion.png');
    if(img) doc.addImage(img, 'PNG', 160, 10, 35, 35);

    doc.setFontSize(18);
    doc.text("ORDEN DE CITACIÓN FISCAL", 105, 30, null, null, "center");
    doc.setFontSize(12);
    doc.text(`POR LA PRESENTE SE CITA A: ${nombre}`, 20, 55);
    doc.text(`FECHA Y HORA: ${fecha}`, 20, 65);
    doc.text(`LUGAR: FISCALÍA DISTRITAL PD-8`, 20, 75);
    doc.text(`FISCAL ASIGNADO: ${fiscal}`, 20, 85);
    
    doc.setFontSize(10);
    doc.text("Bajo advertencia de emitir mandamiento de aprehensión en caso de incomparecencia.", 20, 110, {maxWidth: 170});
    
    doc.save(`Citacion_${nombre}.pdf`);
    cerrarModal();
    alert("Citación Registrada y Documento PDF Generado");
}