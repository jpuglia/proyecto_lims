import { test as setup, expect } from '@playwright/test';
import path from 'path';

const adminFile = path.join(import.meta.dirname, '.auth/admin.json');
const operatorFile = path.join(import.meta.dirname, '.auth/operator.json');

setup('authenticate as admin', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByTestId('login-username')).toBeVisible({ timeout: 20_000 });
    await page.getByTestId('login-username').fill('admin');
    await page.getByTestId('login-password').fill('admin123');
    await page.getByTestId('login-submit').click();
    
    // Wait for the token to be stored in localStorage
    await page.waitForFunction(() => localStorage.getItem('token') !== null, { timeout: 15_000 });
    
    await expect(page).toHaveURL('/', { timeout: 30_000 });
    await page.context().storageState({ path: adminFile });
});

setup('authenticate as operator', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByTestId('login-username')).toBeVisible({ timeout: 20_000 });
    await page.getByTestId('login-username').fill('operador');
    await page.getByTestId('login-password').fill('operador123');
    await page.getByTestId('login-submit').click();

    // Wait for the token to be stored in localStorage
    await page.waitForFunction(() => localStorage.getItem('token') !== null, { timeout: 15_000 });

    await expect(page).toHaveURL('/', { timeout: 30_000 });
    await page.context().storageState({ path: operatorFile });
});
