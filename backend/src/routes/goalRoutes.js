const express = require('express');
const { createGoal, listGoals } = require('../controllers/goalController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

// Todas las rutas de goals requieren autenticación
router.use(authMiddleware);

router.post('/', createGoal);
router.get('/', listGoals);

module.exports = router;
