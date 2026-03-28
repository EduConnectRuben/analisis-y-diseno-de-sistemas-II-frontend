const API = "https://analisis-y-diseno-de-sistemas-ii.onrender.com";

// Registro de usuarios
async function registrar() {
    const email = document.getElementById("reg_email").value;
    const password = document.getElementById("reg_password").value;

    try {
        const res = await fetch(`${API}/registro`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        if (res.ok) {
            alert("¡Registro exitoso! Ya puedes iniciar sesión.");
        } else {
            alert("Error: " + data.detail);
        }
    } catch (error) {
        mostrarMensaje("Error de conexión con el servidor");
    }
}

// Login
async function login() {
    const email = document.getElementById("login_email").value;
    const password = document.getElementById("login_password").value;

    try {
        const res = await fetch(`${API}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        if (res.ok) {
            document.getElementById("auth-section").style.display = "none";
            document.getElementById("dashboard-section").style.display = "block";
            listarDenuncias();
        } else {
            alert("Error: " + data.detail);
        }
    } catch (error) {
        mostrarMensaje("Error al intentar ingresar");
    }
}

// Crear Denuncia
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
            alert("Denuncia enviada");
            listarDenuncias();
            // Limpiar campos
            document.getElementById("den_nombre").value = "";
            document.getElementById("den_ci").value = "";
            document.getElementById("den_desc").value = "";
        }
    } catch (error) {
        alert("Error al enviar denuncia");
    }
}

// Listar Denuncias
async function listarDenuncias() {
    try {
        const res = await fetch(`${API}/denuncias`);
        const data = await res.json();
        
        const tabla = document.getElementById("tabla_denuncias");
        tabla.innerHTML = "";

        data.forEach(d => {
            // El backend devuelve una lista de listas: [id, nombre, ci, desc]
            const fila = `<tr>
                <td>${d[1]}</td>
                <td>${d[2]}</td>
                <td>${d[3]}</td>
            </tr>`;
            tabla.innerHTML += fila;
        });
    } catch (error) {
        console.error("Error al obtener denuncias", error);
    }
}

function cerrarSesion() {
    location.reload();
}

function mostrarMensaje(m) {
    document.getElementById("msg").innerText = m;
}