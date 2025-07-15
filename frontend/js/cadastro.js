// register.js
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');

  if (!form) {
    console.error('Elemento com id="registerForm" não encontrado.');
    return;
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const username = form.querySelector('input[name="username"]')?.value.trim();
    const email = form.querySelector('input[name="email"]')?.value.trim();
    const password = form.querySelector('input[name="password"]')?.value;
    const confirmPassword = form.querySelector('input[name="confirmPassword"]')?.value;

    // Validação básica
    if (!username || !email || !password || !confirmPassword) {
      alert('Todos os campos são obrigatórios!');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('E-mail inválido!');
      return;
    }

    if (password !== confirmPassword) {
      alert('As senhas não coincidem!');
      return;
    }

    if (password.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres!');
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) submitButton.disabled = true;

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, confirmPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro no cadastro');
      }

      sessionStorage.setItem('authToken', data.token);
      sessionStorage.setItem('username', data.username);

      alert('Cadastro realizado com sucesso!');
      window.location.href = 'index.html';
    } catch (error) {
      alert(error.message);
      console.error('Erro no cadastro:', error);
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
});
