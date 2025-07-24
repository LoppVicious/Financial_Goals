const express = require('express');
const { authenticateToken, requirePremium } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');
const { asyncHandler, createError } = require('../middleware/errorHandler');
const BasicCalculator = require('../services/calculations/basicCalculator');
const AdvancedCalculator = require('../services/calculations/advancedCalculator');
const { validateFinancialInputs } = require('../utils/formulas');
const Joi = require('joi');


const router = express.Router();
const basicCalculator = new BasicCalculator();
const advancedCalculator = new AdvancedCalculator();

// All routes require authentication
router.use(authenticateToken);

/**
 * POST /api/calculate/required-contribution
 * Calculate required monthly contribution to reach a goal
 */
router.post('/required-contribution',
  validate(schemas.requiredContributionCalc),
  asyncHandler(async (req, res) => {
    const validation = validateFinancialInputs(req.body);
    
    if (!validation.isValid) {
      throw createError.badRequest('Invalid financial inputs', validation.errors);
    }

    const result = basicCalculator.calculateRequiredContribution(req.body);

    res.json({
      calculation: 'required-contribution',
      inputs: req.body,
      result,
      timestamp: new Date().toISOString()
    });
  })
);

/**
 * POST /api/calculate/future-value
 * Calculate future value with regular contributions
 */
router.post('/future-value',
  validate(schemas.futureValueCalc),
  asyncHandler(async (req, res) => {
    const validation = validateFinancialInputs(req.body);
    
    if (!validation.isValid) {
      throw createError.badRequest('Invalid financial inputs', validation.errors);
    }

    const result = basicCalculator.calculateFutureValue(req.body);

    res.json({
      calculation: 'future-value',
      inputs: req.body,
      result,
      timestamp: new Date().toISOString()
    });
  })
);

/**
 * POST /api/calculate/break-even
 * Calculate break-even analysis for different contribution amounts
 */
router.post('/break-even',
  validate(Joi.object({
    targetAmount: Joi.number().positive().max(10000000).required(),
    currentAmount: Joi.number().min(0).max(10000000).default(0),
    returnRate: Joi.number().min(0).max(0.3).required(),
    inflationRate: Joi.number().min(0).max(0.2).default(0.02)
  })),
  asyncHandler(async (req, res) => {
    const validation = validateFinancialInputs(req.body);
    
    if (!validation.isValid) {
      throw createError.badRequest('Invalid financial inputs', validation.errors);
    }

    const result = basicCalculator.calculateBreakEven(req.body);

    res.json({
      calculation: 'break-even',
      inputs: req.body,
      result,
      timestamp: new Date().toISOString()
    });
  })
);

/**
 * POST /api/calculate/compare-scenarios
 * Compare multiple financial scenarios
 */
router.post('/compare-scenarios',
  validate(Joi.object({
    scenarios: Joi.array().items(
      Joi.object({
        name: Joi.string().optional(),
        monthlyContribution: Joi.number().min(0).max(100000).required(),
        currentAmount: Joi.number().min(0).max(10000000).default(0),
        years: Joi.number().positive().max(50).required(),
        returnRate: Joi.number().min(0).max(0.3).required(),
        inflationRate: Joi.number().min(0).max(0.2).default(0.02)
      })
    ).min(2).max(5).required()
  })),
  asyncHandler(async (req, res) => {
    const { scenarios } = req.body;
    
    // Validate each scenario
    for (const scenario of scenarios) {
      const validation = validateFinancialInputs(scenario);
      if (!validation.isValid) {
        throw createError.badRequest(`Invalid inputs in scenario: ${validation.errors.join(', ')}`);
      }
    }

    const result = basicCalculator.compareScenarios(scenarios);

    res.json({
      calculation: 'compare-scenarios',
      inputs: { scenarios },
      result,
      timestamp: new Date().toISOString()
    });
  })
);

/**
 * POST /api/calculate/inflation-impact
 * Calculate the impact of inflation on purchasing power
 */
