document.getElementById('registerForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const formData = {
    fullname: this.fullname.value.trim(),
    email: this.email.value.trim(),
    username: this.username.value.trim(),
    password: this.password.value,
    confirmPassword: this.confirmPassword.value
  };

  // Validações (mantidas do seu código original)
  if (formData.password !== formData.confirmPassword) {
    alert("As senhas não coincidem!");
    return;
  }

  if (formData.password.length < 6) {
    alert("A senha deve ter pelo menos 6 caracteres!");
    return;
  }

  // Verifica se usuário já existe
  const users = JSON.parse(localStorage.getItem('users')) || [];
  if (users.some(user => user.username === formData.username)) {
    alert("Nome de usuário já em uso!");
    return;
  }

  if (users.some(user => user.email === formData.email)) {
    alert("E-mail já cadastrado!");
    return;
  }

  // Adiciona novo usuário
  users.push({
    id: Date.now(),
    ...formData,
    createdAt: new Date().toISOString()
  });

  localStorage.setItem('users', JSON.stringify(users));
  localStorage.setItem('loggedUser', formData.username);
  localStorage.setItem('userRegistered', 'true'); // ⭐ NOVA LINHA (única mudança real)

  alert("Cadastro realizado com sucesso!");
  window.location.href = 'index.html';
});
