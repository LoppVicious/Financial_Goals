const express = require('express');
const { authenticateToken, checkResourceOwnership } = require('../middleware/auth');
const { validate, schemas, validateUUID, businessRuleValidation } = require('../middleware/validate');
const { asyncHandler, createError } = require('../middleware/errorHandler');
const Contribution = require('../models/contribution.model');
const Goal = require('../models/goal.model');
const BasicCalculator = require('../services/calculations/basicCalculator');

const router = express.Router();
const basicCalculator = new BasicCalculator();

// All routes require authentication
router.use(authenticateToken);

/**
 * GET /api/contributions/:id
 * Get a specific contribution
 */
router.get('/:id',
  validateUUID('id'),
  checkResourceOwnership('id', 'Contribution'),
  asyncHandler(async (req, res) => {
    const contribution = await Contribution.findById(req.params.id);
    
    if (!contribution) {
      throw createError.notFound('Contribution not found');
    }

    res.json({
      contribution
    });
  })
);

/**
 * PUT /api/contributions/:id
 * Update a contribution
 */
router.put('/:id',
  validateUUID('id'),
  checkResourceOwnership('id', 'Contribution'),
  validate(schemas.contributionUpdate),
  businessRuleValidation.pastOrPresentDate,
  asyncHandler(async (req, res) => {
    const contribution = await Contribution.findById(req.params.id);
    
    if (!contribution) {
      throw createError.notFound('Contribution not found');
    }

    const updatedContribution = await Contribution.update(req.params.id, req.body);
    
    // Recalculate goal projection
    const goal = await Goal.findById(contribution.goal_id);
    const contributions = await Contribution.findByGoalId(contribution.goal_id);
    const projection = basicCalculator.calculateGoalProjection(goal, contributions);

    res.json({
      message: 'Contribution updated successfully',
      contribution: updatedContribution,
      updatedProjection: projection
    });
  })
);

/**
 * DELETE /api/contributions/:id
 * Delete a contribution
 */
router.delete('/:id',
  validateUUID('id'),
  checkResourceOwnership('id', 'Contribution'),
  asyncHandler(async (req, res) => {
    const contribution = await Contribution.findById(req.params.id);
    
    if (!contribution) {
      throw createError.notFound('Contribution not found');
    }

    const goalId = contribution.goal_id;
    await Contribution.delete(req.params.id);
    
    // Recalculate goal projection
    const goal = await Goal.findById(goalId);
    const contributions = await Contribution.findByGoalId(goalId);
    const projection = basicCalculator.calculateGoalProjection(goal, contributions);

    res.json({
      message: 'Contribution deleted successfully',
      updatedProjection: projection
    });
  })
);

/**
 * GET /api/contributions/goal/:goalId/summary
 * Get contribution summary for a goal
 */
router.get('/goal/:goalId/summary',
  validateUUID('goalId'),
  checkResourceOwnership('goalId', 'Goal'),
  asyncHandler(async (req, res) => {
    const { goalId } = req.params;
    
    const goal = await Goal.findById(goalId);
    if (!goal) {
      throw createError.notFound('Goal not found');
    }

    const contributions = await Contribution.findByGoalId(goalId);
    const stats = await Contribution.getContributionStats(goalId);
    const history = await Contribution.getContributionHistory(goalId);
    const trend = await Contribution.getContributionTrend(goalId, 12);

    // Calculate monthly averages
    const monthlyContributions = contributions.filter(c => c.type === 'monthly');
    const extraContributions = contributions.filter(c => c.type === 'extra');
    const initialContributions = contributions.filter(c => c.type === 'initial');

    const summary = {
      totalAmount: parseFloat(stats.total_amount) || 0,
      totalContributions: parseInt(stats.total_contributions) || 0,
      averageAmount: parseFloat(stats.avg_amount) || 0,
      largestContribution: await Contribution.findLargestContribution(goalId),
      smallestContribution: await Contribution.findSmallestContribution(goalId),
      byType: {
        monthly: {
          count: parseInt(stats.monthly_contributions) || 0,
          total: monthlyContributions.reduce((sum, c) => sum + parseFloat(c.amount), 0)
        },
        extra: {
          count: parseInt(stats.extra_contributions) || 0,
          total: extraContributions.reduce((sum, c) => sum + parseFloat(c.amount), 0)
        },
        initial: {
          count: parseInt(stats.initial_contributions) || 0,
          total: initialContributions.reduce((sum, c) => sum + parseFloat(c.amount), 0)
        }
      },
      history,
      monthlyTrend: trend
    };

    res.json({
      summary
    });
  })
);

/**
 * POST /api/contributions/bulk
 * Bulk create contributions (Premium feature)
 */
