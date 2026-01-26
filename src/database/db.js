const sqlite3 = require('sqlite3').verbose();
const path = require('node:path');
const fs = require('node:fs');

// Para Railway
const dataPath = '/data';
if (!fs.existsSync(dataPath)) {
  fs.mkdirSync(dataPath, { recursive: true });
}

const dbPath = path.join(dataPath, 'farm.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao conectar no banco SQLite:', err);
  } else {
    console.log('SQLite conectado em', dbPath);
  }
});

// SEMANAL
db.run(`
  CREATE TABLE IF NOT EXISTS users_farm (
    user_id TEXT PRIMARY KEY,
    valor REAL DEFAULT 0
  )
`);

// MENSAL
db.run(`
  CREATE TABLE IF NOT EXISTS users_farm_monthly (
    user_id TEXT PRIMARY KEY,
    valor REAL DEFAULT 0
  )
`);

module.exports = db;
