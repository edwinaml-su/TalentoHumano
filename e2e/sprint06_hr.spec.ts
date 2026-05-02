import { test, expect } from '@playwright/test';

test.describe('Sprint 06: Advanced HR Features E2E', () => {
  const employeeId = 'cmmwiqy7l000vf4w8pm9c7d9n'; // Valid from seed
  const employeeCode = 'EMP-001'; // Should match the seed for cmmwiqy7l000vf4w8pm9c7d9n

  test('Deve calcular vacaciones acumuladas correctamente', async ({ request }) => {
    const response = await request.get(`/api/vacations/accrued?employeeId=${employeeId}`);
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.accruedDays).toBeGreaterThan(0);
    expect(data.availableBalance).toBeDefined();
  });

  test('Deve calcular liquidación legal (Art. 58)', async ({ request }) => {
    const response = await request.get(`/api/settlements/calculate?employeeId=${employeeId}`);
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.totalSettlement).toBeGreaterThan(0);
    expect(data.severance).toBeDefined();
    expect(data.proportionalVacation).toBeDefined();
    console.log(`- Settlement Total: $${data.totalSettlement}`);
  });

  test('Deve importar marcajes biométricos masivos', async ({ request }) => {
    const response = await request.post('/api/attendance/import', {
      data: {
        records: [
          {
            employeeCode: 'EMP-001',
            date: '2026-03-18',
            clockIn: '2026-03-18T08:00:00Z',
            clockOut: '2026-03-18T17:00:00Z'
          }
        ]
      }
    });
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.summary[0].status).toBe('IMPORTED');
  });
});
