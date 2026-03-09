import { test, expect } from '@playwright/test';

test.describe('Inventory Module — Gestión de Inventario', () => {

    test.use({ storageState: 'e2e/.auth/admin.json' });

    test('debe listar polvos y medios preparados', async ({ page }) => {
        await page.goto('/inventory');
        await expect(page.getByText('Inventario de Materiales')).toBeVisible({ timeout: 15000 });
        
        // Verificar pestañas
        await expect(page.locator('#tab-polvos')).toBeVisible();
        await expect(page.locator('#tab-medios')).toBeVisible();
    });

    test('debe crear un nuevo medio preparado', async ({ page }) => {
        const uniqueName = `Medio E2E ${Date.now()}`;
        await page.goto('/inventory');
        
        // Ir a pestaña medios
        await page.locator('#tab-medios').click();
        
        await page.getByTestId('btn-nuevo-medio').click();
        await page.getByTestId('medio-nombre').fill(uniqueName);
        await page.getByTestId('medio-codigo').fill(`E2E-${Date.now()}`);
        await page.getByRole('button', { name: /crear/i }).click();

        // Verificar en la lista
        await expect(page.getByText(uniqueName)).toBeVisible({ timeout: 10000 });
    });

});
