const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'data');

if (!fs.existsSync(dataPath)) {
  fs.mkdirSync(dataPath, { recursive: true });
}

const db = new sqlite3.Database(path.join(dataPath, 'farm.db'), (err) => {
  if (err) return console.error(err.message);
  console.log('SQLite conectado em data/farm.db');
});

db.serialize(() => {

  // Ranking semanal
  db.run(`
    CREATE TABLE IF NOT EXISTS users_farm (
      user_id TEXT PRIMARY KEY,
      cogumelo INTEGER DEFAULT 0,
      semente INTEGER DEFAULT 0
    )
  `);

  // Ranking mensal
  db.run(`
    CREATE TABLE IF NOT EXISTS users_farm_monthly (
      user_id TEXT PRIMARY KEY,
      cogumelo INTEGER DEFAULT 0,
      semente INTEGER DEFAULT 0
    
  `);

  // Histórico bruto (opcional)
  db.run(`
    CREATE TABLE IF NOT EXISTS farm_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      cogumelo_azul REAL DEFAULT 0,
      semente_azul REAL DEFAULT 0,
      data INTEGER NOT NULL
    )
  `);

});

module.exports = db;
