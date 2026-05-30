import express from 'express';
import cors from 'cors';
import pkg from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;
const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Login Route
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM admin_users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Senha incorreta' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, email: user.email, nome: user.nome } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// Create initial admin user (for testing purposes, run once)
app.post('/api/setup-admin', async (req, res) => {
  try {
    const { email, password, nome } = req.body;
    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO admin_users (email, password_hash, nome) VALUES ($1, $2, $3)',
      [email, hash, nome]
    );
    res.json({ message: 'Admin criado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar admin ou usuário já existe' });
  }
});

// ==========================================
// WHATSAPP & N8N WEBHOOKS
// ==========================================

// Webhook para receber novo pedido do n8n
app.post('/api/webhook/novo-pedido', async (req, res) => {
  try {
    const { phone, nome, endereco, bairro, tipo_servico, valor } = req.body;
    const result = await pool.query(
      `INSERT INTO alertas_dashboard 
       (phone, nome, endereco, bairro, tipo_servico, valor, status_pagamento) 
       VALUES ($1, $2, $3, $4, $5, $6, 'pendente') RETURNING *`,
      [phone, nome, endereco, bairro, tipo_servico, valor]
    );
    res.json({ success: true, alerta: result.rows[0] });
  } catch (error) {
    console.error('Erro no webhook novo-pedido:', error);
    res.status(500).json({ error: 'Erro ao processar pedido' });
  }
});

// Endpoint para cadastro de paciente via site (Orçamento)
app.post('/api/orcamento', async (req, res) => {
  try {
    const { nome, phone, email, password, servico } = req.body;
    
    // Hash da senha do paciente
    const hash = await bcrypt.hash(password, 10);
    
    // Insere o paciente no banco de dados (ou atualiza se já existir)
    await pool.query(`
      INSERT INTO pacientes (nome, phone, email, password_hash)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (phone) DO UPDATE 
      SET nome = EXCLUDED.nome, email = EXCLUDED.email, password_hash = EXCLUDED.password_hash
    `, [nome, phone, email, hash]);

    // Cria um alerta no Dashboard para a atendente aprovar e marcar horário
    const alertaResult = await pool.query(`
      INSERT INTO alertas_dashboard 
      (phone, nome, tipo_servico, status_pagamento) 
      VALUES ($1, $2, $3, 'pendente') RETURNING *
    `, [phone, nome, servico]);

    res.json({ success: true, alerta: alertaResult.rows[0] });
  } catch (error) {
    console.error('Erro ao cadastrar orçamento:', error);
    res.status(500).json({ error: 'Erro ao processar orçamento' });
  }
});

// Endpoint para buscar alertas pendentes (Dashboard)
app.get('/api/alertas', async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM alertas_dashboard WHERE lido = FALSE ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar alertas:', error);
    res.status(500).json({ error: 'Erro ao buscar alertas' });
  }
});

// Endpoint para confirmar pagamento e arquivar alerta (Dashboard)
app.post('/api/alertas/:id/confirmar', async (req, res) => {
  try {
    const { id } = req.params;
    const { data_agendamento } = req.body;
    
    // Atualiza status do alerta
    const updateResult = await pool.query(
      "UPDATE alertas_dashboard SET status_pagamento = 'confirmado', lido = TRUE WHERE id = $1 RETURNING *",
      [id]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Alerta não encontrado' });
    }

    const alerta = updateResult.rows[0];

    // Gerar uma senha aleatória para o paciente acessar o portal
    const senha_gerada = Math.floor(100000 + Math.random() * 900000).toString(); // Senha numérica de 6 dígitos
    
    // Enviar POST de volta para o n8n para notificar o cliente via Z-API
    // Enviamos action='confirmar_pix' para o n8n saber que é do Dashboard
    try {
      await fetch('https://n8n.sandlj.com.br/webhook/enfermeira-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'confirmar_pix',
          phone: alerta.phone,
          nome: alerta.nome,
          data_agendamento: data_agendamento || 'A combinar',
          senha_paciente: senha_gerada
        })
      });
    } catch (fetchErr) {
      console.error('Erro ao notificar n8n:', fetchErr);
      // Continua mesmo se o n8n falhar para não travar o painel
    }

    res.json({ success: true, alerta, senha_gerada });
  } catch (error) {
    console.error('Erro ao confirmar alerta:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// Endpoint para rejeitar PIX
app.post('/api/alertas/:id/rejeitar', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "UPDATE alertas_dashboard SET status_pagamento = 'rejeitado', lido = TRUE WHERE id = $1 RETURNING *",
      [id]
    );
    res.json({ success: true, alerta: result.rows[0] });
  } catch (error) {
    console.error('Erro ao rejeitar alerta:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`);
});
