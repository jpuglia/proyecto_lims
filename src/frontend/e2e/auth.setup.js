import { test as setup, expect } from '@playwright/test';
import path from 'path';

const adminFile = path.join(import.meta.dirname, '.auth/admin.json');
const operatorFile = path.join(import.meta.dirname, '.auth/operator.json');
const inspectorFile = path.join(import.meta.dirname, '.auth/inspector.json');
const analistaFile = path.join(import.meta.dirname, '.auth/analista.json');
const supervisorFile = path.join(import.meta.dirname, '.auth/supervisor.json');

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

setup('authenticate as inspector', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByTestId('login-username')).toBeVisible({ timeout: 20_000 });
    await page.getByTestId('login-username').fill('inspector');
    await page.getByTestId('login-password').fill('inspector123');
    await page.getByTestId('login-submit').click();
    await page.waitForFunction(() => localStorage.getItem('token') !== null, { timeout: 15_000 });
    await expect(page).toHaveURL('/', { timeout: 30_000 });
    await page.context().storageState({ path: inspectorFile });
});

setup('authenticate as analista', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByTestId('login-username')).toBeVisible({ timeout: 20_000 });
    await page.getByTestId('login-username').fill('analista');
    await page.getByTestId('login-password').fill('analista123');
    await page.getByTestId('login-submit').click();
    await page.waitForFunction(() => localStorage.getItem('token') !== null, { timeout: 15_000 });
    await expect(page).toHaveURL('/', { timeout: 30_000 });
    await page.context().storageState({ path: analistaFile });
});

setup('authenticate as supervisor', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByTestId('login-username')).toBeVisible({ timeout: 20_000 });
    await page.getByTestId('login-username').fill('supervisor');
    await page.getByTestId('login-password').fill('supervisor123');
    await page.getByTestId('login-submit').click();
    await page.waitForFunction(() => localStorage.getItem('token') !== null, { timeout: 15_000 });
    await expect(page).toHaveURL('/', { timeout: 30_000 });
    await page.context().storageState({ path: supervisorFile });
});
