// backend/src/middlewares/authMiddleware.js

const jwt = require('jsonwebtoken');
const userRepo = require('../repositories/userRepo');

module.exports = async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ authMiddleware payload:', payload);      // <— aquí
    const user = await userRepo.findById(payload.id);
    if (!user) throw new Error();
    req.user = { id: user.id };
    console.log('🔑 req.user.id:', req.user.id);            // <— y aquí
    next();
  } catch (err) {
    console.error('🔒 authMiddleware error:', err.message);
    res.status(401).json({ error: 'Token inválido' });
  }
};
