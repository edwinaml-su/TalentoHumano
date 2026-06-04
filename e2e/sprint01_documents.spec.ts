import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test.describe('Sprint 01: Document Expiration Warnings E2E', () => {
  const dummyFilePath = path.join(process.cwd(), 'dummy.png');

  test.beforeAll(() => {
    // Create a dummy png file for uploading
    fs.writeFileSync(dummyFilePath, 'fake image data');
  });

  test.afterAll(() => {
    // Clean up the dummy file
    if (fs.existsSync(dummyFilePath)) {
      fs.unlinkSync(dummyFilePath);
    }
  });

  test.beforeEach(async ({ page }) => {
    // 1. Perform login via UI page
    await page.goto('/login');
    await page.fill('input[placeholder="admin@global.com"]', 'admin@global.com');
    await page.fill('input[placeholder="••••••••"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL('**/');
  });

  test('Debe permitir subir, ver alertas en dashboard y borrar documentos con vencimiento', async ({ page }) => {
    // 1. Go to employees list page
    await page.goto('/employees');
    await expect(page).toHaveURL(/\/employees/);
    
    // 2. Click the edit link of the first employee
    const editLink = page.locator('a[href^="/employees/"][href$="/edit"]').first();
    await expect(editLink).toBeVisible();
    await editLink.click();
    
    // Wait for the edit page to load
    await expect(page.getByRole('heading', { name: /Editar Expediente/i })).toBeVisible({ timeout: 8000 });

    // 3. Click the "Documentos" tab
    const docsTab = page.getByRole('button', { name: /Documentos/i });
    await expect(docsTab).toBeVisible();
    await docsTab.click();

    // 4. Verify Document tab header
    await expect(page.getByText('Expediente Digital: Archivo y Documentación')).toBeVisible();

    // 5. Open Upload Form
    const uploadBtn = page.getByRole('button', { name: /Subir Documento/i });
    await expect(uploadBtn).toBeVisible();
    await uploadBtn.click();

    // 6. Fill out upload form
    await page.fill('input[placeholder="Ej: DUI Frontal Ampliado, Contrato Temporal 2026"]', 'Contrato de Prueba E2E 2026');
    await page.selectOption('select', { label: 'Contrato / Adenda' });
    
    // Set expiration date to today + 10 days
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 10);
    const dateString = expiryDate.toISOString().split('T')[0];
    await page.fill('input[type="date"]', dateString);

    // Set file upload (using dummy.png)
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('input[type="file"]').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(dummyFilePath);

    // 7. Submit Upload
    const saveBtn = page.getByRole('button', { name: /Guardar en Expediente/i });
    await expect(saveBtn).toBeVisible();
    await saveBtn.click();

    // 8. Verify it appeared in the list and shows the expiry warning
    await expect(page.getByText('Contrato de Prueba E2E 2026')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Vence en/i)).toBeVisible();

    // 9. Go to main dashboard and check if alert widget displays it
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: /Alertas de Vencimiento de Documentación/i })).toBeVisible();
    await expect(page.getByText('Contrato de Prueba E2E 2026')).toBeVisible();
    
    // 10. Click edit button from the widget to go back to employee page
    const editLinkWidget = page.locator('a[href^="/employees/"]').first();
    await expect(editLinkWidget).toBeVisible();
    await editLinkWidget.click();

    // 11. Go back to documents tab and delete it
    await expect(page.getByRole('heading', { name: /Editar Expediente/i })).toBeVisible();
    await page.getByRole('button', { name: /Documentos/i }).click();
    
    // Click delete button of the uploaded document
    const deleteBtn = page.locator('button[title="Eliminar Documento"]').first();
    await expect(deleteBtn).toBeVisible();

    // Dismiss the confirm dialog
    page.once('dialog', async dialog => {
      expect(dialog.type()).toBe('confirm');
      await dialog.accept();
    });
    await deleteBtn.click();

    // Verify it is gone from the list
    await expect(page.getByText('Contrato de Prueba E2E 2026')).not.toBeVisible({ timeout: 10000 });

    // 12. Go back to dashboard and verify the alert is gone
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Contrato de Prueba E2E 2026')).not.toBeVisible();
  });

});
