module.exports = {
  testEnvironment: 'node',
  
  setupFiles: ['<rootDir>/jest.setup.js'],
  
  testMatch: ['**/__tests__/**/*.test.js'],
  
  testTimeout: 30000,
  maxWorkers: 1
};
