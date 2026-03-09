import { test, expect } from '@playwright/test';

test.describe('Workflow Completo 10 Pasos', () => {

    test.use({ storageState: 'e2e/.auth/admin.json' });

    test('debe completar el flujo desde solicitud hasta informe', async ({ page }) => {
        const uniqueObs = `Test Workflow ${Date.now()}`;
        
        // Logging del navegador para el CLI
        page.on('console', msg => console.log(`BROWSER [${msg.type()}]: ${msg.text()}`));
        page.on('pageerror', err => console.log(`BROWSER ERROR: ${err.message}`));

        // 1. Ir a Muestreo
        await page.goto('/samples');
        await expect(page.getByText('Muestreo y Solicitudes')).toBeVisible({ timeout: 15000 });

        // 2. Crear Nueva Solicitud (Step 1)
        await page.getByRole('button', { name: 'Nueva Solicitud' }).click();
        await page.selectOption('select[name="tipo"]', 'Ambiental');
        await page.fill('textarea[name="observacion"]', uniqueObs);
        
        // Monitor de peticiones
        page.on('request', request => console.log('REQ >>', request.method(), request.url()));
        page.on('response', response => console.log('RES <<', response.status(), response.url()));

        // Direct click on the button
        await page.getByRole('button', { name: 'Confirmar Solicitud' }).click();

        // Esperar que el modal se cierre
        await expect(page.getByRole('heading', { name: 'Nueva Solicitud' })).not.toBeVisible({ timeout: 15000 });
        
        // 3. Ejecutar Muestreo (Step 2)
        // Buscamos la fila que acabamos de crear usando el ID único
        await page.waitForTimeout(2000); 
        const row = page.locator('tr').filter({ hasText: uniqueObs }).first();
        await expect(row).toBeVisible({ timeout: 10000 });
        
        // El botón "Muestrear" debería estar visible
        const samplingBtn = row.locator('button').first();
        await expect(samplingBtn).toBeAttached({ timeout: 10000 });
        await samplingBtn.click();
        
        // Completar Modal de Muestreo
        await expect(page.getByRole('heading', { name: 'Ejecutar Muestreo' })).toBeVisible({ timeout: 5000 });
        await page.fill('input[name="codigo_etiqueta"]', 'TAG-' + Date.now());
        await page.fill('textarea[name="muestra_obs"]', 'Muestra tomada por robot');
        await page.getByText('Registrar Muestras').click();
        
        await expect(page.getByText('Sesión de muestreo registrada')).toBeVisible();

        // 4. Verificar transición (Step 3)
        // El badge debería decir "Completado" y el botón "Expediente" debería aparecer
        await expect(row.getByText('Completado')).toBeVisible({ timeout: 10000 });
        await expect(row.getByRole('button', { name: 'Expediente' })).toBeVisible();

        // 5. Ver Expediente (Step 10)
        await row.getByRole('button', { name: 'Expediente' }).click();
        await expect(page).toHaveURL(/\/samples\/\d+/);
        await expect(page.getByText('Expediente de Muestra')).toBeVisible();
    });

    test('debe permitir vincular recursos en análisis', async ({ page }) => {
        // Ir a Análisis
        await page.goto('/analysis');
        await expect(page.getByText('Gestión Analítica')).toBeVisible({ timeout: 15000 });

        // Seleccionar tab de Análisis
        await page.click('button:has-text("Análisis")');

        // Seleccionar un análisis existente o crear uno
        const recursosBtn = page.getByTitle('Asignar Recursos').first();
        if (await recursosBtn.isVisible()) {
            await recursosBtn.click();
            await expect(page.getByText('Asignación de Recursos')).toBeVisible();
            
            // Vincular medio (Step 7) - The new UI has a list of items to click
            const firstMediaBtn = page.locator('button:has(svg)').first(); // The check button in the list
            if (await firstMediaBtn.isVisible()) {
                await firstMediaBtn.click();
                await expect(page.getByText(/asignado correctamente/i)).toBeVisible();
            }
        }
    });
});
