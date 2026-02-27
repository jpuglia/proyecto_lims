import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './e2e',
    fullyParallel: false,   // sequential to avoid JWT collisions in SQLite
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    workers: 1,
    reporter: [['html', { open: 'never' }], ['list']],

    use: {
        baseURL: 'http://localhost:5173',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'on-first-retry',
    },

    projects: [
        // Auth setup — runs first, saves storageState
        {
            name: 'setup',
            testMatch: /auth\.setup\.js/,
        },
        // All other tests — run after setup, reuse auth state
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                storageState: 'e2e/.auth/admin.json',
            },
            dependencies: ['setup'],
            testIgnore: /auth\.setup\.js/,
        },
    ],
});
