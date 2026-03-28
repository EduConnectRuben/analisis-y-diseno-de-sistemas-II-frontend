// ⚠️ IMPORTANTE: Esta URL NO es la de la base de datos. 
// Es la URL de tu Web Service en Render.
const API = "https://analisis-y-diseno-de-sistemas-ii.onrender.com"; 

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
        if (res.ok) alert("Usuario registrado");
        else alert("Error: " + data.detail);
    } catch (error) {
        document.getElementById("msg").innerText = "No se pudo conectar con el servidor. Verifica la URL en app.js";
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

        if (res.ok) {
            alert("Login correcto");
            document.getElementById("auth-section").style.display = "none";
            document.getElementById("dashboard").style.display = "block";
        } else {
            const data = await res.json();
            alert("Error: " + data.detail);
        }
    } catch (error) {
        alert("Error de conexión");
    }
}