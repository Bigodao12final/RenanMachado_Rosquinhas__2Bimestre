document.getElementById('loginForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const credentials = {
    username: this.username.value.trim(),
    password: this.password.value
  };

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro no login');
    }

    // Armazena o token e redireciona
    sessionStorage.setItem('authToken', data.token);
    sessionStorage.setItem('username', credentials.username);
    
    // Verifica se precisa redirecionar após login
    const urlParams = new URLSearchParams(window.location.search);
    const redirect = urlParams.get('redirect');
    
    if (redirect) {
      window.location.href = `${redirect}.html?migrate=true`;
    } else {
      window.location.href = 'index.html';
    }
  } catch (error) {
    alert(error.message);
    console.error('Erro no login:', error);
  }
});