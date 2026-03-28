const API = "https://analisis-y-diseno-de-sistemas-2-backend.onrender.com";

async function registrar() {
    // El .trim() elimina espacios en blanco accidentales
    const email = document.getElementById("reg_email").value.trim();
    const password = document.getElementById("reg_password").value;

    if (!email || !password) return alert("Llena los campos");

    try {
        const res = await fetch(`${API}/registro`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        if (res.ok) {
            alert("¡Usuario registrado con éxito! Ahora intenta el Login.");
        } else {
            alert("Error: " + data.detail);
        }
    } catch (error) {
        alert("Error de conexión");
    }
}

async function login() {
    const email = document.getElementById("login_email").value.trim();
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
            // Aquí puedes redirigir a otra página si quieres
        } else {
            alert("Error: " + data.detail);
        }
    } catch (error) {
        alert("Error de conexión");
    }
}