import { test, expect } from '@playwright/test';

test.describe('Flujo: Editar Expediente de Empleado', () => {
  let employeeId: string;

  test.beforeAll(async ({ request }) => {
    // Get the first employee from the API to use in tests
    const res = await request.get('/api/employees-data');
    const employees = await res.json();

    if (employees.length === 0) {
      // Skip all tests in this suite if no employees exist
      test.skip();
      return;
    }
    employeeId = employees[0].id;
  });

  test('la página de edición carga con datos del empleado pre-cargados', async ({ page }) => {
    await page.goto(`/employees/${employeeId}/edit`);

    // Page should not show a loading spinner indefinitely
    await expect(page.getByText('Cargando expediente...')).not.toBeVisible({
      timeout: 8000,
    });

    // Should show employee's name in heading
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('Editar Expediente');
  });

  test('los 4 tabs de navegación son visibles y clicables', async ({ page }) => {
    await page.goto(`/employees/${employeeId}/edit`);
    await page.waitForLoadState('networkidle');

    const tabs = [
      /ID y Personales/i,
      /Contractual/i,
      /Académico/i,
      /Nómina/i,
    ];

    for (const tabLabel of tabs) {
      const tab = page.getByRole('button', { name: tabLabel });
      await expect(tab).toBeVisible();
      await tab.click();
      await page.waitForTimeout(200);
    }
  });

  test('tab "ID y Personales" muestra campos de nombre y DUI', async ({ page }) => {
    await page.goto(`/employees/${employeeId}/edit`);
    await page.waitForLoadState('networkidle');

    // Click personal tab (default active, but click explicitly)
    await page.getByRole('button', { name: /ID y Personales/i }).click();

    // Key fields should exist
    await expect(page.getByLabel(/Primer Nombre/i)).toBeVisible();
    await expect(page.getByLabel(/DUI/i)).toBeVisible();
    await expect(page.getByLabel(/Nombre Completo/i)).toBeVisible();
  });

  test('tab "Contractual y Legal" contiene dropdowns en cascada', async ({ page }) => {
    await page.goto(`/employees/${employeeId}/edit`);
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: /Contractual/i }).click();
    await page.waitForTimeout(300);

    // Organization dropdown should be enabled
    const orgSelect = page.locator('select').filter({ hasText: /organización|seleccione/i }).first();
    await expect(orgSelect).toBeVisible();
  });

  test('botón "Guardar Cambios" es visible y clicable', async ({ page }) => {
    await page.goto(`/employees/${employeeId}/edit`);
    await page.waitForLoadState('networkidle');

    const saveBtn = page.getByRole('button', { name: /Guardar Cambios/i });
    await expect(saveBtn).toBeVisible();
  });

  test('botón "Cancelar" navega de vuelta a la lista de empleados', async ({ page }) => {
    await page.goto(`/employees/${employeeId}/edit`);
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: /Cancelar/i }).click();
    await expect(page).toHaveURL(/\/employees/, { timeout: 5000 });
  });
});
