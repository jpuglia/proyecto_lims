import { test, expect } from '@playwright/test';

test.describe('Permisos y control de acceso — Autenticado', () => {

    test('admin ve el botón "Nuevo Equipo" (RoleGuard activo)', async ({ page }) => {
        await page.goto('/equipments');
        await page.waitForTimeout(1000);
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

});
