const sqlite3 = require('sqlite3').verbose();
const path = require('node:path');
const fs = require('node:fs');

// Caminho persistente no Railway
const DATA_DIR = '/data';

// Se o diretório não existir, cria
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Caminho do banco
const dbPath = path.join(DATA_DIR, 'bot.db');

// Inicializar banco
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao abrir banco:', err.message);
  } else {
    console.log('Banco carregado em', dbPath);
  }
});

// Criar tabelas se não existirem
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      user_id TEXT PRIMARY KEY,
      farm_points INTEGER DEFAULT 0,
      updated_at TEXT
    )
  `);
});

module.exports = db;
