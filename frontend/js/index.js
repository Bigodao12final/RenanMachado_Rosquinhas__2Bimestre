let cart = [];  // Array para armazenar os itens do carrinho
 const userArea = document.getElementById('userArea');
  const username = localStorage.getItem('loggedUser');

  if (username) {
    userArea.innerHTML = `
      <span class="user-name">${username}</span>
      <button class="logout-button" id="logoutBtn">Logout</button>
    `;

    document.getElementById('logoutBtn').addEventListener('click', () => {
      localStorage.removeItem('loggedUser');
      location.reload(); // Recarrega a página para mostrar o botão Login
    });
  } else {
    userArea.innerHTML = `<a href="login.html" class="footer-link login-button">Login</a>`;
  }
// Função para adicionar um produto ao carrinho
// Objeto para rastrear produtos já adicionados
const addedProducts = {};

function addToCart(name, price) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    const item = cart.find(i => i.name === name);
    
    if (item) {
        item.quantity += 1;
        // Não mostra alerta se já foi adicionado antes
        if (!addedProducts[name]) {
            addedProducts[name] = true;
            showToast(`${name} foi adicionado ao carrinho!`);
        }
    } else {
        cart.push({ name, price, quantity: 1 });
        addedProducts[name] = true;
        showToast(`${name} foi adicionado ao carrinho!`);
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCounter();
}

// Função para mostrar notificação toast (opcional, mais elegante que alert)
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 2000);
}
// ===== CONTROLE DE LOGIN/CADASTRO =====
document.addEventListener('DOMContentLoaded', function() {
    const username = localStorage.getItem('loggedUser');
    const userArea = document.getElementById('userArea');

    if (username) {
        // USUÁRIO LOGADO (oculta cadastro)
        userArea.innerHTML = `
            <span class="user-name">${username}</span>
            <button class="logout-button" id="logoutBtn">Logout</button>
            <a href="login.html" class="footer-link login-button" style="display: none;">Login</a>
            <a href="cadastro.html" class="footer-link register-button" style="display: none;">Cadastre-se</a>
        `;

        document.getElementById('logoutBtn').addEventListener('click', function() {
            localStorage.removeItem('loggedUser');
            location.reload(); // Botão "Cadastre-se" reaparece após logout
        });

    } else {
        // USUÁRIO NÃO LOGADO (mostra ambos)
        userArea.innerHTML = `
            <a href="login.html" class="footer-link login-button">Login</a>
            <a href="cadastro.html" class="footer-link register-button">Cadastre-se</a>
        `;
    }
});