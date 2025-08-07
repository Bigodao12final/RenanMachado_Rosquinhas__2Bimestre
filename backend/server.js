const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const fs = require('fs');              
const fsp = require('fs').promises;  
const csv = require('csv-parser');
const { stringify } = require('csv-stringify');

const app = express();

// Configurações
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Middlewares
function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Acesso não autorizado' });

  try {
    req.user = jwt.verify(token, 'SEGREDO_DO_JWT');
    next();
  } catch (error) {
    res.status(403).json({ error: 'Token inválido' });
  }
}

function authenticateOptional(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try {
      req.user = jwt.verify(token, 'SEGREDO_DO_JWT');
    } catch (error) {
      // Token inválido, continua como guest
    }
  }
  next();
}
// Middleware: identificar visitantes por Session-Id
function identifySession(req, res, next) {
  const sessionId = req.headers['session-id'];
  if (sessionId) {
    req.sessionId = sessionId;
  }
  next();
}
// Rota para obter produtos
app.get('/api/products', async (req, res) => {
  try {
    const products = await readCSV(path.join(__dirname, 'models/carts.csv'));
    res.json(products);
  } catch (error) {
    console.error('Erro ao obter produtos:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});
// Rotas de Autenticação
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;
    
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'As senhas não coincidem' });
    }

    const users = await readCSV(path.join(__dirname, 'models/users.csv'));
    
    if (users.some(u => u.username === username)) {
      return res.status(400).json({ error: 'Nome de usuário já em uso' });
    }

    if (users.some(u => u.email === email)) {
      return res.status(400).json({ error: 'E-mail já cadastrado' });
    }

    const newUser = {
      id: Date.now(),
      username,
      email,
      password // Em produção, usar bcrypt para hash
    };

    users.push(newUser);
    await writeCSV(path.join(__dirname, 'models/users.csv'), users);

    const token = jwt.sign({ userId: newUser.id }, 'SEGREDO_DO_JWT', { expiresIn: '1h' });
    res.json({ token, username });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const users = await readCSV(path.join(__dirname, 'models/users.csv'));
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign({ userId: user.id }, 'SEGREDO_DO_JWT', { expiresIn: '1h' });
    res.json({ token, username });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// Rotas do Carrinho
app.get('/api/cart', authenticateOptional, async (req, res) => {
  try {
    const carts = await readCSV(path.join(__dirname, 'models/carts.csv'));
    let userCart = [];
    
    if (req.user) {
      userCart = carts.filter(c => c.userId == req.user.userId);
    } else {
      const sessionId = req.headers['session-id'] || 'guest';
      userCart = carts.filter(c => c.sessionId == sessionId);
    }
    
    res.json(userCart);
  } catch (error) {
    console.error('Erro ao obter carrinho:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

app.post('/api/cart', authenticateOptional, identifySession, async (req, res) => {
  try {
    const { productId, name, price, quantity } = req.body;

    if (!productId || !name || !price || !quantity) {
      return res.status(400).json({ error: 'Dados incompletos para adicionar ao carrinho' });
    }

    const cartItems = await readCSV(path.join(__dirname, 'models', 'carts.csv'));

    const newItem = {
      id: String(Date.now()),
      productId,
      name,
      price,
      quantity,
      userId: req.user?.userId || undefined,
      sessionId: req.sessionId || undefined
    };

    cartItems.push(newItem);
    await writeCSV(path.join(__dirname, 'models', 'carts.csv'), cartItems);

    res.status(201).json({ message: 'Item adicionado ao carrinho com sucesso', item: newItem });
  } catch (error) {
    console.error('Erro ao adicionar item ao carrinho:', error);
    res.status(500).json({ error: 'Erro interno ao adicionar ao carrinho' });
  }
});


app.delete('/api/cart/:id', authenticateOptional, async (req, res) => {
  try {
    const carts = await readCSV(path.join(__dirname, 'models/carts.csv'));
    
    let filteredCarts;
    if (req.user) {
      filteredCarts = carts.filter(
        c => !(c.userId == req.user.userId && c.id == req.params.id)
      );
    } else {
      const sessionId = req.headers['session-id'] || 'guest';
      filteredCarts = carts.filter(
        c => !(c.sessionId == sessionId && c.id == req.params.id)
      );
    }

    await writeCSV(path.join(__dirname, 'models/carts.csv'), filteredCarts);
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao remover do carrinho:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// Rotas de Pagamento
app.post('/api/payment', authenticate, async (req, res) => {
  try {
    const { method, details } = req.body;
    
    // Processar pagamento (simulação)
    const paymentSuccess = Math.random() > 0.1; // 90% de chance de sucesso
    
    if (paymentSuccess) {
      // Limpar carrinho após pagamento
      const carts = await readCSV(path.join(__dirname, 'models/carts.csv'));
      const filteredCarts = carts.filter(c => c.userId != req.user.userId);
      await writeCSV(path.join(__dirname, 'models/carts.csv'), filteredCarts);
      
      res.json({ success: true, message: 'Pagamento processado com sucesso' });
    } else {
      res.status(400).json({ error: 'Pagamento recusado' });
    }
  } catch (error) {
    console.error('Erro no pagamento:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// Migrar carrinho guest para usuário
app.post('/api/cart/migrate', authenticate, async (req, res) => {
  try {
    const sessionId = req.headers['session-id'];
    if (!sessionId) {
      return res.json({ success: true });
    }

    const carts = await readCSV(path.join(__dirname, 'models/carts.csv'));
    const guestCart = carts.filter(c => c.sessionId == sessionId);

    // Atualizar para userId
    for (const item of guestCart) {
      item.userId = req.user.userId;
      delete item.sessionId;
    }

    await writeCSV(path.join(__dirname, 'models/carts.csv'), carts);
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao migrar carrinho:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// Servir frontend
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Funções auxiliares para CSV
async function readCSV(filePath) {
  try {
await fsp.access(filePath);
  } catch {
    return [];
  }

  const results = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

async function writeCSV(filePath, data) {
  return new Promise((resolve, reject) => {
    stringify(data, { header: true }, (err, output) => {
      if (err) return reject(err);
     fsp.writeFile(filePath, output)
  .then(resolve)
  .catch(reject);

    });
  });
}

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  
  // Criar arquivos CSV se não existirem
 const modelsDir = path.join(__dirname, 'models');
try {
  // Cria a pasta models se não existir
  await fsp.mkdir(modelsDir, { recursive: true });

  // Verifica e cria users.csv
  try {
    await fsp.access(path.join(modelsDir, 'users.csv'));
  } catch {
    await writeCSV(path.join(modelsDir, 'users.csv'), [
      { id: '1', username: 'admin', email: 'admin@example.com', password: 'admin123' }
    ]);
  }

  // Verifica e cria carts.csv
  try {
    await fsp.access(path.join(modelsDir, 'carts.csv'));
  } catch {
    await writeCSV(path.join(modelsDir, 'carts.csv'), []);
  }

} catch (error) {
  console.error('Erro ao inicializar arquivos CSV:', error);
}
})
