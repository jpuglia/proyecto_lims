import { test, expect } from '@playwright/test';

test.describe('Análisis Workflow V3 — Full Lifecycle', () => {

    test.use({ storageState: 'e2e/.auth/admin.json' });

    test('debe completar el ciclo de vida de un análisis (Happy Path)', async ({ page }) => {
        // 1. Ir a la página de Análisis
        await page.goto('/analysis');
        await expect(page.getByText('Gestión Analítica')).toBeVisible({ timeout: 15000 });

        // 2. Tab Recepciones: Recibir y Ejecutar (Programar)
        await page.click('button:has-text("Recepciones")');
        const receiveBtn = page.getByRole('button', { name: /recibir/i }).first();
        if (await receiveBtn.isVisible()) {
            await receiveBtn.click();
            await page.selectOption('select', 'Aprobado');
            await page.getByRole('button', { name: /confirmar/i }).click();
            await expect(page.getByText(/muestra recibida/i)).toBeVisible();
        }

        const executeBtn = page.getByRole('button', { name: /ejecutar/i }).first();
        if (await executeBtn.isVisible()) {
            await executeBtn.click();
            // Seleccionar un método
            await page.locator('.grid-cols-1 >> div').first().click(); 
            await page.getByRole('button', { name: /iniciar análisis/i }).click();
            await expect(page.getByText(/correctamente/i)).toBeVisible();
        }

        // 3. Tab Análisis: Iniciar y Concluir
        await page.click('button:has-text("Análisis")');
        const startBtn = page.getByRole('button', { name: /iniciar/i }).first();
        if (await startBtn.isVisible()) {
            await startBtn.click();
            await expect(page.getByText(/análisis iniciado/i)).toBeVisible();
        }

        const concludeBtn = page.getByRole('button', { name: /concluir/i }).first();
        if (await concludeBtn.isVisible()) {
            await concludeBtn.click();
            await expect(page.getByText(/análisis concluido/i)).toBeVisible();
        }

        // 4. Tab Incubaciones: Iniciar y Finalizar
        await page.click('button:has-text("Incubaciones")');
        const startIncBtn = page.getByRole('button', { name: /iniciar/i }).first();
        if (await startIncBtn.isVisible()) {
            await startIncBtn.click();
            await page.selectOption('select', { index: 1 }); // Primer incubadora
            await page.getByRole('button', { name: /confirmar entrada/i }).click();
            await expect(page.getByText(/incubación iniciada/i)).toBeVisible();
        }

        const finishIncBtn = page.getByRole('button', { name: /finalizar/i }).first();
        if (await finishIncBtn.isVisible()) {
            await finishIncBtn.click();
            await page.fill('input[type="number"]', '37.0');
            await page.getByRole('button', { name: /confirmar salida/i }).click();
            await expect(page.getByText(/finalizada/i)).toBeVisible();
        }

        // 5. Tab Lectura: Registrar Resultado
        await page.click('button:has-text("Lectura")');
        const registerResBtn = page.getByRole('button', { name: /registrar/i }).first();
        if (await registerResBtn.isVisible()) {
            await registerResBtn.click();
            await page.selectOption('select', 'CUMPLE');
            await page.fill('input[type="number"]', '10.5');
            await page.getByRole('button', { name: /confirmar final/i }).click();
            await expect(page.getByText(/registrado/i)).toBeVisible();
        }

        // 6. Tab Reporte: Verificar finalizado
        await page.click('button:has-text("Reporte")');
        await expect(page.getByText(/finalizado/i).first()).toBeVisible();
    });

});
