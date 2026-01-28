const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Caminho do volume no Railway
const dataPath = path.join('/app', 'data');

// Garante que o diretório existe
if (!fs.existsSync(dataPath)) {
  fs.mkdirSync(dataPath, { recursive: true });
}

const dbFile = path.join(dataPath, 'farm.db');

const db = new sqlite3.Database(dbFile, (err) => {
  if (err) return console.error(err.message);
  console.log(`SQLite conectado em ${dbFile}`);
});

db.serialize(() => {
  // Ranking semanal (acumulado)
  db.run(`
    CREATE TABLE IF NOT EXISTS users_farm (
      user_id TEXT PRIMARY KEY,
      cogumelo INTEGER DEFAULT 0,
      semente INTEGER DEFAULT 0
    )
  `);

  // Ranking mensal (acumulado)
  db.run(`
    CREATE TABLE IF NOT EXISTS users_farm_monthly (
      user_id TEXT PRIMARY KEY,
      cogumelo INTEGER DEFAULT 0,
      semente INTEGER DEFAULT 0
    )
  `);

  // Histórico bruto (padronizado com colunas *_azul)
  db.run(`
    CREATE TABLE IF NOT EXISTS farm_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      cogumelo_azul INTEGER DEFAULT 0,
      semente_azul INTEGER DEFAULT 0,
      data INTEGER NOT NULL
    )
  `);

  // Ações registradas (módulo ação/saldo)
  db.run(`
    CREATE TABLE IF NOT EXISTS acoes_registradas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      nome TEXT NOT NULL,
      dia TEXT NOT NULL,
      ganhos INTEGER DEFAULT 0,
      data INTEGER NOT NULL
    )
  `);

  // Farm de drogas (módulo drogas)
  db.run(`
    CREATE TABLE IF NOT EXISTS drogas_farmadas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      valor INTEGER NOT NULL,
      data INTEGER NOT NULL
    )
  `);
});

module.exports = db;
