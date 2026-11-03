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

// Só administradores (token do painel). Tokens de paciente (que têm "phone") não passam.
const requireAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    if (user.role !== 'admin' && !(user.email && !user.phone)) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

if (!process.env.JWT_SECRET) {
  console.warn('ATENÇÃO: JWT_SECRET não definido no .env — usando valor padrão inseguro.');
}

// ==========================================
// MARKETING / GOOGLE ADS — estrutura do banco
// ==========================================
async function ensureMarketingSchema() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS site_eventos (
        id SERIAL PRIMARY KEY,
        tipo VARCHAR(30) NOT NULL,
        origem VARCHAR(50) NOT NULL DEFAULT 'direto',
        campanha VARCHAR(150),
        termo VARCHAR(150),
        gclid VARCHAR(255),
        pagina VARCHAR(255),
        sessao VARCHAR(64),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_site_eventos_data ON site_eventos (created_at)`);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS marketing_investimentos (
        id SERIAL PRIMARY KEY,
        canal VARCHAR(50) NOT NULL DEFAULT 'google',
        valor DECIMAL(10,2) NOT NULL,
        descricao VARCHAR(255),
        data DATE NOT NULL DEFAULT CURRENT_DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);
    await pool.query(`ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS origem VARCHAR(50)`);
    console.log('Tabelas de marketing prontas.');
  } catch (err) {
    console.error('Erro ao preparar tabelas de marketing:', err.message);
  }
}
ensureMarketingSchema();

const TIPOS_EVENTO = ['visita', 'whatsapp', 'telefone', 'orcamento'];
const ORIGENS = ['google', 'google_organico', 'facebook', 'instagram', 'indicacao', 'site', 'whatsapp', 'outro', 'direto'];
const limpa = (v, max) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null);

// Limite simples por IP para o /api/track (evita encher o banco)
const trackHits = new Map();
setInterval(() => trackHits.clear(), 60 * 1000).unref();

// Público: o site registra visitas e cliques (sem guardar IP nem dados pessoais)
app.post('/api/track', async (req, res) => {
  try {
    const ip = req.headers['x-real-ip'] || req.ip || 'x';
    const n = (trackHits.get(ip) || 0) + 1;
    trackHits.set(ip, n);
    if (n > 60) return res.sendStatus(429);

    const { tipo, origem, campanha, termo, gclid, pagina, sessao } = req.body || {};
    if (!TIPOS_EVENTO.includes(tipo)) return res.status(400).json({ error: 'tipo inválido' });
    const org = ORIGENS.includes(origem) ? origem : 'direto';
    await pool.query(
      `INSERT INTO site_eventos (tipo, origem, campanha, termo, gclid, pagina, sessao)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [tipo, org, limpa(campanha, 150), limpa(termo, 150), limpa(gclid, 255), limpa(pagina, 255), limpa(sessao, 64)]
    );
    res.sendStatus(204);
  } catch (error) {
    console.error('Erro no /api/track:', error.message);
    res.sendStatus(500);
  }
});

