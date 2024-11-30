module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.ts"], // Look for test files in __tests__ directory
  moduleNameMapper: {
    "analytics.config.ts": "<rootDir>/src/defaults/analytics.config.ts", // Mock the user config for tests
  },
};
