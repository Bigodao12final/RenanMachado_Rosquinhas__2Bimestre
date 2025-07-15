// Função para mostrar produtos
async function displayProducts() {
  try {
    const response = await fetch('/api/products');
    const products = await response.json();

    const productsContainer = document.getElementById('products');
    productsContainer.innerHTML = '';

    products.forEach(product => {
      const productElement = document.createElement('div');
      productElement.className = 'product';
      productElement.innerHTML = `
        <img src="${product.image}" alt="${product.name}">
        <h3>${product.name}</h3>
        <p>R$ ${product.price.toFixed(2)}</p>
        <button onclick="addToCart('${product.id}', '${product.name}', ${product.price})">
          Adicionar ao Carrinho
        </button>
      `;
      productsContainer.appendChild(productElement);
    });
  } catch (error) {
    console.error('Erro ao carregar produtos:', error);
  }
}

// Função para adicionar ao carrinho sem exigir login
async function addToCart(productId, name, price) {
  try {
    let token = sessionStorage.getItem('authToken');
    let sessionId = sessionStorage.getItem('sessionId');

    // Se não existir sessionId para guest, cria um
    if (!token && !sessionId) {
      sessionId = `guest_${Date.now()}`;
      sessionStorage.setItem('sessionId', sessionId);
    }

    const headers = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else if (sessionId) {
      headers['Session-Id'] = sessionId;
    }

    const response = await fetch('/api/cart', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        productId,
        name,
        price,
        quantity: 1
      })
    });

    if (!response.ok) {
      throw new Error('Erro ao adicionar ao carrinho');
    }

    updateCartCounter();
  } catch (error) {
    console.error('Erro ao adicionar ao carrinho:', error);
  }
}

// Atualiza contador do carrinho
async function updateCartCounter() {
  try {
    const token = sessionStorage.getItem('authToken');
    const sessionId = sessionStorage.getItem('sessionId');

    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else if (sessionId) {
      headers['Session-Id'] = sessionId;
    }

    const response = await fetch('/api/cart', { headers });

    if (!response.ok) {
      throw new Error('Erro ao carregar carrinho');
    }

    const cart = await response.json();
    const totalItems = cart.reduce((sum, item) => sum + parseInt(item.quantity), 0);
    document.getElementById('cartCount').textContent = totalItems;
  } catch (error) {
    console.error('Erro ao atualizar contador:', error);
  }
}

// Verifica se usuário está logado
function checkLoggedIn() {
  const token = sessionStorage.getItem('authToken');
  const username = sessionStorage.getItem('username');

  const greeting = document.getElementById('userGreeting');
  const loginLink = document.getElementById('loginLink');
  const registerLink = document.getElementById('registerLink');
  const logoutLink = document.getElementById('logoutLink');

  if (token && username) {
    greeting.textContent = `Olá, ${username}`;
    if (logoutLink) logoutLink.style.display = 'inline';
    if (loginLink) loginLink.style.display = 'none';
    if (registerLink) registerLink.style.display = 'none';
  } else {
    greeting.textContent = '';
    if (logoutLink) logoutLink.style.display = 'none';
    if (loginLink) loginLink.style.display = 'inline';
    if (registerLink) registerLink.style.display = 'inline';
  }
}

// Logout
function logout() {
  sessionStorage.removeItem('authToken');
  sessionStorage.removeItem('username');
  window.location.href = 'index.html';
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  checkLoggedIn();
  updateCartCounter();
  displayProducts();
});
