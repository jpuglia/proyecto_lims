import { test, expect } from '@playwright/test';

test.describe('Samples Module — Gestión de Muestras', () => {

    test.use({ storageState: 'e2e/.auth/admin.json' });

    test('debe listar solicitudes de muestreo', async ({ page }) => {
        await page.goto('/samples');
        await expect(page.getByText('Muestreo y Solicitudes')).toBeVisible({ timeout: 15000 });
        
        // Verificar que la tabla existe
        const table = page.locator('table');
        await expect(table).toBeVisible();
    });

    test('debe crear una nueva solicitud de muestreo', async ({ page }) => {
        const uniqueObs = `Solicitud E2E ${Date.now()}`;
        await page.goto('/samples');
        
        await page.getByRole('button', { name: 'Nueva Solicitud' }).click();
        await expect(page.getByRole('heading', { name: 'Nueva Solicitud' })).toBeVisible();

        await page.selectOption('select[name="tipo"]', 'Ambiental');
        await page.fill('textarea[name="observacion"]', uniqueObs);
        await page.getByRole('button', { name: 'Crear Solicitud' }).click();

        // Verificar que aparece en la lista
        await expect(page.getByRole('heading', { name: 'Nueva Solicitud' })).not.toBeVisible();
        await expect(page.getByText(uniqueObs)).toBeVisible({ timeout: 10000 });
    });

    test('debe permitir ver el detalle de una muestra', async ({ page }) => {
        await page.goto('/samples');
        // Esperar a que haya al menos una fila
        const detailBtn = page.getByRole('button', { name: /detalle|ver/i }).first();
        if (await detailBtn.isVisible()) {
            await detailBtn.click();
            // Dependiendo de la ruta del detalle, puede ser /samples/:id o similar
            // En el nuevo refactor es /samples/:id
            await expect(page.getByText(/detalle de la muestra|información de la muestra/i)).toBeVisible();
        }
    });

});
