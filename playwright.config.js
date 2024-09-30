// @ts-nocheck
const { defineConfig, devices } = require('@playwright/test');
const dotenv = require('dotenv');
const path = require('path');

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, 'backend', '.env') });

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  webServer: [
    {
      command: 'cd ./gambler && npm run dev',
      port: 5173,
      timeout: 120 * 1000,
      reuseExistingServer: !process.env.CI,
    
    },
    {
      command: 'cd ./backend && npm run test:e2e',
      port: 3001,
      timeout: 120 * 1000,
      reuseExistingServer: !process.env.CI,
      env: {
        TEST_MONGODB_URI: process.env.TEST_MONGODB_URI,
        SECRET: process.env.SECRET,
      },
    }
  ],
  
  testDir: './e2e',
  timeout: 30000,
  fullyParallel: false,

  forbidOnly: !!process.env.CI,

  retries: process.env.CI ? 2 : 0,

  workers: 1,

  reporter: 'html',

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

  ],


});

