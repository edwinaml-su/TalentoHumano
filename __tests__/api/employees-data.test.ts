/**
 * Integration tests for GET /api/employees-data and POST /api/employees-data
 * Prisma is mocked — no real DB required.
 */

jest.mock('@/lib/prisma', () => ({
  prisma: {
    employee: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    employeeDocument: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));
import { prisma } from '@/lib/prisma';

// We import the route handlers dynamically to avoid Next.js module resolution issues
import { GET, POST } from '@/app/api/employees-data/route';

// Helper to build a mock Request for POST handlers
function buildRequest(body: object): Request {
  return new Request('http://localhost/api/employees-data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const mockEmployee = {
  id: 'emp-1',
  employeeCode: 'EMP001',
  firstName: 'Juan',
  firstSurname: 'Pérez',
  fullName: 'Juan Pérez',
  hireDate: new Date('2024-01-01'),
  locationId: 'loc-1',
  positionId: 'pos-1',
  countryId: 'ctry-1',
  status: 'ACTIVE',
  createdAt: new Date(),
  updatedAt: new Date(),
  location: { name: 'Sede Central', organization: { id: 'org-1', legalName: 'Avante' } },
  position: { title: 'Enfermero', department: { id: 'dept-1', name: 'Enfermería' } },
  country: { id: 'ctry-1', name: 'El Salvador', isoCode: 'SV' },
};

// ─── GET /api/employees-data ────────────────────────────────────────────────
describe('GET /api/employees-data', () => {
  it('retorna lista de empleados con status 200', async () => {
    (prisma.employee.findMany as jest.Mock).mockResolvedValueOnce([mockEmployee]);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(json)).toBe(true);
    expect(json).toHaveLength(1);
    expect(json[0].employeeCode).toBe('EMP001');
  });

  it('retorna arreglo vacío cuando no hay empleados', async () => {
    (prisma.employee.findMany as jest.Mock).mockResolvedValueOnce([]);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual([]);
  });

  it('retorna 500 cuando Prisma lanza un error', async () => {
    (prisma.employee.findMany as jest.Mock).mockRejectedValueOnce(
      new Error('DB connection failed')
    );

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.error).toBe('Failed to fetch employees');
  });
});

// ─── POST /api/employees-data ────────────────────────────────────────────────
describe('POST /api/employees-data', () => {
  const validBody = {
    firstName: 'María',
    firstSurname: 'López',
    fullName: 'María López',
    email: 'maria@avante.com',
    hireDate: '2024-03-01',
    baseSalary: 800,
    currencyId: 'curr-1',
    employeeCode: 'EMP002',
    locationId: 'loc-1',
    positionId: 'pos-1',
    countryId: 'ctry-1',
  };

  it('crea empleado con datos válidos y retorna 201', async () => {
    (prisma.employee.create as jest.Mock).mockResolvedValueOnce({
      ...mockEmployee,
      id: 'emp-2',
      firstName: 'María',
      employeeCode: 'EMP002',
    });

    const request = buildRequest(validBody);
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.employeeCode).toBe('EMP002');
    expect(prisma.employee.create).toHaveBeenCalledTimes(1);
  });

  it('retorna 500 cuando Prisma rechaza la creación', async () => {
    (prisma.employee.create as jest.Mock).mockRejectedValueOnce(
      new Error('Unique constraint violation')
    );

    const request = buildRequest(validBody);
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.error).toBe('Failed to create employee');
  });

  it('edge case: hireDate inválido no provoca crash silencioso', async () => {
    (prisma.employee.create as jest.Mock).mockRejectedValueOnce(
      new Error('Invalid date')
    );

    const request = buildRequest({ ...validBody, hireDate: 'not-a-date' });
    const response = await POST(request);

    expect(response.status).toBe(500);
  });
});
