import { test, expect } from '@playwright/test';

test.describe('RBAC Enforcement — Operador', () => {

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
        // Wait for some data to load if any
        await page.waitForTimeout(1000);
        const deleteBtn = page.locator('button:has(svg.lucide-trash2)');
        await expect(deleteBtn).not.toBeVisible();
    });

    test('operador NO ve botones de eliminación en equipos', async ({ page }) => {
        await page.goto('/equipments');
        await page.waitForTimeout(1000);
        const deleteBtn = page.locator('button:has(svg.lucide-trash2)');
        await expect(deleteBtn).not.toBeVisible();
    });

    test('operador NO ve botones de eliminación en análisis', async ({ page }) => {
        await page.goto('/analysis');
        await page.waitForTimeout(1000);
        const deleteBtn = page.locator('button:has(svg.lucide-trash-2)'); // Note the hyphen in lucide-trash-2 for some pages
        await expect(deleteBtn).not.toBeVisible();
    });

});
