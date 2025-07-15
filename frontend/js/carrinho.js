const productImages = {
  'Rosquinha Cremosa': 'img/cremosa.jpg',
  'Rosquinha Tradicional': 'img/tradicional.jpg',
  'Rosquinha de Chocolate': 'img/chocolate.jpg',
  'Rosquinha de Morango': 'img/morango.jpg',
  'Rosquinha Doce de Leite': 'img/doceleite.jpg',
  'Rosquinha de Limão': 'img/limao.jpg',
  'Rosquinha de Baunilha': 'img/baunilha.jpg',
  'Rosquinha de Coco': 'img/coco.jpg',
  'Rosquinha Recheada': 'img/recheada.jpg',
  'Rosquinha de Caramelo': 'img/caramelo.jpg',
  'Rosquinha com Gotas de Chocolate': 'img/gotaschocolate.jpg',
  'Rosquinha de Morango com Chocolate': 'img/morangochocolate.jpg',
  'Rosquinha com Creme de Avelã': 'img/avela.jpg',
  'Rosquinha Doce de Abóbora': 'img/abobora.jpg',
  'Rosquinha de Café': 'img/cafe.jpg'
};

let sessionId = localStorage.getItem('sessionId');
if (!sessionId) {
  sessionId = 'guest-' + Math.random().toString(36).substr(2, 9);
  localStorage.setItem('sessionId', sessionId);
}

async function loadCart() {
  try {
    const token = sessionStorage.getItem('authToken');
    const headers = token
      ? { Authorization: `Bearer ${token}` }
      : { 'Session-Id': sessionId };

    const response = await fetch('/api/cart', { headers });
    if (!response.ok) throw new Error('Erro ao carregar carrinho');

    const cart = await response.json();
    const cartItems = document.getElementById('cartItems');
    const totalEl = document.getElementById('total');
    cartItems.innerHTML = '';
    let total = 0;

    if (!cart.length) {
      cartItems.innerHTML = '<p>Seu carrinho está vazio</p>';
      totalEl.textContent = '0.00';
      return;
    }

    cart.forEach(item => {
      const quantity = parseInt(item.quantity);
      const unitPrice = parseFloat(item.price);
      const itemTotal = unitPrice * quantity;

      const li = document.createElement('li');
      li.className = 'cart-item';

      const img = document.createElement('img');
      img.src = productImages[item.name] || 'img/default.jpg';
      img.alt = item.name;

      const info = document.createElement('div');
      info.className = 'item-info';
      info.innerHTML = `
        <h3>${item.name}</h3>
        <p>Quantidade: ${quantity}</p>
        <p>Preço Unitário: R$ ${unitPrice.toFixed(2)}</p>
        <p>Total: R$ ${itemTotal.toFixed(2)}</p>
      `;

      const removeBtn = document.createElement('button');
      removeBtn.textContent = '❌';
      removeBtn.className = 'remove-button';
      removeBtn.onclick = () => removeFromCart(item.id);

      li.append(img, info, removeBtn);
      cartItems.appendChild(li);
      total += itemTotal;
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
      'Content-Type': 'application/json',
      ...(token
        ? { Authorization: `Bearer ${token}` }
        : { 'Session-Id': sessionId })
    };

    const response = await fetch('/api/cart', {
      method: 'POST',
      headers,
      body: JSON.stringify({ productId, name, price, quantity: 1 })
    });

    if (!response.ok) throw new Error('Erro ao adicionar ao carrinho');
    updateCartCounter();
  } catch (error) {
    console.error('Erro ao adicionar ao carrinho:', error);
  }
}

async function removeFromCart(itemId) {
  try {
    const token = sessionStorage.getItem('authToken');
    const headers = token
      ? { Authorization: `Bearer ${token}` }
      : { 'Session-Id': sessionId };

    const response = await fetch(`/api/cart/${itemId}`, {
      method: 'DELETE',
      headers
    });

    if (!response.ok) throw new Error('Erro ao remover item');
    loadCart();
  } catch (error) {
    console.error('Erro ao remover item:', error);
  }
}

async function migrateGuestCart() {
  const token = sessionStorage.getItem('authToken');
  if (!token || !sessionId) return;

  try {
    const response = await fetch('/api/cart/migrate', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
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

document.getElementById('checkoutBtn').addEventListener('click', e => {
  const token = sessionStorage.getItem('authToken');
  if (!token) {
    e.preventDefault();
    alert('Você precisa estar logado para prosseguir com o pagamento.');
    window.location.href = 'login.html?redirect=carrinho';
  }
});

document.addEventListener('DOMContentLoaded', () => {
  loadCart();
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('migrate') === 'true') migrateGuestCart();
});

async function updateCartCounter() {
  const countElement = document.getElementById('cartCount');
  if (!countElement) return;

  try {
    const token = sessionStorage.getItem('authToken');
    const headers = token
      ? { Authorization: `Bearer ${token}` }
      : { 'Session-Id': sessionId };

    const response = await fetch('/api/cart', { headers });
    if (!response.ok) throw new Error('Erro ao buscar carrinho');

    const cart = await response.json();
    const totalItems = cart.reduce((sum, item) => sum + parseInt(item.quantity), 0);
    countElement.textContent = totalItems;
  } catch (error) {
    console.error('Erro ao atualizar contador:', error);
  }
}
