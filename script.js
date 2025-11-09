let serverData = {};

async function carregarStatusServidor() {
    try {
        const response = await fetch("server_status.json");
        serverData = await response.json();

        document.getElementById("server-url").textContent = serverData.url;
        document.getElementById("server-port").textContent = serverData.porta;
        document.getElementById("server-status").textContent = serverData.status;
        document.getElementById("server-version").textContent = serverData.version;

    } catch (error) {
        document.getElementById("server-status").textContent = "Erro ao carregar status!";
        console.error("Erro ao ler JSON:", error);
    }
}

async function enviarComando(endpoint) {
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    if (!serverData.url) {
        alert("Servidor não encontrado. Aguarde carregar o status.");
        return;
    }

    try {
        const res = await fetch(`${serverData.url}/${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, senha })
        });

        const data = await res.json();
        document.getElementById("response").textContent = data.mensagem || "Resposta recebida.";
    } catch (error) {
        document.getElementById("response").textContent = "Erro ao conectar ao servidor.";
        console.error(error);
    }
}

document.getElementById("btn-register").addEventListener("click", () => enviarComando("register"));
document.getElementById("btn-login").addEventListener("click", () => enviarComando("login"));

carregarStatusServidor();