router.post('/bulk',
  validate(Joi.object({
    goalId: Joi.string().uuid().required(),
    contributions: Joi.array().items(schemas.contributionCreation).min(1).max(100).required()
  })),
  checkResourceOwnership('goalId', 'Goal'),
  asyncHandler(async (req, res) => {
    const { goalId, contributions: contributionsData } = req.body;
    
    const goal = await Goal.findById(goalId);
    if (!goal) {
      throw createError.notFound('Goal not found');
    }

    // Validate all contribution dates
    for (const contrib of contributionsData) {
      const contributionDate = new Date(contrib.contribution_date);
      const now = new Date();
      now.setHours(23, 59, 59, 999);
      
      if (contributionDate > now) {
        throw createError.badRequest(`Contribution date ${contrib.contribution_date} cannot be in the future`);
      }
    }

    // Add goal_id to each contribution
    const contributionsWithGoalId = contributionsData.map(contrib => ({
      ...contrib,
      goal_id: goalId
    }));

    const createdContributions = await Contribution.bulkCreate(contributionsWithGoalId);
    
    // Recalculate goal projection
    const allContributions = await Contribution.findByGoalId(goalId);
    const projection = basicCalculator.calculateGoalProjection(goal, allContributions);

    res.status(201).json({
      message: `${createdContributions.length} contributions created successfully`,
      contributions: createdContributions,
      updatedProjection: projection
    });
  })
);

/**
 * GET /api/contributions/goal/:goalId/export
 * Export contributions as CSV (Premium feature)
 */
router.get('/goal/:goalId/export',
  validateUUID('goalId'),
  checkResourceOwnership('goalId', 'Goal'),
  asyncHandler(async (req, res) => {
    const { goalId } = req.params;
    const { format = 'csv' } = req.query;
    
    const goal = await Goal.findById(goalId);
    if (!goal) {
      throw createError.notFound('Goal not found');
    }

    const contributions = await Contribution.findByGoalId(goalId);

    if (format === 'csv') {
      // Generate CSV
      const csvHeader = 'Date,Amount,Type,Notes\n';
      const csvRows = contributions.map(contrib => 
        `${contrib.contribution_date},${contrib.amount},${contrib.type},"${contrib.notes || ''}"`
      ).join('\n');
      
      const csv = csvHeader + csvRows;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${goal.name}_contributions.csv"`);
      res.send(csv);
    } else {
      // Return JSON
      res.json({
        goal: {
          id: goal.id,
          name: goal.name,
          type: goal.type
        },
        contributions,
        exportDate: new Date().toISOString()
      });
    }
  })
);

/**
 * GET /api/contributions/goal/:goalId/analytics
 * Get detailed analytics for contributions (Premium feature)
 */
router.get('/goal/:goalId/analytics',
  validateUUID('goalId'),
  checkResourceOwnership('goalId', 'Goal'),
  asyncHandler(async (req, res) => {
    const { goalId } = req.params;
    const { months = 12 } = req.query;
    
    const goal = await Goal.findById(goalId);
    if (!goal) {
      throw createError.notFound('Goal not found');
    }

    const contributions = await Contribution.findByGoalId(goalId);
    const monthlyTrend = await Contribution.getContributionTrend(goalId, months);
    const yearlyTrend = await Contribution.getMonthlyContributionSummary(goalId, new Date().getFullYear());

    // Calculate consistency metrics
    const monthlyContributions = contributions.filter(c => c.type === 'monthly');
    const consistencyScore = monthlyContributions.length > 0 ? 
      (monthlyContributions.length / Math.max(1, months)) * 100 : 0;

    // Calculate growth rate
    const sortedContributions = contributions.sort((a, b) =>new Date(a.contribution_date) - new Date(b.contribution_date));
    const firstHalf = sortedContributions.slice(0, Math.floor(sortedContributions.length / 2));
    const secondHalf = sortedContributions.slice(Math.floor(sortedContributions.length / 2));
    
    const firstHalfAvg = firstHalf.reduce((sum, c) => sum + parseFloat(c.amount), 0) / firstHalf.length || 0;
    const secondHalfAvg = secondHalf.reduce((sum, c) => sum + parseFloat(c.amount), 0) / secondHalf.length || 0;
    
    const growthRate = firstHalfAvg > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0;

    const analytics = {
      totalContributions: contributions.length,
      totalAmount: contributions.reduce((sum, c) => sum + parseFloat(c.amount), 0),
      averageContribution: contributions.length > 0 ? 
        contributions.reduce((sum, c) => sum + parseFloat(c.amount), 0) / contributions.length : 0,
      consistencyScore: Math.round(consistencyScore * 100) / 100,
      growthRate: Math.round(growthRate * 100) / 100,
      monthlyTrend,
      yearlyTrend,
      contributionFrequency: {
        daily: contributions.filter(c => {
          const date = new Date(c.contribution_date);
          const today = new Date();
          const diffTime = Math.abs(today - date);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= 1;
        }).length,
        weekly: contributions.filter(c => {
          const date = new Date(c.contribution_date);
          const today = new Date();
          const diffTime = Math.abs(today - date);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= 7;
        }).length,
        monthly: contributions.filter(c => {
          const date = new Date(c.contribution_date);
          const today = new Date();
          const diffTime = Math.abs(today - date);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= 30;
        }).length
      }
    };

    res.json({
      analytics
    });
  })
);

module.exports = router;