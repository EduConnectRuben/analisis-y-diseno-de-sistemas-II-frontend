const API = "https://analisis-y-diseno-de-sistemas-2-backend.onrender.com";
const { jsPDF } = window.jspdf;

async function login() {
    const email = document.getElementById("login_email").value.trim().toLowerCase();
    const password = document.getElementById("login_password").value;
    try {
        const res = await fetch(`${API}/login`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({email, password})
        });
        const data = await res.json();
        if (res.ok) {
            document.getElementById("auth-section").style.display = "none";
            document.getElementById("dashboard").style.display = "block";
            document.getElementById("user-display").innerText = data.email;
            document.getElementById("rol-display").innerText = data.rol.toUpperCase();

            document.getElementById("view-pendiente").style.display = "none";
            document.getElementById("view-admin").style.display = "none";
            document.getElementById("view-policia").style.display = "none";
            document.getElementById("view-fiscal").style.display = "none";

            if (data.rol === 'admin') {
                document.getElementById("view-admin").style.display = "block";
                document.getElementById("rol-display").className = "badge red";
                cargarAdmin();
            } else if (data.rol === 'policia') {
                document.getElementById("view-policia").style.display = "block";
                document.getElementById("rol-display").className = "badge blue";
            } else if (data.rol === 'fiscal') {
                document.getElementById("view-fiscal").style.display = "block";
                document.getElementById("rol-display").className = "badge gold";
                cargarFiscalia();
            } else {
                document.getElementById("view-pendiente").style.display = "block";
            }
        } else {
            alert("Credenciales incorrectas");
        }
    } catch(e) {
        alert("Error de conexión con el servidor");
    }
}

async function registrar() {
    const email = document.getElementById("reg_email").value;
    const password = document.getElementById("reg_password").value;
    if(!email || !password) return alert("Complete los datos");
    try {
        const res = await fetch(`${API}/registro`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({email, password})
        });
        const data = await res.json();
        alert(data.mensaje || data.detail);
    } catch(e) {
        alert("Error al solicitar registro");
    }
}

async function cargarAdmin() {
    try {
        const res = await fetch(`${API}/admin/usuarios`);
        const users = await res.json();
        const tbody = document.getElementById("lista-admin");
        tbody.innerHTML = "";
        users.forEach(u => {
            tbody.innerHTML += `<tr>
                <td>${u[1]}</td><td><span class="badge gray">${u[2]}</span></td>
                <td>
                    <button onclick="asignar(${u[0]},'policia')" class="btn-sm btn-primary">Policía</button>
                    <button onclick="asignar(${u[0]},'fiscal')" class="btn-sm gold" style="color:white">Fiscal</button>
                </td>
            </tr>`;
        });
    } catch (e) { console.error(e); }
}

async function asignar(id, rol) {
    await fetch(`${API}/admin/asignar_rol`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({user_id: id, nuevo_rol: rol})
    });
    alert("CARGO ASIGNADO");
    cargarAdmin();
}

async function crearDenuncia() {
    const nombre = document.getElementById("den_nombre").value;
    const ci = document.getElementById("den_ci").value;
    const desc = document.getElementById("den_desc").value;
    if(!nombre || !ci) return alert("Llene los datos");

    await fetch(`${API}/denuncias`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({nombre, ci, descripcion: desc})
    });
    
    descargarPDFDenuncia(nombre, ci, desc);
}

function descargarPDFDenuncia(nombre, ci, hecho) {
    const doc = new jsPDF();
    const img = new Image(); img.src = 'denuncia.png';
    img.onload = () => {
        doc.addImage(img, 'PNG', 10, 10, 30, 30);
        doc.setFontSize(18); doc.text("ACTA DE DENUNCIA POLICIAL", 105, 25, null, null, "center");
        doc.setFontSize(12); doc.text(`SUJETO: ${nombre}`, 20, 50);
        doc.text(`C.I.: ${ci}`, 20, 60);
        doc.text("RELATO DE HECHOS:", 20, 75);
        doc.setFontSize(10); doc.text(hecho, 20, 85, {maxWidth: 170});
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=DENUNCIA-${ci}`;
        const qrImg = new Image(); qrImg.src = qrUrl;
        qrImg.onload = () => {
            doc.addImage(qrImg, 'PNG', 160, 10, 35, 35);
            doc.save(`Denuncia_${ci}.pdf`);
        };
    };
}

async function cargarFiscalia() {
    const res = await fetch(`${API}/denuncias`);
    const datos = await res.json();
    const tbody = document.getElementById("lista-fiscal");
    tbody.innerHTML = "";
    datos.forEach(d => {
        tbody.innerHTML += `<tr><td>${d[1]}</td><td>${d[2]}</td><td><button onclick="abrirCita(${d[0]},'${d[1]}')" class="btn-sm gold" style="color:white">Citar</button></td></tr>`;
    });
}

function abrirCita(id, nombre) {
    document.getElementById("modal_id").value = id;
    document.getElementById("modal_nombre").value = nombre;
    document.getElementById("modal-citacion").style.display = "block";
}

function generarCitacionPDF() {
    const nombre = document.getElementById("modal_nombre").value;
    const fecha = documen