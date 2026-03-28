const API = "https://analisis-y-diseno-de-sistemas-2-backend.onrender.com";

// Registro y Login (Iguales a los anteriores, pero verifícalos)
async function registrar() {
    const email = document.getElementById("reg_email").value.trim().toLowerCase();
    const password = document.getElementById("reg_password").value;
    if (!email || !password) return alert("Llena los campos");
    try {
        const res = await fetch(`${API}/registro`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        if (res.ok) alert("Registrado con éxito");
        else alert("Error al registrar");
    } catch (e) { alert("Error de conexión"); }
}

async function login() {
    const email = document.getElementById("login_email").value.trim().toLowerCase();
    const password = document.getElementById("login_password").value;
    try {
        const res = await fetch(`${API}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        if (res.ok) {
            alert("¡Login exitoso!");
            document.getElementById("auth-section").style.display = "none";
            document.getElementById("dashboard-section").style.display = "block";
            listarDenuncias();
        } else {
            alert("Credenciales incorrectas");
        }
    } catch (e) { alert("Error de conexión"); }
}

// FUNCIONES DE DENUNCIAS
async function crearDenuncia() {
    const nombre = document.getElementById("den_nombre").value;
    const ci = document.getElementById("den_ci").value;
    const descripcion = document.getElementById("den_desc").value;

    if (!nombre || !ci || !descripcion) return alert("Llena todos los campos");

    try {
        const res = await fetch(`${API}/denuncias`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre, ci, descripcion })
        });

        if (res.ok) {
            alert("Denuncia enviada correctamente");
            document.getElementById("den_nombre").value = "";
            document.getElementById("den_ci").value = "";
            document.getElementById("den_desc").value = "";
            listarDenuncias();
        }
    } catch (e) { alert("Error al enviar"); }
}

async function listarDenuncias() {
    try {
        const res = await fetch(`${API}/denuncias`);
        const datos = await res.json();
        
        const tbody = document.getElementById("lista_denuncias");
        tbody.innerHTML = "";

        // Verificamos que datos sea una lista antes de usar forEach
        if (Array.isArray(datos)) {
            datos.forEach(d => {
                tbody.innerHTML += `
                    <tr>
                        <td>${d[1]}</td>
                        <td>${d[2]}</td>
                        <td>${d[3]}</td>
                    </tr>`;
            });
        }
    } catch (e) {
        console.error("Error al listar:", e);
    }
}

function cerrarSesion() { location.reload(); }