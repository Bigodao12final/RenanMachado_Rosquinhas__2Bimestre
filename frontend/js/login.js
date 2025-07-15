// login.js
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');

  if (!form) {
    console.error('Elemento com id="loginForm" não encontrado.');
    return;
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const usernameInput = form.querySelector('input[name="username"]');
    const passwordInput = form.querySelector('input[name="password"]');

    if (!usernameInput || !passwordInput) {
      alert('Campos de login não encontrados!');
      return;
    }

    const credentials = {
      username: usernameInput.value.trim(),
      password: passwordInput.value
    };

    // Validação simples
    if (!credentials.username || !credentials.password) {
      alert('Preencha todos os campos!');
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) submitButton.disabled = true;

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro no login');
      }

      sessionStorage.setItem('authToken', data.token);
      sessionStorage.setItem('username', credentials.username);

      const urlParams = new URLSearchParams(window.location.search);
      const redirect = urlParams.get('redirect');

      window.location.href = redirect
        ? `${redirect}.html?migrate=true`
        : 'index.html';
    } catch (error) {
      alert(error.message);
      console.error('Erro no login:', error);
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
});
