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
