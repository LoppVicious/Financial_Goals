const knex = require('knex');
const config = require('../../knexfile');

// Selecciona el entorno según NODE_ENV (default development)
const env = process.env.NODE_ENV || 'development';
const db = knex(config[env]);

module.exports = db;
