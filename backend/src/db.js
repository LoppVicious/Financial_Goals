// backend/src/db.js
const knex = require('knex');
require('dotenv').config();

const isSqlite = true;  // ← marca que usamos SQLite en dev

const db = knex({
  client: isSqlite ? 'sqlite3' : 'pg',
  connection: isSqlite
    ? { filename: './dev.sqlite3' }
    : process.env.DATABASE_URL,
  useNullAsDefault: isSqlite,      // para SQLite
  pool: isSqlite
    ? { afterCreate: (conn, done) => {
        conn.run('PRAGMA foreign_keys = ON', done);
      }}
    : { min: 0, max: 7 },
});

module.exports = db;
