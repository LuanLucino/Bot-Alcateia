const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

if (!fs.existsSync('/data')) {
  fs.mkdirSync('/data', { recursive: true });
}

const db = new sqlite3.Database('/data/farm.db', (err) => {
  if (err) return console.error(err.message);
  console.log('SQLite conectado em /data/farm.db');
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
    )
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

  db.run(`
  CREATE TABLE IF NOT EXISTS users_farm_monthly (
    user_id TEXT PRIMARY KEY,
    valor REAL DEFAULT 0
  )
`);


});

module.exports = db;
