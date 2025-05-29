const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  timeout: 30000, // 30 seconds per test
  expect: {
    timeout: 10000, // 10 seconds for assertions
  },
  use: {
    baseURL: 'http://localhost',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000, // 10 seconds for actions
    navigationTimeout: 15000, // 15 seconds for navigation
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