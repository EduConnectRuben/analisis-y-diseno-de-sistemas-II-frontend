
const API = "https://analisis-y-diseno-de-sistemas-2-backend.onrender.com";

// El resto de tus funciones (registrar, login) se quedan igual

async function registrar() {
    const email = document.getElementById("reg_email").value;
    const password = document.getElementById("reg_password").value;

    if (!email || !password) return alert("Escribe un correo y contraseña");

    try {
        const res = await fetch(`${API}/registro`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email, password: password })
        });

        const data = await res.json();

        if (res.ok) {
            alert("¡Usuario registrado con éxito!");
        } else {
            alert("Error: " + data.detail);
        }
    } catch (error) {
        console.error("Error detectado:", error);
        alert("Error de conexión. Asegúrate de que el servidor de Render ya cargó.");
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

        const data = await res.json();
        if (res.ok) {
            alert("¡Bienvenido!");
        } else {
            alert("Error: " + data.detail);
        }
    } catch (error) {
        alert("Error de conexión");
    }
}