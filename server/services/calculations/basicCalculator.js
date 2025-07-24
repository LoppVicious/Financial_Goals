const { 
  futureValueAnnuity, 
  requiredPayment, 
  inflationAdjust, 
  calculateProgress,
  generateProjection,
  yearsBetween,
  monthsBetween,
  validateFinancialInputs
} = require('../../utils/formulas');

class BasicCalculator {
  /**
   * Calculate projection for a goal
   * @param {Object} goal - Goal object
   * @param {Array} contributions - Array of contributions
   * @returns {Object} Projection data
   */
  calculateGoalProjection(goal, contributions = []) {
    // Calculate current value from contributions
    const currentValue = contributions.reduce((sum, contrib) => sum + parseFloat(contrib.amount), 0);
    
    // Calculate years to target
    const yearsToTarget = goal.target_years || 
      (goal.target_date ? 
        Math.max(0, yearsBetween(new Date(), new Date(goal.target_date))) : 
        0);
    
    const monthsToTarget = Math.ceil(yearsToTarget * 12);
    
    // Adjust target for inflation
    const inflationAdjustedTarget = inflationAdjust(
      parseFloat(goal.target_amount), 
      parseFloat(goal.inflation_rate), 
      yearsToTarget
    );
    
    // Calculate progress
    const progress = calculateProgress(currentValue, inflationAdjustedTarget);
    
    // Calculate required monthly contribution
    const requiredMonthly = monthsToTarget > 0 ? 
      requiredPayment(
        inflationAdjustedTarget, 
        parseFloat(goal.return_rate), 
        monthsToTarget, 
        currentValue
      ) : 0;
    
    // Generate month-by-month projection
    const projectionData = generateProjection(
      {
        target_amount: parseFloat(goal.target_amount),
        return_rate: parseFloat(goal.return_rate),
        inflation_rate: parseFloat(goal.inflation_rate),
        monthly_contribution: parseFloat(goal.monthly_contribution)
      },
      currentValue,
      Math.min(monthsToTarget, 120) // Max 10 years projection
    );
    
    // Calculate final projected value
    const finalProjectedValue = monthsToTarget > 0 ? 
      futureValueAnnuity(
        parseFloat(goal.monthly_contribution),
        parseFloat(goal.return_rate),
        monthsToTarget,
        currentValue
      ) : currentValue;
    
    // Determine status
    const status = this.determineGoalStatus(
      progress,
      parseFloat(goal.monthly_contribution),
      requiredMonthly
    );
    
    return {
      currentValue: Math.round(currentValue * 100) / 100,
      targetAmount: parseFloat(goal.target_amount),
      inflationAdjustedTarget: Math.round(inflationAdjustedTarget * 100) / 100,
      progress: Math.round(progress * 100) / 100,
      yearsToTarget,
      monthsToTarget,
      requiredMonthly: Math.round(requiredMonthly * 100) / 100,
      finalProjectedValue: Math.round(finalProjectedValue * 100) / 100,
      projectionData,
      status,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Calculate required contribution for a specific goal
   * @param {Object} params - Calculation parameters
   * @returns {Object} Required contribution data
   */
  calculateRequiredContribution(params) {
    const validation = validateFinancialInputs(params);
    if (!validation.isValid) {
      throw new Error(`Invalid inputs: ${validation.errors.join(', ')}`);
    }

    const {
      targetAmount,
      currentAmount = 0,
      years,
      returnRate,
      inflationRate = 0.02
    } = params;

    const months = years * 12;
    const inflationAdjustedTarget = inflationAdjust(targetAmount, inflationRate, years);
    
    const requiredMonthly = requiredPayment(
      inflationAdjustedTarget,
      returnRate,
      months,
      currentAmount
    );

    const totalContributions = requiredMonthly * months;
    const totalInterest = inflationAdjustedTarget - currentAmount - totalContributions;

    return {
      requiredMonthly: Math.round(requiredMonthly * 100) / 100,
      totalContributions: Math.round(totalContributions * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      inflationAdjustedTarget: Math.round(inflationAdjustedTarget * 100) / 100,
      effectiveRate: returnRate,
      months
    };
  }

  /**
   * Calculate future value projection
   * @param {Object} params - Calculation parameters
   * @returns {Object} Future value data
   */
  calculateFutureValue(params) {
    const validation = validateFinancialInputs(params);
    if (!validation.isValid) {
      throw new Error(`Invalid inputs: ${validation.errors.join(', ')}`);
    }

    const {
      monthlyContribution,
      currentAmount = 0,
      years,
      returnRate
    } = params;

    const months = years * 12;
    const futureValue = futureValueAnnuity(
      monthlyContribution,
      returnRate,
      months,
      currentAmount
    );

    const totalContributions = monthlyContribution * months;
    const totalInterest = futureValue - currentAmount - totalContributions;

    return {
      futureValue: Math.round(futureValue * 100) / 100,
      totalContributions: Math.round(totalContributions * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      effectiveRate: returnRate,
      months
    };
  }

  /**
   * Determine goal status based on progress and contributions
   * @param {number} progress - Current progress percentage
   * @param {number} currentMonthly - Current monthly contribution
   * @param {number} requiredMonthly - Required monthly contribution
   * @returns {Object} Status object
   */
  determineGoalStatus(progress, currentMonthly, requiredMonthly) {
    if (progress >= 100) {
      return {
        status: 'completed',
        message: '¡Meta alcanzada!',
        color: 'green',
        priority: 'low'
      };
    }
    
    if (currentMonthly >= requiredMonthly * 0.95) {
      return {
        status: 'on_track',
        message: 'En línea',
        color: 'green',
        priority: 'low'
      };
    }
    
    if (currentMonthly >= requiredMonthly * 0.8) {
      return {
        status: 'close',
        message: 'Cerca del objetivo',
        color: 'yellow',
        priority: 'medium'
      };
    }
    
    const deficit = requiredMonthly - currentMonthly;
    return {
      status: 'behind',
      message: `Necesitas +€${Math.round(deficit)}/mes`,
      color: 'red',
      priority: 'high',
      deficit: Math.round(deficit * 100) / 100
    };
  }

  /**
   * Compare multiple scenarios
   * @param {Array} scenarios - Array of scenario parameters
   * @returns {Array} Comparison results
   */
  compareScenarios(scenarios) {
    return scenarios.map((scenario, index) => {
      const result = this.calculateFutureValue(scenario);
      return {
        scenarioIndex: index,
        scenarioName: scenario.name || `Escenario ${index + 1}`,
        ...result,
        ...scenario
      };
    });
  }

  /**
   * Calculate break-even point
   * @param {Object} params - Calculation parameters
   * @returns {Object} Break-even analysis
   */
  calculateBreakEven(params) {
    const {
      targetAmount,
      currentAmount = 0,
      returnRate,
      inflationRate = 0.02
    } = params;

    // Calculate break-even time for different monthly contributions
    const contributions = [100, 250, 500, 750, 1000, 1500, 2000];
    const breakEvenData = [];

    for (const monthlyContrib of contributions) {
      // Binary search to find the number of months needed
      let low = 1;
      let high = 600; // 50 years max
      let months = 0;

      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const years = mid / 12;
        const adjustedTarget = inflationAdjust(targetAmount, inflationRate, years);
        const projectedValue = futureValueAnnuity(monthlyContrib, returnRate, mid, currentAmount);

        if (projectedValue >= adjustedTarget) {
          months = mid;
          high = mid - 1;
        } else {
          low = mid + 1;
        }
      }

      if (months > 0 && months <= 600) {
        breakEvenData.push({
          monthlyContribution: monthlyContrib,
          months,
          years: Math.round((months / 12) * 10) / 10
        });
      }
    }

    return breakEvenData;
  }
}

module.exports = BasicCalculator;