import { test, expect } from '@playwright/test';

test.describe('Catálogo Tipos de Solicitud — E2E', () => {

    test('debe navegar y listar los 9 tipos iniciales', async ({ page }) => {
        await page.goto('/sampling-types');
        
        // Verificar título
        await expect(page.getByRole('heading', { name: /catálogo de tipos de solicitud/i })).toBeVisible({ timeout: 10_000 });
        
        // Verificar presencia de algunos tipos inyectados por el seeder
        await expect(page.getByText('AIRE_AREA')).toBeVisible();
        await expect(page.getByText('PRODUCTO')).toBeVisible();
        await expect(page.getByText('AGUA')).toBeVisible();
        await expect(page.getByText('NITROGENO')).toBeVisible();
    });

    test('puede filtrar tipos en la tabla', async ({ page }) => {
        await page.goto('/sampling-types');
        
        const searchInput = page.getByPlaceholder(/buscar por código/i);
        await searchInput.fill('HISOPADO');
        
        // Debería mostrar los 3 de hisopado
        await expect(page.getByText('HISOPADO_PERSONAL')).toBeVisible();
        await expect(page.getByText('HISOPADO_EQUIPO')).toBeVisible();
        await expect(page.getByText('HISOPADO_SUPERFICIE')).toBeVisible();
        
        // No debería mostrar AIRE_AREA
        await expect(page.getByText('AIRE_AREA')).not.toBeVisible();
    });

    test('puede abrir el modal y validar campos obligatorios', async ({ page }) => {
        await page.goto('/sampling-types');
        
        await page.getByText('Nuevo Tipo').click();
        await expect(page.getByText(/nuevo tipo de solicitud/i).last()).toBeVisible();
        
        // Intentar guardar vacío
        await page.getByTestId('tipo-submit').click();
        
        // Verificar mensajes de error (Zod)
        await expect(page.locator('p', { hasText: /obligatorio|requerido/i }).first()).toBeVisible();
    });

    test('puede crear un nuevo tipo de solicitud', async ({ page }) => {
        await page.goto('/sampling-types');
        
        await page.getByText('Nuevo Tipo').click();
        
        const randomCode = `TIPO_${Math.floor(Math.random() * 10000)}`;
        await page.getByTestId('tipo-codigo').fill(randomCode);
        await page.getByTestId('tipo-descripcion').fill('Descripción de prueba E2E');
        await page.getByTestId('tipo-categoria').fill('E2E Category');
        
        await page.getByTestId('tipo-submit').click();
        
        // Verificar que el modal se cierra y el nuevo tipo aparece
        await expect(page.getByText(/nuevo tipo de solicitud/i)).not.toBeVisible();
        await expect(page.getByText(randomCode)).toBeVisible();
    });

});
