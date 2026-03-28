const API = "https://analisis-y-diseno-de-sistemas-2-backend.onrender.com";
const { jsPDF } = window.jspdf;

async function login() {
    const email = document.getElementById("login_email").value.trim().toLowerCase();
    const password = document.getElementById("login_password").value;

    try {
        const res = await fetch(`${API}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok) {
            alert("¡LOGIN EXITOSO!");
            document.getElementById("auth-section").style.display = "none";
            document.getElementById("dashboard-section").style.display = "block";
            listarDenuncias();
        } else {
            alert("Error: " + data.detail);
        }
    } catch (e) { alert("Error de conexión"); }
}

async function registrar() {
    const email = document.getElementById("reg_email").value.trim().toLowerCase();
    const password = document.getElementById("reg_password").value;
    try {
        const res = await fetch(`${API}/registro`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        if (res.ok) alert("Oficial registrado. Ya puede ingresar.");
        else alert("El usuario ya existe.");
    } catch (e) { alert("Error de conexión"); }
}

async function crearDenuncia() {
    const nombre = document.getElementById("den_nombre").value;
    const ci = document.getElementById("den_ci").value;
    const descripcion = document.getElementById("den_desc").value;

    try {
        const res = await fetch(`${API}/denuncias`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre, ci, descripcion })
        });
        if (res.ok) {
            alert("Denuncia registrada");
            listarDenuncias();
            document.getElementById("den_nombre").value = "";
            document.getElementById("den_ci").value = "";
            document.getElementById("den_desc").value = "";
        }
    } catch (e) { alert("Error al registrar"); }
}

async function listarDenuncias() {
    try {
        const res = await fetch(`${API}/denuncias`);
        const datos = await res.json();
        const tbody = document.getElementById("lista_denuncias");
        tbody.innerHTML = "";
        datos.forEach(d => {
            tbody.innerHTML += `
                <tr>
                    <td>${d[1]}</td>
                    <td>${d[2]}</td>
                    <td>
                        <button class="btn-sm" onclick="emitirCitacion(${d[0]}, '${d[1]}')">Citar</button>
                        <button class="btn-sm btn-danger" onclick="generarPDF('${d[1]}','${d[2]}','${d[3]}')">PDF Captura</button>
                    </td>
                </tr>`;
        });
    } catch (e) { console.error(e); }
}

function generarPDF(nombre, ci, desc) {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("ORDEN DE APREHENSIÓN - POLICÍA PD-8", 105, 20, null, null, "center");
    doc.setFontSize(12);
    doc.text(`SUJETO: ${nombre}`, 20, 40);
    doc.text(`C.I.: ${ci}`, 20, 50);
    doc.text(`HECHOS: ${desc}`, 20, 60, { maxWidth: 170 });
    doc.text("FIRMA FISCALÍA:", 20, 100);
    doc.save(`Orden_${ci}.pdf`);
}

async function emitirCitacion(id, nombre) {
    const fecha = prompt("Fecha de la cita:");
    const fiscal = prompt("Nombre del Fiscal:");
    if(!fecha || !fiscal) return;
    const res = await fetch(`${API}/citaciones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ denuncia_id: id, fecha, fiscal })
    });
    if(res.ok) alert("Citación emitida para " + nombre);
}