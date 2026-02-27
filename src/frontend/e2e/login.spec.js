import { test, expect } from '@playwright/test';

// ─── Tests SIN autenticación (no usan storageState del admin) ────────────────

test.describe('Login — flujos de autenticación', () => {

    test('redirige a /login cuando no hay token', async ({ page }) => {
        // Clear any stored auth state for this test
        await page.context().clearCookies();
        await page.goto('/');
        // Should be redirected to login
        await expect(page).toHaveURL(/.*login/, { timeout: 10_000 });
        await expect(page.getByTestId('login-username')).toBeVisible();
    });

    test('muestra error con credenciales incorrectas', async ({ page }) => {
        await page.goto('/login');
        await expect(page.getByTestId('login-username')).toBeVisible({ timeout: 10_000 });

        await page.getByTestId('login-username').fill('usuario_inexistente');
        await page.getByTestId('login-password').fill('clave_incorrecta');
        await page.getByTestId('login-submit').click();

        // Error message should appear
        await expect(page.getByTestId('login-error')).toBeVisible({ timeout: 10_000 });
        // Still on login page
        await expect(page).toHaveURL(/.*login/);
    });

    test('login exitoso redirige al dashboard', async ({ page }) => {
        await page.goto('/login');
        await expect(page.getByTestId('login-username')).toBeVisible({ timeout: 10_000 });

        await page.getByTestId('login-username').fill('admin');
        await page.getByTestId('login-password').fill('admin123');
        await page.getByTestId('login-submit').click();

        await expect(page).toHaveURL('/', { timeout: 15_000 });
        await expect(page.getByText('Panel de Control')).toBeVisible({ timeout: 10_000 });
    });

    test('cerrar sesión redirige a /login', async ({ page }) => {
        // Login first
        await page.goto('/login');
        await expect(page.getByTestId('login-username')).toBeVisible({ timeout: 10_000 });
        await page.getByTestId('login-username').fill('admin');
        await page.getByTestId('login-password').fill('admin123');
        await page.getByTestId('login-submit').click();
        await expect(page).toHaveURL('/', { timeout: 15_000 });

        // Logout
        await page.getByTestId('btn-logout').click();
        await expect(page).toHaveURL(/.*login/, { timeout: 10_000 });
        await expect(page.getByTestId('login-username')).toBeVisible();
    });

});
