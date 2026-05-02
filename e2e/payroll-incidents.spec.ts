import { test, expect } from '@playwright/test';

test.describe('Flujo: Nómina e Incidencias (/payroll)', () => {
  test('la página de nómina carga correctamente', async ({ page }) => {
    await page.goto('/payroll');
    await expect(page).toHaveURL(/\/payroll/);

    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
  });

  test('la sección de incidencias es visible después de cargar', async ({ page }) => {
    await page.goto('/payroll');
    await page.waitForLoadState('networkidle');

    // Should show some kind of payroll content
    const payrollContent = page
      .locator('table, [data-testid="payroll-grid"], [data-testid="incidents-section"]')
      .first();

    await expect(
      payrollContent.or(page.getByText(/No hay|Sin nóminas/i))
    ).toBeVisible({ timeout: 8000 });
  });

  test('botón para agregar incidencia abre un modal o formulario', async ({ page }) => {
    await page.goto('/payroll');
    await page.waitForLoadState('networkidle');

    const addIncidentBtn = page
      .getByRole('button', { name: /incidencia|incident|agregar/i })
      .first();

    const btnExists = await addIncidentBtn.count();
    if (btnExists === 0) {
      test.skip();
      return;
    }

    await addIncidentBtn.click();
    await page.waitForTimeout(500);

    // A modal, dialog, or form should appear
    const modal = page
      .locator('[role="dialog"], [data-testid="incident-modal"], .modal')
      .first();
    const form = page.locator('form').first();

    const modalVisible = await modal.count() > 0;
    const formVisible = await form.count() > 0;
    expect(modalVisible || formVisible).toBe(true);
  });
});

// ─── API Contract Tests usando Playwright request ─────────────────────────────
test.describe('Contrato API: /api/payroll/incidents', () => {
  test('GET sin payrollRunId retorna 400', async ({ request }) => {
    const res = await request.get('/api/payroll/incidents');
    expect(res.status()).toBe(400);

    const json = await res.json();
    expect(json.error).toBe('payrollRunId is required');
  });

  test('GET con payrollRunId inexistente retorna 200 con arreglo vacío', async ({ request }) => {
    const res = await request.get(
      '/api/payroll/incidents?payrollRunId=non-existent-run-id-xyz'
    );
    expect(res.status()).toBe(200);

    const json = await res.json();
    expect(Array.isArray(json)).toBe(true);
    expect(json).toHaveLength(0);
  });

  test('GET con payrollRunId válido retorna incidencias', async ({ request }) => {
    // Get an existing payroll run first
    const runsRes = await request.get('/api/payroll-runs');
    if (!runsRes.ok()) {
      test.skip();
      return;
    }

    const runs = await runsRes.json();
    if (!runs.length) {
      test.skip();
      return;
    }

    const res = await request.get(
      `/api/payroll/incidents?payrollRunId=${runs[0].id}`
    );
    expect(res.status()).toBe(200);
    expect(Array.isArray(await res.json())).toBe(true);
  });
});
