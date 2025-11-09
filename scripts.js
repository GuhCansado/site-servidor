window.addEventListener("load", async () => {
    const statusIndicator = document.getElementById("status-indicator");
    const statusText = document.getElementById("status-text");
    const versionBox = document.getElementById("version");
    const sendButton = document.getElementById("sendButton");
    const jsonInput = document.getElementById("jsonInput");
    const responseBox = document.getElementById("responseBox"); 

    if (!statusIndicator || !statusText || !sendButton || !responseBox) {
        console.error("❌ Elementos não encontrados no DOM. Verifique os IDs no HTML.");
        return;
    }

    let serverData = null;

    // 📦 Função para carregar as informações do servidor
    async function loadServerInfo() {
        try {
            // 🛑 CORREÇÃO: Buscando 'server_status.json' (conforme o Python gera)
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
            responseBox.textContent = "⚠️ Erro ao carregar status. Verifique se 'server_status.json' foi enviado para o GitHub Pages.";
        }
    }

    // 🚀 Envia o JSON digitado para o servidor
    async function sendJson() {
        if (!serverData || !serverData.url) {
            responseBox.textContent = "⚠️ Servidor não configurado ou offline. (URL não encontrada no JSON)";
            return;
        }

        let userJson;
        try {
            // Tenta analisar o JSON digitado
            userJson = JSON.parse(jsonInput.value);
        } catch {
            responseBox.textContent = "❌ JSON inválido. Corrija o formato antes de enviar.";
            return;
        }

        // 🛑 CORREÇÃO 405: Determina o endpoint a partir do JSON
        let endpoint = userJson.comando; 

        // Validação básica do comando
        if (!endpoint || (endpoint !== '/register' && endpoint !== '/login')) {
            responseBox.textContent = '❌ JSON Inválido: Use **"comando": "/register"** ou **"comando": "/login"** no seu JSON.';
            return;
        }

        responseBox.textContent = "⏳ Enviando dados para " + endpoint + "...";
        
        // Concatena a URL base do ngrok com o endpoint extraído do JSON.
        // targetUrl será algo como: https://seu.ngrok.dev/login
        const targetUrl = serverData.url + endpoint; 

        try {
            const res = await fetch(targetUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userJson)
            });

            // Se o servidor retornar HTML (como no erro 405), exibimos o erro de forma clara.
            if (res.status === 405) {
                responseBox.textContent = "🔴 Erro 405 (Method Not Allowed). Verifique se o endpoint existe: " + targetUrl;
                return;
            }
            
            const text = await res.text();
            responseBox.textContent = "✅ Resposta do servidor:\n" + text;
            jsonInput.value = "";
        } catch (err) {
            console.error("Erro ao enviar JSON:", err);
            responseBox.textContent = "🔴 Erro ao conectar ao servidor. (Verifique o CORS ou se o ngrok está ativo).";
        }
    }

    sendButton.addEventListener("click", sendJson);

    // 🔁 Atualiza o status a cada 10 segundos
    await loadServerInfo();
    setInterval(loadServerInfo, 10000);
});