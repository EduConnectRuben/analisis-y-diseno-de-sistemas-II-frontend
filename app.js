// 1. MIRA TUS PESTAÑAS DE CHROME: La pestaña 7 (analisis-y-diseno-...)
// tiene la URL real. Cópiala y pégala aquí ABAJO:
const API = "https://analisis-y-diseno-de-sistemas-ll.onrender.com";

async function registrar() {
    const email = document.getElementById("reg_email").value;
    const password = document.getElementById("reg_password").value;
    const msg = document.getElementById("msg");

    if (!email || !password) return alert("Llena los campos");

    try {
        console.log("Intentando conectar a:", `${API}/registro`); // Esto saldrá en F12
        
        const res = await fetch(`${API}/registro`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        console.log("Respuesta del servidor:", data);

        if (res.ok) {
            alert("¡Registrado correctamente!");
        } else {
            alert("Error del servidor: " + data.detail);
        }
    } catch (error) {
        console.error("ERROR DE CONEXIÓN:", error);
        msg.innerHTML = "Error de conexión. <br> Posibles causas: <br> 1. El servidor de Render está dormido (espera 1 min). <br> 2. La URL en app.js no es la correcta. <br> 3. CORS está bloqueando la petición.";
    }
}

// Copia la función de login igual si quieres, pero prueba registro primero.