router.post('/inflation-impact',
  validate(Joi.object({
    amount: Joi.number().positive().max(10000000).required(),
    years: Joi.number().positive().max(50).required(),
    inflationRate: Joi.number().min(0).max(0.2).default(0.02)
  })),
  asyncHandler(async (req, res) => {
    const { amount, years, inflationRate } = req.body;
    
    const { inflationAdjust, presentValue } = require('../utils/formulas');
    
    const futureValue = inflationAdjust(amount, inflationRate, years);
    const purchasingPowerLoss = amount - presentValue(amount, inflationRate, years);
    const realValue = amount / Math.pow(1 + inflationRate, years);
    
    const result = {
      originalAmount: amount,
      futureNominalValue: Math.round(futureValue * 100) / 100,
      realValueToday: Math.round(realValue * 100) / 100,
      purchasingPowerLoss: Math.round(purchasingPowerLoss * 100) / 100,
      inflationImpactPercentage: Math.round(((futureValue - amount) / amount) * 10000) / 100,
      years,
      inflationRate: inflationRate * 100
    };

    res.json({
      calculation: 'inflation-impact',
      inputs: req.body,
      result,
      timestamp: new Date().toISOString()
    });
  })
);

// Premium calculation features
/**
 * POST /api/calculate/optimal-allocation
 * Calculate optimal asset allocation (Premium only)
 */
router.post('/optimal-allocation',
  requirePremium,
  validate(Joi.object({
    riskTolerance: Joi.string().valid('conservative', 'moderate', 'aggressive').default('moderate'),
    timeHorizon: Joi.number().positive().max(50).required(),
    currentAge: Joi.number().integer().min(18).max(100).required(),
    targetAmount: Joi.number().positive().max(10000000).required(),
    currentAmount: Joi.number().min(0).max(10000000).default(0)
  })),
  asyncHandler(async (req, res) => {
    const result = advancedCalculator.calculateOptimalAllocation(req.body);

    res.json({
      calculation: 'optimal-allocation',
      inputs: req.body,
      result,
      timestamp: new Date().toISOString()
    });
  })
);

/**
 * POST /api/calculate/tax-adjusted-returns
 * Calculate tax-adjusted investment returns (Premium only)
 */
router.post('/tax-adjusted-returns',
  requirePremium,
  validate(Joi.object({
    grossReturn: Joi.number().min(0).max(0.5).required(),
    taxRate: Joi.number().min(0).max(0.5).default(0.25),
    accountType: Joi.string().valid('taxable', 'tax_deferred', 'tax_free').default('taxable'),
    years: Joi.number().positive().max(50).required()
  })),
  asyncHandler(async (req, res) => {
    const result = advancedCalculator.calculateTaxAdjustedReturns(req.body);

    res.json({
      calculation: 'tax-adjusted-returns',
      inputs: req.body,
      result,
      timestamp: new Date().toISOString()
    });
  })
);

/**
 * POST /api/calculate/monte-carlo
 * Run Monte Carlo simulation (Premium only)
 */
router.post('/monte-carlo',
  requirePremium,
  validate(Joi.object({
    monthlyContribution: Joi.number().min(0).max(100000).required(),
    currentAmount: Joi.number().min(0).max(10000000).default(0),
    years: Joi.number().positive().max(50).required(),
    expectedReturn: Joi.number().min(0).max(0.3).required(),
    returnStdDev: Joi.number().min(0.01).max(0.5).default(0.15),
    iterations: Joi.number().integer().min(100).max(10000).default(1000)
  })),
  asyncHandler(async (req, res) => {
    const { monthlyContribution, currentAmount, years, expectedReturn, returnStdDev, iterations } = req.body;
    
    // Create a mock goal object for the simulation
    const mockGoal = {
      target_amount: 0, // Not used in this calculation
      return_rate: expectedReturn,
      inflation_rate: 0.02,
      monthly_contribution: monthlyContribution,
      target_years: years
    };
    
    // Create mock contributions representing current amount
    const mockContributions = currentAmount > 0 ? [{ amount: currentAmount }] : [];
    
    const result = advancedCalculator.monteCarloSimulation(
      mockGoal, 
      mockContributions, 
      { iterations, returnRateStdDev: returnStdDev }
    );

    res.json({
      calculation: 'monte-carlo',
      inputs: req.body,
      result,
      timestamp: new Date().toISOString()
    });
  })
);

