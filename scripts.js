window.addEventListener("load", async () => {
    const statusIndicator = document.getElementById("status-indicator");
    const statusText = document.getElementById("status-text");
    const versionBox = document.getElementById("version");
    const sendButton = document.getElementById("sendButton");
    const jsonInput = document.getElementById("jsonInput");
    // Adicionei responseBox aqui, caso seu HTML o use para exibir a resposta.
    const responseBox = document.getElementById("responseBox"); 

    if (!statusIndicator || !statusText || !sendButton) {
        console.error("❌ Elementos não encontrados no DOM. Verifique os IDs no HTML.");
        return;
    }

    let serverData = null;

    // 📦 Função para carregar as informações do servidor
    async function loadServerInfo() {
        try {
            // 🛑 ALTERAÇÃO AQUI: Buscando 'server_status.json'
            const res = await fetch("server_status.json?cache=" + Date.now()); 
            
            if (!res.ok) throw new Error("Arquivo server_status.json não encontrado.");
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
            if (responseBox) responseBox.textContent = "⚠️ Verifique se 'server_status.json' foi enviado para o GitHub Pages.";
        }
    }

    // 🚀 Envia o JSON digitado para o servidor
    async function sendJson() {
        if (!serverData || !serverData.url) {
            if (responseBox) responseBox.textContent = "⚠️ Servidor não configurado ou offline. (URL não encontrada no JSON)";
            return;
        }

        let userJson;
        try {
            userJson = JSON.parse(jsonInput.value);
        } catch {
            if (responseBox) responseBox.textContent = "❌ JSON inválido. Corrija o formato antes de enviar.";
            return;
        }

        if (responseBox) responseBox.textContent = "⏳ Enviando dados...";
        
        // Determina a URL de destino (Você pode querer adicionar o endpoint aqui, se necessário)
        // Por exemplo, se for para login: const targetUrl = serverData.url + "/login";
        const targetUrl = serverData.url; 

        try {
            const res = await fetch(targetUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userJson)
            });

            const text = await res.text();
            if (responseBox) responseBox.textContent = "✅ Resposta do servidor:\n" + text;
            jsonInput.value = "";
        } catch (err) {
            console.error("Erro ao enviar JSON:", err);
            if (responseBox) responseBox.textContent = "🔴 Erro ao conectar ao servidor. (Verifique o CORS no Flask)";
        }
    }

    sendButton.addEventListener("click", sendJson);

    // 🔁 Atualiza o status a cada 10 segundos
    await loadServerInfo();
    setInterval(loadServerInfo, 10000);
});