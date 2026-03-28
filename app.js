// HE CORREGIDO LA URL: Ahora usa "ll" (ele ele) en lugar de "ii"
const API = "https://analisis-y-diseno-de-sistemas-ll.onrender.com";

async function registrar() {
    const email = document.getElementById("reg_email").value;
    const password = document.getElementById("reg_password").value;
    const msg = document.getElementById("msg");

    if (!email || !password) {
        alert("Por favor llena todos los campos");
        return;
    }

    try {
        msg.innerText = "Conectando con el servidor..."; // Feedback visual
        const res = await fetch(`${API}/registro`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email, password: password })
        });

        const data = await res.json();
        if (res.ok) {
            alert("¡Usuario registrado con éxito!");
            msg.innerText = "";
        } else {
            alert("Error: " + (data.detail || "No se pudo registrar"));
            msg.innerText = "";
        }
    } catch (error) {
        console.error("Error completo:", error);
        msg.innerHTML = "Error: No se pudo conectar.<br>1. Revisa que la URL en app.js sea igual a la de Render.<br>2. Espera 1 minuto a que Render 'despierte'.";
    }
}

async function login() {
    const email = document.getElementById("login_email").value;
    const password = document.getElementById("login_password").value;

    try {
        const res = await fetch(`${API}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email, password: password })
        });

        if (res.ok) {
            alert("¡Login correcto!");
            // Aquí puedes redirigir o mostrar contenido
        } else {
            const data = await res.json();
            alert("Error: " + data.detail);
        }
    } catch (error) {
        alert("Error de conexión al intentar entrar.");
    }
}