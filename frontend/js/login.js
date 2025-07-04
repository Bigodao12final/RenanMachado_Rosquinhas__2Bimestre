  // Modifique o login.js ou o script inline para verificar os usuários cadastrados
document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const username = this.username.value.trim();
  const password = this.password.value;
  
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    localStorage.setItem('loggedUser', username);
    window.location.href = 'index.html';
  } else {
    alert("Credenciais inválidas ou usuário não cadastrado!");
  }
});