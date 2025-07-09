const productImages = {
  'Rosquinha Cremosa': 'img/cremosa.jpg',
  'Rosquinha Tradicional': 'img/tradicional.jpg',
  // ... (outras imagens de produtos)
};

// Gerar sessionId único para usuários não logados
let sessionId = localStorage.getItem('sessionId');
if (!sessionId) {
  sessionId = 'guest-' + Math.random().toString(36).substr(2, 9);
  localStorage.setItem('sessionId', sessionId);
}

async function loadCart() {
  try {
    const token = sessionStorage.getItem('authToken');
    const headers = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      headers['Session-Id'] = sessionId;
    }

    const response = await fetch('/api/cart', {
      headers: headers
    });

    if (!response.ok) {
      throw new Error('Erro ao carregar carrinho');
    }

    const cart = await response.json();
    const cartItems = document.getElementById('cartItems');
    const totalEl = document.getElementById('total');
    cartItems.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
      cartItems.innerHTML = '<p>Seu carrinho está vazio</p>';
      totalEl.textContent = '0.00';
      return;
    }

    cart.forEach((item, index) => {
      const li = document.createElement('li');
      li.classList.add('cart-item');

      const img = document.createElement('img');
      img.src = productImages[item.name] || 'img/default.jpg';
      img.alt = item.name;

      const info = document.createElement('div');
      info.classList.add('item-info');
      info.innerHTML = `
        <h3>${item.name}</h3>
        <p>Quantidade: ${item.quantity}</p>
        <p>Preço Unitário: R$ ${parseFloat(item.price).toFixed(2)}</p>
        <p>Total: R$ ${(parseFloat(item.price) * parseInt(item.quantity)).toFixed(2)}</p>
      `;

      const removeBtn = document.createElement('button');
      removeBtn.textContent = '❌';
      removeBtn.classList.add('remove-button');
      removeBtn.onclick = () => removeFromCart(item.id);

      li.appendChild(img);
      li.appendChild(info);
      li.appendChild(removeBtn);
      cartItems.appendChild(li);

      total += parseFloat(item.price) * parseInt(item.quantity);
    });

    totalEl.textContent = total.toFixed(2);
  } catch (error) {
    console.error('Erro ao carregar carrinho:', error);
    document.getElementById('cartItems').innerHTML = '<p>Erro ao carregar carrinho</p>';
  }
}

async function addToCart(productId, name, price) {
  try {
    const token = sessionStorage.getItem('authToken');
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      headers['Session-Id'] = sessionId;
    }

    const response = await fetch('/api/cart', {
      method: 'POST',
      headers: headers,
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

    showToast(`${name} adicionado ao carrinho!`);
    updateCartCounter();
  } catch (error) {
    console.error('Erro ao adicionar ao carrinho:', error);
    alert(error.message);
  }
}

async function removeFromCart(itemId) {
  try {
    const token = sessionStorage.getItem('authToken');
    const headers = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      headers['Session-Id'] = sessionId;
    }

    const response = await fetch(`/api/cart/${itemId}`, {
      method: 'DELETE',
      headers: headers
    });

    if (!response.ok) {
      throw new Error('Erro ao remover item');
    }

    loadCart();
  } catch (error) {
    console.error('Erro ao remover item:', error);
    alert(error.message);
  }
}

// Migrar carrinho guest para usuário após login
async function migrateGuestCart() {
  const token = sessionStorage.getItem('authToken');
  if (!token || !sessionId) return;

  try {
    const response = await fetch('/api/cart/migrate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Session-Id': sessionId
      }
    });

    if (response.ok) {
      localStorage.removeItem('sessionId');
      sessionId = null;
    }
  } catch (error) {
    console.error('Erro ao migrar carrinho:', error);
  }
}

document.getElementById('checkoutBtn').addEventListener('click', function(e) {
  const token = sessionStorage.getItem('authToken');
  if (!token) {
    e.preventDefault();
    alert("Você precisa estar logado para prosseguir com o pagamento.");
    window.location.href = "login.html?redirect=carrinho";
  }
});

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  loadCart();
  
  // Verificar se veio de login para migrar carrinho
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('migrate') === 'true') {
    migrateGuestCart();
  }
});

// Função auxiliar para mostrar notificações
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Atualizar contador do carrinho
async function updateCartCounter() {
  const countElement = document.getElementById('cartCount');
  if (!countElement) return;

  try {
    const token = sessionStorage.getItem('authToken');
    const headers = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      headers['Session-Id'] = sessionId;
    }

    const response = await fetch('/api/cart', {
      headers: headers
    });

    if (response.ok) {
      const cart = await response.json();
      const totalItems = cart.reduce((sum, item) => sum + parseInt(item.quantity), 0);
      countElement.textContent = totalItems;
    }
  } catch (error) {
    console.error('Erro ao atualizar contador:', error);
  }
}