/**
 * GET /api/calculate/formulas
 * Get information about the financial formulas used
 */
router.get('/formulas',
  asyncHandler(async (req, res) => {
    const formulas = {
      futureValueAnnuity: {
        name: 'Future Value of Annuity',
        formula: 'FV = PMT × ((1+r)^n - 1) / r + PV×(1+r)^n',
        description: 'Calculates the future value of regular payments with compound interest',
        variables: {
          FV: 'Future Value',
          PMT: 'Payment per period (monthly contribution)',
          r: 'Interest rate per period (annual rate / 12)',
          n: 'Number of periods (months)',
          PV: 'Present Value (initial amount)'
        }
      },
      requiredPayment: {
        name: 'Required Payment',
        formula: 'PMT = (FV - PV×(1+r)^n) × r / ((1+r)^n - 1)',
        description: 'Calculates the required payment to reach a future value target',
        variables: {
          PMT: 'Required payment per period',
          FV: 'Future Value target',
          PV: 'Present Value (initial amount)',
          r: 'Interest rate per period',
          n: 'Number of periods'
        }
      },
      inflationAdjustment: {
        name: 'Inflation Adjustment',
        formula: 'Real Value = Nominal Value × (1 + inflation)^years',
        description: 'Adjusts nominal values for inflation over time',
        variables: {
          'Real Value': 'Inflation-adjusted value',
          'Nominal Value': 'Value without inflation adjustment',
          inflation: 'Annual inflation rate',
          years: 'Number of years'
        }
      },
      compoundInterest: {
        name: 'Compound Interest',
        formula: 'A = P × (1 + r/n)^(n×t)',
        description: 'Calculates compound interest growth',
        variables: {
          A: 'Final amount',
          P: 'Principal (initial amount)',
          r: 'Annual interest rate',
          n: 'Compounding frequency per year',
          t: 'Time in years'
        }
      }
    };

    res.json({
      formulas,
      disclaimer: 'These formulas provide estimates based on the assumptions provided. Actual investment returns may vary significantly due to market volatility, fees, taxes, and other factors.',
      timestamp: new Date().toISOString()
    });
  })
);

/**
 * GET /api/calculate/assumptions
 * Get default assumptions and ranges for calculations
 */
router.get('/assumptions',
  asyncHandler(async (req, res) => {
    const assumptions = {
      defaultValues: {
        inflationRate: 0.02, // 2%
        returnRate: 0.05, // 5%
        taxRate: 0.25 // 25%
      },
      ranges: {
        inflationRate: { min: 0, max: 0.2, recommended: { min: 0.015, max: 0.04 } },
        returnRate: { min: 0, max: 0.3, recommended: { min: 0.03, max: 0.12 } },
        taxRate: { min: 0, max: 0.5, recommended: { min: 0.15, max: 0.35 } }
      },
      riskProfiles: {
        conservative: {
          expectedReturn: 0.04,
          volatility: 0.08,
          description: 'Low risk, stable returns'
        },
        moderate: {
          expectedReturn: 0.07,
          volatility: 0.12,
          description: 'Balanced risk and return'
        },
        aggressive: {
          expectedReturn: 0.10,
          volatility: 0.18,
          description: 'High risk, high potential return'
        }
      },
      disclaimer: 'These are general assumptions for planning purposes. Consult with a financial advisor for personalized advice.',
      lastUpdated: new Date().toISOString()
    };

    res.json(assumptions);
  })
);

module.exports = router;