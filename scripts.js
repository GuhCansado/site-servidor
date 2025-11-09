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

    // 🛑 NOVO CÓDIGO AQUI: Determina o endpoint
    let endpoint = userJson.comando; 

    // Garante que a rota é válida (se não tiver 'comando', o POST falhará, o que é um comportamento de segurança)
    if (!endpoint || (endpoint !== '/register' && endpoint !== '/login')) {
        if (responseBox) responseBox.textContent = '❌ JSON Inválido: Use "comando": "/register" ou "comando": "/login".';
        return;
    }

    if (responseBox) responseBox.textContent = "⏳ Enviando dados para " + endpoint + "...";
    
    // Concatena a URL base do ngrok com o endpoint extraído do JSON.
    const targetUrl = serverData.url + endpoint; 

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