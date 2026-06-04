/**
 * Integration tests for GET /api/payroll/incidents and POST /api/payroll/incidents
 * Key contract: GET requires payrollRunId query param (returns 400 if missing).
 */

jest.mock('@/lib/prisma', () => ({
  prisma: {
    payrollIncident: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    payrollRun: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));
import { prisma } from '@/lib/prisma';
import { GET, POST } from '@/app/api/payroll/incidents/route';


const mockIncident = {
  id: 'inc-1',
  payrollRunId: 'run-1',
  employeeId: 'emp-1',
  type: 'REINTEGRO',
  amount: '150.00',
  quantity: null,
  notes: 'Test incident',
  date: new Date('2026-03-01'),
  createdAt: new Date(),
  updatedAt: new Date(),
};

// ─── GET /api/payroll/incidents ───────────────────────────────────────────────
describe('GET /api/payroll/incidents', () => {
  it('⚠️ EDGE CASE: retorna 400 cuando falta payrollRunId', async () => {
    const request = new Request('http://localhost/api/payroll/incidents');
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe('payrollRunId is required');
    expect(prisma.payrollIncident.findMany).not.toHaveBeenCalled();
  });

  it('retorna incidencias para un payrollRunId válido', async () => {
    (prisma.payrollIncident.findMany as jest.Mock).mockResolvedValueOnce([mockIncident]);

    const request = new Request(
      'http://localhost/api/payroll/incidents?payrollRunId=run-1'
    );
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toHaveLength(1);
    expect(json[0].payrollRunId).toBe('run-1');
  });

  it('filtra también por employeeId cuando se proporciona', async () => {
    (prisma.payrollIncident.findMany as jest.Mock).mockResolvedValueOnce([mockIncident]);

    const request = new Request(
      'http://localhost/api/payroll/incidents?payrollRunId=run-1&employeeId=emp-1'
    );
    const response = await GET(request);

    expect(response.status).toBe(200);
    const callArgs = (prisma.payrollIncident.findMany as jest.Mock).mock.calls[0][0];
    expect(callArgs.where.employeeId).toBe('emp-1');
  });

  it('retorna 500 cuando Prisma falla', async () => {
    (prisma.payrollIncident.findMany as jest.Mock).mockRejectedValueOnce(
      new Error('DB error')
    );

    const request = new Request(
      'http://localhost/api/payroll/incidents?payrollRunId=run-1'
    );
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.error).toBe('Internal Server Error');
  });
});

// ─── POST /api/payroll/incidents ──────────────────────────────────────────────
describe('POST /api/payroll/incidents', () => {
  const validBody = {
    payrollRunId: 'run-1',
    employeeId: 'emp-1',
    type: 'REINTEGRO',
    amount: 150.00,
    quantity: null,
    notes: 'Reintegro por error de nómina anterior',
    date: '2026-03-01',
  };

  it('crea incidencia con body válido y retorna 200', async () => {
    (prisma.payrollRun.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'run-1', status: 'DRAFT' });
    (prisma.payrollIncident.findFirst as jest.Mock).mockResolvedValueOnce(null);
    (prisma.payrollIncident.create as jest.Mock).mockResolvedValueOnce(mockIncident);

    const request = new Request('http://localhost/api/payroll/incidents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.payrollRunId).toBe('run-1');
    expect(prisma.payrollIncident.create).toHaveBeenCalledTimes(1);
  });

  it('usa fecha actual cuando no se proporciona date', async () => {
    (prisma.payrollRun.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'run-1', status: 'DRAFT' });
    (prisma.payrollIncident.findFirst as jest.Mock).mockResolvedValueOnce(null);
    (prisma.payrollIncident.create as jest.Mock).mockResolvedValueOnce(mockIncident);

    const bodyWithoutDate = { ...validBody, date: undefined };
    const request = new Request('http://localhost/api/payroll/incidents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyWithoutDate),
    });
    await POST(request);

    const callArgs = (prisma.payrollIncident.create as jest.Mock).mock.calls[0][0];
    // date field should be undefined (Prisma defaults to now())
    expect(callArgs.data.date).toBeUndefined();
  });

  it('retorna 500 cuando Prisma falla en la creación', async () => {
    (prisma.payrollRun.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'run-1', status: 'DRAFT' });
    (prisma.payrollIncident.findFirst as jest.Mock).mockResolvedValueOnce(null);
    (prisma.payrollIncident.create as jest.Mock).mockRejectedValueOnce(
      new Error('FK constraint violation')
    );

    const request = new Request('http://localhost/api/payroll/incidents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.error).toBe('Internal Server Error');
  });
});
