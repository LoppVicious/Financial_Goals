// server/controllers/goals.controller.js
const { v4: uuidv4 } = require('uuid');
const knex = require('../models/db');
const { futureValueAnnuity, inflationAdjust } = require('../utils/formulas');

// GET /api/goals
async function listGoals(req, res, next) {
  try {
    const goals = await knex('goals').where({ user_id: req.user.id });
    res.json(goals);
  } catch (err) {
    next(err);
  }
}

// POST /api/goals
async function createGoal(req, res, next) {
  try {
    const id = uuidv4();
    const { name, type, target_amount, target_date, target_years,
            monthly_contribution, inflation_rate, return_rate } = req.body;

    await knex('goals').insert({
      id,
      user_id: req.user.id,
      name,
      type,
      target_amount,
      target_date: target_date || null,
      target_years: target_years || null,
      monthly_contribution,
      inflation_rate,
      return_rate,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    });

    res.status(201).json({ id, name, type, target_amount, target_date, target_years,
                           monthly_contribution, inflation_rate, return_rate });
  } catch (err) {
    next(err);
  }
}

// GET /api/goals/:id
async function getGoal(req, res, next) {
  try {
    const { id } = req.params;
    const goal = await knex('goals').where({ id, user_id: req.user.id }).first();
    if (!goal) return res.status(404).json({ error: 'Goal not found' });
    res.json(goal);
  } catch (err) {
    next(err);
  }
}

// PUT /api/goals/:id
async function updateGoal(req, res, next) {
  try {
    const { id } = req.params;
    const updates = req.body;
    updates.updated_at = knex.fn.now();

    const count = await knex('goals')
      .where({ id, user_id: req.user.id })
      .update(updates);

    if (!count) return res.status(404).json({ error: 'Goal not found' });
    res.json({ message: 'Updated' });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/goals/:id
async function deleteGoal(req, res, next) {
  try {
    const { id } = req.params;
    const count = await knex('goals')
      .where({ id, user_id: req.user.id })
      .del();
    if (!count) return res.status(404).json({ error: 'Goal not found' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

// GET /api/goals/:id/projection
async function getProjection(req, res, next) {
  try {
    const { id } = req.params;
    const goal = await knex('goals').where({ id, user_id: req.user.id }).first();
    if (!goal) return res.status(404).json({ error: 'Goal not found' });

    const contributions = await knex('contributions')
      .where({ goal_id: id })
      .orderBy('contribution_date', 'asc');

    // Aquí invocamos tu servicio de proyección
    const { series, finalFV, neededPerMonth } = require('../services/calculations/basicCalculator')
      .buildProjection({ goal, contributions });

    res.json({ series, finalFV, neededPerMonth });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listGoals,
  createGoal,
  getGoal,
  updateGoal,
  deleteGoal,
  getProjection
};
