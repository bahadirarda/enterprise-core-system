const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true, // Enable parallel execution for maximum speed
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1, // Allow retries for flaky tests
  workers: process.env.CI ? '100%' : '50%', // Use all available cores in CI, 50% locally
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],
  timeout: 45000, // 45 seconds per test for complex scenarios
  expect: {
    timeout: 15000, // 15 seconds for assertions
  },
  use: {
    baseURL: 'http://localhost',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15000, // 15 seconds for actions
    navigationTimeout: 30000, // 30 seconds for navigation
    // Performance optimizations
    ignoreHTTPSErrors: true,
    launchOptions: {
      args: [
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding'
      ]
    }
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  webServer: [
    {
      command: 'cd apps/auth && npm run dev',
      port: 4000,
      reuseExistingServer: true,
    },
    {
      command: 'cd apps/portal && npm run dev',
      port: 4001,
      reuseExistingServer: true,
    },
    {
      command: 'cd apps/hrms && npm run dev',
      port: 4002,
      reuseExistingServer: true,
    },
    {
      command: 'cd apps/admin && npm run dev',
      port: 4003,
      reuseExistingServer: true,
    },
    {
      command: 'cd apps/status && npm run dev',
      port: 4004,
      reuseExistingServer: true,
    },
  ],
}); 