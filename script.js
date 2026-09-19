// ==========================================
// CONFIGURACIÓN DE SEGURIDAD Y CONTRASEÑAS
// ==========================================
const MASTER_PASSWORD_SECRETA = "SANTANA-ELMEJOR-2026"; // 👑 Tu contraseña secreta (Solo tú la conoces)
const RESELLER_PASSWORD_SECRETA = "REVENDEDOR-XIT-2026"; // 🤝 Contraseña que le das a tus revendedores

// Clave inicial de prueba para clientes
const KEY_INICIAL_CLIENTE = "SANTANA-CLIENTE-777";

window.onload = function() {
    inicializarBaseDeDatos();
    verificarSesionActiva();
};

function inicializarBaseDeDatos() {
    if (!localStorage.getItem("misKeysPersonalizadas")) {
        let keysIniciales = {};
        let fechaExpiracion = new Date().getTime() + (30 * 24 * 60 * 60 * 1000);
        keysIniciales[KEY_INICIAL_CLIENTE] = fechaExpiracion;
        localStorage.setItem("misKeysPersonalizadas", JSON.stringify(keysIniciales));
    }
}

// ==========================================
// 1. VALIDACIÓN DE CLIENTES
// ==========================================
function verificarKey() {
    let inputKey = document.getElementById("key-input").value.trim();
    let errorMsg = document.getElementById("error-msg");
    
    // TRUCO DE SEGURIDAD: Si metes tu contraseña maestra en la barra de clientes, te abre el Panel Master de inmediato
    if (inputKey === MASTER_PASSWORD_SECRETA) {
        document.getElementById("panel-master-admin").style.display = "flex";
        document.getElementById("login-screen").style.display = "none";
        alert("👑 ¡Bienvenido al Panel Master, Santana!");
        return;
    }

    let keysGuardadas = JSON.parse(localStorage.getItem("misKeysPersonalizadas")) || {};

    if (keysGuardadas[inputKey]) {
        let tiempoExpiracion = keysGuardadas[inputKey];
        let ahora = new Date().getTime();

        if (ahora < tiempoExpiracion) {
            localStorage.setItem("keyActivaSesion", inputKey);
            localStorage.setItem("tiempoExpiracionSesion", tiempoExpiracion);
            errorMsg.textContent = "";
            document.getElementById("key-input").value = "";
            verificarSesionActiva();
        } else {
            errorMsg.textContent = "❌ Esta Key ya ha expirado.";
        }
    } else {
        errorMsg.textContent = "❌ Key de cliente inválida.";
    }
}

function verificarSesionActiva() {
    let keyActiva = localStorage.getItem("keyActivaSesion");
    let tiempoExpiracion = localStorage.getItem("tiempoExpiracionSesion");
    let ahora = new Date().getTime();

    if (keyActiva && tiempoExpiracion && ahora < parseInt(tiempoExpiracion)) {
        document.getElementById("login-screen").style.display = "none";
        document.getElementById("panel-principal").style.display = "block";
        document.getElementById("key-activa-txt").textContent = keyActiva;
        
        let fechaExp = new Date(parseInt(tiempoExpiracion));
        document.getElementById("fecha-exp-txt").textContent = fechaExp.toLocaleDateString();

        iniciarContadorRegresivo(parseInt(tiempoExpiracion));
    } else {
        document.getElementById("login-screen").style.display = "block";
        document.getElementById("panel-principal").style.display = "none";
        limpiarContador();
    }
}

