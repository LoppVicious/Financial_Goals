// Ajusta según el cliente DB que uses (Knex, Sequelize, etc.)
const db = require('../db');

exports.insert = async (goal) => {
  // Ejemplo con Knex:
  const [created] = await db('goals')
    .insert(goal)
    .returning('*');
  return created;
};

exports.findByUser = async (userId) => {
  return db('goals')
    .where({ userId })
    .select('*');
};
