import { test, expect } from '@playwright/test';

test.describe('Workflow Multi-Rol LIMS', () => {

    test.beforeEach(async ({ page }) => {
        page.on('console', msg => {
            if (msg.type() === 'error') console.log(`BROWSER ERROR: ${msg.text()}`);
        });
    });

    test.describe('Inspector Workflow', () => {
        test.use({ storageState: 'e2e/.auth/inspector.json' });
        
        test('debe crear un muestreo fraccionado con múltiples equipos', async ({ page }) => {
            const uniqueTag = `TAG-E2E-${Math.floor(Math.random() * 10000)}`;
            
            await page.goto('/dashboard/inspector');
            await expect(page.getByText('Panel de Inspector')).toBeVisible({ timeout: 15000 });

            // Abrir formulario
            await page.getByRole('button', { name: '+ Nuevo Muestreo Programado' }).click();
            
            // Completar datos generales
            await page.selectOption('select >> nth=0', 'Ambiental');
            
            // Esperar a que carguen los equipos
            await page.waitForTimeout(2000);
            
            // Seleccionar múltiples equipos (dinámico)
            const multiSelect = page.locator('select[multiple]');
            await expect(multiSelect).toBeVisible();
            const options = await multiSelect.locator('option').all();
            if (options.length >= 2) {
                const val1 = await options[0].getAttribute('value');
                const val2 = await options[1].getAttribute('value');
                await multiSelect.selectOption([val1, val2]);
            }

            // Configurar muestras y envíos
            await page.fill('input[placeholder="Autogenerar..."]', uniqueTag);
            
            // Añadir segundo laboratorio destino
            const addEnvioBtn = page.locator('button').filter({ has: page.locator('svg') }).nth(2); // The plus button for envios
            await addEnvioBtn.click();
            
            await page.waitForTimeout(1000);

            // Seleccionar laboratorios usando el nuevo aria-label
            const labSelects = page.getByLabel('Seleccionar Laboratorio');
            await expect(labSelects).toHaveCount(2);
            
            await labSelects.nth(0).selectOption({ index: 1 });
            await labSelects.nth(1).selectOption({ index: 2 });

            // Enviar
            await page.getByTestId('muestreo-submit').click();
            
            await expect(page.getByText(/Muestreo y envíos registrados con éxito/i)).toBeVisible({ timeout: 15000 });
        });
    });

    test.describe('Analista Workflow', () => {
        test.use({ storageState: 'e2e/.auth/analista.json' });

        test('debe recibir y procesar muestra de su laboratorio', async ({ page }) => {
            await page.goto('/dashboard/analista');
            await expect(page.getByText('Panel de Analista')).toBeVisible({ timeout: 15000 });
            await page.waitForTimeout(2000);

            // Localizar el primer análisis programado y hacer clic en recibir
            const receiveBtn = page.getByRole('button', { name: /Recibir/i }).first();
            await expect(receiveBtn).toBeVisible({ timeout: 15000 });
            await receiveBtn.click();

            // Completar modal de recepción
            await expect(page.getByText(/Recepción de Muestra/i)).toBeVisible();
            await page.getByRole('button', { name: /Confirmar/i }).click();
            await expect(page.getByText(/Muestra recibida correctamente/i)).toBeVisible();

            // Iniciar ejecución
            const execBtn = page.getByRole('button', { name: /Ejecutar/i }).first();
            await expect(execBtn).toBeVisible({ timeout: 15000 });
            await execBtn.click();

            await page.waitForTimeout(2000);

            // Vincular equipo
            const eqSelect = page.locator('select').first();
            const eqOptions = await eqSelect.locator('option').all();
            if (eqOptions.length > 1) {
                await eqSelect.selectOption({ index: 1 });
                await page.getByRole('button', { name: /Registrar Uso/i }).click();
                await expect(page.getByText(/Recursos vinculados correctamente/i)).toBeVisible();
            }

            // Ingresar resultados
            await page.fill('input[type="number"]', '150');
            await page.fill('input[placeholder="ej. UFC/g"]', 'UFC/g');
            
            const dictamenSelect = page.locator('select').nth(1);
            await dictamenSelect.selectOption('CUMPLE');
            
            await page.getByRole('button', { name: /Finalizar Análisis/i }).click();
            await expect(page.getByText(/Resultado FINAL registrado/i)).toBeVisible();
        });
    });

    test.describe('Supervisor Workflow', () => {
        test.use({ storageState: 'e2e/.auth/supervisor.json' });

        test('debe aprobar análisis firmado digitalmente', async ({ page }) => {
            await page.goto('/dashboard/supervisor');
            await expect(page.getByText('Panel de Supervisor')).toBeVisible({ timeout: 15000 });
            await page.waitForTimeout(2000);

            // Localizar análisis
            const approveBtn = page.getByRole('button', { name: /APROBAR Y FIRMAR/i }).first();
            await expect(approveBtn).toBeVisible({ timeout: 15000 });
            await approveBtn.click();

            // Firma digital
            await expect(page.getByText(/Firma de Aprobación/i)).toBeVisible();
            await page.fill('input[type="password"]', 'supervisor123');
            await page.getByRole('button', { name: /CONFIRMAR FIRMA/i }).click();

            await expect(page.getByText(/Análisis aprobado y firmado digitalmente/i)).toBeVisible();
        });
    });
});
