/**
 * Financial calculation utilities
 */

/**
 * Calculate future value of an annuity with compound interest
 * @param {number} pmt - Monthly payment
 * @param {number} r - Annual interest rate (as decimal, e.g., 0.05 for 5%)
 * @param {number} n - Number of months
 * @param {number} pv - Present value (initial amount)
 * @returns {number} Future value
 */
export function futureValueAnnuity(pmt, r, n, pv = 0) {
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
export function requiredPayment(fv, r, n, pv = 0) {
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
export function inflationAdjust(value, inflationRate, years) {
  return value * Math.pow(1 + inflationRate, years);
}

/**
 * Calculate progress percentage
 * @param {number} currentValue - Current accumulated value
 * @param {number} targetValue - Target value (inflation-adjusted)
 * @returns {number} Progress percentage (0-100)
 */
export function calculateProgress(currentValue, targetValue) {
  if (targetValue <= 0) return 0;
  return Math.min((currentValue / targetValue) * 100, 100);
}

/**
 * Format currency for display
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: EUR)
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency = 'EUR') {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Calculate years between two dates
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {number} Years difference
 */
export function yearsBetween(startDate, endDate) {
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
export function monthsBetween(startDate, endDate) {
  const years = endDate.getFullYear() - startDate.getFullYear();
  const months = endDate.getMonth() - startDate.getMonth();
  return years * 12 + months;
}