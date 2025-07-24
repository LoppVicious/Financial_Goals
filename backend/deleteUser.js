// backend/deleteUser.js
require('dotenv').config();
const db = require('./src/db');

const email = process.argv[2];
if (!email) {
  console.error('Uso: node deleteUser.js user@example.com');
  process.exit(1);
}

db('users')
  .where({ email })
  .del()
  .then(count => {
    console.log(`Se han borrado ${count} usuario(s) con email "${email}".`);
    process.exit(0);
  })
  .catch(err => {
    console.error('Error al borrar usuario:', err);
    process.exit(1);
  });
