import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Test-only env (points at the ilya_e2e database). Loaded here so both the
// web server below and the tests (which sign session cookies) can read it.
dotenv.config({ path: '.env.test.local' });

const PORT = 3001;
const BASE_URL = `http://localhost:${PORT}`;

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',
  // Resets the e2e database before every run.
  globalSetup: './e2e/global-setup.ts',
  // All tests change the same seeded gift, so they must run one after another.
  fullyParallel: false,
  workers: 1,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL: BASE_URL,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: `npm run dev -- --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    // The first dev compile with Payload can be slow.
    timeout: 180_000,
    // Real env vars win over .env files in Next, so the server uses the e2e
    // database even though .env.development.local points at the dev one.
    env: {
      DATABASE_URI: process.env.DATABASE_URI!,
      PAYLOAD_SECRET: process.env.PAYLOAD_SECRET!,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET!,
      NEXTAUTH_URL: BASE_URL,
    },
  },
});
