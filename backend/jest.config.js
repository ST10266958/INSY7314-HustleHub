module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  setupFiles: ['<rootDir>/tests/setupEnv.js'],
  collectCoverageFrom: ['src/**/*.js', '!src/server.js', '!src/config/db.js', '!src/config/httpsConfig.js'],
  coverageReporters: ['text', 'text-summary', 'lcov'],
  coverageThreshold: { global: { statements: 70, branches: 55, functions: 70, lines: 70 } },
};
