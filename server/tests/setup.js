const { initializeDatabase, closeDatabase } = require('../models/db');

// Global test setup
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-for-testing-only';
  process.env.DB_FILENAME = ':memory:'; // Use in-memory SQLite for tests
  
  // Initialize test database
  try {
    await initializeDatabase();
    console.log('✅ Test database initialized');
  } catch (error) {
    console.error('❌ Failed to initialize test database:', error);
    throw error;
  }
});

// Global test teardown
afterAll(async () => {
  try {
    await closeDatabase();
    console.log('✅ Test database closed');
  } catch (error) {
    console.error('❌ Failed to close test database:', error);
  }
});

// Increase timeout for database operations
jest.setTimeout(30000);

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to suppress logs during tests
  // log: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  error: console.error, // Keep errors visible
};

// Global test utilities
global.testUtils = {
  // Helper to create test user data
  createTestUser: (overrides = {}) => ({
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    ...overrides
  }),

  // Helper to create test goal data
  createTestGoal: (overrides = {}) => ({
    name: 'Test Goal',
    type: 'casa',
    target_amount: 50000,
    target_years: 5,
    monthly_contribution: 500,
    inflation_rate: 0.02,
    return_rate: 0.05,
    ...overrides
  }),

  // Helper to create test contribution data
  createTestContribution: (overrides = {}) => ({
    amount: 250,
    contribution_date: new Date().toISOString().split('T')[0],
    type: 'monthly',
    notes: 'Test contribution',
    ...overrides
  }),

  // Helper to wait for async operations
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  // Helper to generate random email
  randomEmail: () => `test${Math.random().toString(36).substr(2, 9)}@example.com`,

  // Helper to generate UUID-like string for testing
  generateId: () => `test-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`,
};

// Custom matchers
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },

  toBeValidCurrency(received) {
    const pass = typeof received === 'number' && received >= 0 && Number.isFinite(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid currency amount`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid currency amount (positive finite number)`,
        pass: false,
      };
    }
  },

  toBeValidPercentage(received) {
    const pass = typeof received === 'number' && received >= 0 && received <= 100;
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid percentage`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid percentage (0-100)`,
        pass: false,
      };
    }
  }
});

// Handle unhandled promise rejections in tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit in tests, just log the error
});

// Clean up any test artifacts
afterEach(() => {
  // Clear any mocks
  jest.clearAllMocks();
});