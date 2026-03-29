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
            const userRole = data.rol ? data.rol : 'pendiente';
            document.getElementById("user-display").innerText = data.email;
            document.getElementById("rol-display").innerText = userRole.toUpperCase();

            // Limpiar vistas
            document.getElementById("view-pendiente").style.display = "none";
            document.getElementById("view-admin").style.display = "none";
            document.getElementById("view-policia").style.display = "none";
            document.getElementById("view-fiscal").style.display = "none";

            if (userRole === 'admin') {
                document.getElementById("view-admin").style.display = "block";
                cargarAdmin();
            } else if (userRole === 'policia') {
                document.getElementById("view-policia").style.display = "block";
                cargarDenunciasPolicia();
            } else if (userRole === 'fiscal') {
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
    try {
        const res = await fetch(`${API}/admin/asignar?user_id=${id}&rol=${rol}`, {method: "POST"});
        if (!res.ok) throw new Error("Error interno del servidor");
        alert(`Cargo ${rol.toUpperCase()} asignado correctamente.`);
        cargarAdmin();
    } catch(e) {
        alert("Error: El backend no pudo procesar la asignación de cargo.");
    }
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

        let intro = `En la ciudad y División PD-8 de la Fuerza Especial de Lucha contra el Crimen (FELCC), a fecha ${fechaActual}, se hace presente el oficial de turno para registrar de manera formal y bajo juramento de ley la presente acta de denuncia, mediante el Sistema Único de Control (SINCOJ).`;
        doc.text(intro, 20, 70, {maxWidth: 170, align:'justify', lineHeightFactor: 1.5});

        doc.setFont("times", "bold");
        doc.text(`I. DATOS DEL DENUNCIADO:`, 20, 95);
        doc.setFont("times", "normal");
        doc.text(`NOMBRE COMPLETO: ${nombre.toUpperCase()}`, 20, 105);
        doc.text(`CÉDULA DE IDENTIDAD (C.I.): ${ci}`, 20, 115);
        doc.text(`ESTADO DE PROCEDIMIENTO: En etapa preliminar de investigación táctica.`, 20, 125);
        
        doc.setFont("times", "bold");
        doc.text(`II. RELACIÓN CIRCUNSTANCIADA DE LOS HECHOS:`, 20, 140);
        doc.setFont("times", "normal");
        doc.text(hecho, 20, 150, {maxWidth: 170, align:'justify', lineHeightFactor: 1.5});

        // Artículo legal extendido
        doc.setFont("times", "bold");
        doc.text(`III. FUNDAMENTACIÓN LEGAL JURÍDICA:`, 20, 175);
        doc.setFont("times", "normal");
        doc.setFontSize(10);
        let fundamentos = `El presente documento tiene pleno valor legal probatorio. De conformidad a lo estipulado en los Arts. 284 (Denuncia), 285 (Forma y Contenido) y siguientes del Código de Procedimiento Penal Boliviano (Ley N° 1970), y en concordancia con los principios constitucionales que rigen nuestro Estado, se eleva la presente constancia para los fines procesales, investigativos, tácticos y periciales subsecuentes, bajo tuición, control y conocimiento del Ministerio Público. Cualquier alteración de este documento público pena conforme al Art. 198 del Código Penal.`;
        doc.text(fundamentos, 20, 185, {maxWidth: 170, align:'justify', lineHeightFactor: 1.5});
        
        // Firmas y código QR
        doc.line(70, 245, 140, 245);
        doc.setFontSize(10);
        doc.setFont("times", "bold");
        doc.text("F I R M A  Y  S E L L O  P O L I C I A L", 105, 253, {align:'center'});
        doc.setFont("times", "normal");
        doc.text("División de Recepción y Despacho FELCC - PD8", 105, 258, {align:'center'});

        const qr = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=PD8-DEN-${ci}`;
        const qrImg = new Image(); 
        qrImg.crossOrigin = "Anonymous";
        qrImg.src = qr;
        qrImg.onload = () => { 
            doc.addImage(qrImg, 'PNG', 160, 240, 30, 30); 
            doc.save(`ACTA_DENUNCIA_${ci}.pdf`); 
        };
        qrImg.onerror = () => { doc.save(`ACTA_DENUNCIA_${ci}.pdf`); }; // Si falla la imagen, guarda igual
    };
    img.onerror = () => {
        alert("No se pudo cargar el logo, pero el PDF se generó.");
        doc.save(`ACTA_DENUNCIA_${ci}.pdf`);
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
        if(!res.ok) throw new Error("Backend devolvió error");
    } catch(e) {
        alert("NOTA: Tu Backend en Render no está actualizado o está fallando. Se generará el PDF de forma local para no interrumpir el proceso.");
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
        
        let citaText = `Dentro del proceso de seguimiento e investigación penal a cargo de este Despacho Fiscal, en estricto cumplimiento y ejercicio de las atribuciones conferidas por la Constitución Política del Estado, y la Ley Orgánica del Ministerio Público (Ley N° 260), la autoridad que suscribe:`;
        doc.text(citaText, 20, 80, {maxWidth:170, align:'justify', lineHeightFactor: 1.5});

        doc.setFont("times", "bold");
        doc.text(`I. AUTORIDAD REQUIRENTE (FISCALÍA):`, 20, 100);
        doc.setFont("times", "normal");
        doc.text(`FISCAL A CARGO: Abg. ${fiscal.toUpperCase()}`, 20, 110);
        
        doc.setFont("times", "bold");
        doc.text(`II. MANDATO DE LEY:`, 20, 125);
        doc.setFont("times", "normal");
        let mandato = `POR CUANTO: MANDA Y ORDENA a cualquier Autoridad Policial hábil, asignada al caso, Escuadrón Táctico Especial o Funcionario del Estado para que, con las formalidades de ley, se requiera y efectivice la COMPARECENCIA INMEDIATA Y OBLIGATORIA del (la) ciudadano (a):`;
        doc.text(mandato, 20, 135, {maxWidth:170, align:'justify', lineHeightFactor: 1.5});

        doc.setFont("times", "bold");
        doc.text(`NOMBRE DEL CITADO: ${nombre.toUpperCase()}`, 20, 158);
        
        doc.setFont("times", "normal");
        doc.text(`FECHA EXACTA DE PRESENTACIÓN: ${new Date(fecha).toLocaleString('es-BO')}`, 20, 168);
        doc.text(`LUGAR DE DECLARACIÓN: Instalaciones principales de la Fiscalía y Área Especial PD-8.`, 20, 178);

        doc.setFont("times", "bold");
        doc.text(`III. CONMINATORIAS Y APERCIBIMIENTOS DE LEY:`, 20, 195);
        doc.setFont("times", "normal");
        doc.setFontSize(11);
        let advertencia = `ADVERTENCIA JURÍDICA SEVERA: El presente citatorio obedece a un mandato legal emitido por autoridad competente en materia penal. En el hipotético caso de incomparecencia injustificada en la fecha, hora y lugar señalados precedentemente, y al tratarse de un requerimiento legal formal, de conformidad con lo estatuido expresa y terminantemente por el Art. 224 y concordantes del Código de Procedimiento Penal Boliviano (Ley 1970), se expedirá de forma directa e incontestable MANDAMIENTO DE APREHENSIÓN en contra del sujeto renuente, a objeto de asegurar su presencia física ante esta misma autoridad, el Juez y el sistema de justicia.`;
        doc.text(advertencia, 20, 205, {maxWidth: 170, align:'justify', lineHeightFactor: 1.4});
        
        doc.line(70, 260, 140, 260);
        doc.setFontSize(10);
        doc.setFont("times", "bold");
        doc.text("F I R M A   Y   S E L L O   F I S C A L", 105, 265, {align:'center'});
        doc.setFont("times", "normal");
        doc.text("FISCALÍA DE MATERIA PENAL", 105, 270, {align:'center'});
        
        const qr = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=CITA-FISCALIA-${nombre}`;
        const qrImg = new Image(); 
        qrImg.crossOrigin = "Anonymous";
        qrImg.src = qr;
        qrImg.onload = () => { 
            doc.addImage(qrImg, 'PNG', 160, 240, 30, 30); 
            doc.save(`CITACION_${nivel}_${nombre}.pdf`); 
            cerrarModal(); 
            cargarFiscalia(); // Actualizar colores y botones
        };
        qrImg.onerror = () => {
            doc.save(`CITACION_${nivel}_${nombre}.pdf`); 
            cerrarModal(); 
            cargarFiscalia();
        };
    };
    img.onerror = () => {
        alert("No se pudo cargar el logo, pero el PDF se generó.");
        doc.save(`CITACION_${nivel}_${nombre}.pdf`); 
        cerrarModal();
        cargarFiscalia();
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