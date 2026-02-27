/**
 * auth.setup.js — runs once before all other E2E tests.
 * Logs in as admin and saves the storageState (localStorage token)
 * so all other tests can reuse the session without logging in again.
 */
import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(import.meta.dirname, '.auth/admin.json');

setup('authenticate as admin', async ({ page }) => {
    await page.goto('/login');

    // Wait for the login form to appear
    await expect(page.getByTestId('login-username')).toBeVisible({ timeout: 10_000 });

    await page.getByTestId('login-username').fill('admin');
    await page.getByTestId('login-password').fill('admin123');
    await page.getByTestId('login-submit').click();

    // After successful login, should redirect to dashboard
    await expect(page).toHaveURL('/', { timeout: 15_000 });
    await expect(page.getByText('Panel de Control')).toBeVisible({ timeout: 10_000 });

    // Save the storage state (contains the JWT in localStorage)
    await page.context().storageState({ path: authFile });
});
