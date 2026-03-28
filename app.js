let token="";
let datos=[];

// ⚠️ CAMBIA ESTA URL
const API = "https://TU_BACKEND.onrender.com";

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
        document.getElementById("panel").style.display="block";
        cargar();
        stats();
    }else{
        alert("Error login");
    }
}

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

async function cargar(){
    let res = await fetch(API+"/denuncias");
    datos = await res.json();
    render(datos);
}

function render(data){
    tabla.innerHTML="";
    data.forEach(d=>{
        tabla.innerHTML += `<tr><td>${d[1]}</td></tr>`;
    });
}

function filtrar(){
    let t = buscar.value.toLowerCase();
    let f = datos.filter(d => d[1].toLowerCase().includes(t));
    render(f);
}

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
            datasets:[{data:nombres.map(()=>1)}]
        }
    });
}