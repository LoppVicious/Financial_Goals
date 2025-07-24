const BasicCalculator = require('./basicCalculator');

class AdvancedCalculator extends BasicCalculator {
  /**
   * Monte Carlo simulation for goal projection
   * @param {Object} goal - Goal object
   * @param {Array} contributions - Array of contributions
   * @param {Object} options - Simulation options
   * @returns {Object} Monte Carlo simulation results
   */
  monteCarloSimulation(goal, contributions = [], options = {}) {
    const {
      iterations = 1000,
      returnRateStdDev = 0.15,
      inflationRateStdDev = 0.01
    } = options;

    const currentValue = contributions.reduce((sum, contrib) => sum + parseFloat(contrib.amount), 0);
    const yearsToTarget = goal.target_years || 
      (goal.target_date ? 
        Math.max(0, (new Date(goal.target_date) - new Date()) / (1000 * 60 * 60 * 24 * 365.25)) : 
        0);
    
    const monthsToTarget = Math.ceil(yearsToTarget * 12);
    const results = [];

    for (let i = 0; i < iterations; i++) {
      // Generate random return and inflation rates using normal distribution
      const randomReturnRate = this.normalRandom(parseFloat(goal.return_rate), returnRateStdDev);
      const randomInflationRate = this.normalRandom(parseFloat(goal.inflation_rate), inflationRateStdDev);
      
      // Ensure rates are within reasonable bounds
      const boundedReturnRate = Math.max(-0.5, Math.min(0.5, randomReturnRate));
      const boundedInflationRate = Math.max(0, Math.min(0.2, randomInflationRate));

      // Calculate final value with random rates
      const finalValue = this.simulateGrowthWithVolatility(
        currentValue,
        parseFloat(goal.monthly_contribution),
        boundedReturnRate,
        monthsToTarget
      );

      const inflationAdjustedTarget = parseFloat(goal.target_amount) * 
        Math.pow(1 + boundedInflationRate, yearsToTarget);

      results.push({
        finalValue,
        inflationAdjustedTarget,
        success: finalValue >= inflationAdjustedTarget,
        returnRate: boundedReturnRate,
        inflationRate: boundedInflationRate
      });
    }

    // Calculate statistics
    const successfulRuns = results.filter(r => r.success).length;
    const successRate = (successfulRuns / iterations) * 100;
    
    const finalValues = results.map(r => r.finalValue).sort((a, b) => a - b);
    const percentile10 = finalValues[Math.floor(iterations * 0.1)];
    const percentile50 = finalValues[Math.floor(iterations * 0.5)];
    const percentile90 = finalValues[Math.floor(iterations * 0.9)];

    return {
      successRate: Math.round(successRate * 100) / 100,
      percentiles: {
        p10: Math.round(percentile10 * 100) / 100,
        p50: Math.round(percentile50 * 100) / 100,
        p90: Math.round(percentile90 * 100) / 100
      },
      averageFinalValue: Math.round((finalValues.reduce((a, b) => a + b, 0) / iterations) * 100) / 100,
      iterations,
      targetAmount: parseFloat(goal.target_amount)
    };
  }

  /**
   * Stress test scenarios
   * @param {Object} goal - Goal object
   * @param {Array} contributions - Array of contributions
   * @param {Array} stressScenarios - Array of stress scenarios
   * @returns {Array} Stress test results
   */
  stressTest(goal, contributions = [], stressScenarios = []) {
    const defaultScenarios = [
      { name: 'Recesión Moderada', returnRate: -0.1, duration: 12, startMonth: 12 },
      { name: 'Crisis Severa', returnRate: -0.3, duration: 24, startMonth: 24 },
      { name: 'Inflación Alta', inflationRate: 0.08, duration: 36, startMonth: 6 },
      { name: 'Estanflación', returnRate: -0.05, inflationRate: 0.06, duration: 18, startMonth: 18 }
    ];

    const scenarios = stressScenarios.length > 0 ? stressScenarios : defaultScenarios;
    const baseProjection = this.calculateGoalProjection(goal, contributions);
    
    return scenarios.map(scenario => {
      const stressedProjection = this.applyStressScenario(goal, contributions, scenario);
      
      return {
        name: scenario.name,
        scenario,
        baseProjection: baseProjection.finalProjectedValue,
        stressedProjection: stressedProjection.finalProjectedValue,
        impact: stressedProjection.finalProjectedValue - baseProjection.finalProjectedValue,
        impactPercentage: ((stressedProjection.finalProjectedValue - baseProjection.finalProjectedValue) / baseProjection.finalProjectedValue) * 100,
        stillAchievable: stressedProjection.finalProjectedValue >= stressedProjection.inflationAdjustedTarget
      };
    });
  }

