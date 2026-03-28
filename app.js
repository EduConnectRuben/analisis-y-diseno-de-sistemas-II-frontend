let token="";
let datos=[];

// 🔥 CAMBIA POR TU BACKEND REAL DE RENDER
const API = "const API = "https://analisis-y-design-de-sistemas-ii.onrender.com";

// LOGIN
async function login(){
    let res = await fetch(API+"/login",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
            email:email.value,
            password:password.value
        })
    });

    let data = await res.json();

    if(data.token){
        token=data.token;
        document.getElementById("login").style.display="none";
        document.getElementById("registro").style.display="none";
        document.getElementById("panel").style.display="block";
        cargar();
        stats();
    }else{
        alert("Error login");
    }
}

// REGISTRO
async function registro(){
    let res = await fetch(API+"/registro",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
            email:reg_email.value,
            password:reg_password.value,
            rol:"usuario"
        })
    });

    let data = await res.json();

    alert("Usuario creado correctamente");
}

// GUARDAR DENUNCIA
async function guardar(){
    await fetch(API+"/denuncias",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
            nombre:nombre.value,
            ci:ci.value,
            descripcion:desc.value
        })
    });

    alert("Guardado");
    cargar();
}

// CARGAR DATOS
async function cargar(){
    let res = await fetch(API+"/denuncias");
    datos = await res.json();
    render(datos);
}

// MOSTRAR TABLA
function render(data){
    tabla.innerHTML="";
    data.forEach(d=>{
        tabla.innerHTML += `
        <tr>
            <td>${d[1]}</td>
            <td>${d[2]}</td>
            <td>${d[3]}</td>
        </tr>`;
    });
}

// FILTRO
function filtrar(){
    let t = buscar.value.toLowerCase();
    let f = datos.filter(d => d[1].toLowerCase().includes(t));
    render(f);
}

// DASHBOARD
let chart;

async function stats(){
    let res = await fetch(API+"/denuncias");
    let data = await res.json();

    let nombres = data.map(d=>d[1]);

    if(chart) chart.destroy();

    chart = new Chart(document.getElementById("grafico"),{
        type:"bar",
        data:{
            labels:nombres,
            datasets:[{
                label:"Denuncias",
                data:nombres.map(()=>1)
            }]
        }
    });
}