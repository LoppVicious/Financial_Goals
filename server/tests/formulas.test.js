const {
  futureValueAnnuity,
  requiredPayment,
  inflationAdjust,
  calculateProgress,
  validateFinancialInputs
} = require('../utils/formulas');

describe('Financial Formulas', () => {
  describe('futureValueAnnuity', () => {
    test('should calculate future value with 0% interest rate', () => {
      const result = futureValueAnnuity(100, 0, 12, 0);
      expect(result).toBe(1200);
    });

    test('should calculate future value with interest', () => {
      const result = futureValueAnnuity(100, 0.05, 12, 0);
      expect(result).toBeCloseTo(1283.36, 2);
    });

    test('should include present value in calculation', () => {
      const result = futureValueAnnuity(100, 0.05, 12, 1000);
      expect(result).toBeCloseTo(2334.73, 2);
    });

    test('should handle edge case of very small payments', () => {
      const result = futureValueAnnuity(0.01, 0.05, 12, 0);
      expect(result).toBeCloseTo(0.1283, 4);
    });
  });

  describe('requiredPayment', () => {
    test('should calculate required payment with 0% interest rate', () => {
      const result = requiredPayment(12000, 0, 12, 0);
      expect(result).toBe(1000);
    });

    test('should calculate required payment with interest', () => {
      const result = requiredPayment(12000, 0.05, 12, 0);
      expect(result).toBeCloseTo(934.26, 2);
    });

    test('should account for present value', () => {
      const result = requiredPayment(12000, 0.05, 12, 1000);
      expect(result).toBeCloseTo(855.32, 2);
    });

    test('should return 0 for already achieved goal', () => {
      const result = requiredPayment(1000, 0.05, 12, 1200);
      expect(result).toBeLessThan(0);
    });
  });

  describe('inflationAdjust', () => {
    test('should adjust value for inflation', () => {
      const result = inflationAdjust(10000, 0.02, 5);
      expect(result).toBeCloseTo(11040.81, 2);
    });

    test('should return same value with 0% inflation', () => {
      const result = inflationAdjust(10000, 0, 5);
      expect(result).toBe(10000);
    });

    test('should handle high inflation rates', () => {
      const result = inflationAdjust(10000, 0.1, 10);
      expect(result).toBeCloseTo(25937.42, 2);
    });

    test('should handle fractional years', () => {
      const result = inflationAdjust(10000, 0.02, 2.5);
      expect(result).toBeCloseTo(10510.10, 2);
    });
  });

  describe('calculateProgress', () => {
    test('should calculate progress percentage', () => {
      const result = calculateProgress(5000, 10000);
      expect(result).toBe(50);
    });

    test('should cap progress at 100%', () => {
      const result = calculateProgress(15000, 10000);
      expect(result).toBe(100);
    });

    test('should return 0 for zero target', () => {
      const result = calculateProgress(5000, 0);
      expect(result).toBe(0);
    });

    test('should handle zero current value', () => {
      const result = calculateProgress(0, 10000);
      expect(result).toBe(0);
    });

    test('should handle negative target (edge case)', () => {
      const result = calculateProgress(5000, -1000);
      expect(result).toBe(0);
    });
  });

  describe('validateFinancialInputs', () => {
    test('should validate correct inputs', () => {
      const inputs = {
        targetAmount: 10000,
        monthlyContribution: 500,
        returnRate: 0.05,
        inflationRate: 0.02,
        years: 5
      };
      
      const result = validateFinancialInputs(inputs);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject negative target amount', () => {
      const inputs = { targetAmount: -1000 };
      const result = validateFinancialInputs(inputs);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Target amount must be greater than 0');
    });

    test('should reject negative monthly contribution', () => {
      const inputs = { monthlyContribution: -100 };
      const result = validateFinancialInputs(inputs);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Monthly contribution cannot be negative');
    });

    test('should reject unrealistic return rates', () => {
      const inputs = { returnRate: 0.5 };
      const result = validateFinancialInputs(inputs);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Return rate must be between 0% and 30%');
    });

    test('should reject unrealistic inflation rates', () => {
      const inputs = { inflationRate: 0.3 };
      const result = validateFinancialInputs(inputs);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Inflation rate must be between 0% and 20%');
    });

    test('should reject zero or negative years', () => {
      const inputs = { years: 0 };
      const result = validateFinancialInputs(inputs);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Time period must be greater than 0');
    });

    test('should collect multiple errors', () => {
      const inputs = {
        targetAmount: -1000,
        monthlyContribution: -100,
        returnRate: 0.5,
        years: -1
      };
      
      const result = validateFinancialInputs(inputs);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('Integration tests', () => {
    test('required payment should achieve target when used in future value calculation', () => {
      const targetAmount = 50000;
      const returnRate = 0.06;
      const years = 10;
      const months = years * 12;
      
      // Calculate required payment
      const payment = requiredPayment(targetAmount, returnRate, months, 0);
      
      // Use that payment to calculate future value
      const achievedAmount = futureValueAnnuity(payment, returnRate, months, 0);
      
      // Should be very close to target (within rounding error)
      expect(achievedAmount).toBeCloseTo(targetAmount, 0);
    });

    test('inflation adjustment should work with future value calculations', () => {
      const nominalTarget = 10000;
      const inflationRate = 0.03;
      const years = 5;
      
      // Adjust target for inflation
      const realTarget = inflationAdjust(nominalTarget, inflationRate, years);
      
      // Calculate required payment for real target
      const payment = requiredPayment(realTarget, 0.05, years * 12, 0);
      
      // Verify the payment is higher than for nominal target
      const nominalPayment = requiredPayment(nominalTarget, 0.05, years * 12, 0);
      expect(payment).toBeGreaterThan(nominalPayment);
    });

    test('progress calculation should work with projected values', () => {
      const targetAmount = 20000;
      const currentAmount = 5000;
      const monthlyContribution = 500;
      const returnRate = 0.04;
      const months = 24;
      
      // Calculate future value
      const projectedAmount = futureValueAnnuity(monthlyContribution, returnRate, months, currentAmount);
      
      // Calculate progress
      const progress = calculateProgress(projectedAmount, targetAmount);
      
      expect(progress).toBeGreaterThan(0);
      expect(progress).toBeLessThanOrEqual(100);
    });
  });

  describe('Edge cases and error handling', () => {
    test('should handle very large numbers', () => {
      const result = futureValueAnnuity(10000, 0.05, 360, 100000); // 30 years
      expect(result).toBeGreaterThan(0);
      expect(isFinite(result)).toBe(true);
    });

    test('should handle very small numbers', () => {
      const result = futureValueAnnuity(0.01, 0.001, 12, 0.01);
      expect(result).toBeGreaterThan(0);
      expect(isFinite(result)).toBe(true);
    });

    test('should handle zero interest rate edge cases', () => {
      expect(futureValueAnnuity(0, 0, 12, 1000)).toBe(1000);
      expect(requiredPayment(1000, 0, 12, 0)).toBeCloseTo(83.33, 2);
    });

    test('should handle maximum reasonable values', () => {
      const maxTarget = 10000000; // 10 million
      const maxRate = 0.3; // 30%
      const maxYears = 50;
      
      const payment = requiredPayment(maxTarget, maxRate, maxYears * 12, 0);
      expect(payment).toBeGreaterThan(0);
      expect(isFinite(payment)).toBe(true);
    });
  });
});