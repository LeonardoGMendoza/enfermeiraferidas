import pkg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const { Pool, Client } = pkg;

async function createDatabaseIfNotExists() {
  const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: 'postgres', // Connect to default DB first
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  try {
    await client.connect();
    const res = await client.query(`SELECT datname FROM pg_catalog.pg_database WHERE datname = '${process.env.DB_DATABASE}'`);
    if (res.rowCount === 0) {
      console.log(`Creating database ${process.env.DB_DATABASE}...`);
      await client.query(`CREATE DATABASE "${process.env.DB_DATABASE}"`);
      console.log('Database created successfully.');
    } else {
      console.log('Database already exists.');
    }
  } catch (err) {
    console.error('Error creating database:', err);
  } finally {
    await client.end();
  }
}

async function setupDB() {
  try {
    await createDatabaseIfNotExists();

    const pool = new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_DATABASE,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
    });

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
        bairro VARCHAR(100),
        tipo_ferida VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Em caso de banco já existente, vamos garantir que as colunas existam
    await pool.query(`ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS bairro VARCHAR(100)`);
    await pool.query(`ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS tipo_ferida VARCHAR(100)`);

    // Tabela de Alertas Dashboard (caso não exista)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS alertas_dashboard (
        id SERIAL PRIMARY KEY,
        phone VARCHAR(50),
        nome VARCHAR(255),
        endereco TEXT,
        bairro VARCHAR(100),
        tipo_servico VARCHAR(100),
        valor DECIMAL(10,2),
        status_pagamento VARCHAR(50),
        lido BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await pool.query(`ALTER TABLE alertas_dashboard ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);

    // Inserir Admin e Atendente iniciais se não existirem
    const hashAdmin = await bcrypt.hash('123456', 10);
    const hashAtendente = await bcrypt.hash('atendente123', 10);

    await pool.query(`
      INSERT INTO admin_users (nome, email, password_hash, role)
      VALUES 
        ('Sandra Nakata', 'sandra.nakata92@gmail.com', $1, 'admin')
      ON CONFLICT (email) DO NOTHING
    `, [hashAdmin]);

    console.log('Banco de dados estruturado com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao estruturar o banco:', error);
    process.exit(1);
  }
}

setupDB();
