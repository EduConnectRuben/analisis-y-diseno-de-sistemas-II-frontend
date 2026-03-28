// USA LA URL QUE COPIASTE EN EL PASO 1
const API = "https://analisis-y-diseno-de-sistemas-ll.onrender.com";

// Función para probar si el servidor está vivo
async function probarConexion() {
    const msg = document.getElementById("msg");
    try {
        const res = await fetch(API + "/");
        const data = await res.json();
        console.log("Conexión exitosa:", data);
        msg.style.color = "green";
        msg.innerText = "Conectado al servidor";
    } catch (e) {
        console.error("Error probando conexión:", e);
        msg.style.color = "red";
        msg.innerText = "Servidor no responde. Revisa la URL en app.js";
    }
}

// Ejecutar prueba al cargar
probarConexion();

async function registrar() {
    const email = document.getElementById("reg_email").value;
    const password = document.getElementById("reg_password").value;
    const msg = document.getElementById("msg");

    if (!email || !password) return alert("Llena los campos");

    try {
        msg.innerText = "Enviando datos...";
        const res = await fetch(`${API}/registro`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        if (res.ok) {
            alert("¡Usuario registrado!");
            msg.innerText = "";
        } else {
            alert("Error: " + data.detail);
        }
    } catch (error) {
        msg.innerText = "Error de conexión. Mira la consola (F12)";
        console.error("Error detallado:", error);
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
            alert("Bienvenido");
        } else {
            alert("Error: " + data.detail);
        }
    } catch (error) {
        alert("Error de conexión");
    }
}