import { test, expect } from '@playwright/test';

test.describe('Manufacturing Workflow — Step-by-Step Traceability', () => {

    test.use({ storageState: 'e2e/.auth/admin.json' });

    test('Flujo completo: Crear Orden -> Iniciar Proceso -> Cancelar', async ({ page }) => {
        await page.goto('/manufacturing');

        // 1. Crear Nueva Orden
        await page.getByTestId('btn-nueva-orden').click();
        
        // Wait for modal to be fully visible and data to load
        await expect(page.getByText(/nueva orden de manufactura/i)).toBeVisible({ timeout: 5000 });
        await page.waitForTimeout(1000); // Wait for fetchData to finish

        await page.locator('input[name="codigo"]').fill('E2E-ORD-' + Date.now());
        await page.locator('input[name="lote"]').fill('L-E2E');
        await page.locator('input[name="fecha"]').fill('2026-03-03');
        
        // Wait specifically for options to exist
        const productSelect = page.locator('select[name="producto_id"]');
        await expect(productSelect.locator('option').nth(1)).toBeAttached({ timeout: 10_000 });
        
        // Select de Producto (usar value)
        await productSelect.selectOption({ value: '1' });
        await page.locator('input[name="cantidad"]').fill('500');
        
        const operatorSelect = page.locator('select[name="operario_id"]');
        await expect(operatorSelect.locator('option').nth(1)).toBeAttached({ timeout: 10_000 });
        await operatorSelect.selectOption({ value: '1' });
        
        // Submit via keyboard to avoid viewport issues
        await page.locator('input[name="cantidad"]').focus();
        await page.keyboard.press('Enter');
        
        await expect(page.getByText(/orden creada/i)).toBeVisible();

        // 2. Iniciar Proceso (Click en 'Play' de la primera fila)
        const firstRow = page.locator('tbody tr').first();
        await firstRow.locator('button[title="Iniciar Proceso"]').click();

        // Debería cambiar de tab automáticamente y abrir modal
        await expect(page.getByText(/nuevo proceso de manufactura/i)).toBeVisible();
        // Verificar pre-fill (el input es type number, valor debería coincidir con el ID de la orden)
        const ordenIdVal = await page.locator('input[name="orden_manufactura_id"]').inputValue();
        expect(ordenIdVal).not.toBe('');

        await page.getByRole('button', { name: /crear/i }).click();
        await expect(page.getByText(/proceso creado/i)).toBeVisible();

        // 3. Verificar Cancelación Global
        // Abrir modal de cambio de estado del proceso recién creado
        await page.locator('button[title="Cambiar estado"]').first().click();
        
        // El select de nuevo estado DEBE tener la opción "Cancelado"
        const selectEstado = page.locator('select[name="nuevo_estado_id"]');
        await expect(selectEstado.locator('option', { hasText: /cancelado/i })).toBeAttached();
        
        await selectEstado.selectOption({ label: 'Cancelado' });
        await page.getByRole('button', { name: 'Cambiar', exact: true }).click();
        
        await expect(page.getByText(/estado actualizado/i)).toBeVisible();
        await expect(page.getByText(/cancelado/i).first()).toBeVisible();
    });

});
