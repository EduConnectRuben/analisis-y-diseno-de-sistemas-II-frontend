const API = "https://analisis-y-diseno-de-sistemas-2-backend.onrender.com";
const { jsPDF } = window.jspdf;

// --- LOGIN Y REGISTRO ---
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
            alert("Credenciales incorrectas");
        }
    } catch(e) { alert("Error de conexión"); }
}

async function registrar() {
    const email = document.getElementById("reg_email").value.trim().toLowerCase();
    const password = document.getElementById("reg_password").value;
    try {
        const res = await fetch(`${API}/registro`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({email, password})
        });
        if(res.ok) alert("Oficial registrado correctamente.");
        else alert("El usuario ya existe.");
    } catch(e) { alert("Error de conexión"); }
}

// --- DENUNCIAS ---
async function crearDenuncia() {
    const nombre = document.getElementById("den_nombre").value;
    const ci = document.getElementById("den_ci").value;
    const descripcion = document.getElementById("den_desc").value;

    if(!nombre || !ci || !descripcion) return alert("Complete los datos");

    try {
        const res = await fetch(`${API}/denuncias`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({nombre, ci, descripcion})
        });
        if(res.ok) {
            alert("Denuncia enviada con éxito");
            document.getElementById("den_nombre").value = "";
            document.getElementById("den_ci").value = "";
            document.getElementById("den_desc").value = "";
            listarDenuncias();
        }
    } catch(e) { alert("Error al guardar"); }
}

async function listarDenuncias() {
    try {
        const res = await fetch(`${API}/denuncias`);
        const datos = await res.json();
        const tabla = document.getElementById("tabla_denuncias");
        tabla.innerHTML = "";
        
        if (Array.isArray(datos)) {
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
    } catch(e) { console.error("Error al listar:", e); }
}

// --- MODAL Y CITACIONES ---
function emitirCitacion(id, nombre) {
    document.getElementById("modal_denuncia_id").value = id;
    document.getElementById("modal_nombre").value = nombre;
    document.getElementById("modal-citacion").style.display = "block";
}

function cerrarModal() {
    document.getElementById("modal-citacion").style.display = "none";
}

async function guardarCitacion() {
    const id = document.getElementById("modal_denuncia_id").value;
    const fechaRaw = document.getElementById("modal_fecha").value;
    const fiscal = document.getElementById("modal_fiscal").value;

    if(!fechaRaw || !fiscal) return alert("Llene los datos de la cita");

    const fecha = new Date(fechaRaw).toLocaleString();

    await fetch(`${API}/citaciones`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({denuncia_id: parseInt(id), fecha, fiscal})
    });
    alert("Citación emitida para " + document.getElementById("modal_nombre").value);
    cerrarModal();
}

// --- PDF ---
function descargarPDF(nombre, ci, hecho) {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("ORDEN DE CAPTURA - DISTRITO PD8", 105, 20, null, null, "center");
    doc.setFontSize(12);
    doc.text(`NOMBRE DEL SUJETO: ${nombre}`, 20, 40);
    doc.text(`CI: ${ci}`, 20, 50);
    doc.text(`HECHOS: ${hecho}`, 20, 60, {maxWidth: 170});
    doc.text("------------------------------------------", 20, 100);
    doc.text("FIRMA FISCALÍA DE TURNO", 20, 110);
    doc.save(`Orden_${ci}.pdf`);
}