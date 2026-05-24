module.exports = {
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.js"],
  collectCoverageFrom: [
    "controllers/paystackController.js",
    "routes/orderRoutes.js",
    "utils/emailTemplates.js",
    "utils/loyaltyHelper.js",
  ],
  coverageThreshold: {
    global: { branches: 80, functions: 80, lines: 80, statements: 80 },
  },
  setupFiles: ["<rootDir>/jest.setup.js"],
};
