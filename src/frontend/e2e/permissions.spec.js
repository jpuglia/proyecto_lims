import { test, expect } from '@playwright/test';

test.describe('Permisos y control de acceso', () => {

    test('admin ve el botón "Nuevo Equipo" (RoleGuard activo)', async ({ page }) => {
        await page.goto('/equipments');
        await page.waitForTimeout(1000);
        // Admin should see the create button (RoleGuard allows administrador)
        await expect(page.getByTestId('btn-nuevo-equipo')).toBeVisible({ timeout: 10_000 });
    });

    test('admin ve el botón "Nueva Planta"', async ({ page }) => {
        await page.goto('/plants');
        await page.waitForTimeout(1000);
        await expect(page.getByText('Nueva Planta')).toBeVisible({ timeout: 10_000 });
    });

    test('admin ve el botón "Nueva Orden" en manufactura', async ({ page }) => {
        await page.goto('/manufacturing');
        await page.waitForTimeout(1000);
        await expect(page.getByText('Nueva Orden')).toBeVisible({ timeout: 10_000 });
    });

    test('sin sesión, /equipments redirige a /login', async ({ browser }) => {
        // Fresh context with NO stored auth state
        const ctx = await browser.newContext();
        const page = await ctx.newPage();
        await page.goto('/equipments');
        await expect(page).toHaveURL(/.*login/, { timeout: 10_000 });
        await ctx.close();
    });

    test('sin sesión, /manufacturing redirige a /login', async ({ browser }) => {
        const ctx = await browser.newContext();
        const page = await ctx.newPage();
        await page.goto('/manufacturing');
        await expect(page).toHaveURL(/.*login/, { timeout: 10_000 });
        await ctx.close();
    });

});
