/**
 * Financial calculation utilities for the server
 */

/**
 * Calculate future value of an annuity with compound interest
 * @param {number} pmt - Monthly payment
 * @param {number} r - Annual interest rate (as decimal, e.g., 0.05 for 5%)
 * @param {number} n - Number of months
 * @param {number} pv - Present value (initial amount)
 * @returns {number} Future value
 */
function futureValueAnnuity(pmt, r, n, pv = 0) {
  if (r === 0) {
    return pv + pmt * n;
  }
  
  const monthlyRate = r / 12;
  const futureValuePV = pv * Math.pow(1 + monthlyRate, n);
  const futureValueAnnuity = pmt * ((Math.pow(1 + monthlyRate, n) - 1) / monthlyRate);
  
  return futureValuePV + futureValueAnnuity;
}

/**
 * Calculate required monthly payment to reach a future value
 * @param {number} fv - Future value target
 * @param {number} r - Annual interest rate (as decimal)
 * @param {number} n - Number of months
 * @param {number} pv - Present value (initial amount)
 * @returns {number} Required monthly payment
 */
function requiredPayment(fv, r, n, pv = 0) {
  if (r === 0) {
    return (fv - pv) / n;
  }
  
  const monthlyRate = r / 12;
  const adjustedFV = fv - (pv * Math.pow(1 + monthlyRate, n));
  
  return adjustedFV * monthlyRate / (Math.pow(1 + monthlyRate, n) - 1);
}

/**
 * Adjust value for inflation
 * @param {number} value - Nominal value
 * @param {number} inflationRate - Annual inflation rate (as decimal)
 * @param {number} years - Number of years
 * @returns {number} Inflation-adjusted value
 */
function inflationAdjust(value, inflationRate, years) {
  return value * Math.pow(1 + inflationRate, years);
}

/**
 * Calculate present value (reverse of inflation adjustment)
 * @param {number} futureValue - Future value
 * @param {number} inflationRate - Annual inflation rate (as decimal)
 * @param {number} years - Number of years
 * @returns {number} Present value
 */
function presentValue(futureValue, inflationRate, years) {
  return futureValue / Math.pow(1 + inflationRate, years);
}

/**
 * Calculate progress percentage
 * @param {number} currentValue - Current accumulated value
 * @param {number} targetValue - Target value
 * @returns {number} Progress percentage (0-100)
 */
function calculateProgress(currentValue, targetValue) {
  if (targetValue <= 0) return 0;
  return Math.min((currentValue / targetValue) * 100, 100);
}

/**
 * Calculate compound interest
 * @param {number} principal - Initial amount
 * @param {number} rate - Annual interest rate (as decimal)
 * @param {number} time - Time in years
 * @param {number} compoundFrequency - Compounding frequency per year (default: 12 for monthly)
 * @returns {number} Final amount after compound interest
 */
function compoundInterest(principal, rate, time, compoundFrequency = 12) {
  return principal * Math.pow(1 + rate / compoundFrequency, compoundFrequency * time);
}

/**
 * Calculate effective annual rate
 * @param {number} nominalRate - Nominal annual rate (as decimal)
 * @param {number} compoundFrequency - Compounding frequency per year
 * @returns {number} Effective annual rate
 */
function effectiveAnnualRate(nominalRate, compoundFrequency) {
  return Math.pow(1 + nominalRate / compoundFrequency, compoundFrequency) - 1;
}

/**
 * Generate projection data for a goal
 * @param {Object} goal - Goal object with target_amount, return_rate, inflation_rate, etc.
 * @param {number} currentValue - Current accumulated value
 * @param {number} monthsToProject - Number of months to project
 * @returns {Array} Array of projection data points
 */
function generateProjection(goal, currentValue, monthsToProject) {
  const projection = [];
  let projectedValue = currentValue;
  const monthlyRate = goal.return_rate / 12;
  
  for (let month = 1; month <= monthsToProject; month++) {
    // Apply monthly growth and add monthly contribution
    projectedValue = projectedValue * (1 + monthlyRate) + goal.monthly_contribution;
    
    // Calculate inflation-adjusted target for this month
    const targetAtMonth = inflationAdjust(
      goal.target_amount, 
      goal.inflation_rate, 
      month / 12
    );
    
    projection.push({
      month,
      value: Math.round(projectedValue * 100) / 100,
      target: Math.round(targetAtMonth * 100) / 100,
      progress: calculateProgress(projectedValue, targetAtMonth)
    });
  }
  
  return projection;
}

/**
 * Calculate years between two dates
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {number} Years difference
 */
function yearsBetween(startDate, endDate) {
  const diffTime = Math.abs(endDate - startDate);
  const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
  return diffYears;
}

/**
 * Calculate months between two dates
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {number} Months difference
 */
function monthsBetween(startDate, endDate) {
  const years = endDate.getFullYear() - startDate.getFullYear();
  const months = endDate.getMonth() - startDate.getMonth();
  return years * 12 + months;
}

/**
 * Validate financial inputs
 * @param {Object} inputs - Object containing financial inputs
 * @returns {Object} Validation result with isValid and errors
 */
function validateFinancialInputs(inputs) {
  const errors = [];
  
  if (inputs.targetAmount && inputs.targetAmount <= 0) {
    errors.push('Target amount must be greater than 0');
  }
  
  if (inputs.monthlyContribution && inputs.monthlyContribution < 0) {
    errors.push('Monthly contribution cannot be negative');
  }
  
  if (inputs.returnRate && (inputs.returnRate < 0 || inputs.returnRate > 0.3)) {
    errors.push('Return rate must be between 0% and 30%');
  }
  
  if (inputs.inflationRate && (inputs.inflationRate < 0 || inputs.inflationRate > 0.2)) {
    errors.push('Inflation rate must be between 0% and 20%');
  }
  
  if (inputs.years && inputs.years <= 0) {
    errors.push('Time period must be greater than 0');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  futureValueAnnuity,
  requiredPayment,
  inflationAdjust,
  presentValue,
  calculateProgress,
  compoundInterest,
  effectiveAnnualRate,
  generateProjection,
  yearsBetween,
  monthsBetween,
  validateFinancialInputs
};