// Resumo de marketing para o painel (e para o analista de IA)
async function resumoMarketing(dias = 30, canal = 'google') {
  dias = Math.min(Math.max(parseInt(dias) || 30, 1), 365);
  const desde = `NOW() - INTERVAL '${dias} days'`;
  const ev = await pool.query(
    `SELECT tipo, COUNT(*)::int AS total, COUNT(DISTINCT sessao)::int AS pessoas
       FROM site_eventos WHERE origem = $1 AND created_at >= ${desde} GROUP BY tipo`, [canal]);
  const evTodos = await pool.query(
    `SELECT tipo, COUNT(*)::int AS total FROM site_eventos WHERE created_at >= ${desde} GROUP BY tipo`);
  const termos = await pool.query(
    `SELECT termo, COUNT(*)::int AS total FROM site_eventos
      WHERE origem = $1 AND termo IS NOT NULL AND created_at >= ${desde}
      GROUP BY termo ORDER BY total DESC LIMIT 5`, [canal]);
  const pac = await pool.query(
    `SELECT COUNT(*)::int AS total FROM pacientes WHERE origem = $1 AND created_at >= ${desde}`, [canal]);
  const receita = await pool.query(
    `SELECT COALESCE(SUM(a.valor),0)::float AS total
       FROM alertas_dashboard a JOIN pacientes p ON p.phone = a.phone
      WHERE p.origem = $1 AND a.status_pagamento = 'confirmado' AND a.created_at >= ${desde}`, [canal]);
  const inv = await pool.query(
    `SELECT COALESCE(SUM(valor),0)::float AS total FROM marketing_investimentos
      WHERE canal = $1 AND data >= (CURRENT_DATE - $2::int)`, [canal, dias]);

  const porTipo = Object.fromEntries(ev.rows.map(r => [r.tipo, r]));
  const visitas = porTipo.visita?.total || 0;
  const contatos = (porTipo.whatsapp?.total || 0) + (porTipo.telefone?.total || 0) + (porTipo.orcamento?.total || 0);
  const investido = inv.rows[0].total;
  const pacientes = pac.rows[0].total;
  const recebido = receita.rows[0].total;
  return {
    canal, dias,
    visitas,
    cliques_whatsapp: porTipo.whatsapp?.total || 0,
    cliques_telefone: porTipo.telefone?.total || 0,
    orcamentos: porTipo.orcamento?.total || 0,
    contatos,
    pacientes,
    investido,
    recebido,
    custo_por_contato: investido && contatos ? +(investido / contatos).toFixed(2) : null,
    custo_por_paciente: investido && pacientes ? +(investido / pacientes).toFixed(2) : null,
    retorno: investido ? +(recebido / investido).toFixed(2) : null,
    taxa_contato: visitas ? +((contatos / visitas) * 100).toFixed(1) : null,
    termos: termos.rows,
    site_total: Object.fromEntries(evTodos.rows.map(r => [r.tipo, r.total])),
  };
}

app.get('/api/marketing/resumo', requireAdmin, async (req, res) => {
  try {
    res.json(await resumoMarketing(req.query.dias, req.query.canal || 'google'));
  } catch (error) {
    console.error('Erro no resumo de marketing:', error.message);
    res.status(500).json({ error: 'Erro ao gerar resumo' });
  }
});

app.get('/api/marketing/investimentos', requireAdmin, async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM marketing_investimentos ORDER BY data DESC, id DESC LIMIT 50');
    res.json(r.rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar investimentos' });
  }
});

app.post('/api/marketing/investimentos', requireAdmin, async (req, res) => {
  try {
    const valor = parseFloat(String(req.body?.valor ?? '').replace(',', '.'));
    if (!(valor > 0) || valor > 100000) return res.status(400).json({ error: 'Valor inválido' });
    const canal = ORIGENS.includes(req.body?.canal) ? req.body.canal : 'google';
    const data = /^\d{4}-\d{2}-\d{2}$/.test(req.body?.data || '') ? req.body.data : null;
    const r = await pool.query(
      `INSERT INTO marketing_investimentos (canal, valor, descricao, data)
       VALUES ($1,$2,$3,COALESCE($4::date, CURRENT_DATE)) RETURNING *`,
      [canal, valor, limpa(req.body?.descricao, 255), data]);
    res.json(r.rows[0]);
  } catch (error) {
    console.error('Erro ao salvar investimento:', error.message);
    res.status(500).json({ error: 'Erro ao salvar investimento' });
  }
});

app.delete('/api/marketing/investimentos/:id', requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM marketing_investimentos WHERE id = $1', [req.params.id]);
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir' });
  }
});

