import { test, expect } from '@playwright/test';

test.describe('RBAC Enforcement — Operador', () => {

    test.use({ storageState: 'e2e/.auth/operator.json' });

    test('operador NO ve botón Nueva Planta', async ({ page }) => {
        await page.goto('/plants');
        await expect(page.getByTestId('btn-nueva-planta')).not.toBeVisible({ timeout: 10_000 });
    });

    test('operador NO ve botón Nuevo Equipo', async ({ page }) => {
        await page.goto('/equipments');
        await expect(page.getByTestId('btn-nuevo-equipo')).not.toBeVisible({ timeout: 10_000 });
    });

    test('operador NO ve botón Nueva Orden en manufactura', async ({ page }) => {
        await page.goto('/manufacturing');
        await expect(page.getByText('Nueva Orden')).not.toBeVisible({ timeout: 10_000 });
    });

    test('operador NO ve botones de eliminación en plantas', async ({ page }) => {
        await page.goto('/plants');
        await page.waitForTimeout(1000);
        const deleteBtn = page.locator('button:has(svg.lucide-trash2)');
        await expect(deleteBtn).not.toBeVisible();
    });

    test('operador NO ve botón Nuevo Polvo en inventario', async ({ page }) => {
        await page.goto('/inventory');
        await expect(page.getByTestId('btn-nuevo-polvo')).not.toBeVisible({ timeout: 10_000 });
    });

    test('operador NO ve botón Configuración en el Sidebar', async ({ page }) => {
        await page.goto('/');
        await expect(page.getByText('Configuración')).not.toBeVisible();
    });

    test('operador NO ve botón Audit Trail en el Sidebar', async ({ page }) => {
        await page.goto('/');
        await expect(page.getByText('Audit Trail')).not.toBeVisible();
    });

});
