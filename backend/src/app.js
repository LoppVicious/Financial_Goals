// backend/src/app.js
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const db      = require('./db');

const authRoutes = require('./routes/authRoutes');
const goalRoutes = require('./routes/goalRoutes');

const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// 1️⃣ Crear tabla users si no existe
async function ensureUsersTable() {
  const exists = await db.schema.hasTable('users');
  if (!exists) {
    await db.schema.createTable('users', table => {
      table.increments('id').primary();
      table.text('name').notNullable();
      table.text('email').notNullable().unique();
      table.text('password_hash').notNullable();
      table.boolean('gdpr_consent').notNullable();
      table.timestamp('created_at').defaultTo(db.fn.now());
    });
    console.log('🗄  Tabla users creada en SQLite');
  }
}

// 2️⃣ Crear tabla goals si no existe
async function ensureGoalsTable() {
  const exists = await db.schema.hasTable('goals');
  if (!exists) {
    await db.schema.createTable('goals', table => {
      table.increments('id').primary();
      table
        .integer('userId')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE');
      table.string('name').notNullable();
      table.decimal('targetAmount', 14, 2).notNullable();
      table.string('currency', 3).notNullable();
      table.date('targetDate').nullable();
      table.integer('yearsToGoal').nullable();
      table.decimal('defaultInflation', 4, 2).notNullable();
      table.decimal('defaultReturn', 4, 2).notNullable();
      table.decimal('currentAmount', 14, 2).notNullable().defaultTo(0);
      table.timestamp('created_at').defaultTo(db.fn.now());
    });
    console.log('🗄  Tabla goals creada en SQLite');
  }
}

// Ejecutamos la creación de tablas en secuencia
ensureUsersTable()
  .then(ensureGoalsTable)
  .then(() => {
    // Montamos rutas tras asegurarnos de las tablas
    app.use('/api/auth', authRoutes);
    app.use('/api/goals', goalRoutes);

    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(`🚀 Server listening on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Error al asegurar esquema:', err);
    process.exit(1);
  });
