import { test, expect } from '@playwright/test';

// These tests use the admin storageState set up in auth.setup.js

test.describe('CRUD Equipos — autenticado como admin', () => {

    test('tabla vacía muestra mensaje de tipo "No se encontraron equipos"', async ({ page }) => {
        await page.goto('/equipments');
        await expect(page.getByRole('heading', { name: /equipos/i })).toBeVisible({ timeout: 10_000 });

        // Wait for loading to finish (spinner disappears or results render)
        await page.waitForTimeout(1500);

        // Either the empty message or a card is visible
        const emptyMsg = page.getByText(/no se encontraron/i);
        const firstCard = page.locator('.bg-white.rounded-2xl.border').first();
        await expect(emptyMsg.or(firstCard)).toBeVisible({ timeout: 10_000 });
    });

    test('botón "Nuevo Equipo" es visible para el admin', async ({ page }) => {
        await page.goto('/equipments');
        await expect(page.getByTestId('btn-nuevo-equipo')).toBeVisible({ timeout: 10_000 });
    });

    test('modal se abre al hacer clic en "Nuevo Equipo"', async ({ page }) => {
        await page.goto('/equipments');
        await expect(page.getByTestId('btn-nuevo-equipo')).toBeVisible({ timeout: 10_000 });
        await page.getByTestId('btn-nuevo-equipo').click();

        // Modal title should appear
        await expect(page.getByText('Nuevo Equipo').last()).toBeVisible({ timeout: 5_000 });
        await expect(page.getByTestId('equipo-nombre')).toBeVisible();
    });

    test('validación Zod: submit sin nombre muestra error inline', async ({ page }) => {
        await page.goto('/equipments');
        await expect(page.getByTestId('btn-nuevo-equipo')).toBeVisible({ timeout: 10_000 });
        await page.getByTestId('btn-nuevo-equipo').click();

        // Modal is open — clear nombre and try to submit
        await expect(page.getByTestId('equipo-nombre')).toBeVisible({ timeout: 5_000 });
        await page.getByTestId('equipo-nombre').fill('');
        await page.getByTestId('equipo-submit').click();

        // Zod error message should appear (inline, in Spanish)
        await expect(page.locator('p', { hasText: /obligatorio|requerido|mínimo/i }).first()).toBeVisible({ timeout: 5_000 });
    });

});
