const API = "https://analisis-y-diseno-de-sistemas-ii.onrender.com";

async function registrar() {
    console.log("Registrando...");

    const email = document.getElementById("reg_email").value;
    const password = document.getElementById("reg_password").value;

    try {
        const res = await fetch(`${API}/registro`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        alert(JSON.stringify(data));
    } catch (error) {
        console.error(error);
        alert("Error al registrar");
    }
}

async function login() {
    console.log("Login...");

    const email = document.getElementById("login_email").value;
    const password = document.getElementById("login_password").value;

    try {
        const res = await fetch(`${API}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        alert(JSON.stringify(data));
    } catch (error) {
        console.error(error);
        alert("Error en login");
    }
}