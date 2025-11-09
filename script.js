const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const form = document.getElementById("form");
const inputsDiv = document.getElementById("inputs");
const statusMsg = document.getElementById("status");

let currentMode = null;

loginBtn.addEventListener("click", () => {
    currentMode = "login";
    form.classList.remove("hidden");
    inputsDiv.innerHTML = `
        <input type="email" id="email" placeholder="Email" required>
        <input type="password" id="senha" placeholder="Senha" required>
    `;
});

registerBtn.addEventListener("click", () => {
    currentMode = "register";
    form.classList.remove("hidden");
    inputsDiv.innerHTML = `
        <input type="email" id="email" placeholder="Email" required>
        <input type="password" id="senha" placeholder="Senha" required>
        <input type="text" id="nome" placeholder="Nome de usuário" required>
    `;
});

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    statusMsg.textContent = "⏳ Enviando...";

    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;
    const nome = document.getElementById("nome")?.value;

    let endpoint = currentMode === "login" ? "/login" : "/register";

    try {
        const resposta = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, senha, nome }),
        });

        const data = await resposta.json();
        statusMsg.textContent = data.mensagem || JSON.stringify(data);
    } catch (err) {
        statusMsg.textContent = "❌ Erro ao conectar ao servidor.";
    }
});
