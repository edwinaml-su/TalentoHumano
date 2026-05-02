import { test, expect } from '@playwright/test';

test.describe('Sprint 04: Payroll Closure & Reports E2E', () => {
  let payrollRunId: string;
  const employeeId = 'cmmwiqy7l000vf4w8pm9c7d9n'; // Valid from seed

  test.beforeAll(async ({ request }) => {
    // 1. Create a Payroll Run
    const response = await request.post('/api/payroll-runs/process', {
      data: {
        unitIds: ['loc-sv-001'], // Valid unit from seed
        type: 'QUINCENAL',
        month: 3,
        year: 2026
      }
    });
    expect(response.ok()).toBeTruthy();
    const run = await response.json();
    payrollRunId = run.id;
  });

  test('Deve permitir adicionar incidente em nómina abierta', async ({ request }) => {
    const response = await request.post('/api/payroll/incidents', {
      data: {
        payrollRunId,
        employeeId: employeeId,
        type: 'BONO',
        amount: 100,
        date: new Date().toISOString()
      }
    });
    expect(response.status()).toBe(200);
  });

  test('Deve cerrar la nómina y bloquear nuevos incidentes', async ({ request }) => {
    // 1. Close the run
    const closeResponse = await request.post(`/api/payroll-runs/${payrollRunId}/close`);
    expect(closeResponse.status()).toBe(200);
    const closedRun = await closeResponse.json();
    expect(closedRun.status).toBe('CLOSED');

    // 2. Try to add another incident
    const failResponse = await request.post('/api/payroll/incidents', {
      data: {
        payrollRunId,
        employeeId: employeeId,
        type: 'LLEGADA_TARDE',
        amount: 10,
        date: new Date().toISOString()
      }
    });
    expect(failResponse.status()).toBe(400);
    const errorBody = await failResponse.json();
    expect(errorBody.error).toContain('closed');
  });

  test('Reporte de nómina debe ser accesible y contener datos', async ({ request }) => {
    const response = await request.get('/reports/payroll');
    expect(response.status()).toBe(200);
    const html = await response.text();
    
    // Simple HTML content validation
    expect(html).toContain('Reportes de Planilla');
    expect(html).toContain('CLOSED'); // Should see the closed run status
    expect(html).toContain('loc-sv-001'); // Should see the unit name/code
  });
});
