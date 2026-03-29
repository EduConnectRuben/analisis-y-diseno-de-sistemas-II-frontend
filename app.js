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
            
            document.getElementById("view-pendiente").style.display = "none";
            document.getElementById("view-admin").style.display = "none";
            document.getElementById("view-policia").style.display = "none";
            document.getElementById("view-fiscal").style.display = "none";

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
    } catch(e) { alert("Error de servidor"); }
}

// POLICIA: GUARDAR Y PDF
async function guardarDenuncia() {
    const nombre = document.getElementById("den_nombre").value;
    const ci = document.getElementById("den_ci").value;
    const descripcion = document.getElementById("den_desc").value;

    if(!nombre || !ci || !descripcion) return alert("Complete todos los campos");

    try {
        const res = await fetch(`${API}/denuncias`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({nombre, ci, descripcion})
        });

        if(res.ok) {
            alert("DENUNCIA GUARDADA EN BASE DE DATOS");
            generarPDFDenuncia(nombre, ci, descripcion);
            document.getElementById("den_nombre").value = "";
            document.getElementById("den_ci").value = "";
            document.getElementById("den_desc").value = "";
        }
    } catch(e) { alert("Error al guardar denuncia"); }
}

function generarPDFDenuncia(nombre, ci, hecho) {
    const doc = new jsPDF();
    const img = new Image(); img.src = 'denuncia.png';
    img.onload = () => {
        doc.addImage(img, 'PNG', 85, 10, 30, 30);
        doc.setFont(undefined, 'bold');
        doc.text("ACTA DE DENUNCIA FORMAL", 105, 50, {align: 'center'});
        doc.setFontSize(10);
        doc.text("DISTRITO POLICIAL N° 8 - BOLIVIA", 105, 56, {align: 'center'});
        
        doc.setFont(undefined, 'normal');
        doc.setFontSize(12);
        let texto = `En la ciudad de El Alto, se registra la presente denuncia contra el ciudadano(a) ${nombre}, con C.I. ${ci}. \n\nRELACIÓN DE LOS HECHOS: \n${hecho}\n\nSe eleva el presente informe a conocimiento del Ministerio Público para fines legales pertinentes.`;
        doc.text(texto, 20, 80, {maxWidth: 170, align: 'justify'});

        const qr = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=PD8-DEN-${ci}`;
        const qrImg = new Image(); qrImg.src = qr;
        qrImg.onload = () => { doc.addImage(qrImg, 'PNG', 150, 240, 30, 30); doc.save(`Denuncia_${ci}.pdf`); };
    };
}

// FISCALIA: CARGAR Y PDF CITACION
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

function generarPDFCitacion() {
    const nombre = document.getElementById("modal_nombre").value;
    const num = document.getElementById("modal_num").value;
    const fecha = new Date(document.getElementById("modal_fecha").value).toLocaleString();
    const fiscal = document.getElementById("modal_fiscal").value;

    const doc = new jsPDF();
    const img = new Image(); img.src = 'citacion.png';
    img.onload = () => {
        doc.addImage(img, 'PNG', 85, 10, 30, 30);
        doc.setFont(undefined, 'bold');
        doc.text(`${num} CITACIÓN FISCAL`, 105, 50, {align: 'center'});
        
        doc.setFont(undefined, 'normal');
        let texto = `Se ordena la comparecencia obligatoria del ciudadano(a) ${nombre} para el día ${fecha} en las oficinas de la Fiscalía del Distrito PD-8. \n\nMotivo: Declaración informativa sobre denuncia en su contra. \n\nFiscal a cargo: ${fiscal}. \n\nADVERTENCIA: En caso de incomparecencia a esta ${num} citación, se emitirá mandamiento de aprehensión conforme al Art. 224 del Código de Procedimiento Penal.`;
        doc.text(texto, 20, 80, {maxWidth: 170, align: 'justify'});

        const qrImg = new Image(); qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=CITA-${nombre}`;
        qrImg.onload = () => { doc.addImage(qrImg, 'PNG', 150, 240, 30, 30); doc.save(`Citacion_${nombre}.pdf`); cerrarModal(); };
    };
}

function cerrarModal() { document.getElementById("modal-citacion").style.display = "none"; }

// ADMIN LOGIC
async function cargarAdmin() {
    const res = await fetch(`${API}/admin/usuarios`);
    const users = await res.json();
    const tbody = document.getElementById("lista-admin");
    tbody.innerHTML = "";
    users.forEach(u => {
        tbody.innerHTML += `<tr><td>${u[1]}</td><td>${u[2]}</td><td>
            <button onclick="asignar(${u[0]},'policia')" class="btn-sm blue">Hacer Policía</button>
            <button onclick="asignar(${u[0]},'fiscal')" class="btn-sm gold" style="color:white">Hacer Fiscal</button>
        </td></tr>`;
    });
}

async function asignar(id, rol) {
    await fetch(`${API}/admin/asignar?user_id=${id}&rol=${rol}`, {method: "POST"});
    alert("CARGO ASIGNADO");
    cargarAdmin();
}