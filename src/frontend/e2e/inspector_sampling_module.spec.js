import { test, expect } from '@playwright/test';

test.describe('Inspector Sampling Module E2E', () => {

  test.describe('Role: Inspector', () => {
    test.use({ storageState: 'e2e/.auth/inspector.json' });

    test('Flow A: Ad-hoc Sampling (Sampling Point)', async ({ page }) => {
      await page.goto('/inspection/adhoc');
      await page.waitForLoadState('networkidle');
      
      await expect(page.getByRole('heading', { name: 'Inspección Ad-hoc' })).toBeVisible({ timeout: 15000 });

      // Fill Point
      await page.getByTestId('select-point').selectOption({ index: 1 });
      
      // Verify quantity is hidden
      await expect(page.getByTestId('input-quantity')).not.toBeVisible();

      // Verify destination options
      const destSelect = page.getByTestId('select-destination');
      await expect(destSelect).toBeVisible();
      const options = await destSelect.locator('option').allInnerTexts();
      expect(options).toContain('Microbiología');
      expect(options).toContain('Fisicoquímico');
      expect(options).toContain('Retén');

      // Fill destination
      await destSelect.selectOption('Microbiología');

      // Submit
      await page.getByTestId('btn-submit-sampling').click();

      // Success toast
      await expect(page.getByText(/Muestreo de inspección registrado/i)).toBeVisible({ timeout: 15000 });
      await expect(page).toHaveURL('/sampling');
    });

    test('Flow B: Request-Derived Sampling (Product)', async ({ page }) => {
      await page.goto('/samples');
      await page.waitForLoadState('networkidle');
      
      // Check if we have samples
      const sampleLink = page.locator('td >> text=#').first();
      const isVisible = await sampleLink.isVisible();
      
      if (!isVisible) {
          await page.goto('/dashboard/inspector');
          await page.waitForLoadState('networkidle');
          const dashSample = page.locator('p >> text=#').first();
          await expect(dashSample).toBeVisible({ timeout: 15000 });
          // Extract ID and go
          const text = await dashSample.innerText();
          const id = text.match(/#(\d+)/)[1];
          await page.goto(`/samples/${id}`);
      } else {
          await sampleLink.click();
      }

      // Now on SampleDetail
      await expect(page.getByRole('heading', { name: /Expediente de Muestra/i })).toBeVisible({ timeout: 15000 });
      
      const startSamplingBtn = page.getByRole('button', { name: /Iniciar Muestreo de Inspección/i });
      await expect(startSamplingBtn).toBeVisible({ timeout: 15000 });
      await startSamplingBtn.click();

      // Modal should open
      await expect(page.getByText('Registro de Inspección')).toBeVisible();

      // Searchable Select for Product
      const productSelect = page.locator('div:has-text("-- Seleccionar Producto --")').last(); // Fallback if placeholder is default
      // Or just click the container that has "Buscar por código o nombre"
      await page.getByText('Buscar por código o nombre...').click();
      // Select first option
      await page.locator('div.bg-white.border-2.border-primary\\/20 div.max-h-60 div').first().click();

      // Manual Lot
      await page.getByTestId('input-lot-manual').fill('LOTE-E2E-TEST');

      // Quantity should appear
      await expect(page.getByTestId('input-quantity')).toBeVisible();
      await page.getByTestId('input-quantity').fill('250.5');

      await page.getByTestId('select-destination').selectOption('Fisicoquímico');

      // Submit
      await page.getByTestId('btn-submit-sampling').click();

      await expect(page.getByText(/Muestreo de inspección registrado/i)).toBeVisible({ timeout: 15000 });
      // Modal should close
      await expect(page.getByText('Registro de Inspección')).not.toBeVisible();
    });

    test('Validation: Date logic', async ({ page }) => {
        await page.goto('/inspection/adhoc');
        await page.waitForLoadState('networkidle');
        
        // Wait for inputs to be available
        const startInput = page.locator('input[type="datetime-local"]').first();
        await expect(startInput).toBeVisible({ timeout: 15000 });
        
        // Set end date before start date
        const startVal = await startInput.inputValue();
        const pastDate = new Date(new Date(startVal).getTime() - 86400000).toISOString().slice(0, 16);
        
        await page.locator('input[type="datetime-local"]').last().fill(pastDate);
        await page.getByTestId('select-point').selectOption({ index: 1 });
        await page.getByTestId('select-destination').selectOption('Retén');
        
        await page.getByTestId('btn-submit-sampling').click();
        
        await expect(page.getByText(/La fecha de fin debe ser posterior/i)).toBeVisible();
    });
  });

  test.describe('Role: Operator (Unauthorized)', () => {
    test.use({ storageState: 'e2e/.auth/operator.json' });

    test('should not see "Inspección Ad-hoc" in sidebar', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await expect(page.getByTestId('nav-dashboard')).toBeVisible({ timeout: 15000 });
      await expect(page.getByText('Inspección Ad-hoc')).not.toBeVisible();
    });

    test('direct access to /inspection/adhoc should show Access Denied', async ({ page }) => {
        await page.goto('/inspection/adhoc');
        await page.waitForLoadState('networkidle');
        await expect(page.getByText('Acceso Denegado')).toBeVisible({ timeout: 15000 });
    });
  });
});