let intervaloTimer = null;
function iniciarContadorRegresivo(tiempoFinal) {
    if (intervaloTimer) clearInterval(intervaloTimer);

    intervaloTimer = setInterval(() => {
        let ahora = new Date().getTime();
        let distancia = tiempoFinal - ahora;

        if (distancia < 0) {
            clearInterval(intervaloTimer);
            document.getElementById("tiempo-restante-txt").textContent = "Expirada";
            desactivarKey();
            return;
        }

        let dias = Math.floor(distancia / (1000 * 60 * 60 * 24));
        let horas = Math.floor((distancia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        let minutos = Math.floor((distancia % (1000 * 60 * 60)) / (1000 * 60));
        let segundos = Math.floor((distancia % (1000 * 60)) / 1000);

        let textoTiempo = "";
        if (dias > 0) textoTiempo += dias + "d ";
        textoTiempo += horas + "h " + minutos + "m " + segundos + "s";

        document.getElementById("tiempo-restante-txt").textContent = textoTiempo;
    }, 1000);
}

function limpiarContador() {
    if (intervaloTimer) clearInterval(intervaloTimer);
}

function desactivarKey() {
    localStorage.removeItem("keyActivaSesion");
    localStorage.removeItem("tiempoExpiracionSesion");
    verificarSesionActiva();
}

// ==========================================
// 2. SISTEMA DE ACCESO PARA REVENDEDORES
// ==========================================
function verificarReseller() {
    let passInput = document.getElementById("reseller-pass-input").value.trim();

    if (passInput === RESELLER_PASSWORD_SECRETA) {
        // Ocultar login de revendedor y mostrar sus herramientas de generación
        document.getElementById("panel-reseller-login").style.display = "none";
        document.getElementById("panel-reseller-tools").style.display = "flex";
        alert("🤝 ¡Acceso concedido al panel de Revendedor!");
    } else {
        alert("❌ Contraseña de revendedor incorrecta.");
    }
}

function cerrarSesionReseller() {
    document.getElementById("panel-reseller-login").style.display = "block";
    document.getElementById("panel-reseller-tools").style.display = "none";
    document.getElementById("reseller-pass-input").value = "";
}

function generarKeyReseller() {
    let selectDias = document.getElementById("duracion-key-reseller").value;
    let diasNum = parseInt(selectDias);

    let aleatorio = Math.random().toString(36).substring(2, 6).toUpperCase();
    let nuevaKey = `RESELL-${aleatorio}`; // Prefijo para identificar keys de revendedor

    let ahora = new Date().getTime();
    let duracionMilisegundos = diasNum * 24 * 60 * 60 * 1000;
    let expiracionTotal = ahora + duracionMilisegundos;

    let keysGuardadas = JSON.parse(localStorage.getItem("misKeysPersonalizadas")) || {};
    keysGuardadas[nuevaKey] = expiracionTotal;
    localStorage.setItem("misKeysPersonalizadas", JSON.stringify(keysGuardadas));

    let campoOutput = document.getElementById("key-output-reseller");
    campoOutput.value = nuevaKey;
    
    navigator.clipboard.writeText(nuevaKey).then(() => {
        alert(`¡Key generada (${diasNum} días)! Copiada al portapapeles: ${nuevaKey}`);
    }).catch(() => {
        alert(`¡Key generada (${diasNum} días)! Cópiala: ${nuevaKey}`);
    });
}

// ==========================================
// 3. GENERADOR MASTER (SOLO PARA TI)
// ==========================================
function generarKeyMaster() {
    let selectDias = document.getElementById("duracion-master").value;
    let diasNum = parseInt(selectDias);

    let aleatorio = Math.random().toString(36).substring(2, 6).toUpperCase();
    let nuevaKey = `MASTER-${aleatorio}`;

    let ahora = new Date().getTime();
    let duracionMilisegundos = diasNum * 24 * 60 * 60 * 1000;
    let expiracionTotal = ahora + duracionMilisegundos;

    let keysGuardadas = JSON.parse(localStorage.getItem("misKeysPersonalizadas")) || {};
    keysGuardadas[nuevaKey] = expiracionTotal;
    localStorage.setItem("misKeysPersonalizadas", JSON.stringify(keysGuardadas));

    let campoOutput = document.getElementById("key-output-master");
    campoOutput.value = nuevaKey;
    
    navigator.clipboard.writeText(nuevaKey).then(() => {
        alert(`👑 ¡Key Master generada con éxito! Copiada: ${nuevaKey}`);
    });
}
