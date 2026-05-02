/**
 * Integration tests for GET /api/config/shifts and POST /api/config/shifts
 * Key edge case: POST returns 500 when no organization exists in DB.
 */

jest.mock('@/lib/prisma', () => ({
  prisma: {
    shift: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    organization: {
      findFirst: jest.fn(),
    },
  },
}));
import { prisma } from '@/lib/prisma';
import { GET, POST } from '@/app/api/config/shifts/route';

const mockShift = {
  id: 'shift-1',
  name: 'Turno Diurno',
  startTime: '08:00',
  endTime: '16:00',
  gracePeriod: 15,
  organizationId: 'org-1',
  departments: [{ id: 'dept-1', name: 'Enfermería' }],
  locations: [{ id: 'loc-1', name: 'Sede Central' }],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockOrg = { id: 'org-1', legalName: 'Inversiones Avante' };

// ─── GET /api/config/shifts ───────────────────────────────────────────────────
describe('GET /api/config/shifts', () => {
  it('retorna todos los turnos con sus departamentos y ubicaciones', async () => {
    (prisma.shift.findMany as jest.Mock).mockResolvedValueOnce([mockShift]);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toHaveLength(1);
    expect(json[0].name).toBe('Turno Diurno');
    expect(json[0].departments).toBeDefined();
    expect(json[0].locations).toBeDefined();
  });

  it('retorna arreglo vacío si no hay turnos', async () => {
    (prisma.shift.findMany as jest.Mock).mockResolvedValueOnce([]);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual([]);
  });

  it('retorna 500 cuando Prisma falla', async () => {
    (prisma.shift.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB fail'));

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.error).toBe('Error fetching shifts');
  });
});

// ─── POST /api/config/shifts ──────────────────────────────────────────────────
describe('POST /api/config/shifts', () => {
  const validBody = {
    name: 'Turno Nocturno',
    startTime: '22:00',
    endTime: '06:00',
    gracePeriod: 10,
    departments: [{ id: 'dept-1' }],
    locations: [{ id: 'loc-1' }],
  };

  it('crea turno con organización existente', async () => {
    (prisma.organization.findFirst as jest.Mock).mockResolvedValueOnce(mockOrg);
    (prisma.shift.create as jest.Mock).mockResolvedValueOnce({
      ...mockShift,
      name: 'Turno Nocturno',
    });

    const request = new Request('http://localhost/api/config/shifts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.name).toBe('Turno Nocturno');
    expect(prisma.shift.create).toHaveBeenCalledTimes(1);
  });

  it('crea turno con arreglos vacíos de departments y locations', async () => {
    (prisma.organization.findFirst as jest.Mock).mockResolvedValueOnce(mockOrg);
    (prisma.shift.create as jest.Mock).mockResolvedValueOnce({
      ...mockShift,
      departments: [],
      locations: [],
    });

    const request = new Request('http://localhost/api/config/shifts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...validBody, departments: [], locations: [] }),
    });
    const response = await POST(request);

    expect(response.status).toBe(200);
  });

  it('⚠️ EDGE CASE: retorna 500 cuando no existe ninguna organización en la BD', async () => {
    // This is a known weak point in the current API implementation
    (prisma.organization.findFirst as jest.Mock).mockResolvedValueOnce(null);

    const request = new Request('http://localhost/api/config/shifts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.error).toBe('No organization found');
    expect(prisma.shift.create).not.toHaveBeenCalled();
  });
});
