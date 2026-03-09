import { test, expect } from '@playwright/test';

test.describe('Form Hardening & Validation — GAMP-5 Compliance', () => {

    test.use({ storageState: 'e2e/.auth/admin.json' });

    test('Inventario: bloquea volumen negativo y nombres cortos', async ({ page }) => {
        await page.goto('/inventory');
        // Click on the specific tab using its ID
        await page.locator('#tab-medios').click();
        await page.getByTestId('btn-nuevo-medio').click();

        // 1. Validar nombre corto (min 3)
        await page.getByTestId('medio-nombre').fill('Ab');
        await page.getByTestId('medio-volumen').fill('500');
        await page.getByRole('button', { name: /crear/i }).click();
        await expect(page.getByText(/debe tener al menos 3 caracteres/i)).toBeVisible();

        // 2. Validar volumen negativo
        await page.getByTestId('medio-nombre').fill('Caldo de Prueba');
        await page.getByTestId('medio-volumen').fill('-10');
        await page.getByRole('button', { name: /crear/i }).click();
        await expect(page.getByText(/debe ser un número positivo/i)).toBeVisible();
    });

    test('Plantas: bloquea nombres de solo espacios (trimming)', async ({ page }) => {
        await page.goto('/plants');
        await page.getByTestId('btn-nueva-planta').click();

        // Solo espacios
        await page.getByTestId('planta-nombre').fill('   ');
        await page.getByTestId('planta-codigo').fill('P-001');
        await page.getByTestId('planta-submit').click();

        // Puede fallar por 'obligatorio' (si queda vacío tras trim) o 'mínimo 3' (si se cuenta el length antes/después)
        await expect(page.locator('p', { hasText: /obligatorio|mínimo|menos/i }).first()).toBeVisible();
    });

    test('Manufactura: valida campos numéricos obligatorios', async ({ page }) => {
        await page.goto('/manufacturing');
        await page.getByTestId('btn-nueva-orden').click();
        
        await expect(page.getByText(/nueva orden de manufactura/i)).toBeVisible({ timeout: 5000 });

        // Intentar submit vacío
        await page.locator('input[name="cantidad"]').focus();
        await page.keyboard.press('Enter');

        // Zod debería disparar errores para cantidad, producto_id, operario_id
        await expect(page.getByText(/la cantidad debe ser un número positivo/i)).toBeVisible();

        await expect(page.getByText(/el ID de producto debe ser positivo/i)).toBeVisible();
    });

});
