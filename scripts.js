document.addEventListener("DOMContentLoaded", () => {
    const loginButton = document.getElementById("loginButton");
    const registerButton = document.getElementById("registerButton");
    const statusIndicator = document.getElementById("status-indicator");
    const statusText = document.getElementById("status-text");

    // 🔗 Troque pelo link do seu servidor Ngrok ou localhost
    const SERVER_URL = "https://seu-endereco-ngrok.ngrok.io";

    // Verifica status do servidor
    async function checkServerStatus() {
        try {
            const response = await fetch(SERVER_URL + "/status");
            if (response.ok) {
                statusIndicator.classList.remove("offline");
                statusIndicator.classList.add("online");
                statusText.textContent = "Servidor Online";
            } else {
                throw new Error();
            }
        } catch {
            statusIndicator.classList.remove("online");
            statusIndicator.classList.add("offline");
            statusText.textContent = "Servidor Offline";
        }
    }

    // Verifica a cada 10 segundos
    checkServerStatus();
    setInterval(checkServerStatus, 10000);

    // Ações dos botões
    loginButton.addEventListener("click", () => {
        window.location.href = "login.html";
    });

    registerButton.addEventListener("click", () => {
        window.location.href = "registro.html";
    });
});
