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
                cargarDenunciasPolicia();
            } else if (data.rol === 'fiscal') {
                document.getElementById("view-fiscal").style.display = "block";
                cargarFiscalia();
            } else {
                document.getElementById("view-pendiente").style.display = "block";
            }
        } else alert("Credenciales Incorrectas");
    } catch(e) { alert("Servidor no responde o está en mantenimiento."); }
}

async function registrar() {
    const email = document.getElementById("reg_email").value;
    const password = document.getElementById("reg_password").value;
    if(!email || !password) return alert("Ingrese correo y contraseña");
    
    // Add visual feedback
    const btn = document.querySelector("#auth-section .btn-gray");
    btn.innerText = "SOLICITANDO...";
    
    try {
        const res = await fetch(`${API}/registro`, {
            method: "POST", headers: {"Content-Type": "application/json"},
            body: JSON.stringify({email, password})
        });
        if(res.ok) alert("Solicitud enviada al Administrador. Espere a que asigne su rango.");
        else alert("Usuario ya existe o error en la solicitud.");
    } catch(e) {
        alert("Error de conexión con el servidor principal.");
    }
    btn.innerText = "SOLICITAR ACCESO";
}

// ADMIN
async function cargarAdmin() {
    const res = await fetch(`${API}/admin/usuarios`);
    const users = await res.json();
    const tbody = document.getElementById("lista-admin");
    tbody.innerHTML = "";
    users.forEach(u => {
        tbody.innerHTML += `<tr><td>${u[1]}</td><td><span class="badge">${u[2]}</span></td><td>
            <div class="btn-container">
                <button onclick="asignar(${u[0]},'policia')" class="btn-blue" style="width:auto; padding:8px 15px; font-size:12px;">Sargento/Policía</button>
                <button onclick="asignar(${u[0]},'fiscal')" class="btn-warning" style="width:auto; padding:8px 15px; font-size:12px;">Fiscal</button>
            </div>
        </td></tr>`;
    });
}

async function asignar(id, rol) {
    await fetch(`${API}/admin/asignar?user_id=${id}&rol=${rol}`, {method: "POST"});
    alert(`Cargo ${rol.toUpperCase()} asignado correctamente.`);
    cargarAdmin();
}

function getEstadoClase(numCitaciones) {
    if(!numCitaciones || numCitaciones === 0) return {class: "row-normal", text: "Registrado", badge: "0 Citaciones"};
    if(numCitaciones === 1) return {class: "row-yellow", text: "Alerta Nivel 1", badge: "1ra Citación"};
    if(numCitaciones === 2) return {class: "row-orange", text: "Alerta Nivel 2", badge: "2da Citación"};
    return {class: "row-red", text: "Riesgo de Aprehensión", badge: `${numCitaciones} Citaciones`};
}

// POLICIA
async function procesarDenuncia() {
    const nombre = document.getElementById("den_nombre").value;
    const ci = document.getElementById("den_ci").value;
    const desc = document.getElementById("den_desc").value;
    if(!nombre || !ci) return alert("Faltan datos obligatorios del sujeto.");

    const res = await fetch(`${API}/denuncias`, {
        method: "POST", headers: {"Content-Type": "application/json"},
        body: JSON.stringify({nombre, ci, descripcion: desc})
    });
    if(res.ok) {
        alert("DENUNCIA GUARDADA EN EL SISTEMA JUDICIAL");
        document.getElementById("den_nombre").value = "";
        document.getElementById("den_ci").value = "";
        document.getElementById("den_desc").value = "";
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
        // d: [id, nombre, ci, descripcion, num_citaciones, ultima_fecha]
        const count = d[4] || 0;
        const e = getEstadoClase(count);
        tbody.innerHTML += `<tr class="${e.class}">
            <td><strong>${d[1]}</strong></td>
            <td>C.I. ${d[2]}</td>
            <td><span class="status-badge status">${e.badge}</span><br><small style="color:#94a3b8;font-size:10px;">${e.text}</small></td>
            <td>
                <div class="btn-container">
                    <button onclick="generarPDFDenuncia('${d[1]}','${d[2]}','${d[3].replace(/'/g,"\\'").replace(/\n/g," ")}')" class="btn-green">Acta Denuncia</button>
                    ${count > 0 ? `<button onclick="descargarHistorialPDF('${d[1]}','${d[2]}', ${count})" class="btn-red" style="width:auto!important; padding:8px; font-size:12px;">Reporte PDF</button>` : ''}
                </div>
            </td>
        </tr>`;
    });
}

