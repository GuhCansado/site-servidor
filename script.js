// URL do JSON hospedado no GitHub Pages
const STATUS_URL = "https://guhcansado.github.io/site-servidor/server_status.json";

// Função que busca o servidor atual
async function getServerInfo() {
    try {
        const response = await fetch(STATUS_URL + `?t=${Date.now()}`); // evita cache
        const data = await response.json();
        console.log("📡 Servidor carregado:", data);
        return data;
    } catch (error) {
        console.error("❌ Erro ao buscar status do servidor:", error);
        alert("Não foi possível conectar ao servidor. Tente novamente mais tarde.");
        return null;
    }
}

// =============================
// INTERFACE E BOTÕES
// =============================
document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("container");
    const loginBtn = document.getElementById("login-btn");
    const registerBtn = document.getElementById("register-btn");

    loginBtn.addEventListener("click", () => showForm("login"));
    registerBtn.addEventListener("click", () => showForm("register"));
});

// Cria o formulário dinamicamente
function showForm(type) {
    const container = document.getElementById("container");
    container.innerHTML = "";

    const form = document.createElement("div");
    form.classList.add("form");

    let html = "";
    if (type === "login") {
        html = `
            <h2>Login</h2>
            <input type="email" id="email" placeholder="Email" required><br>
            <input type="password" id="senha" placeholder="Senha" required><br>
        `;
    } else {
        html = `
            <h2>Registro</h2>
            <input type="text" id="nome" placeholder="Nome" required><br>
            <input type="email" id="email" placeholder="Email" required><br>
            <input type="password" id="senha" placeholder="Senha" required><br>
        `;
    }

    form.innerHTML = html + `<button id="send-btn">Concluir</button>`;
    container.appendChild(form);

    document.getElementById("send-btn").addEventListener("click", () => sendData(type));
}

// Envia dados para o servidor Ngrok
async function sendData(type) {
    const server = await getServerInfo();
    if (!server) return;

    const url = `${server.url}/${type}`;
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;
    const nome = document.getElementById("nome") ? document.getElementById("nome").value : "";

    const payload = type === "login"
        ? { email, senha }
        : { email, senha, nome };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        alert(`🔹 ${data.mensagem || JSON.stringify(data)}`);
    } catch (error) {
        console.error("Erro ao enviar:", error);
        alert("Falha ao conectar ao servidor.");
    }
}
