document.addEventListener("DOMContentLoaded", async () => {
    const statusIndicator = document.getElementById("status-indicator");
    const statusText = document.getElementById("status-text");
    const versionBox = document.getElementById("version");
    const sendButton = document.getElementById("sendButton");
    const jsonInput = document.getElementById("jsonInput");
    const responseBox = document.getElementById("responseBox");

    let serverData = null;

    // 📦 Carrega as informações do servidor
    async function loadServerInfo() {
        try {
            const res = await fetch("server_info.json");
            serverData = await res.json();

            versionBox.textContent = `Versão: ${serverData.version || "Desconhecida"}`;

            if (serverData.status.toLowerCase() === "online") {
                statusIndicator.classList.add("online");
                statusText.textContent = "🟢 Servidor Online";
            } else {
                statusIndicator.classList.remove("online");
                statusText.textContent = "🔴 Servidor Offline";
            }
        } catch (err) {
            statusText.textContent = "Erro ao carregar informações do servidor.";
        }
    }

    // 🚀 Envia o JSON digitado para o servidor
    async function sendJson() {
        if (!serverData || !serverData.url) {
            responseBox.textContent = "Erro: servidor não configurado.";
            return;
        }

        let userJson;
        try {
            userJson = JSON.parse(jsonInput.value);
        } catch {
            responseBox.textContent = "Erro: JSON inválido.";
            return;
        }

        try {
            const res = await fetch(`${serverData.url}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userJson)
            });

            const data = await res.text();
            responseBox.textContent = "Resposta do servidor:\n" + data;
            jsonInput.value = "";
        } catch (err) {
            responseBox.textContent = "Erro ao conectar ao servidor.";
        }
    }

    sendButton.addEventListener("click", sendJson);

    await loadServerInfo();
});
