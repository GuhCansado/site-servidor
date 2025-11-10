// Elementos da UI
const serverDot = document.getElementById('server-dot');
const serverStatus = document.getElementById('server-status');
const serverVersion = document.getElementById('server-version');
const jsonInput = document.getElementById('json-input');
const sendButton = document.getElementById('send-button');
const responseContent = document.getElementById('response-content');
const offlineMessage = document.getElementById('offline-message');
const commandFormContainer = document.getElementById('command-form-container');

// O caminho para o JSON de status no GitHub Pages
const STATUS_JSON_URL = "server_status.json"; 

// Variável que armazenará a URL pública atual do ngrok
let NGROK_API_URL = null;

// Função para formatar a resposta JSON
function formatResponse(data, isError = false) {
    if (isError) {
        responseContent.className = 'text-red-400 whitespace-pre-wrap';
        responseContent.textContent = data;
    } else {
        responseContent.className = 'text-green-400 whitespace-pre-wrap';
        responseContent.textContent = JSON.stringify(data, null, 2);
    }
}

// ----------------------------------------------------
// LÓGICA DE VERIFICAÇÃO DE STATUS
// ----------------------------------------------------

async function loadServerInfo() {
    console.log("Iniciando verificação de status do servidor...");
    try {
        // 1. Obtém o JSON de status (criado pelo Server.py e enviado ao GitHub)
        const statusResponse = await fetch(STATUS_JSON_URL, { cache: 'no-store' });
        if (!statusResponse.ok) {
            throw new Error(`Arquivo server_status.json não encontrado ou erro HTTP: ${statusResponse.status}`);
        }
        const statusData = await statusResponse.json();
        NGROK_API_URL = statusData.url;
        serverVersion.textContent = `Versão: v${statusData.version}`;
        
        if (statusData.status === "Online" && NGROK_API_URL) {
            // 2. Tenta fazer um HEAD/GET na URL do ngrok para checar conectividade real
            try {
                // Tentativa de GET em uma rota simples para testar a conexão
                const apiCheck = await fetch(`${NGROK_API_URL}/api/status`, {
                    method: 'GET',
                    headers: { 'Accept': 'application/json' },
                    mode: 'cors',
                    signal: AbortSignal.timeout(5000) // Timeout de 5s
                });

                if (apiCheck.ok && apiCheck.status === 200) {
                    // SUCESSO: Servidor Flask está ativo por trás do ngrok
                    serverDot.className = 'status-dot bg-green-online';
                    serverStatus.textContent = "Servidor Online (Conectado)";
                    sendButton.disabled = false;
                    offlineMessage.classList.add('hidden');
                    commandFormContainer.classList.remove('hidden');
                    return; // Sai da função com status OK
                } else {
                    throw new Error(`Resposta HTTP inesperada: ${apiCheck.status}`);
                }
            } catch (apiError) {
                // O ngrok está ativo, mas o servidor Flask pode ter caído, ou a conexão falhou
                // console.error("Erro ao conectar à API ngrok:", apiError);
                // Continua para o estado de erro abaixo
            }
        }
        
    } catch (error) {
        // console.error("Erro ao carregar informações do servidor:", error);
        // Se a busca inicial ou a checagem da API falharem, assume-se Offline
    }

    // Se o código chegou aqui, é porque falhou em algum momento
    serverDot.className = 'status-dot bg-red-offline';
    serverStatus.textContent = "Servidor Offline (Erro de Conexão)";
    sendButton.disabled = true;
    offlineMessage.classList.remove('hidden');
    commandFormContainer.classList.add('hidden');
    formatResponse("Não foi possível conectar ao servidor via ngrok ou o arquivo de status está desatualizado.", true);
}


// ----------------------------------------------------
// LÓGICA DE ENVIO DE COMANDOS
// ----------------------------------------------------

async function sendJson() {
    // 1. Validação de pré-requisitos
    if (sendButton.disabled || !NGROK_API_URL) {
        formatResponse("Servidor offline ou URL ngrok indisponível.", true);
        return;
    }

    let data;
    try {
        // 2. Tenta parsear o JSON de entrada
        data = JSON.parse(jsonInput.value);
    } catch (e) {
        formatResponse("Erro de sintaxe no JSON. Verifique se o formato está correto.", true);
        return;
    }
    
    // 3. Desabilita o botão e limpa a resposta
    sendButton.disabled = true;
    sendButton.textContent = "Enviando...";
    formatResponse("Aguardando resposta do servidor...", false); 

    try {
        // 4. Envia o JSON para a rota /api/cmd do Flask via ngrok
        const response = await fetch(`${NGROK_API_URL}/api/cmd`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data),
            mode: 'cors',
            signal: AbortSignal.timeout(10000) // Timeout de 10s para o comando
        });

        // 5. Verifica o status HTTP e trata a resposta
        if (!response.ok) {
             const errorBody = await response.json().catch(() => ({ message: response.statusText }));
             throw new Error(`HTTP Error ${response.status}: ${JSON.stringify(errorBody, null, 2)}`);
        }
        
        const responseData = await response.json();
        
        // 6. Exibe a resposta formatada
        formatResponse(responseData, responseData.error ? true : false);

    } catch (e) {
        // 7. Trata erros de rede, timeout, ou erros HTTP
        formatResponse(`Erro ao enviar comando: ${e.message || e}`, true);
        console.error("Erro no envio:", e);
    } finally {
        // 8. Reabilita o botão
        sendButton.disabled = false;
        sendButton.textContent = "Enviar Comando";
    }
}

// ----------------------------------------------------
// INICIALIZAÇÃO E LISTENERS
// ----------------------------------------------------

// Listener do botão Enviar
sendButton.addEventListener('click', sendJson);

// Inicia a verificação de status imediatamente
loadServerInfo();

// Atualiza o status a cada 10 segundos
setInterval(loadServerInfo, 10000);