import { test, expect } from '@playwright/test';

test.describe('Login — flujos de autenticación', () => {

    test('redirige a /login cuando no hay token', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveURL(/.*login/, { timeout: 10_000 });
        await expect(page.getByTestId('login-username')).toBeVisible();
    });

    test('sin sesión, /equipments redirige a /login', async ({ page }) => {
        await page.goto('/equipments');
        await expect(page).toHaveURL(/.*login/, { timeout: 10_000 });
    });

    test('sin sesión, /manufacturing redirige a /login', async ({ page }) => {
        await page.goto('/manufacturing');
        await expect(page).toHaveURL(/.*login/, { timeout: 10_000 });
    });

    test('muestra error con credenciales incorrectas', async ({ page }) => {
        await page.goto('/login');
        await expect(page.getByTestId('login-username')).toBeVisible({ timeout: 10_000 });

        await page.getByTestId('login-username').fill('usuario_inexistente');
        await page.getByTestId('login-password').fill('clave_incorrecta');
        await page.getByTestId('login-submit').click();

        // Give it a moment for the async request and state update
        await page.waitForTimeout(500);

        // Error message should appear
        await expect(page.getByTestId('login-error')).toBeVisible({ timeout: 10_000 });
        await expect(page).toHaveURL(/.*login/);
    });

    test('login exitoso redirige al dashboard', async ({ page }) => {
        await page.goto('/login');
        await page.getByTestId('login-username').fill('admin');
        await page.getByTestId('login-password').fill('admin123');
        await page.getByTestId('login-submit').click();

        await expect(page).toHaveURL('/', { timeout: 15_000 });
        await expect(page.getByText('Panel de Control')).toBeVisible({ timeout: 10_000 });
    });

});
