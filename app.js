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
            alert("¡Usuario registrado con éxito!");
        } else {
            alert("Error: " + data.detail);
        }
    } catch (error) {
        console.error("Error:", error);
        msg.innerText = "Error de conexión con el servidor.";
    }
}
// ... la función de login es igual, solo cambia el final de la URL a /login