import { test, expect } from '@playwright/test';

test.describe('Workflow Inspector — Muestreo y Despacho', () => {

    test.use({ storageState: 'e2e/.auth/inspector.json' });

    test('visualización de semáforo de urgencia en Solicitudes', async ({ page }) => {
        await page.goto('/sampling');
        await expect(page.getByRole('button', { name: 'Solicitudes' })).toBeVisible();
        
        const cards = page.locator('.group.hover\\:shadow-premium');
        await expect(cards.first()).toBeVisible({ timeout: 15000 });
        
        // Usamos la clase personalizada 'urgency-badge' añadida en InspectorSamplingPage.jsx
        const urgencyBadge = page.locator('.urgency-badge');
        await expect(urgencyBadge.first()).toBeVisible({ timeout: 15000 });
    });

    test('flujo de corroboración y envío', async ({ page }) => {
        await page.goto('/sampling');
        await page.getByText('Espera de Envío').click();
        
        // Esperar a que la lista cargue y el botón sea visible
        const corroborarBtn = page.getByRole('button', { name: /Corroborar/i });
        await expect(corroborarBtn.first()).toBeVisible({ timeout: 15000 });
        
        await corroborarBtn.first().click();
        await expect(page.getByText(/corroborada correctamente/i)).toBeVisible();
        
        // Tras corroborar, debe aparecer el botón de Enviar
        const enviarBtn = page.getByRole('button', { name: /Enviar/i });
        await expect(enviarBtn.first()).toBeVisible();
        
        await enviarBtn.first().click();
        await expect(page.getByText(/enviada al laboratorio/i)).toBeVisible();
    });

    test('renderizado condicional Producto vs Ambiental', async ({ page }) => {
        await page.goto('/sampling');
        
        const cards = page.locator('.group.hover\\:shadow-premium');
        await expect(cards.first()).toBeVisible({ timeout: 15000 });
        
        // Verificar etiquetas específicas usando first() para evitar strict mode violation si hay varios
        const hasLote = await page.getByText('Lote:').first().isVisible();
        const hasPunto = await page.getByText('Punto:').first().isVisible();
        
        expect(hasLote || hasPunto).toBeTruthy();
    });

    test('navegación desde Dashboard a secciones operativas', async ({ page }) => {
        await page.goto('/dashboard/inspector');
        await expect(page.getByText('Panel de Inspector')).toBeVisible();
        await expect(page.getByText(/Muestreos Críticos/i)).toBeVisible();
        
        await page.getByText(/Ejecutar Muestreos/i).click();
        await expect(page).toHaveURL('/sampling');
    });
});
