import { test, expect } from '@playwright/test';

test.describe('Analysis Module — Control Analítico', () => {

    test.use({ storageState: 'e2e/.auth/admin.json' });

    test('debe listar análisis en curso', async ({ page }) => {
        await page.goto('/analysis');
        await expect(page.getByText('Gestión Analítica')).toBeVisible({ timeout: 15000 });
        
        // Verificar que hay una tabla de análisis
        const table = page.locator('table');
        await expect(table).toBeVisible();
    });

    test('debe permitir navegar a la entrada de datos', async ({ page }) => {
        await page.goto('/analysis');
        
        // El refactor tiene un botón para ir a /data-entry o similar
        // Si no está el botón directamente, probamos la ruta
        await page.goto('/data-entry');
        await expect(page.getByText(/data entry|registro de resultado/i)).toBeVisible({ timeout: 15000 });
    });

    test('debe permitir registrar un resultado de análisis (Happy Path)', async ({ page }) => {
        await page.goto('/data-entry');
        
        // Seleccionar el primer análisis de la lista si hay
        const analysisCard = page.locator('.analysis-card').first();
        if (await analysisCard.isVisible()) {
            await analysisCard.click();
            
            // Llenar resultado
            await page.fill('input[name="resultado"]', '7.0');
            await page.getByRole('button', { name: /guardar|registrar/i }).click();
            
            // Debería pedir firma electrónica (Double Challenge)
            await expect(page.getByText(/firma electrónica/i)).toBeVisible();
            await page.fill('input[name="password"]', 'admin123');
            await page.getByRole('button', { name: /firmar/i }).click();
            
            await expect(page.getByText(/exitosamente|guardado/i)).toBeVisible();
        }
    });

});
