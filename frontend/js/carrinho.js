const productImages = {
  'Rosquinha Cremosa': 'img/cremosa.jpg',
  'Rosquinha Tradicional': 'img/tradicional.jpg',
  // ... (outras imagens de produtos)
};

async function loadCart() {
  try {
    const token = sessionStorage.getItem('authToken');
    if (!token) {
      document.getElementById('cartItems').innerHTML = '<p>Faça login para ver seu carrinho</p>';
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

async function removeFromCart(itemId) {
  try {
    const token = sessionStorage.getItem('authToken');
    if (!token) {
      alert('Você precisa estar logado para remover itens');
      window.location.href = 'login.html';
      return;
    }

    const response = await fetch(`/api/cart/${itemId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
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

document.getElementById('checkoutBtn').addEventListener('click', function(e) {
  const token = sessionStorage.getItem('authToken');
  if (!token) {
    e.preventDefault();
    alert("Você precisa estar logado para prosseguir com o pagamento.");
    window.location.href = "login.html";
  }
});

// Inicialização
document.addEventListener('DOMContentLoaded', loadCart);