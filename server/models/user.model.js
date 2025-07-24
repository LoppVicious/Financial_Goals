const { db } = require('./db');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

class User {
  static async create({ email, password, name, plan = 'retail' }) {
    const id = uuidv4();
    const password_hash = await bcrypt.hash(password, 12);
    
    const [user] = await db('users')
      .insert({
        id,
        email,
        password_hash,
        name,
        plan,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning(['id', 'email', 'name', 'plan', 'created_at']);
    
    return user;
  }

  static async findByEmail(email) {
    return await db('users')
      .where({ email })
      .first();
  }

  static async findById(id) {
    return await db('users')
      .where({ id })
      .select(['id', 'email', 'name', 'plan', 'created_at', 'updated_at'])
      .first();
  }

  static async update(id, updates) {
    const updatedData = {
      ...updates,
      updated_at: new Date()
    };

    const [user] = await db('users')
      .where({ id })
      .update(updatedData)
      .returning(['id', 'email', 'name', 'plan', 'updated_at']);
    
    return user;
  }

  static async delete(id) {
    return await db('users')
      .where({ id })
      .del();
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async updatePassword(id, newPassword) {
    const password_hash = await bcrypt.hash(newPassword, 12);
    
    return await db('users')
      .where({ id })
      .update({
        password_hash,
        updated_at: new Date()
      });
  }

  static async updatePlan(id, plan) {
    return await this.update(id, { plan });
  }

  static async getStats() {
    const [stats] = await db('users')
      .select([
        db.raw('COUNT(*) as total_users'),
        db.raw('COUNT(CASE WHEN plan = ? THEN 1 END) as retail_users', ['retail']),
        db.raw('COUNT(CASE WHEN plan = ? THEN 1 END) as premium_users', ['premium'])
      ]);
    
    return stats;
  }

  // Refresh token methods
  static async createRefreshToken(userId) {
    const tokenId = uuidv4();
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await db('refresh_tokens').insert({
      id: tokenId,
      user_id: userId,
      token,
      expires_at: expiresAt,
      created_at: new Date()
    });

    return token;
  }

  static async findRefreshToken(token) {
    return await db('refresh_tokens')
      .where({ token })
      .andWhere('expires_at', '>', new Date())
      .first();
  }

  static async deleteRefreshToken(token) {
    return await db('refresh_tokens')
      .where({ token })
      .del();
  }

  static async deleteAllRefreshTokens(userId) {
    return await db('refresh_tokens')
      .where({ user_id: userId })
      .del();
  }

  static async cleanExpiredRefreshTokens() {
    return await db('refresh_tokens')
      .where('expires_at', '<', new Date())
      .del();
  }
}

module.exports = User;