 const paymentRadios = document.querySelectorAll('input[name="payment"]');
    const pixForm = document.getElementById('pixForm');
    const dinheiroForm = document.getElementById('dinheiroForm');
    const trocoSelect = document.getElementById('trocoSelect');
    const trocoValorDiv = document.getElementById('trocoValorDiv');
    const pixValorInput = document.getElementById('pixValor');

    const cartaoTipo = document.getElementById('cartaoTipo');
    const cartaoDadosPessoais = document.getElementById('cartaoDadosPessoais');
    const cartaoInfo = document.getElementById('cartaoInfo');

    const tipoCartaoRadios = document.getElementsByName('tipoCartao');

    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    function getTotal() {
      return cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);
    }

    pixValorInput.value = "R$ " + getTotal();

    // Atualiza visibilidade com base na forma de pagamento
    paymentRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        const value = radio.value;
        pixForm.style.display = value === 'pix' ? 'block' : 'none';
        dinheiroForm.style.display = value === 'dinheiro' ? 'block' : 'none';
        cartaoTipo.style.display = value === 'cartao' ? 'block' : 'none';
        cartaoDadosPessoais.style.display = 'none';
        cartaoInfo.style.display = 'none';
      });
    });

    tipoCartaoRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        cartaoDadosPessoais.style.display = 'block';
        cartaoInfo.style.display = 'block';
      });
    });

    trocoSelect.addEventListener('change', () => {
      trocoValorDiv.style.display = trocoSelect.value === 'sim' ? 'block' : 'none';
    });

    document.getElementById('paymentForm').addEventListener('submit', function (e) {
      e.preventDefault();
      const method = document.querySelector('input[name="payment"]:checked')?.value || '';
      alert(`Pagamento confirmado via ${method.toUpperCase()}`);
      localStorage.removeItem('cart');
      window.location.href = "index.html";

    });
// Finaliza a compra
function completePurchase(method) {
    alert(`✅ Pagamento via ${method.toUpperCase()} confirmado!`);
    localStorage.removeItem('cart');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}
// Máscaras para campos do cartão
document.querySelector('input[name="numeroCartao"]')?.addEventListener('input', function () {
    this.value = this.value.replace(/\D/g, '').slice(0, 16);
});

document.querySelector('input[name="cvv"]')?.addEventListener('input', function () {
    this.value = this.value.replace(/\D/g, '').slice(0, 3);
});

document.querySelector('input[name="validade"]')?.addEventListener('input', function () {
    this.value = this.value.replace(/[^0-9\/]/g, '').slice(0, 5);
});

document.querySelector('input[name="cpf"]')?.addEventListener('input', function () {
    this.value = this.value.replace(/\D/g, '').slice(0, 11);
});

document.getElementById("cpfInput")?.addEventListener("input", function () {
    this.value = this.value.replace(/\D/g, "").slice(0, 11);
});

// Formatação automática para MM/AA
const validadeInput = document.getElementById("validadeInput");
validadeInput?.addEventListener("input", function () {
    let val = this.value.replace(/\D/g, "").slice(0, 4);
    if (val.length >= 3) {
        const mes = parseInt(val.slice(0, 2), 10);
        const ano = val.slice(2);
        if (mes < 1 || mes > 12) {
            this.value = "";
            alert("Mês inválido. Use um valor entre 01 e 12.");
            return;
        }
        this.value = (mes < 10 ? "0" + mes : mes) + "/" + ano;
    } else {
        this.value = val;
    }
});
// Configuração inicial
document.addEventListener('DOMContentLoaded', function () {
    const paymentForm = document.getElementById('paymentForm');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    document.getElementById('cpfInput')?.addEventListener('input', function () {
        this.value = this.value.replace(/\D/g, '').slice(0, 11);
    });

    document.querySelectorAll('input[name="payment"]').forEach(radio => {
        radio.addEventListener('change', togglePaymentFields);
    });

    // ✅ BOTÃO CONFIRMAR PAGAMENTO FUNCIONANDO PARA TODOS OS MÉTODOS
    paymentForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const method = document.querySelector('input[name="payment"]:checked')?.value;

        if (!method) {
            alert("Selecione uma forma de pagamento.");
            return;
        }

        let isValid = false;

        if (method === "cartao") {
            const tipoCartao = document.querySelector('input[name="tipoCartao"]:checked');
            if (!tipoCartao) {
                alert("Selecione Débito ou Crédito.");
                return;
            }
            isValid = validateCard();
        } else if (method === "pix") {
            isValid = validatePix();
        } else if (method === "dinheiro") {
            isValid = validateCash();
        }

        if (!isValid) {
            alert("Preencha todos os campos obrigatórios.");
            return;
        }

        completePurchase(method);
    });
});

// Troca de visibilidade dos campos
function togglePaymentFields() {
    const method = this.value;

    document.querySelectorAll('.payment-details').forEach(el => {
        el.style.display = 'none';
    });

    if (method === 'cartao') {
        document.getElementById('cartaoTipo').style.display = 'block';
    } else if (method) {
        document.getElementById(`${method}Form`).style.display = 'block';
    }
}

// Validações
function validateCard() {
    const required = ['nomeCompleto', 'email', 'cpf', 'numeroCartao', 'validade', 'cvv'];
    return validateFields(required) && validateCardType();
}

function validatePix() {
    return validateFields(['pixName', 'pixCPF']);
}

function validateCash() {
    const needsChange = document.getElementById('trocoSelect').value === 'sim';
    if (needsChange && !document.querySelector('input[name="trocoValor"]').value) {
        alert("Informe para quanto precisa de troco");
        return false;
    }
    return validateFields(['cashName']);
}

function validateCardType() {
    const tipo = document.querySelector('input[name="tipoCartao"]:checked');
    return !!tipo;
}

function validateFields(fields) {
    let valid = true;
    fields.forEach(name => {
        const field = document.querySelector(`[name="${name}"]`);
        if (!field?.value.trim()) {
            field?.classList.add('error');
            valid = false;
        } else {
            field.classList.remove('error');
        }
    });
    return valid;
}
