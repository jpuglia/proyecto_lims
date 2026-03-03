import { test, expect } from '@playwright/test';

test.describe('Workflow Completo 10 Pasos', () => {

    test('debe completar el flujo desde solicitud hasta informe', async ({ page }) => {
        // Logging del navegador para el CLI
        page.on('console', msg => console.log(`BROWSER [${msg.type()}]: ${msg.text()}`));
        page.on('pageerror', err => console.log(`BROWSER ERROR: ${err.message}`));

        // 1. Ir a Muestreo
        await page.goto('/samples');
        await expect(page.getByText('Muestreo y Solicitudes')).toBeVisible({ timeout: 15000 });

        // 2. Crear Nueva Solicitud (Step 1)
        await page.getByRole('button', { name: 'Nueva Solicitud' }).click();
        await page.selectOption('select[name="tipo"]', 'Ambiental');
        await page.fill('textarea[name="observacion"]', 'Test Automatizado Workflow');
        
        // Monitor de peticiones
        page.on('request', request => console.log('REQ >>', request.method(), request.url()));
        page.on('response', response => console.log('RES <<', response.status(), response.url()));

        await page.getByRole('button', { name: 'Crear Solicitud' }).click();

        // Esperar que el modal se cierre (esto confirma éxito del submit)
        await expect(page.getByRole('heading', { name: 'Nueva Solicitud' })).not.toBeVisible({ timeout: 15000 });
        
        // 3. Ejecutar Muestreo (Step 2)
        // Buscamos la fila que acabamos de crear. Refrescamos si es necesario.
        await page.waitForTimeout(2000); 
        const row = page.locator('tr').filter({ hasText: 'Test Automatizado Workflow' }).first();
        await expect(row).toBeVisible({ timeout: 10000 });
        
        // El botón "Muestrear" debería estar visible
        await row.getByRole('button', { name: 'Muestrear' }).click();
        
        // Completar Modal de Muestreo
        await page.fill('input[name="codigo_etiqueta"]', 'TAG-' + Date.now());
        await page.fill('textarea[name="muestra_obs"]', 'Muestra tomada por robot');
        await page.getByText('Registrar Muestras').click();
        
        await expect(page.getByText('Sesión de muestreo registrada')).toBeVisible();

        // 4. Verificar transición (Step 3)
        // El badge debería decir "Completado" y el botón "Informe" debería aparecer
        await expect(row.getByText('Completado')).toBeVisible();
        await expect(row.getByRole('button', { name: 'Informe' })).toBeVisible();

        // 5. Ver Informe (Step 10)
        await row.getByRole('button', { name: 'Informe' }).click();
        await expect(page).toHaveURL(/\/report\/\d+/);
        await expect(page.getByText('Informe de Trazabilidad')).toBeVisible();
        await expect(page.getByText('Ambiental')).toBeVisible();
    });

    test('debe permitir vincular recursos en análisis', async ({ page }) => {
        // Ir a Análisis
        await page.goto('/analysis');
        await expect(page.getByText('Control Analítico')).toBeVisible({ timeout: 15000 });

        // Seleccionar un análisis existente o crear uno
        // Por simplicidad, tomamos el primero que tenga el botón "Recursos"
        const recursosBtn = page.getByRole('button', { name: 'Recursos' }).first();
        if (await recursosBtn.isVisible()) {
            await recursosBtn.click();
            await expect(page.getByText('Registro de Recursos')).toBeVisible();
            
            // Vincular medio (Step 7)
            await page.fill('input[name="resource_id"]', '1');
            await page.getByText('Vincular Medio').click();
            await expect(page.getByText('Recurso registrado')).toBeVisible();
        }
    });
});