  /**
   * Apply stress scenario to projection
   * @param {Object} goal - Goal object
   * @param {Array} contributions - Array of contributions
   * @param {Object} scenario - Stress scenario
   * @returns {Object} Stressed projection
   */
  applyStressScenario(goal, contributions, scenario) {
    const currentValue = contributions.reduce((sum, contrib) => sum + parseFloat(contrib.amount), 0);
    const yearsToTarget = goal.target_years || 
      (goal.target_date ? 
        Math.max(0, (new Date(goal.target_date) - new Date()) / (1000 * 60 * 60 * 24 * 365.25)) : 
        0);
    
    const monthsToTarget = Math.ceil(yearsToTarget * 12);
    let projectedValue = currentValue;
    
    for (let month = 1; month <= monthsToTarget; month++) {
      let monthlyRate = parseFloat(goal.return_rate) / 12;
      
      // Apply stress scenario if within the stress period
      if (month >= scenario.startMonth && month < scenario.startMonth + scenario.duration) {
        if (scenario.returnRate !== undefined) {
          monthlyRate = scenario.returnRate / 12;
        }
      }
      
      projectedValue = projectedValue * (1 + monthlyRate) + parseFloat(goal.monthly_contribution);
    }
    
    // Calculate inflation-adjusted target (potentially with stressed inflation)
    let inflationRate = parseFloat(goal.inflation_rate);
    if (scenario.inflationRate !== undefined) {
      inflationRate = scenario.inflationRate;
    }
    
    const inflationAdjustedTarget = parseFloat(goal.target_amount) * 
      Math.pow(1 + inflationRate, yearsToTarget);
    
    return {
      finalProjectedValue: Math.round(projectedValue * 100) / 100,
      inflationAdjustedTarget: Math.round(inflationAdjustedTarget * 100) / 100,
      scenario
    };
  }

  /**
   * Calculate optimal asset allocation
   * @param {Object} params - Allocation parameters
   * @returns {Object} Optimal allocation
   */
  calculateOptimalAllocation(params) {
    const {
      riskTolerance = 'moderate', // conservative, moderate, aggressive
      timeHorizon,
      currentAge,
      targetAmount,
      currentAmount = 0
    } = params;

    // Simple rule-based allocation (in a real app, this would be more sophisticated)
    let stockAllocation, bondAllocation, cashAllocation;

    switch (riskTolerance) {
      case 'conservative':
        stockAllocation = Math.max(20, 100 - currentAge);
        bondAllocation = 60;
        cashAllocation = 20;
        break;
      case 'aggressive':
        stockAllocation = Math.min(90, 120 - currentAge);
        bondAllocation = 10;
        cashAllocation = 0;
        break;
      default: // moderate
        stockAllocation = Math.max(30, 110 - currentAge);
        bondAllocation = 40;
        cashAllocation = 10;
    }

    // Adjust for time horizon
    if (timeHorizon < 5) {
      stockAllocation = Math.max(stockAllocation - 20, 20);
      bondAllocation += 10;
      cashAllocation += 10;
    } else if (timeHorizon > 20) {
      stockAllocation = Math.min(stockAllocation + 10, 90);
      bondAllocation -= 5;
      cashAllocation -= 5;
    }

    // Normalize to 100%
    const total = stockAllocation + bondAllocation + cashAllocation;
    stockAllocation = Math.round((stockAllocation / total) * 100);
    bondAllocation = Math.round((bondAllocation / total) * 100);
    cashAllocation = 100 - stockAllocation - bondAllocation;

    // Calculate expected returns and risk
    const expectedReturns = {
      stocks: 0.08,
      bonds: 0.04,
      cash: 0.02
    };

    const portfolioReturn = 
      (stockAllocation / 100) * expectedReturns.stocks +
      (bondAllocation / 100) * expectedReturns.bonds +
      (cashAllocation / 100) * expectedReturns.cash;

    return {
      allocation: {
        stocks: stockAllocation,
        bonds: bondAllocation,
        cash: cashAllocation
      },
      expectedReturn: Math.round(portfolioReturn * 10000) / 100, // as percentage
      riskLevel: riskTolerance,
      timeHorizon,
      rebalanceFrequency: 'quarterly'
    };
  }

  /**
   * Generate normal random number using Box-Muller transform
   * @param {number} mean - Mean value
   * @param {number} stdDev - Standard deviation
   * @returns {number} Random number from normal distribution
   */
  normalRandom(mean, stdDev) {
    let u = 0, v = 0;
    while(u === 0) u = Math.random(); // Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return z * stdDev + mean;
  }

  /**
   * Simulate growth with monthly volatility
   * @param {number} initialValue - Starting value
   * @param {number} monthlyContribution - Monthly contribution
   * @param {number} annualReturnRate - Annual return rate
   * @param {number} months - Number of months
   * @returns {number} Final value
   */
  simulateGrowthWithVolatility(initialValue, monthlyContribution, annualReturnRate, months) {
    let value = initialValue;
    const monthlyReturnRate = annualReturnRate / 12;
    const monthlyVolatility = 0.15 / Math.sqrt(12); // Annualized volatility of 15%

    for (let month = 0; month < months; month++) {
      // Add monthly contribution
      value += monthlyContribution;
      
      // Apply random monthly return
      const randomReturn = this.normalRandom(monthlyReturnRate, monthlyVolatility);
      value *= (1 + randomReturn);
      
      // Ensure value doesn't go negative
      value = Math.max(0, value);
    }

    return value;
  }

  /**
   * Calculate tax-adjusted returns
   * @param {Object} params - Tax calculation parameters
   * @returns {Object} Tax-adjusted projection
   */
  calculateTaxAdjustedReturns(params) {
    const {
      grossReturn,
      taxRate = 0.25,
      accountType = 'taxable', // taxable, tax_deferred, tax_free
      years
    } = params;

    let effectiveReturn;

    switch (accountType) {
      case 'tax_free':
        effectiveReturn = grossReturn;
        break;
      case 'tax_deferred':
        // Tax paid on withdrawal
        effectiveReturn = grossReturn;
        break;
      default: // taxable
        // Tax paid annually on gains
        effectiveReturn = grossReturn * (1 - taxRate);
    }

    return {
      grossReturn: Math.round(grossReturn * 10000) / 100,
      effectiveReturn: Math.round(effectiveReturn * 10000) / 100,
      taxImpact: Math.round((grossReturn - effectiveReturn) * 10000) / 100,
      accountType
    };
  }
}

module.exports = AdvancedCalculator;