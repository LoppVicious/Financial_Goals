const knex = require('knex');
const config = require('../config/env');

// Initialize Knex with configuration
const db = knex(config.database);

// Database initialization function
const initializeDatabase = async () => {
  try {
    // Test the connection
    await db.raw('SELECT 1');
    console.log('📊 Database connection established');

    // Create tables if they don't exist
    await createTables();
    console.log('📋 Database tables ready');

    return db;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

// Create all necessary tables
const createTables = async () => {
  // Users table
  const hasUsersTable = await db.schema.hasTable('users');
  if (!hasUsersTable) {
    await db.schema.createTable('users', (table) => {
      table.string('id').primary();
      table.string('email').notNullable().unique();
      table.string('password_hash').notNullable();
      table.string('name');
      table.string('plan').notNullable().defaultTo('retail');
      table.timestamp('created_at').defaultTo(db.fn.now());
      table.timestamp('updated_at').defaultTo(db.fn.now());
      
      // Add check constraint for plan
      table.check('plan IN (?, ?)', ['retail', 'premium']);
    });
    console.log('✅ Created users table');
  }

  // Goals table
  const hasGoalsTable = await db.schema.hasTable('goals');
  if (!hasGoalsTable) {
    await db.schema.createTable('goals', (table) => {
      table.string('id').primary();
      table.string('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.string('name').notNullable();
      table.string('type').notNullable();
      table.decimal('target_amount', 12, 2).notNullable();
      table.date('target_date');
      table.integer('target_years');
      table.decimal('monthly_contribution', 10, 2).defaultTo(0);
      table.decimal('inflation_rate', 5, 4).defaultTo(0.02);
      table.decimal('return_rate', 5, 4).defaultTo(0.05);
      table.boolean('is_active').defaultTo(true);
      table.timestamp('created_at').defaultTo(db.fn.now());
      table.timestamp('updated_at').defaultTo(db.fn.now());
      
      // Add check constraints
      table.check('type IN (?, ?, ?, ?, ?)', ['casa', 'viaje', 'coche', 'jubilacion', 'otro']);
      table.check('target_amount > 0');
      table.check('monthly_contribution >= 0');
      table.check('inflation_rate >= 0 AND inflation_rate <= 0.2');
      table.check('return_rate >= 0 AND return_rate <= 0.3');
    });
    console.log('✅ Created goals table');
  }

  // Contributions table
  const hasContributionsTable = await db.schema.hasTable('contributions');
  if (!hasContributionsTable) {
    await db.schema.createTable('contributions', (table) => {
      table.string('id').primary();
      table.string('goal_id').notNullable().references('id').inTable('goals').onDelete('CASCADE');
      table.decimal('amount', 10, 2).notNullable();
      table.date('contribution_date').notNullable();
      table.string('type').notNullable().defaultTo('monthly');
      table.text('notes');
      table.timestamp('created_at').defaultTo(db.fn.now());
      
      // Add check constraints
      table.check('type IN (?, ?, ?)', ['monthly', 'extra', 'initial']);
      table.check('amount > 0');
    });
    console.log('✅ Created contributions table');
  }

  // Scenarios table (for Premium features)
  const hasScenariosTable = await db.schema.hasTable('scenarios');
  if (!hasScenariosTable) {
    await db.schema.createTable('scenarios', (table) => {
      table.string('id').primary();
      table.string('goal_id').notNullable().references('id').inTable('goals').onDelete('CASCADE');
      table.string('name').notNullable();
      table.decimal('inflation_rate', 5, 4);
      table.decimal('return_rate', 5, 4);
      table.string('type').notNullable().defaultTo('base');
      table.timestamp('created_at').defaultTo(db.fn.now());
      
      // Add check constraint
      table.check('type IN (?, ?, ?)', ['base', 'optimista', 'pesimista']);
    });
    console.log('✅ Created scenarios table');
  }

  // Refresh tokens table
  const hasRefreshTokensTable = await db.schema.hasTable('refresh_tokens');
  if (!hasRefreshTokensTable) {
    await db.schema.createTable('refresh_tokens', (table) => {
      table.string('id').primary();
      table.string('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.string('token').notNullable().unique();
      table.timestamp('expires_at').notNullable();
      table.timestamp('created_at').defaultTo(db.fn.now());
    });
    console.log('✅ Created refresh_tokens table');
  }
};

// Graceful shutdown
const closeDatabase = async () => {
  try {
    await db.destroy();
    console.log('📊 Database connection closed');
  } catch (error) {
    console.error('❌ Error closing database:', error);
  }
};

// Handle process termination
process.on('SIGTERM', closeDatabase);
process.on('SIGINT', closeDatabase);

module.exports = {
  db,
  initializeDatabase,
  closeDatabase
};