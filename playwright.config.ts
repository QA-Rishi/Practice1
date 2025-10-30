import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
dotenv.config();
/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ["line"],
    [
      "allure-playwright",
      {
        resultsDir: "allure-results",
        detail: true,
        outputFolder: "allure-report",
      },
    ],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */

    baseURL: process.env.API_BASE_URL || "https://reqres.in/api",
    extraHTTPHeaders: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-API-KEY": process.env.REQRES_API_KEY ?? "reqres-free-v1",
    },
    ignoreHTTPSErrors: true,
    trace: "retain-on-failure",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "api-smoke-tests",
      testMatch: "**/api/**/*smoke*.spec.ts",
    },
    {
      name: "api-regression-tests",
      testMatch: "**/api/**/*.spec.ts",
    },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
