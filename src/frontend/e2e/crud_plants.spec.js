import { test, expect } from '@playwright/test';

test.describe('CRUD Plantas — autenticado como admin', () => {

    test('página de plantas carga correctamente', async ({ page }) => {
        await page.goto('/plants');
        await expect(page.getByRole('heading', { name: /plantas/i })).toBeVisible({ timeout: 10_000 });
        await page.waitForTimeout(1500);

        const emptyMsg = page.getByText(/no se encontraron/i);
        const firstCard = page.locator('.glass-card').nth(1); // first result card
        await expect(emptyMsg.or(firstCard)).toBeVisible({ timeout: 10_000 });
    });

    test('botón "Nueva Planta" visible para admin', async ({ page }) => {
        await page.goto('/plants');
        // The button may be inside a RoleGuard, wait for page to settle
        await page.waitForTimeout(1000);
        const btn = page.getByText('Nueva Planta');
        await expect(btn).toBeVisible({ timeout: 10_000 });
    });

    test('modal de planta se abre al hacer clic', async ({ page }) => {
        await page.goto('/plants');
        await page.waitForTimeout(1000);
        await page.getByText('Nueva Planta').click();
        await expect(page.getByText('Nueva Planta').last()).toBeVisible({ timeout: 5_000 });
        await expect(page.getByTestId('planta-nombre')).toBeVisible();
    });

    test('validación Zod inline en el modal de planta', async ({ page }) => {
        await page.goto('/plants');
        await page.waitForTimeout(1000);
        await page.getByText('Nueva Planta').click();
        await expect(page.getByTestId('planta-nombre')).toBeVisible({ timeout: 5_000 });

        // Clear nombre and submit
        await page.getByTestId('planta-nombre').fill('');
        await page.getByTestId('planta-submit').click();

        await expect(page.getByText(/obligatorio|requerido|mínimo/i)).toBeVisible({ timeout: 5_000 });
    });

});
