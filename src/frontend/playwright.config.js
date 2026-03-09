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
        viewport: { width: 1920, height: 1080 },
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
                viewport: { width: 1920, height: 1080 },
            },
            dependencies: ['setup'],
            testMatch: [
                /crud_.*\.spec\.js/,
                /navigation\.spec\.js/,
                /permissions\.spec\.js/,
                /form_validation\.spec\.js/,
                /manufacturing_workflow\.spec\.js/,
                /workflow_10steps\.spec\.js/,
                /workflow_roles\.spec\.js/,
                /analysis.*\.spec\.js/
            ],
        },
        // Tests that REQUIRE being logged in as operator
        {
            name: 'chromium-operator',
            use: {
                ...devices['Desktop Chrome'],
                storageState: 'e2e/.auth/operator.json',
                viewport: { width: 1920, height: 1080 },
            },
            dependencies: ['setup'],
            testMatch: [/rbac_enforcement\.spec\.js/],
        },
        // Tests that REQUIRE being logged in as inspector
        {
            name: 'chromium-inspector',
            use: {
                ...devices['Desktop Chrome'],
                storageState: 'e2e/.auth/inspector.json',
                viewport: { width: 1920, height: 1080 },
            },
            dependencies: ['setup'],
            testMatch: [/inspector_.*\.spec\.js/],
        },
        // Tests that REQUIRE being logged out (Login page, redirections)
        {
            name: 'chromium-unauthenticated',
            use: {
                ...devices['Desktop Chrome'],
                storageState: { cookies: [], origins: [] }, // Force empty state
                viewport: { width: 1920, height: 1080 },
            },
            testMatch: [/login\.spec\.js/],
        },
    ],
});
