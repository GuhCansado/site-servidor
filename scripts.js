window.addEventListener("load", async () => {
    const statusIndicator = document.getElementById("status-indicator");
    const statusText = document.getElementById("status-text");
    const versionBox = document.getElementById("version");
    const sendButton = document.getElementById("sendButton");
    const jsonInput = document.getElementById("jsonInput");
    const responseBox = document.getElementById("responseBox");

    if (!statusIndicator || !statusText || !sendButton) {
        console.error("❌ Elementos não encontrados no DOM. Verifique os IDs no HTML.");
        return;
    }

    let serverData = null;

    // 📦 Função para carregar as informações do servidor
    async function loadServerInfo() {
        try {
            const res = await fetch("server_info.json?cache=" + Date.now());
            if (!res.ok) throw new Error("Arquivo server_info.json não encontrado.");
            serverData = await res.json();

            versionBox.textContent = `Versão: ${serverData.version || "Desconhecida"}`;

            if (serverData.status && serverData.status.toLowerCase() === "online") {
                statusIndicator.classList.add("online");
                statusText.textContent = "🟢 Servidor Online";
            } else {
                statusIndicator.classList.remove("online");
                statusText.textContent = "🔴 Servidor Offline";
            }
        } catch (err) {
            console.error("Erro ao carregar informações do servidor:", err);
            statusIndicator.classList.remove("online");
            statusText.textContent = "🔴 Erro ao carregar status";
        }
    }

    // 🚀 Envia o JSON digitado para o servidor
    async function sendJson() {
        if (!serverData || !serverData.url) {
            responseBox.textContent = "⚠️ Servidor não configurado ou offline.";
            return;
        }

        let userJson;
        try {
            userJson = JSON.parse(jsonInput.value);
        } catch {
            responseBox.textContent = "❌ JSON inválido. Corrija o formato antes de enviar.";
            return;
        }

        responseBox.textContent = "⏳ Enviando dados...";

        try {
            const res = await fetch(serverData.url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userJson)
            });

            const text = await res.text();
            responseBox.textContent = "✅ Resposta do servidor:\n" + text;
            jsonInput.value = "";
        } catch (err) {
            console.error("Erro ao enviar JSON:", err);
            responseBox.textContent = "🔴 Erro ao conectar ao servidor.";
        }
    }

    sendButton.addEventListener("click", sendJson);

    // 🔁 Atualiza o status a cada 10 segundos
    await loadServerInfo();
    setInterval(loadServerInfo, 10000);
});
