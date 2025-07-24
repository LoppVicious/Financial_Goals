const db = require('../utils/db');

const USERS_TABLE = 'users';

module.exports = {
  async create(user) {
    // user: { email, password_hash, name, gdpr_consent }
    const [id] = await db(USERS_TABLE).insert(user).returning('id');
    return id;
  },

  async findByEmail(email) {
    return db(USERS_TABLE).where({ email }).first();
  },

  async findById(id) {
    return db(USERS_TABLE).where({ id }).first();
  }
};
