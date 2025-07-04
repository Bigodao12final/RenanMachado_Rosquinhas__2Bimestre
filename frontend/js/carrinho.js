   const productImages = {
      'Rosquinha Cremosa': 'img/cremosa.jpg',
      'Rosquinha Tradicional': 'img/tradicional.jpg',
      'Rosquinha de Chocolate': 'img/chocolate.jpg',
      'Rosquinha de Morango': 'img/morango.jpg',
      'Rosquinha de Baunilha':'img/baunilha.jpg',
      'Rosquinha Doce de Leite':'img/docedeleite.jpg',
      'Rosquinha de Limão':'img/limao.jpg',
      'Rosquinha de Coco':'img/coco.jpg',
      'Rosquinha Recheada':'img/recheada.jpg',
      'Rosquinha de Flocos':'img/flocos.jpg',
      'Rosquinha com Gotas de Chocolate':'img/gotasdechocolate.jpg',
      'Rosquinha de Maracujá':'img/maracuja.jpg',
      'Rosquinha de Canela':'img/canela.jpg',
      'Rosquinha de Brigadeiro':'img/brigadeiro.jpg',
      'Rosquinha de Granulado':'img/granulado.jpg'

    };

    function loadCart() {
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      const cartItems = document.getElementById('cartItems');
      const totalEl = document.getElementById('total');
      cartItems.innerHTML = '';
      let total = 0;

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
          <p>Preço Unitário: R$ ${item.price.toFixed(2)}</p>
          <p>Total: R$ ${(item.price * item.quantity).toFixed(2)}</p>
        `;

        const removeBtn = document.createElement('button');
        removeBtn.textContent = '❌';
        removeBtn.classList.add('remove-button');
        removeBtn.onclick = () => removeFromCart(index);

        li.appendChild(img);
        li.appendChild(info);
        li.appendChild(removeBtn);
        cartItems.appendChild(li);

        total += item.price * item.quantity;
      });

      totalEl.textContent = total.toFixed(2);
    }

    function removeFromCart(index) {
      let cart = JSON.parse(localStorage.getItem('cart')) || [];
      cart.splice(index, 1);
      localStorage.setItem('cart', JSON.stringify(cart));
      loadCart(); // Atualiza a tela
    }

    loadCart();
  document.getElementById('checkoutBtn').addEventListener('click', function (e) {
    const loggedUser = localStorage.getItem('loggedUser');

    if (!loggedUser) {
      e.preventDefault(); // Impede o redirecionamento
      alert("Você precisa estar logado para prosseguir com o pagamento.");
      window.location.href = "login.html"; // Redireciona para tela de login
    }
  });
// Exibe os itens do carrinho
function displayCart() {
    const cartItemsContainer = document.getElementById("cart-items");
    const cartData = JSON.parse(localStorage.getItem('cart')) || [];
    let total = 0;

    cartItemsContainer.innerHTML = '';  // Limpa o carrinho

    cartData.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.textContent = `${item.name} - R$ ${item.price}`;
        cartItemsContainer.appendChild(itemElement);
        total += parseFloat(item.price); // Corrigido para evitar soma incorreta
    });

    const totalElement = document.getElementById("total");
    totalElement.textContent = `Total: R$ ${total.toFixed(2)}`;
}

// Redireciona para a página de checkout
function goToCheckout() {
    const cartData = JSON.parse(localStorage.getItem('cart')) || [];
    if (cartData.length === 0) {
        alert("Seu carrinho está vazio. Adicione itens antes de finalizar a compra.");
    } else {
        window.location.href = 'pagamento.html';
    }
}
// Exibe os itens do carrinho quando a página carregar
if (document.getElementById("cart-items")) {
    displayCart();
}
