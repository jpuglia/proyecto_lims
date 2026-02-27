import { test, expect } from '@playwright/test';

// Estos tests usan el storageState del admin (definido en playwright.config.js)

test.describe('Navegación por el sidebar — autenticado como admin', () => {

    test('Dashboard muestra Panel de Control y KPI cards', async ({ page }) => {
        await page.goto('/');
        await expect(page.getByText('Panel de Control')).toBeVisible({ timeout: 10_000 });
        await expect(page.getByText('Equipos Activos')).toBeVisible();
        await expect(page.getByText('Análisis Pendientes')).toBeVisible();
        await expect(page.getByText('Muestras Hoy')).toBeVisible();
    });

    test('navegar a Equipos desde el sidebar', async ({ page }) => {
        await page.goto('/');
        await expect(page.getByTestId('nav-equipments')).toBeVisible({ timeout: 10_000 });
        await page.getByTestId('nav-equipments').click();
        await expect(page).toHaveURL('/equipments', { timeout: 10_000 });
        await expect(page.getByRole('heading', { name: /equipos/i })).toBeVisible({ timeout: 10_000 });
    });

    test('navegar a Plantas desde el sidebar', async ({ page }) => {
        await page.goto('/');
        await expect(page.getByTestId('nav-plants')).toBeVisible({ timeout: 10_000 });
        await page.getByTestId('nav-plants').click();
        await expect(page).toHaveURL('/plants', { timeout: 10_000 });
        await expect(page.getByRole('heading', { name: /plantas/i })).toBeVisible({ timeout: 10_000 });
    });

    test('navegar a Muestras desde el sidebar', async ({ page }) => {
        await page.goto('/');
        await expect(page.getByTestId('nav-samples')).toBeVisible({ timeout: 10_000 });
        await page.getByTestId('nav-samples').click();
        await expect(page).toHaveURL('/samples', { timeout: 10_000 });
        await expect(page.getByRole('heading', { name: /muestreo|solicitudes/i })).toBeVisible({ timeout: 10_000 });
    });

    test('navegar a Manufactura desde el sidebar', async ({ page }) => {
        await page.goto('/');
        await expect(page.getByTestId('nav-manufacturing')).toBeVisible({ timeout: 10_000 });
        await page.getByTestId('nav-manufacturing').click();
        await expect(page).toHaveURL('/manufacturing', { timeout: 10_000 });
        await expect(page.getByRole('heading', { name: /manufactura/i })).toBeVisible({ timeout: 10_000 });
    });

});
