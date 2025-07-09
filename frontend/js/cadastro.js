document.getElementById('registerForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const formData = {
    username: this.username.value.trim(),
    email: this.email.value.trim(),
    password: this.password.value,
    confirmPassword: this.confirmPassword.value
  };

  // Validações client-side
  if (formData.password !== formData.confirmPassword) {
    alert("As senhas não coincidem!");
    return;
  }

  if (formData.password.length < 6) {
    alert("A senha deve ter pelo menos 6 caracteres!");
    return;
  }

  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro no cadastro');
    }

    // Armazena o token e redireciona
    sessionStorage.setItem('authToken', data.token);
    sessionStorage.setItem('username', data.username);
    
    alert('Cadastro realizado com sucesso!');
    window.location.href = 'index.html';
  } catch (error) {
    alert(error.message);
    console.error('Erro no cadastro:', error);
  }
});