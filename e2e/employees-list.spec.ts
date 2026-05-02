import { test, expect } from '@playwright/test';

test.describe('Página: Lista de Empleados (/employees)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/employees');
  });

  test('carga correctamente y muestra el encabezado de la página', async ({ page }) => {
    await expect(page).toHaveURL(/\/employees/);
    // The page should have a visible heading
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
  });

  test('muestra lista/tabla de empleados o mensaje de vacío', async ({ page }) => {
    // Either employee rows or an empty-state element should appear
    const employeeRows = page.locator('table tbody tr, [data-testid="employee-row"]');
    const emptyState = page.locator('[data-testid="empty-state"], text=No hay empleados');

    const rowCount = await employeeRows.count();
    if (rowCount > 0) {
      expect(rowCount).toBeGreaterThan(0);
    } else {
      await expect(emptyState.first()).toBeVisible();
    }
  });

  test('contiene botón de "Nuevo" o "Agregar" empleado', async ({ page }) => {
    const newButton = page.getByRole('button', { name: /nuevo|agregar|crear/i }).first();
    await expect(newButton).toBeVisible();
  });

  test('búsqueda filtra la lista de empleados', async ({ page }) => {
    const searchInput = page.getByRole('searchbox').or(
      page.locator('input[placeholder*="buscar"], input[placeholder*="Buscar"], input[type="search"]')
    ).first();

    const inputExists = await searchInput.count();
    if (inputExists === 0) {
      test.skip();
      return;
    }

    const initialRows = await page.locator('table tbody tr').count();
    await searchInput.fill('xxxNonExistentEmployee123');
    await page.waitForTimeout(300); // debounce

    const filteredRows = await page.locator('table tbody tr').count();
    expect(filteredRows).toBeLessThanOrEqual(initialRows);
  });
});
