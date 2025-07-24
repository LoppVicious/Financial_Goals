// backend/src/controllers/authController.js

const Joi = require('joi');
const authService = require('../services/authService');

// Schema Joi para login (registrado ya validado en las rutas)
const loginSchema = Joi.object({
  email:    Joi.string().email().required(),
  password: Joi.string().required(),
});

exports.register = async (req, res) => {
  try {
    const token = await authService.register(req.body);
    return res.status(201).json({ token, message: 'Usuario creado' });
  } catch (err) {
    console.error('Register error:', err);

    if (err.message.includes('Email already registered')) {
      return res.status(409).json({ message: err.message });
    }

    const status  = err.isJoi ? 400 : 500;
    const message = err.isJoi
      ? err.details[0].message
      : 'Error interno del servidor';

    return res.status(status).json({ message });
  }
};

exports.login = async (req, res) => {
  try {
    // Validamos también por seguridad en el controlador
    const payload = await loginSchema.validateAsync(req.body);
    const token   = await authService.login(payload);
    return res.json({ token, message: 'Login exitoso' });
  } catch (err) {
    console.error('Login error:', err);

    if (err.isJoi) {
      return res.status(400).json({ message: err.details[0].message });
    }

    const status = err.status || 401;
    return res.status(status).json({ message: err.message || 'Credenciales inválidas' });
  }
};

exports.me = (req, res) => {
  // authMiddleware debe haber puesto req.user
  if (!req.user) {
    return res.status(401).json({ message: 'No autenticado' });
  }
  // Puedes filtrar qué campos del usuario quieres devolver
  const { id, email, name } = req.user;
  return res.json({ user: { id, email, name } });
};