// Marcar de onde o paciente veio (Google, indicação...)
app.put('/api/pacientes/:id/origem', requireAdmin, async (req, res) => {
  try {
    const origem = req.body?.origem;
    if (origem !== null && !ORIGENS.includes(origem)) return res.status(400).json({ error: 'Origem inválida' });
    const r = await pool.query('UPDATE pacientes SET origem = $1 WHERE id = $2 RETURNING id, origem', [origem, req.params.id]);
    if (!r.rowCount) return res.status(404).json({ error: 'Paciente não encontrado' });
    res.json(r.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao salvar origem' });
  }
});

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

    const token = jwt.sign({ id: user.id, email: user.email, role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, email: user.email, nome: user.nome } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// Login Paciente Route
app.post('/api/login-paciente', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM pacientes WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Paciente não encontrado' });
    }

    const paciente = result.rows[0];
    const validPassword = await bcrypt.compare(password, paciente.password_hash);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Senha incorreta' });
    }

    const token = jwt.sign({ id: paciente.id, phone: paciente.phone }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, paciente: { id: paciente.id, nome: paciente.nome, phone: paciente.phone, email: paciente.email, tipo_ferida: paciente.tipo_ferida } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// Get Paciente Profile & Status Route
app.get('/api/paciente/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Não autorizado' });
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const pacienteResult = await pool.query('SELECT * FROM pacientes WHERE id = $1', [decoded.id]);
    if (pacienteResult.rows.length === 0) return res.status(404).json({ error: 'Paciente não encontrado' });
    
    const paciente = pacienteResult.rows[0];
    
    // Buscar o alerta mais recente para ver o status do pagamento
    const alertaResult = await pool.query(
      'SELECT status_pagamento FROM alertas_dashboard WHERE phone = $1 ORDER BY created_at DESC LIMIT 1',
      [paciente.phone]
    );
    
    const status_pagamento = alertaResult.rows.length > 0 ? alertaResult.rows[0].status_pagamento : 'pendente';
    
    res.json({ 
      paciente: { 
        id: paciente.id, 
        nome: paciente.nome, 
        phone: paciente.phone, 
        email: paciente.email, 
        tipo_ferida: paciente.tipo_ferida,
        status_pagamento
      } 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// Endpoint: Paciente avisou que copiou o PIX (cria/atualiza alerta para atendente)
app.post('/api/paciente/avisar-pix', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Não autorizado' });
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const pacienteResult = await pool.query('SELECT * FROM pacientes WHERE id = $1', [decoded.id]);
    if (pacienteResult.rows.length === 0) return res.status(404).json({ error: 'Paciente não encontrado' });
    const paciente = pacienteResult.rows[0];

    // Verifica se já existe um alerta pendente para esse paciente
    const existente = await pool.query(
      "SELECT id FROM alertas_dashboard WHERE phone = $1 AND lido = FALSE LIMIT 1",
      [paciente.phone]
    );

    if (existente.rows.length > 0) {
      // Atualiza o existente para "aguardando_confirmacao"
      await pool.query(
        "UPDATE alertas_dashboard SET status_pagamento = 'aguardando_confirmacao', updated_at = NOW() WHERE id = $1",
        [existente.rows[0].id]
      );
    } else {
      // Cria novo alerta
      await pool.query(
        "INSERT INTO alertas_dashboard (phone, nome, tipo_servico, status_pagamento) VALUES ($1, $2, $3, 'aguardando_confirmacao')",
        [paciente.phone, paciente.nome, paciente.tipo_ferida || 'Serviço solicitado']
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao avisar pix:', error);
    res.status(500).json({ error: 'Erro no servidor' });
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
    const origem = ORIGENS.includes(req.body?.origem) ? req.body.origem : 'site';
    
    // Hash da senha do paciente
    const hash = await bcrypt.hash(password, 10);
    
    // Insere o paciente no banco de dados (ou atualiza se já existir)
    await pool.query(`
      INSERT INTO pacientes (nome, phone, email, password_hash, tipo_ferida, origem)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (phone) DO UPDATE 
      SET nome = EXCLUDED.nome, email = EXCLUDED.email, password_hash = EXCLUDED.password_hash, tipo_ferida = EXCLUDED.tipo_ferida,
          origem = COALESCE(pacientes.origem, EXCLUDED.origem)
    `, [nome, phone, email, hash, servico, origem]);

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

// Endpoint para buscar pacientes
app.get('/api/pacientes', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM pacientes ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar pacientes:', error);
    res.status(500).json({ error: 'Erro ao buscar pacientes' });
  }
});

// Endpoint para buscar alertas pendentes (Dashboard)
app.get('/api/alertas', requireAdmin, async (req, res) => {
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
app.post('/api/alertas/:id/confirmar', requireAdmin, async (req, res) => {
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
app.post('/api/alertas/:id/rejeitar', requireAdmin, async (req, res) => {
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
