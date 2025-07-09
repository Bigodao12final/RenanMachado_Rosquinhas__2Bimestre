// Configuração dos campos de pagamento
const paymentRadios = document.querySelectorAll('input[name="payment"]');
const pixForm = document.getElementById('pixForm');
const dinheiroForm = document.getElementById('dinheiroForm');
const cartaoTipo = document.getElementById('cartaoTipo');
const cartaoDados = document.getElementById('cartaoDados');

paymentRadios.forEach(radio => {
  radio.addEventListener('change', () => {
    const method = radio.value;
    pixForm.style.display = method === 'pix' ? 'block' : 'none';
    dinheiroForm.style.display = method === 'dinheiro' ? 'block' : 'none';
    cartaoTipo.style.display = method === 'cartao' ? 'block' : 'none';
    cartaoDados.style.display = 'none';
  });
});

document.querySelectorAll('input[name="tipoCartao"]').forEach(radio => {
  radio.addEventListener('change', () => {
    cartaoDados.style.display = 'block';
  });
});

// Máscaras para campos
document.getElementById('cpfInput')?.addEventListener('input', function() {
  this.value = this.value.replace(/\D/g, '').slice(0, 11);
});

document.getElementById('validadeInput')?.addEventListener('input', function() {
  let val = this.value.replace(/\D/g, '').slice(0, 4);
  if (val.length >= 2) {
    const mes = val.slice(0, 2);
    const ano = val.slice(2);
    this.value = `${mes}/${ano}`;
  } else {
    this.value = val;
  }
});

// Finalizar compra
document.getElementById('paymentForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const token = sessionStorage.getItem('authToken');
  if (!token) {
    alert('Você precisa estar logado para finalizar a compra');
    window.location.href = 'login.html';
    return;
  }

  const method = document.querySelector('input[name="payment"]:checked')?.value;
  if (!method) {
    alert('Selecione um método de pagamento');
    return;
  }

  try {
    // Validar campos conforme método selecionado
    let isValid = true;
    if (method === 'cartao') {
      isValid = validateCardFields();
    } else if (method === 'pix') {
      isValid = validatePixFields();
    } else if (method === 'dinheiro') {
      isValid = validateCashFields();
    }

    if (!isValid) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    // Processar pagamento
    const response = await fetch('/api/payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        method,
        details: getPaymentDetails(method)
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro no pagamento');
    }

    alert('Compra finalizada com sucesso!');
    window.location.href = 'index.html';
  } catch (error) {
    console.error('Erro ao finalizar compra:', error);
    alert(error.message || 'Erro ao processar pagamento');
  }
});

function validateCardFields() {
  const required = ['nomeCartao', 'numeroCartao', 'validade', 'cvv', 'cpf'];
  let isValid = true;
  
  required.forEach(field => {
    const element = document.querySelector(`[name="${field}"]`);
    if (!element?.value.trim()) {
      element?.classList.add('error');
      isValid = false;
    } else {
      element?.classList.remove('error');
    }
  });

  return isValid;
}

function validatePixFields() {
  const required = ['pixName', 'pixCpf'];
  let isValid = true;
  
  required.forEach(field => {
    const element = document.querySelector(`[name="${field}"]`);
    if (!element?.value.trim()) {
      element?.classList.add('error');
      isValid = false;
    } else {
      element?.classList.remove('error');
    }
  });

  return isValid;
}

function validateCashFields() {
  const needsChange = document.getElementById('trocoSelect')?.value === 'sim';
  const changeValue = document.querySelector('input[name="trocoValor"]')?.value;
  
  if (needsChange && !changeValue) {
    alert('Informe o valor para o troco');
    return false;
  }

  return true;
}

function getPaymentDetails(method) {
  if (method === 'cartao') {
    return {
      name: document.querySelector('[name="nomeCartao"]').value,
      number: document.querySelector('[name="numeroCartao"]').value,
      expiry: document.querySelector('[name="validade"]').value,
      cvv: document.querySelector('[name="cvv"]').value,
      cpf: document.querySelector('[name="cpf"]').value,
      type: document.querySelector('input[name="tipoCartao"]:checked').value
    };
  } else if (method === 'pix') {
    return {
      name: document.querySelector('[name="pixName"]').value,
      cpf: document.querySelector('[name="pixCpf"]').value
    };
  } else if (method === 'dinheiro') {
    return {
      needsChange: document.getElementById('trocoSelect').value === 'sim',
      changeFor: document.querySelector('[name="trocoValor"]')?.value || null
    };
  }
  return {};
}

// Carrega total ao abrir a página
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const token = sessionStorage.getItem('authToken');
    if (!token) {
      alert('Você precisa fazer login para finalizar a compra');
      window.location.href = 'login.html?redirect=pagamento';
      return;
    }

    const response = await fetch('/api/cart/total', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao carregar total');
    }

    const data = await response.json();
    document.getElementById('totalAmount').textContent = `R$ ${data.total.toFixed(2)}`;
    document.getElementById('pixValor').textContent = `R$ ${data.total.toFixed(2)}`;
  } catch (error) {
    console.error('Erro ao carregar total:', error);
    // Adicione tratamento visual de erro se necessário
    document.getElementById('totalAmount').textContent = 'Erro ao carregar';
  }
});