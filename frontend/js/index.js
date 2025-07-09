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

// Função para adicionar ao carrinho
async function addToCart(productId, name, price) {
  try {
    const token = sessionStorage.getItem('authToken');
    if (!token) {
      alert('Você precisa estar logado para adicionar itens ao carrinho');
      window.location.href = 'login.html';
      return;
    }

    const response = await fetch('/api/cart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
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

    alert(`${name} adicionado ao carrinho!`);
    updateCartCounter();
  } catch (error) {
    console.error('Erro ao adicionar ao carrinho:', error);
    alert(error.message);
  }
}

// Atualiza contador do carrinho
async function updateCartCounter() {
  try {
    const token = sessionStorage.getItem('authToken');
    if (!token) {
      document.getElementById('cartCount').textContent = '0';
      return;
    }

    const response = await fetch('/api/cart', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

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
  
  if (token && username) {
    document.getElementById('loginLink').style.display = 'none';
    document.getElementById('registerLink').style.display = 'none';
    document.getElementById('logoutLink').style.display = 'block';
    document.getElementById('userGreeting').textContent = `Olá, ${username}`;
  } else {
    document.getElementById('logoutLink').style.display = 'none';
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