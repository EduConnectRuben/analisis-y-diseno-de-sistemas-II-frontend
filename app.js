const API = "https://analisis-y-diseno-de-sistemas-ll.onrender.com";

async function registrar() {
    const email = document.getElementById("reg_email").value;
    const password = document.getElementById("reg_password").value;
    const msg = document.getElementById("msg");

    if (!email || !password) return alert("Llena los campos");

    try {
        const res = await fetch(`${API}/registro`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        if (res.ok) {
            alert("Usuario registrado correctamente");
            msg.innerText = "";
        } else {
            alert("Error: " + data.detail);
        }
    } catch (error) {
        msg.innerText = "Error de conexión. Revisa que el servidor de Render esté activo.";
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
            alert("¡Bienvenido al sistema!");
        } else {
            alert("Error: " + data.detail);
        }
    } catch (error) {
        alert("Error al conectar");
    }
}