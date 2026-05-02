/**
 * Integration tests for GET /api/attendance and POST /api/attendance
 * Covers clock-in, clock-out, filtering, and the critical edge case of
 * attempting clock-out with no open attendance record.
 */

jest.mock('@/lib/prisma', () => ({
  prisma: {
    attendance: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));
import { prisma } from '@/lib/prisma';
import { GET, POST } from '@/app/api/attendance/route';

function buildRequest(body: object, url = 'http://localhost/api/attendance'): Request {
  return new Request(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const mockAttendance = {
  id: 'att-1',
  employeeId: 'emp-1',
  date: new Date('2026-03-18'),
  clockIn: new Date('2026-03-18T08:00:00'),
  clockOut: null,
  status: 'PRESENT',
  lateMinutes: 0,
  overtimeMinutes: 0,
  employee: {
    fullName: 'Juan Pérez',
    employeeCode: 'EMP001',
    location: { name: 'Sede Central' },
    position: { title: 'Enfermero' },
  },
  shift: null,
};

// ─── GET /api/attendance ─────────────────────────────────────────────────────
describe('GET /api/attendance', () => {
  it('retorna asistencias del día actual con status 200', async () => {
    (prisma.attendance.findMany as jest.Mock).mockResolvedValueOnce([mockAttendance]);

    const request = new Request('http://localhost/api/attendance');
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(json)).toBe(true);
    expect(json[0].employeeId).toBe('emp-1');
  });

  it('acepta parámetro date y filtra por esa fecha', async () => {
    (prisma.attendance.findMany as jest.Mock).mockResolvedValueOnce([]);

    const request = new Request('http://localhost/api/attendance?date=2026-03-01');
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual([]);

    // Verify filter was applied with startOfDay/endOfDay range
    const callArgs = (prisma.attendance.findMany as jest.Mock).mock.calls[0][0];
    expect(callArgs.where.date.gte).toBeInstanceOf(Date);
    expect(callArgs.where.date.lte).toBeInstanceOf(Date);
  });

  it('filtra por unitIds cuando se proporcionan', async () => {
    (prisma.attendance.findMany as jest.Mock).mockResolvedValueOnce([]);

    const request = new Request(
      'http://localhost/api/attendance?unitIds=loc-1,loc-2'
    );
    const response = await GET(request);

    expect(response.status).toBe(200);
    const callArgs = (prisma.attendance.findMany as jest.Mock).mock.calls[0][0];
    expect(callArgs.where.employee.locationId.in).toEqual(['loc-1', 'loc-2']);
  });

  it('retorna 500 cuando Prisma falla', async () => {
    (prisma.attendance.findMany as jest.Mock).mockRejectedValueOnce(
      new Error('DB error')
    );

    const request = new Request('http://localhost/api/attendance');
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.error).toBe('Failed to fetch attendance');
  });
});

// ─── POST /api/attendance (Clock-IN) ─────────────────────────────────────────
describe('POST /api/attendance — Clock IN', () => {
  it('registra entrada (clock-in) y retorna 201', async () => {
    (prisma.attendance.create as jest.Mock).mockResolvedValueOnce({
      ...mockAttendance,
      status: 'PRESENT',
    });

    const request = buildRequest({
      employeeId: 'emp-1',
      type: 'IN',
      clockTime: '2026-03-18T08:05:00',
      locationId: 'loc-1',
    });
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.employeeId).toBe('emp-1');
    expect(prisma.attendance.create).toHaveBeenCalledTimes(1);
  });
});

// ─── POST /api/attendance (Clock-OUT) ────────────────────────────────────────
describe('POST /api/attendance — Clock OUT', () => {
  it('registra salida (clock-out) cuando existe un registro abierto', async () => {
    (prisma.attendance.findFirst as jest.Mock).mockResolvedValueOnce(mockAttendance);
    (prisma.attendance.update as jest.Mock).mockResolvedValueOnce({
      ...mockAttendance,
      clockOut: new Date('2026-03-18T17:00:00'),
    });

    const request = buildRequest({
      employeeId: 'emp-1',
      type: 'OUT',
      clockTime: '2026-03-18T17:00:00',
    });
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.clockOut).toBeDefined();
  });

  it('⚠️ EDGE CASE: retorna 400 si no existe clock-in abierto para hoy', async () => {
    // This is the critical guard the API implements
    (prisma.attendance.findFirst as jest.Mock).mockResolvedValueOnce(null);

    const request = buildRequest({
      employeeId: 'emp-1',
      type: 'OUT',
      clockTime: '2026-03-18T17:00:00',
    });
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe('No open clock-in found for today');
    expect(prisma.attendance.update).not.toHaveBeenCalled();
  });

  it('retorna 500 cuando Prisma falla en clock-out', async () => {
    (prisma.attendance.findFirst as jest.Mock).mockResolvedValueOnce(mockAttendance);
    (prisma.attendance.update as jest.Mock).mockRejectedValueOnce(
      new Error('DB error')
    );

    const request = buildRequest({
      employeeId: 'emp-1',
      type: 'OUT',
      clockTime: '2026-03-18T17:00:00',
    });
    const response = await POST(request);

    expect(response.status).toBe(500);
  });
});
