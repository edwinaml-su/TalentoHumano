import { test, expect } from '@playwright/test';

test.describe('Sprint 07: E2E Validation of Phase 2 & Phase 3 Modules', () => {

  test.beforeEach(async ({ page }) => {
    // 1. Perform login via UI page
    await page.goto('/login');
    await page.fill('input[placeholder="admin@global.com"]', 'admin@global.com');
    await page.fill('input[placeholder="••••••••"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Wait for authentication and redirect to home page
    await page.waitForURL('**/');
  });

  test('Deve cargar el Tablero Central y verificar los accesos del menú lateral', async ({ page }) => {
    const sidebar = page.locator('aside');
    await expect(sidebar).toBeVisible();
    await expect(page.getByText('SV-HR Core')).toBeVisible();
  });

  test('Deve cargar correctamente el módulo de Desempeño & KPIs', async ({ page }) => {
    await page.goto('/admin/performance');
    await expect(page).toHaveURL(/\/admin\/performance/);
    
    const title = page.getByRole('heading', { name: /Desempeño & KPIs/i });
    await expect(title).toBeVisible();
    
    // Verify Stats Cards
    await expect(page.getByText(/Metas Totales/i)).toBeVisible();
    await expect(page.getByText(/Nota Promedio/i)).toBeVisible();
  });

  test('Deve cargar correctamente el ATS de Reclutamiento', async ({ page }) => {
    // 1. Jobs Posting Page
    await page.goto('/admin/recruitment/jobs');
    await expect(page).toHaveURL(/\/admin\/recruitment\/jobs/);
    await expect(page.getByRole('heading', { name: /Bolsa de Trabajo/i })).toBeVisible();
    
    // 2. Candidates Page
    await page.goto('/admin/recruitment/candidates');
    await expect(page).toHaveURL(/\/admin\/recruitment\/candidates/);
    await expect(page.getByRole('heading', { name: /Candidatos & ATS/i })).toBeVisible();
  });

  test('Deve cargar correctamente el Centro de Formación (Capacitación)', async ({ page }) => {
    await page.goto('/admin/training');
    await expect(page).toHaveURL(/\/admin\/training/);
    
    await expect(page.getByRole('heading', { name: /Centro de Formación/i })).toBeVisible();
    await expect(page.getByText(/Cursos Activos/i)).toBeVisible();
  });

  test('Deve cargar correctamente la Matriz 9-Box (Talento & Sucesión)', async ({ page }) => {
    await page.goto('/admin/talent/9box');
    await expect(page).toHaveURL(/\/admin\/talent\/9box/);
    
    await expect(page.getByRole('heading', { name: /Matriz de Talento 9-Box/i })).toBeVisible();
    // Grid cells should be visible
    const grid = page.locator('.grid');
    await expect(grid).toBeVisible();
  });

  test('Deve cargar correctamente la sección de Cultura y Encuestas', async ({ page }) => {
    await page.goto('/admin/surveys');
    await expect(page).toHaveURL(/\/admin\/surveys/);
    
    await expect(page.getByRole('heading', { name: /Clima Organizacional/i })).toBeVisible();
    await expect(page.getByText(/eNPS Global/i)).toBeVisible();
  });

  test('Deve cargar los reportes de Analítica Estratégica', async ({ page }) => {
    // 1. General Analytics
    await page.goto('/admin/analytics');
    await expect(page).toHaveURL(/\/admin\/analytics/);
    await expect(page.getByRole('heading', { name: /Estrategia de Talento/i })).toBeVisible();
    
    // 2. Exit Interviews Analysis
    await page.goto('/admin/analytics/exit');
    await expect(page).toHaveURL(/\/admin\/analytics\/exit/);
    await expect(page.getByRole('heading', { name: /Análisis de Salida/i })).toBeVisible();
  });

  test('Deve cargar el Centro de Auditoría y Seguridad', async ({ page }) => {
    await page.goto('/admin/audit');
    await expect(page).toHaveURL(/\/admin\/audit/);
    
    await expect(page.getByRole('heading', { name: /Centro de Auditoría/i })).toBeVisible();
    await expect(page.locator('table')).toBeVisible();
  });

});
