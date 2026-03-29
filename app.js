const API = "https://analisis-y-diseno-de-sistemas-2-backend.onrender.com";
const { jsPDF } = window.jspdf;

async function login() {
    const email = document.getElementById("login_email").value.trim().toLowerCase();
    const password = document.getElementById("login_password").value;
    try {
        const res = await fetch(`${API}/login`, {
            method: "POST", headers: {"Content-Type": "application/json"},
            body: JSON.stringify({email, password})
        });
        const data = await res.json();
        if (res.ok) {
            document.getElementById("auth-section").style.display = "none";
            document.getElementById("dashboard").style.display = "block";
            document.getElementById("user-display").innerText = data.email;
            document.getElementById("rol-display").innerText = data.rol.toUpperCase();

            // Limpiar vistas
            document.getElementById("view-pendiente").style.display = "none";
            document.getElementById("view-admin").style.display = "none";
            document.getElementById("view-policia").style.display = "none";
            document.getElementById("view-fiscal").style.display = "none";

            if (data.rol === 'admin') {
                document.getElementById("view-admin").style.display = "block";
                cargarAdmin();
            } else if (data.rol === 'policia') {
                document.getElementById("view-policia").style.display = "block";
                cargarDenunciasPolicia();
            } else if (data.rol === 'fiscal') {
                document.getElementById("view-fiscal").style.display = "block";
                cargarFiscalia();
            } else {
                document.getElementById("view-pendiente").style.display = "block";
            }
        } else alert("Credenciales Incorrectas");
    } catch(e) { alert("Servidor no responde"); }
}

async function registrar() {
    const email = document.getElementById("reg_email").value;
    const password = document.getElementById("reg_password").value;
    const res = await fetch(`${API}/registro`, {
        method: "POST", headers: {"Content-Type": "application/json"},
        body: JSON.stringify({email, password})
    });
    if(res.ok) alert("Solicitud enviada");
    else alert("Usuario ya existe");
}

// ADMIN: CARGAR LISTA
async function cargarAdmin() {
    const res = await fetch(`${API}/admin/usuarios`);
    const users = await res.json();
    const tbody = document.getElementById("lista-admin");
    tbody.innerHTML = "";
    users.forEach(u => {
        tbody.innerHTML += `<tr><td>${u[1]}</td><td><span class="badge">${u[2]}</span></td><td>
            <button onclick="asignar(${u[0]},'policia')" style="background:blue; font-size:10px; width:auto; padding:5px;">Policía</button>
            <button onclick="asignar(${u[0]},'fiscal')" style="background:orange; font-size:10px; width:auto; padding:5px;">Fiscal</button>
        </td></tr>`;
    });
}

async function asignar(id, rol) {
    await fetch(`${API}/admin/asignar?user_id=${id}&rol=${rol}`, {method: "POST"});
    alert("Cargo Actualizado");
    cargarAdmin();
}

// POLICIA: GUARDAR Y PDF
async function procesarDenuncia() {
    const nombre = document.getElementById("den_nombre").value;
    const ci = document.getElementById("den_ci").value;
    const desc = document.getElementById("den_desc").value;
    if(!nombre || !ci) return alert("Faltan datos");

    const res = await fetch(`${API}/denuncias`, {
        method: "POST", headers: {"Content-Type": "application/json"},
        body: JSON.stringify({nombre, ci, descripcion: desc})
    });
    if(res.ok) {
        alert("DENUNCIA GUARDADA");
        cargarDenunciasPolicia();
        generarPDFDenuncia(nombre, ci, desc);
    }
}

async function cargarDenunciasPolicia() {
    const res = await fetch(`${API}/denuncias`);
    const datos = await res.json();
    const tbody = document.getElementById("lista-denuncias-policia");
    tbody.innerHTML = "";
    datos.forEach(d => {
        tbody.innerHTML += `<tr><td>${d[1]}</td><td>${d[2]}</td><td>
            <button onclick="generarPDFDenuncia('${d[1]}','${d[2]}','${d[3]}')" style="background:green; width:auto; padding:5px;">PDF</button>
        </td></tr>`;
    });
}

function generarPDFDenuncia(nombre, ci, hecho) {
    const doc = new jsPDF();
    const img = new Image(); img.src = 'denuncia.png';
    img.onload = () => {
        doc.addImage(img, 'PNG', 85, 10, 35, 35);
        doc.setFont("helvetica", "bold");
        doc.text("ACTA DE DENUNCIA POLICIAL", 105, 55, {align:'center'});
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        let texto = `En la unidad PD-8 se registra la denuncia formal contra el ciudadano(a) ${nombre} con C.I. ${ci}.\n\nRELACIÓN DE HECHOS:\n${hecho}\n\nEste documento tiene validez legal con firma digital QR.`;
        doc.text(texto, 20, 80, {maxWidth: 170, align:'justify'});
        const qr = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=PD8-DEN-${ci}`;
        const qrImg = new Image(); qrImg.src = qr;
        qrImg.onload = () => { doc.addImage(qrImg, 'PNG', 150, 240, 35, 35); doc.save(`Denuncia_${ci}.pdf`); };
    };
}

// FISCALIA
async function cargarFiscalia() {
    const res = await fetch(`${API}/denuncias`);
    const datos = await res.json();
    const tbody = document.getElementById("lista-fiscal");
    tbody.innerHTML = "";
    datos.forEach(d => {
        tbody.innerHTML += `<tr><td>${d[1]}</td><td>${d[2]}</td><td><button onclick="abrirCita(${d[0]},'${d[1]}')" class="btn-blue" style="width:auto; padding:5px;">CITAR</button></td></tr>`;
    });
}

function abrirCita(id, nombre) {
    document.getElementById("modal_id").value = id;
    document.getElementById("modal_nombre").value = nombre;
    document.getElementById("modal-citacion").style.display = "block";
}

function procesarCitacion() {
    const nombre = document.getElementById("modal_nombre").value;
    const nivel = document.getElementById("modal_nivel").value;
    const fecha = document.getElementById("modal_fecha").value;
    const fiscal = document.getElementById("modal_fiscal").value;

    const doc = new jsPDF();
    const img = new Image(); img.src = 'citacion.png';
    img.onload = () => {
        doc.addImage(img, 'PNG', 85, 10, 35, 35);
        doc.setFont("helvetica", "bold");
        doc.text(`ORDEN DE ${nivel.toUpperCase()}`, 105, 55, {align:'center'});
        doc.setFont("helvetica", "normal");
        doc.text(`Se ordena la comparecencia de ${nombre} para el día ${new Date(fecha).toLocaleString()}.\n\nFiscal a cargo: ${fiscal}\n\nAdvertencia: El incumplimiento genera orden de aprehensión.`, 20, 80, {maxWidth:170});
        const qr = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=CITA-${nombre}`;
        const qrImg = new Image(); qrImg.src = qr;
        qrImg.onload = () => { doc.addImage(qrImg, 'PNG', 150, 240, 35, 35); doc.save(`Citacion_${nombre}.pdf`); cerrarModal(); };
    };
}

function cerrarModal() { document.getElementById("modal-citacion").style.display = "none"; }