function generarPDFDenuncia(nombre, ci, hecho) {
    const doc = new jsPDF();
    const img = new Image(); img.src = 'denuncia.png';
    img.onload = () => {
        doc.addImage(img, 'PNG', 15, 10, 25, 30);
        doc.setFont("times", "bold");
        doc.setFontSize(16);
        doc.text("POLICÍA BOLIVIANA", 105, 20, {align:'center'});
        doc.setFontSize(12);
        doc.text("FUERZA ESPECIAL DE LUCHA CONTRA EL CRIMEN (F.E.L.C.C.)", 105, 28, {align:'center'});
        doc.text("DISTRITO POLICIAL N° 8", 105, 36, {align:'center'});
        
        doc.line(15, 42, 195, 42); // Línea separadora
        
        doc.setFontSize(14);
        doc.text("ACTA DE DENUNCIA FORMAL", 105, 55, {align:'center'});
        doc.setFont("times", "normal");
        doc.setFontSize(11);
        
        const fechaActual = new Date().toLocaleDateString('es-BO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' });

        let intro = `En la ciudad y División PD-8 de la Fuerza Especial de Lucha contra el Crimen, a fecha ${fechaActual}, se hace presente el oficial de turno para registrar de manera formal la presente denuncia mediante el Sistema Único de Control (SINCOJ).`;
        doc.text(intro, 20, 70, {maxWidth: 170, align:'justify', lineHeightFactor: 1.5});

        doc.setFont("times", "bold");
        doc.text(`SOBRE EL SUJETO DENUNCIADO:`, 20, 95);
        doc.setFont("times", "normal");
        doc.text(`NOMBRE COMPLETO: ${nombre.toUpperCase()}`, 20, 105);
        doc.text(`NÚMERO DE IDENTIDAD (C.I.): ${ci}`, 20, 115);
        
        doc.setFont("times", "bold");
        doc.text(`RELACIÓN CIRCUNSTANCIADA DE LOS HECHOS:`, 20, 135);
        doc.setFont("times", "normal");
        doc.text(hecho, 20, 145, {maxWidth: 170, align:'justify', lineHeightFactor: 1.5});

        // Artículo legal
        doc.setFontSize(9);
        doc.text(`*De conformidad a lo establecido en los Arts. 284 y 285 del Código de Procedimiento Penal Boliviano (Ley 1970), se eleva la constancia para los fines investigativos bajo tuición del Ministerio Público.`, 20, 200, {maxWidth: 170, align:'justify'});
        
        // Firmas y código QR
        doc.line(70, 250, 140, 250);
        doc.setFontSize(10);
        doc.text("F I R M A  Y  S E L L O", 105, 258, {align:'center'});
        doc.text("UNIDAD DE RECEPCIÓN Y DESPACHO PD-8", 105, 263, {align:'center'});

        const qr = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=PD8-DEN-${ci}`;
        const qrImg = new Image(); qrImg.src = qr;
        qrImg.onload = () => { 
            doc.addImage(qrImg, 'PNG', 160, 240, 30, 30); 
            doc.save(`ACTA_DENUNCIA_${ci}.pdf`); 
        };
    };
}

// FISCALIA
async function cargarFiscalia() {
    const res = await fetch(`${API}/denuncias`);
    const datos = await res.json();
    const tbody = document.getElementById("lista-fiscal");
    tbody.innerHTML = "";
    datos.forEach(d => {
        const count = d[4] || 0;
        const e = getEstadoClase(count);
        tbody.innerHTML += `<tr class="${e.class}">
            <td><strong>${d[1]}</strong></td>
            <td>C.I. ${d[2]}</td>
            <td><span class="status-badge status">${e.badge}</span></td>
            <td>
                <div class="btn-container">
                    <button onclick="abrirCita(${d[0]},'${d[1]}')" class="btn-blue" style="width:auto; padding:8px 15px;">ACTUAR / CITAR</button>
                    ${count > 0 ? `<button onclick="descargarHistorialPDF('${d[1]}','${d[2]}', ${count})" class="btn-gray" style="width:auto; padding:8px;">PDF Exp.</button>` : ''}
                </div>
            </td>
        </tr>`;
    });
}

function abrirCita(id, nombre) {
    document.getElementById("modal_id").value = id;
    document.getElementById("modal_nombre").value = nombre;
    document.getElementById("modal-citacion").style.display = "flex";
}

async function procesarCitacion() {
    const denuncia_id = document.getElementById("modal_id").value;
    const nombre = document.getElementById("modal_nombre").value;
    const nivel = document.getElementById("modal_nivel").value;
    const fecha = document.getElementById("modal_fecha").value;
    const fiscal = document.getElementById("modal_fiscal").value;

    if(!fecha || !fiscal) return alert("Por favor complete todos los datos requeridos.");

    // Guardar en la base de datos backend primero
    try {
        const res = await fetch(`${API}/citaciones`, {
            method: "POST", headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                denuncia_id: parseInt(denuncia_id),
                nivel: nivel,
                fecha: fecha,
                fiscal: fiscal
            })
        });
        if(!res.ok) throw new Error("Error en BD");
    } catch(e) {
        alert("Fallo al guardar la citación en el sistema central.");
        return;
    }

    // Generar PDF Profesional de la Citación
    const doc = new jsPDF();
    const img = new Image(); img.src = 'citacion.png';
    img.onload = () => {
        doc.addImage(img, 'PNG', 15, 10, 25, 30);
        doc.setFont("times", "bold");
        doc.setFontSize(16);
        doc.text("MINISTERIO PÚBLICO DEL ESTADO", 105, 20, {align:'center'});
        doc.setFontSize(12);
        doc.text("FISCALÍA DEPARTAMENTAL", 105, 28, {align:'center'});
        
        doc.line(15, 42, 195, 42); // Línea
        
        doc.setFontSize(16);
        doc.text(`ORDEN DE ${nivel.toUpperCase()}`, 105, 55, {align:'center'});
        doc.text(`NÚMERO DE CASO: MP-${denuncia_id} / 2026`, 105, 63, {align:'center'});

        doc.setFont("times", "normal");
        doc.setFontSize(12);
        
        let citaText = `En estricto cumplimiento y ejercicio de las atribuciones conferidas por la Constitución y la Ley Orgánica del Ministerio Público (Ley N° 260), la autoridad fiscal asignada:`;
        doc.text(citaText, 20, 80, {maxWidth:170, align:'justify', lineHeightFactor: 1.5});

        doc.setFont("times", "bold");
        doc.text(`FISCAL A CARGO: ${fiscal.toUpperCase()}`, 20, 100);
        
        doc.setFont("times", "normal");
        let mandato = `MANDA Y ORDENA a cualquier Autoridad Policial hábil e Investigador Asignado al Caso o Funcionario Público para que requiera la COMPARECENCIA INMEDIATA del(la) ciudadano(a):`;
        doc.text(mandato, 20, 115, {maxWidth:170, align:'justify', lineHeightFactor: 1.5});

        doc.setFont("times", "bold");
        doc.text(`NOMBRE DEL CITADO: ${nombre.toUpperCase()}`, 20, 135);
        
        doc.setFont("times", "normal");
        doc.text(`FECHA DE PRESENTACIÓN: ${new Date(fecha).toLocaleString('es-BO')}`, 20, 150);
        doc.text(`LUGAR DE PRESENTACIÓN: Instalaciones Fiscalía PD-8.`, 20, 160);

        doc.setFontSize(11);
        doc.text(`ADVERTENCIA LEGAL: En caso de incomparecencia injustificada en la fecha y hora señalada legalmente, y al tratarse de un requerimiento dentro del marco del proceso penal, de conformidad a los Arts. 224 y siguientes del CPP Boliviano, se expedirá de forma inmediata ORDEN DE APREHENSIÓN en contra del renuente para asegurar su presencia física.`, 20, 180, {maxWidth: 170, align:'justify', lineHeightFactor: 1.3});
        
        doc.line(70, 250, 140, 250);
        doc.text("Firma o Sello Fiscal", 105, 255, {align:'center'});
        
        const qr = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=CITA-FISCALIA-${nombre}`;
        const qrImg = new Image(); qrImg.src = qr;
        qrImg.onload = () => { 
            doc.addImage(qrImg, 'PNG', 160, 240, 30, 30); 
            doc.save(`CITACION_${nivel}_${nombre}.pdf`); 
            cerrarModal(); 
            cargarFiscalia(); // Actualizar colores y botones
        };
    };
}

function generarReporteGralExtra(nombre, ci, numCitaciones) {
    const doc = new jsPDF();
    doc.setFont("times", "bold");
    doc.text(`REPORTE GENERAL DEL EXPEDIENTE`, 105, 30, {align:'center'});
    doc.setFont("times", "normal");
    doc.text(`El individuo ${nombre} (CI: ${ci}) ha sido registrado en el SINCOJ y a la fecha cuenta con ${numCitaciones} citaciones emitidas formalmente. Documento oficial validado.`, 20, 50, {maxWidth: 170});
    doc.save(`EXPEDIENTE_${ci}.pdf`);
}

function descargarHistorialPDF(nombre, ci, numCitaciones) {
    generarReporteGralExtra(nombre, ci, numCitaciones);
}

function cerrarModal() { document.getElementById("modal-citacion").style.display = "none"; }