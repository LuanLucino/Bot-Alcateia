const sqlite3 = require('sqlite3').verbose();
const path = require('node:path');
const fs = require('node:fs');

// Garantir que a pasta /data exista (Railway usa isso)
const dataPath = '/data';
if (!fs.existsSync(dataPath)) {
  fs.mkdirSync(dataPath, { recursive: true });
}

const dbPath = path.join(dataPath, 'farm.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao conectar no banco SQLite:', err);
  } else {
    console.log('Banco SQLite conectado em', dbPath);
  }
});

// Criar tabela semanal
db.run(`
  CREATE TABLE IF NOT EXISTS users_farm (
    user_id TEXT PRIMARY KEY,
    cogumelo INTEGER DEFAULT 0,
    semente INTEGER DEFAULT 0
  )
`);

// Criar tabela mensal (acumula todas semanas do mês)
db.run(`
  CREATE TABLE IF NOT EXISTS users_farm_monthly (
    user_id TEXT PRIMARY KEY,
    cogumelo INTEGER DEFAULT 0,
    semente INTEGER DEFAULT 0
  )
`);

module.exports = db;
