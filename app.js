const API = "https://analisis-y-diseno-de-sistemas-2-backend.onrender.com";
const { jsPDF } = window.jspdf;

async function login() {
    const email = document.getElementById("login_email").value;
    const password = document.getElementById("login_password").value;
    const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });
    if (res.ok) {
        document.getElementById("auth-section").style.display = "none";
        document.getElementById("dashboard").style.display = "block";
        listarDenuncias();
    } else alert("Acceso denegado");
}

async function registrar() {
    const email = document.getElementById("reg_email").value;
    const password = document.getElementById("reg_password").value;
    const res = await fetch(`${API}/registro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });
    if (res.ok) alert("Oficial registrado correctamente");
}

async function enviarDenuncia() {
    const nombre = document.getElementById("den_nombre").value;
    const ci = document.getElementById("den_ci").value;
    const descripcion = document.getElementById("den_desc").value;
    const res = await fetch(`${API}/denuncias`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, ci, descripcion })
    });
    if (res.ok) {
        alert("Caso guardado");
        listarDenuncias();
    }
}

async function listarDenuncias() {
    const res = await fetch(`${API}/denuncias`);
    const datos = await res.json();
    const tabla = document.getElementById("tabla_casos");
    tabla.innerHTML = "";
    datos.forEach(d => {
        tabla.innerHTML += `
            <tr>
                <td>${d[0]}</td>
                <td>${d[1]}</td>
                <td>${d[2]}</td>
                <td>
                    <button class="btn-sm" onclick="emitirCitacion(${d[0]}, '${d[1]}')">Citar</button>
                    <button class="btn-sm btn-danger" onclick="generarOrdenCaptura('${d[1]}', '${d[2]}', '${d[3]}')">Captura</button>
                </td>
            </tr>`;
    });
}

// FUNCIONALIDAD FISCAL: EMITIR CITACIÓN
async function emitirCitacion(id, nombre) {
    const fecha = prompt("Ingrese fecha y hora de la cita (Ej: 30/03/2026 10:00AM):");
    const fiscal = prompt("Nombre del Fiscal de turno:");
    if (!fecha || !fiscal) return;

    const res = await fetch(`${API}/citaciones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ denuncia_id: id, fecha, fiscal })
    });
    if (res.ok) alert(`Citación emitida para ${nombre} el día ${fecha}`);
}

// FUNCIONALIDAD: GENERAR PDF ORDEN DE CAPTURA
function generarOrdenCaptura(nombre, ci, desc) {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text("ORDEN DE APREHENSIÓN - PD-8", 105, 20, null, null, "center");
    
    doc.setFontSize(12);
    doc.text("MINISTERIO PÚBLICO - DISTRITO POLICIAL N° 8", 105, 30, null, null, "center");
    
    doc.text(`Por la presente, se ordena la búsqueda y captura del ciudadano:`, 20, 50);
    doc.setFont(undefined, 'bold');
    doc.text(`NOMBRE: ${nombre}`, 20, 60);
    doc.text(`C.I.: ${ci}`, 20, 70);
    doc.setFont(undefined, 'normal');
    
    doc.text(`MOTIVO DE LA ORDEN:`, 20, 90);
    doc.text(`${desc}`, 20, 100, { maxWidth: 170 });
    
    doc.text(`Firma: ___________________________`, 105, 150, null, null, "center");
    doc.text(`FISCALÍA DE TURNO - PD-8`, 105, 160, null, null, "center");
    
    doc.save(`Orden_Captura_${ci}.pdf`);
}

async function buscarCI() {
    const ci = document.getElementById("search_ci").value;
    const res = await fetch(`${API}/denuncias`);
    const datos = await res.json();
    const filtrado = datos.filter(d => d[2] === ci);
    const tabla = document.getElementById("tabla_casos");
    tabla.innerHTML = "";
    filtrado.forEach(d => {
        tabla.innerHTML += `<tr><td>${d[0]}</td><td>${d[1]}</td><td>${d[2]}</td><td><button class="btn-sm" onclick="emitirCitacion(${d[0]}, '${d[1]}')">Citar</button></td></tr>`;
    });
}

function mostrarRegistro() {
    document.getElementById("reg-card").style.display = "block";
}