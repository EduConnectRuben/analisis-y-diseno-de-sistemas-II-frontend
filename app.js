const API = "https://analisis-y-diseno-de-sistemas-2-backend.onrender.com";

async function login() {
    const email = document.getElementById("login_email").value.trim().lower();
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
            
            // ESTO ES LO QUE HACE QUE "ENTRE":
            document.getElementById("auth-section").style.display = "none";
            document.getElementById("dashboard-section").style.display = "block";
            
            listarDenuncias(); // Carga las denuncias existentes
        } else {
            alert("Error: " + data.detail);
        }
    } catch (error) {
        alert("Error de conexión");
    }
}

async function registrar() {
    const email = document.getElementById("reg_email").value.trim().lower();
    const password = document.getElementById("reg_password").value;
    try {
        const res = await fetch(`${API}/registro`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        if (res.ok) alert("Registrado. Ahora haz login.");
        else alert("El usuario ya existe.");
    } catch (e) { alert("Error"); }
}

async function crearDenuncia() {
    const nombre = document.getElementById("den_nombre").value;
    const ci = document.getElementById("den_ci").value;
    const descripcion = document.getElementById("den_desc").value;

    try {
        const res = await fetch(`${API}/denuncias`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre, ci, descripcion })
        });
        if (res.ok) {
            alert("Denuncia enviada");
            listarDenuncias();
            // Limpiar campos
            document.getElementById("den_nombre").value = "";
            document.getElementById("den_ci").value = "";
            document.getElementById("den_desc").value = "";
        }
    } catch (e) { alert("Error al enviar"); }
}

async function listarDenuncias() {
    try {
        const res = await fetch(`${API}/denuncias`);
        const datos = await res.json();
        const tbody = document.getElementById("lista_denuncias");
        tbody.innerHTML = "";
        datos.forEach(d => {
            // El backend devuelve: [id, nombre, ci, descripcion]
            tbody.innerHTML += `<tr>
                <td style="border:1px solid #ddd; padding:8px;">${d[1]}</td>
                <td style="border:1px solid #ddd; padding:8px;">${d[2]}</td>
                <td style="border:1px solid #ddd; padding:8px;">${d[3]}</td>
            </tr>`;
        });
    } catch (e) { console.error(e); }
}

function cerrarSesion() {
    location.reload(); // Recarga la página para volver al login
}