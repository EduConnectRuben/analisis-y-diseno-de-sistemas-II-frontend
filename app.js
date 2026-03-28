const API = "https://analisis-y-diseno-de-sistemas-ii.onrender.com";

async function registrar() {
    const email = document.getElementById("reg_email").value;
    const password = document.getElementById("reg_password").value;

    try {
        const res = await fetch(API + "/registro", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await res.json();

        if (res.ok) {
            alert("Usuario registrado correctamente");
        } else {
            alert("Error: " + data.detail);
        }

    } catch (error) {
        document.getElementById("msg").innerText = "Error conexión backend";
    }
}

async function login() {
    const email = document.getElementById("login_email").value;
    const password = document.getElementById("login_password").value;

    try {
        const res = await fetch(API + "/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await res.json();

        if (res.ok) {
            alert("Login correcto");
        } else {
            alert("Error: " + data.detail);
        }

    } catch (error) {
        document.getElementById("msg").innerText = "Error conexión backend";
    }
}

        const data = await res.json();
        alert(JSON.stringify(data));
    } catch (error) {
        console.error(error);
        alert("Error en login");
    }
}