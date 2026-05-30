import pkg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function setupDB() {
  try {
    // Tabela de Administradores/Atendentes
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'atendente',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de Pacientes
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pacientes (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255),
        phone VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        endereco TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Inserir Admin e Atendente iniciais se não existirem
    const hashAdmin = await bcrypt.hash('123456', 10);
    const hashAtendente = await bcrypt.hash('atendente123', 10);

    await pool.query(`
      INSERT INTO admin_users (nome, email, password_hash, role)
      VALUES 
        ('Administrador', 'admin@feridas.com', $1, 'admin'),
        ('Atendimento', 'atendimento@feridas.com', $2, 'atendente')
      ON CONFLICT (email) DO NOTHING
    `, [hashAdmin, hashAtendente]);

    console.log('Banco de dados estruturado com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao estruturar o banco:', error);
    process.exit(1);
  }
}

setupDB();
