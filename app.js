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
            document.getElementById("user-display").innerText = "OFICIAL: " + data.email;
            document.getElementById("rol-display").innerText = data.rol.toUpperCase();

            // Reset vistas
            const views = ["view-pendiente", "view-admin", "view-policia", "view-fiscal"];
            views.forEach(v => document.getElementById(v).style.display = "none");

            if (data.rol === 'admin') {
                document.getElementById("view-admin").style.display = "block";
                cargarAdmin();
            } else if (data.rol === 'policia') {
                document.getElementById("view-policia").style.display = "block";
            } else if (data.rol === 'fiscal') {
                document.getElementById("view-fiscal").style.display = "block";
                cargarFiscalia();
            } else {
                document.getElementById("view-pendiente").style.display = "block";
            }
        } else alert("Credenciales incorrectas");
    } catch(e) { alert("Error de conexión"); }
}

async function registrar() {
    const email = document.getElementById("reg_email").value;
    const password = document.getElementById("reg_password").value;
    if(!email) return alert("Ingrese un correo");
    const res = await fetch(`${API}/registro`, {
        method: "POST", headers: {"Content-Type": "application/json"},
        body: JSON.stringify({email, password})
    });
    if(res.ok) alert("Solicitud enviada al Administrador.");
    else alert("Error: El usuario ya existe.");
}

// --- POLICIA: GUARDADO Y PDF ---
async function procesarDenuncia() {
    const nombre = document.getElementById("den_nombre").value;
    const ci = document.getElementById("den_ci").value;
    const desc = document.getElementById("den_desc").value;

    if(!nombre || !ci || !desc) return alert("Llene todos los campos");

    try {
        // 1. Guardar en Base de Datos
        const res = await fetch(`${API}/denuncias`, {
            method: "POST", headers: {"Content-Type": "application/json"},
            body: JSON.stringify({nombre, ci, descripcion: desc})
        });
        
        if(res.ok) {
            alert("CASO REGISTRADO EN EL SISTEMA EXITOSAMENTE");
            // 2. Generar PDF
            generarPDFDenuncia(nombre, ci, desc);
            // Limpiar
            document.getElementById("den_nombre").value = "";
            document.getElementById("den_ci").value = "";
            document.getElementById("den_desc").value = "";
        }
    } catch(e) { alert("Error al guardar en el servidor"); }
}

function generarPDFDenuncia(nombre, ci, hecho) {
    const doc = new jsPDF();
    const img = new Image(); img.src = 'denuncia.png';
    img.onload = () => {
        doc.addImage(img, 'PNG', 85, 10, 35, 35);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.text("ACTA DE REGISTRO DE DENUNCIA", 105, 55, {align: 'center'});
        doc.setFontSize(11);
        doc.text("DISTRITO POLICIAL N° 8 - EL ALTO, BOLIVIA", 105, 62, {align: 'center'});
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        let cuerpo = `Mediante la presente acta, el Sargento de turno registra la denuncia formal contra el ciudadano(a) ${nombre}, identificado con C.I. ${ci}.\n\nRELACIÓN CIRCUNSTANCIAL DE LOS HECHOS:\n${hecho}\n\nEn fe de lo cual, se eleva el presente documento para el inicio de la investigación fiscal correspondiente.`;
        doc.text(cuerpo, 20, 85, {maxWidth: 170, align: 'justify'});

        const qr = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=DENUNCIA-PD8-${ci}`;
        const qrImg = new Image(); qrImg.src = qr;
        qrImg.onload = () => { 
            doc.addImage(qrImg, 'PNG', 150, 240, 35, 35);
            doc.save(`Denuncia_${ci}.pdf`);
        };
    };
}

// --- FISCALIA: CARGAR Y CITACIONES ---
async function cargarFiscalia() {
    const res = await fetch(`${API}/denuncias`);
    const datos = await res.json();
    const tbody = document.getElementById("lista-fiscal");
    tbody.innerHTML = "";
    datos.forEach(d => {
        tbody.innerHTML += `<tr><td><b>${d[1]}</b></td><td>${d[2]}</td><td><button onclick="abrirCita(${d[0]},'${d[1]}')" class="btn-sm btn-success">CITAR</button></td></tr>`;
    });
}

function abrirCita(id, nombre) {
    document.getElementById("modal_id").value = id;
    document.getElementById("modal_nombre").value = nombre;
    document.getElementById("modal-citacion").style.display = "block";
}

async function procesarCitacion() {
    const id = document.getElementById("modal_id").value;
    const nivel = document.getElementById("modal_nivel").value;
    const fecha = document.getElementById("modal_fecha").value;
    const fiscal = document.getElementById("modal_fiscal").value;
    const nombre = document.getElementById("modal_nombre").value;

    if(!fecha || !fiscal) return alert("Faltan datos");

    // 1. Guardar Citación en Historial
    await fetch(`${API}/citaciones`, {
        method: "POST", headers: {"Content-Type": "application/json"},
        body: JSON.stringify({denuncia_id: id, nivel, fecha_cita: fecha, fiscal})
    });

    // 2. Generar PDF
    const doc = new jsPDF();
    const img = new Image(); img.src = 'citacion.png';
    img.onload = () => {
        doc.addImage(img, 'PNG', 85, 10, 35, 35);
        doc.setFont("helvetica", "bold");
        doc.text(`ORDEN DE ${nivel.toUpperCase()}`, 105, 55, {align: 'center'});
        doc.setFont("helvetica", "normal");
        let cuerpo = `Se ordena la comparecencia del ciudadano(a) ${nombre} bajo conocimiento del Ministerio Público. \n\nFECHA PROGRAMADA: ${new Date(fecha).toLocaleString()}\nFISCAL ASIGNADO: ${fiscal}\n\nADVERTENCIA: En caso de no presentarse, se aplicará el Art. 224 del CPP (Mandamiento de Aprehensión).`;
        doc.text(cuerpo, 20, 80, {maxWidth: 170, align: 'justify'});
        
        const qrImg = new Image(); qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=CITA-${nombre}`;
        qrImg.onload = () => { doc.addImage(qrImg, 'PNG', 20, 240, 35, 35); doc.save(`Citacion_${nombre}.pdf`); cerrarModal(); };
    };
    alert("CITACIÓN GUARDADA Y DOCUMENTO GENERADO");
}

function cerrarModal() { document.getElementById("modal-citacion").style.display = "none"; }

// --- ADMIN ---
async function cargarAdmin() {
    const res = await fetch(`${API}/admin/usuarios`);
    const users = await res.json();
    const tbody = document.getElementById("lista-admin");
    tbody.innerHTML = "";
    users.forEach(u => {
        tbody.innerHTML += `<tr><td>${u[1]}</td><td><span class="badge">${u[2]}</span></td><td>
            <button onclick="asignar(${u[0]},'policia')" class="btn-sm btn-main">Policía</button>
            <button onclick="asignar(${u[0]},'fiscal')" class="btn-sm header-gold">Fiscal</button>
        </td></tr>`;
    });
}

async function asignar(id, rol) {
    await fetch(`${API}/admin/asignar?user_id=${id}&rol=${rol}`, {method: "POST"});
    alert("CARGO ACTUALIZADO");
    cargarAdmin();
}