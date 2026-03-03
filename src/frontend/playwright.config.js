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
        // Tests that REQUIRE being logged in as admin
        {
            name: 'chromium-authenticated',
            use: {
                ...devices['Desktop Chrome'],
                storageState: 'e2e/.auth/admin.json',
            },
            dependencies: ['setup'],
            testMatch: [
                /crud_.*\.spec\.js/,
                /navigation\.spec\.js/,
                /permissions\.spec\.js/,
                /form_validation\.spec\.js/,
                /manufacturing_workflow\.spec\.js/,
                /workflow_10steps\.spec\.js/
            ],
        },
        // Tests that REQUIRE being logged in as operator
        {
            name: 'chromium-operator',
            use: {
                ...devices['Desktop Chrome'],
                storageState: 'e2e/.auth/operator.json',
            },
            dependencies: ['setup'],
            testMatch: [/rbac_enforcement\.spec\.js/],
        },
        // Tests that REQUIRE being logged out (Login page, redirections)
        {
            name: 'chromium-unauthenticated',
            use: {
                ...devices['Desktop Chrome'],
                storageState: { cookies: [], origins: [] }, // Force empty state
            },
            testMatch: [/login\.spec\.js/],
        },
    ],
});
