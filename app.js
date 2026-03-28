const API = "https://analisis-y-diseno-de-sistemas-2-backend.onrender.com";
const { jsPDF } = window.jspdf;

async function registrar() {
    const email = document.getElementById("reg_email").value.trim().toLowerCase();
    const password = document.getElementById("reg_password").value;
    if(!email || !password) return alert("Complete los datos");
    
    try {
        const res = await fetch(`${API}/registro`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({email, password})
        });
        if(res.ok) alert("Registrado con éxito. Ahora ingrese.");
        else alert("Error: El usuario ya existe");
    } catch(e) { alert("Error de conexión"); }
}

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
            alert("¡LOGIN EXITOSO!");
            document.getElementById("auth-section").style.display = "none";
            document.getElementById("dashboard").style.display = "block";
            listarDenuncias();
        } else {
            alert("Usuario o clave incorrecta");
        }
    } catch(e) { alert("Error de conexión"); }
}

async function crearDenuncia() {
    const nombre = document.getElementById("den_nombre").value;
    const ci = document.getElementById("den_ci").value;
    const descripcion = document.getElementById("den_desc").value;

    const res = await fetch(`${API}/denuncias`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({nombre, ci, descripcion})
    });
    if(res.ok) {
        alert("Denuncia enviada");
        listarDenuncias();
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
                <td>${d[1]}</td>
                <td>${d[2]}</td>
                <td>
                    <button class="btn-sm" onclick="emitirCitacion(${d[0]}, '${d[1]}')">Citar</button>
                    <button class="btn-sm btn-danger" onclick="descargarPDF('${d[1]}','${d[2]}','${d[3]}')">Captura</button>
                </td>
            </tr>`;
    });
}

function descargarPDF(nombre, ci, hecho) {
    const doc = new jsPDF();
    doc.text("ORDEN DE CAPTURA - DISTRITO PD8", 105, 20, null, null, "center");
    doc.text(`NOMBRE: ${nombre}`, 20, 40);
    doc.text(`CI: ${ci}`, 20, 50);
    doc.text(`HECHO: ${hecho}`, 20, 60);
    doc.save(`Orden_${ci}.pdf`);
}

async function emitirCitacion(id, nombre) {
    const fecha = prompt("Fecha de cita:");
    const fiscal = prompt("Nombre Fiscal:");
    await fetch(`${API}/citaciones`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({denuncia_id: id, fecha, fiscal})
    });
    alert("Citación emitida para " + nombre);
}