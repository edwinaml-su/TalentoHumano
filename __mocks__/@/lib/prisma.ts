// Shared Prisma mock — used by all API route tests
// Jest automatically picks this up when jest.mock('@/lib/prisma') is called

const prismaMock = {
  employee: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  attendance: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  payrollIncident: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
  payrollRun: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  shift: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  position: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
  department: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  organization: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
  },
  country: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
  },
  taxTable: {
    findFirst: jest.fn(),
  },
  gerencia: {
    findMany: jest.fn(),
  },
  location: {
    findMany: jest.fn(),
  },
};

export const prisma = prismaMock;
