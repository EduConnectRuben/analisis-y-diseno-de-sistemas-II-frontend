const API = "https://analisis-y-diseno-de-sistemas-2-backend.onrender.com";

async function registrar() {
    const emailInput = document.getElementById("reg_email");
    const passwordInput = document.getElementById("reg_password");
    
    // CORRECCIÓN: toLowerCase() en lugar de lower()
    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    if (!email || !password) return alert("Por favor, llena todos los campos");

    try {
        const res = await fetch(`${API}/registro`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        if (res.ok) {
            alert("¡Usuario registrado con éxito! Ahora puedes ingresar.");
            emailInput.value = "";
            passwordInput.value = "";
        } else {
            alert("Error: " + data.detail);
        }
    } catch (error) {
        alert("Error de conexión con el servidor");
    }
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

        const data = await res.json();
        if (res.ok) {
            alert("¡LOGIN EXITOSO! Bienvenido.");
            // Cambiar de vista
            document.getElementById("auth-section").style.display = "none";
            document.getElementById("dashboard-section").style.display = "block";
            listarDenuncias();
        } else {
            alert("Error: " + data.detail);
        }
    } catch (error) {
        alert("Error de conexión");
    }
}

async function crearDenuncia() {
    const nombre = document.getElementById("den_nombre").value;
    const ci = document.getElementById("den_ci").value;
    const descripcion = document.getElementById("den_desc").value;

    if (!nombre || !ci || !descripcion) return alert("Llena todos los datos de la denuncia");

    try {
        const res = await fetch(`${API}/denuncias`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre, ci, descripcion })
        });
        if (res.ok) {
            alert("Denuncia enviada correctamente");
            listarDenuncias();
            document.getElementById("den_nombre").value = "";
            document.getElementById("den_ci").value = "";
            document.getElementById("den_desc").value = "";
        }
    } catch (e) { alert("Error al enviar denuncia"); }
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
                    <td>${d[3]}</td>
                </tr>`;
        });
    } catch (e) { console.error("Error al listar:", e); }
}

function cerrarSesion() {
    location.reload();
}