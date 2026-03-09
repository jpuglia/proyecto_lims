import { test, expect } from '@playwright/test';

test.describe('RBAC Inspector — Restricciones de Visibilidad', () => {

    test.use({ storageState: 'e2e/.auth/inspector.json' });

    test('inspector VE Dashboard, Muestreos e Histórico en el Sidebar', async ({ page }) => {
        await page.goto('/');
        await expect(page.getByTestId('nav-dashboard')).toBeVisible();
        await expect(page.getByTestId('nav-sampling')).toBeVisible();
        await expect(page.getByTestId('nav-history')).toBeVisible();
    });

    test('inspector NO VE módulos restringidos (Equipos, Plantas, Inventario, Manufactura)', async ({ page }) => {
        await page.goto('/');
        await expect(page.getByTestId('nav-equipments')).not.toBeVisible();
        await expect(page.getByTestId('nav-plants')).not.toBeVisible();
        await expect(page.getByTestId('nav-inventory')).not.toBeVisible();
        await expect(page.getByTestId('nav-manufacturing')).not.toBeVisible();
        await expect(page.getByTestId('nav-analysis')).not.toBeVisible();
    });

    test('inspector NO VE sección de Ajustes', async ({ page }) => {
        await page.goto('/');
        await expect(page.getByTestId('nav-settings')).not.toBeVisible();
    });

    test('intento de navegación forzada a /plants redirige o muestra error', async ({ page }) => {
        await page.goto('/plants');
        // El ProtectedRoute debe mostrar "Acceso Denegado"
        await expect(page.getByText('Acceso Denegado')).toBeVisible();
    });
});
