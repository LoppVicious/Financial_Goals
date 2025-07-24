// backend/src/services/authService.js

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userRepo = require('../repositories/userRepo');

const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = 10;

module.exports = {
  /**
   * Registra un nuevo usuario.
   * @param {Object} param0
   * @param {string} param0.email
   * @param {string} param0.password
   * @param {string} param0.name
   * @param {boolean} param0.gdpr_consent
   * @throws {Error} con property `status` si el email ya existe
   * @returns {string} JWT token
   */
  async register({ email, password, name, gdpr_consent }) {
    // 1) Verificar duplicado
    const existing = await userRepo.findByEmail(email);
    if (existing) {
      const err = new Error('Email already registered');
      err.status = 409;          // 409 Conflict para recurso duplicado
      throw err;
    }

    // 2) Hashear contraseña
    const hash = await bcrypt.hash(password, SALT_ROUNDS);

    // 3) Crear usuario
    const newUser = {
      email,
      password_hash: hash,
      name,
      gdpr_consent: !!gdpr_consent
    };
    const created = await userRepo.create(newUser);

    // 4) Devolver token con payload mínimo
    return this._generateToken({
      id: created.id,
      email: created.email,
      name: created.name
    });
  },

  /**
   * Autentica a un usuario existente.
   * @param {Object} param0
   * @param {string} param0.email
   * @param {string} param0.password
   * @throws {Error} con status 401 si credenciales inválidas
   * @returns {string} JWT token
   */
  async login({ email, password }) {
    // 1) Buscar usuario
    const user = await userRepo.findByEmail(email);
    if (!user) {
      const err = new Error('Invalid credentials');
      err.status = 401;
      throw err;
    }

    // 2) Comparar hash
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      const err = new Error('Invalid credentials');
      err.status = 401;
      throw err;
    }

    // 3) Devolver token
    return this._generateToken({
      id: user.id,
      email: user.email,
      name: user.name
    });
  },

  /**
   * Genera un JWT firmado con secreta.
   * @param {Object} payload — { id, email, name, ... }
   * @returns {string} token
   */
  _generateToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  }
};
