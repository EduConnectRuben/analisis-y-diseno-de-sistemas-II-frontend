// ASEGÚRATE DE QUE ESTA URL SEA EXACTAMENTE LA DE TU RENDER
const API = "https://analisis-y-diseno-de-sistemas-ll.onrender.com";

async function registrar() {
    const email = document.getElementById("reg_email").value;
    const password = document.getElementById("reg_password").value;
    const msg = document.getElementById("msg");

    if (!email || !password) return alert("Completa todos los campos");

    try {
        const res = await fetch(`${API}/registro`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        if (res.ok) {
            alert("Usuario registrado correctamente");
        } else {
            alert("Error: " + (data.detail || "No se pudo registrar"));
        }
    } catch (error) {
        console.error(error);
        msg.innerText = "Error: No se pudo conectar con el backend. Revisa la URL.";
    }
}

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
            alert("Login correcto");
            // Ocultar login y mostrar dashboard
            document.getElementById("auth-container").style.display = "none";
            document.getElementById("dashboard").style.display = "block";
            cargarDenuncias();
        } else {
            alert("Error: " + data.detail);
        }
    } catch (error) {
        console.error(error);
        document.getElementById("msg").innerText = "Error de conexión. ¿El backend está despierto?";
    }
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
            cargarDenuncias();
        }
    } catch (error) {
        alert("Error al enviar denuncia");
    }
}

async function cargarDenuncias() {
    try {
        const res = await fetch(`${API}/denuncias`);
        const data = await res.json();
        const tabla = document.getElementById("cuerpo_tabla");
        tabla.innerHTML = "";
        data.forEach(d => {
            tabla.innerHTML += `<tr><td>${d[1]}</td><td>${d[2]}</td><td>${d[3]}</td></tr>`;
        });
    } catch (e) { console.error(e); }
}