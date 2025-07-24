// server/routes/goals.routes.js
const express = require('express');
const router = express.Router();

const {
  validate,
  schemas,
  validateUUID,
  businessRuleValidation
} = require('../middleware/validate');

const goalsController = require('../controllers/goals.controller');

// GET /api/goals
router.get(
  '/',
  validate(schemas.goalFilterQuery, 'query'),
  goalsController.listGoals
);

// POST /api/goals
router.post(
  '/',
  validate(schemas.goalCreation),
  businessRuleValidation.futureDate,
  businessRuleValidation.reasonableFinancialValues,
  goalsController.createGoal
);

// GET /api/goals/:id
router.get(
  '/:id',
  validateUUID('id'),
  goalsController.getGoal
);

// PUT /api/goals/:id
router.put(
  '/:id',
  validateUUID('id'),
  validate(schemas.goalUpdate),
  businessRuleValidation.futureDate,
  goalsController.updateGoal
);

// DELETE /api/goals/:id
router.delete(
  '/:id',
  validateUUID('id'),
  goalsController.deleteGoal
);

// GET /api/goals/:id/projection
router.get(
  '/:id/projection',
  validateUUID('id'),
  goalsController.getProjection
);

module.exports = router;
