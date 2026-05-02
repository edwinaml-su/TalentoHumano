/**
 * Integration tests for GET /api/config/positions
 */

jest.mock('@/lib/prisma', () => ({
  prisma: {
    position: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));
import { prisma } from '@/lib/prisma';
import { GET } from '@/app/api/config/positions/route';

const mockPositions = [
  {
    id: 'pos-1',
    title: 'Enfermero/a',
    description: null,
    departmentId: 'dept-1',
    department: { id: 'dept-1', name: 'Enfermería' },
  },
  {
    id: 'pos-2',
    title: 'Médico General',
    description: null,
    departmentId: 'dept-2',
    department: { id: 'dept-2', name: 'Medicina' },
  },
];

describe('GET /api/config/positions', () => {
  it('retorna lista de posiciones con sus departamentos', async () => {
    (prisma.position.findMany as jest.Mock).mockResolvedValueOnce(mockPositions);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(json)).toBe(true);
    expect(json).toHaveLength(2);
  });

  it('cada posición incluye la relación department', async () => {
    (prisma.position.findMany as jest.Mock).mockResolvedValueOnce(mockPositions);

    const response = await GET();
    const json = await response.json();

    expect(json[0].department).toBeDefined();
    expect(json[0].department.name).toBe('Enfermería');
  });

  it('retorna lista vacía cuando no hay posiciones', async () => {
    (prisma.position.findMany as jest.Mock).mockResolvedValueOnce([]);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual([]);
  });

  it('ordena las posiciones por título (asc) — verifica que Prisma recibe el orderBy correcto', async () => {
    (prisma.position.findMany as jest.Mock).mockResolvedValueOnce(mockPositions);

    await GET();

    const callArgs = (prisma.position.findMany as jest.Mock).mock.calls[0][0];
    expect(callArgs.orderBy).toEqual({ title: 'asc' });
  });

  it('retorna 500 cuando Prisma lanza un error', async () => {
    (prisma.position.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB fail'));

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.error).toBe('Error fetching positions');
  });
});
