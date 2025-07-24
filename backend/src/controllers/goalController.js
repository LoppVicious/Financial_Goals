const Joi = require('joi');
const goalService = require('../services/goalService');

const goalSchema = Joi.object({
  name: Joi.string().required(),
  targetAmount: Joi.number().positive().required(),
  currency: Joi.string().valid('EUR', 'USD').required(),
  targetDate: Joi.date().iso().allow(null),
  yearsToGoal: Joi.number().integer().min(0).allow(null),
  defaultInflation: Joi.number().min(0).max(1).required(),
  defaultReturn: Joi.number().min(0).max(1).required(),
});

exports.createGoal = async (req, res) => {
  try {
    const payload = await goalSchema.validateAsync(req.body);
    const userId = req.user.id;
    const goal = await goalService.createGoal(userId, payload);
    res.status(201).json(goal);
  } catch (err) {
    if (err.isJoi) {
      return res.status(400).json({ message: err.details[0].message });
    }
    console.error(err);
    res.status(500).json({ message: 'Error interno al crear meta' });
  }
};

exports.listGoals = async (req, res) => {
  try {
    const userId = req.user.id;
    const goals = await goalService.listGoals(userId);
    res.json(goals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error interno al listar metas' });
  }
};
