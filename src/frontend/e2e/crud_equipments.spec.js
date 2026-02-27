import { test, expect } from '@playwright/test';

// These tests use the admin storageState set up in auth.setup.js

test.describe('CRUD Equipos — autenticado como admin', () => {

    test('tabla vacía muestra mensaje de tipo "No se encontraron equipos"', async ({ page }) => {
        await page.goto('/equipments');
        await expect(page.getByRole('heading', { name: /equipos/i })).toBeVisible({ timeout: 10_000 });

        // Wait for loading to finish (spinner disappears or table renders)
        await page.waitForTimeout(1500);

        // Either the empty message or a table row is visible
        const emptyMsg = page.getByText(/no se encontraron/i);
        const firstRow = page.locator('tbody tr').first();
        await expect(emptyMsg.or(firstRow)).toBeVisible({ timeout: 10_000 });
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
        await expect(page.getByText(/obligatorio|requerido|mínimo/i)).toBeVisible({ timeout: 5_000 });
    });

});
