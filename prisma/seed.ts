import { PrismaClient } from '../src/generated/client'
import "dotenv/config";
import bcrypt from "bcrypt";

const prisma = new PrismaClient()

async function main() {
  console.log("🚀 Starting Comprehensive Multi-Org & Employee Seeding...");

  // 1. Core Config (Currencies)
  const usd = await prisma.currency.upsert({
    where: { code: 'USD' }, update: {}, create: { code: 'USD', symbol: '$', name: 'US Dollar' }
  });
  const gtq = await prisma.currency.upsert({
    where: { code: 'GTQ' }, update: {}, create: { code: 'GTQ', symbol: 'Q', name: 'Quetzal' }
  });

  // 2. Countries
  const sv = await prisma.country.upsert({
    where: { isoCode: 'SV' }, update: {}, create: { name: 'El Salvador', isoCode: 'SV', currencyId: usd.id }
  });
  const gt = await prisma.country.upsert({
    where: { isoCode: 'GT' }, update: {}, create: { name: 'Guatemala', isoCode: 'GT', currencyId: gtq.id }
  });

  // 4. Organizations & Units (Locations)
  const orgSV = await prisma.organization.upsert({
    where: { taxId: 'SV-001' },
    update: {},
    create: { taxId: 'SV-001', legalName: 'SV Corp SA', commercialName: 'SV Unit', countryId: sv.id }
  });

  const orgGT = await prisma.organization.upsert({
    where: { taxId: 'GT-001' },
    update: {},
    create: { taxId: 'GT-001', legalName: 'GT Solutions SA', commercialName: 'GT Unit', countryId: gt.id }
  });

  // 3. Departments & Positions (Linked to Org)
  const getDept = async (name: string, orgId: string) => {
    let dept = await prisma.department.findFirst({ where: { name, organizationId: orgId } });
    if (!dept) {
      dept = await prisma.department.create({ data: { name, organizationId: orgId } });
    }
    return dept;
  };

  const getPos = async (title: string, deptId: string) => {
    let pos = await prisma.position.findFirst({ where: { title, departmentId: deptId } });
    if (!pos) {
      pos = await prisma.position.create({ data: { title, departmentId: deptId } });
    }
    return pos;
  };

  const deptIT_SV = await getDept('Informática', orgSV.id);
  const deptOps_SV = await getDept('Operaciones', orgSV.id);
  const deptIT_GT = await getDept('Informática', orgGT.id);

  const posDev = await getPos('Desarrollador Senior', deptIT_SV.id);
  const posManager = await getPos('Gerente Operativo', deptOps_SV.id);
  const posDevGT = await getPos('Software Engineer', deptIT_GT.id);

  const locSV1 = await prisma.location.upsert({
    where: { id: 'loc-sv-001' },
    update: { name: 'San Salvador Central' },
    create: { id: 'loc-sv-001', name: 'San Salvador Central', organizationId: orgSV.id }
  });
  const locSV2 = await prisma.location.upsert({
    where: { id: 'loc-sv-002' },
    update: { name: 'Santa Ana Branch' },
    create: { id: 'loc-sv-002', name: 'Santa Ana Branch', organizationId: orgSV.id }
  });

  const locGT1 = await prisma.location.upsert({
    where: { id: 'loc-gt-001' },
    update: { name: 'Guatemala City HQ' },
    create: { id: 'loc-gt-001', name: 'Guatemala City HQ', organizationId: orgGT.id }
  });

  // 5. User Roles & Assignments
  const corpRole = await prisma.role.upsert({
    where: { name: 'Corporativo Multinacional' },
    update: { isCorporate: true },
    create: { name: 'Corporativo Multinacional', isCorporate: true, description: 'Acceso global multi-país' }
  });

  const hashedPassword = await bcrypt.hash('admin123', 10);
  const globalUser = await prisma.user.upsert({
    where: { email: 'admin@global.com' },
    update: {},
    create: { email: 'admin@global.com', passwordHash: hashedPassword }
  });

  const allLocs = [locSV1, locSV2, locGT1];
  for (const loc of allLocs) {
    await prisma.userUnitAssignment.upsert({
      where: { userId_locationId_roleId: { userId: globalUser.id, locationId: loc.id, roleId: corpRole.id } },
      update: {},
      create: { userId: globalUser.id, locationId: loc.id, roleId: corpRole.id, isDefault: loc.id === locSV1.id }
    });
  }

  // Cost Centers
  const ccVentas = await prisma.costCenter.upsert({
    where: { code: 'CC-VNT-01' },
    update: {},
    create: { code: 'CC-VNT-01', name: 'Ventas Centro', locationId: locSV1.id, budget: 50000.00 }
  });
  const ccOps = await prisma.costCenter.upsert({
    where: { code: 'CC-OPS-01' },
    update: {},
    create: { code: 'CC-OPS-01', name: 'Operaciones Generales', locationId: locSV1.id, budget: 150000.00 }
  });

  // Shifts
  const shiftDiurno = await prisma.shift.upsert({
    where: { id: 'shift-diurno-admin' },
    update: {},
    create: { id: 'shift-diurno-admin', name: 'Diurno Administrativo', startTime: '08:00', endTime: '17:00', gracePeriod: 15, isOvernight: false, organizationId: orgSV.id }
  });

  // Contracts
  const contractIndef = await prisma.contractType.upsert({
    where: { name: 'Tiempo Indefinido' },
    update: {},
    create: { name: 'Tiempo Indefinido' }
  });

  // Afp Options
  const afpConfia = await prisma.afpType.upsert({
    where: { name: 'AFP Confia' },
    update: {},
    create: { name: 'AFP Confia', rate: 0.0725 }
  });

  // Banks
  const bAgr = await prisma.bank.upsert({
    where: { name: 'Banco Agrícola' },
    update: {},
    create: { name: 'Banco Agrícola', code: 'BA-001' }
  });
  const bDav = await prisma.bank.upsert({
    where: { name: 'Davivienda' },
    update: {},
    create: { name: 'Davivienda', code: 'DV-002' }
  });

  // 6. Employees Population
  const employeesData = [
    {
      code: 'EMP-001',
      first: 'Andrea',
      last: 'Flandez',
      dui: '06517100-6',
      locationId: locSV1.id,
      positionId: posManager.id,
      countryId: sv.id,
      salary: 1200.00,
      currencyId: usd.id,
      shiftId: shiftDiurno.id,
      costCenterId: ccOps.id,
      contractTypeId: contractIndef.id,
      afpTypeId: afpConfia.id,
      bankId: bAgr.id
    },
    {
      code: 'EMP-002',
      first: 'Juan',
      last: 'Perez',
      dui: '12345678-9',
      locationId: locSV2.id,
      positionId: posDev.id,
      countryId: sv.id,
      salary: 850.00,
      currencyId: usd.id,
      shiftId: shiftDiurno.id,
      costCenterId: ccOps.id,
      contractTypeId: contractIndef.id,
      afpTypeId: afpConfia.id,
      bankId: bAgr.id
    },
    {
      code: 'EMP-003',
      first: 'Maria',
      last: 'Gomez',
      dui: '98765432-1',
      locationId: locGT1.id,
      positionId: posDevGT.id,
      countryId: gt.id,
      salary: 15000.00, // GTQ
      currencyId: gtq.id,
      shiftId: shiftDiurno.id,
      costCenterId: ccVentas.id,
      contractTypeId: contractIndef.id,
      afpTypeId: afpConfia.id,
      bankId: bDav.id
    },
    {
      code: 'EMP-004',
      first: 'Roberto',
      last: 'Castillo',
      dui: '06783100-6',
      locationId: locSV1.id,
      positionId: posDev.id,
      countryId: sv.id,
      salary: 950.00,
      currencyId: usd.id,
      shiftId: shiftDiurno.id,
      costCenterId: ccOps.id,
      contractTypeId: contractIndef.id,
      afpTypeId: afpConfia.id,
      bankId: bDav.id
    }
  ];

  // 7. Tax Tables (El Salvador ISR)
  console.log("📊 Seeding Tax Tables...");
  const isrSV = await prisma.taxTable.upsert({
    where: { id: 'isr-sv-monthly' },
    update: {},
    create: {
      id: 'isr-sv-monthly',
      name: 'ISR El Salvador (Mensual)',
      countryId: sv.id,
      frequency: 'MONTHLY'
    }
  });

  const brackets = [
    { from: 0.01, to: 472.00, fixed: 0, percent: 0, excess: 0, order: 1 },
    { from: 472.01, to: 895.24, fixed: 17.67, percent: 0.10, excess: 472.00, order: 2 },
    { from: 895.25, to: 2038.10, fixed: 60.00, percent: 0.20, excess: 895.24, order: 3 },
    { from: 2038.11, to: null, fixed: 288.57, percent: 0.30, excess: 2038.10, order: 4 },
  ];

  for (const b of brackets) {
    await prisma.taxBracket.upsert({
      where: { id: `bracket-sv-m-${b.order}` },
      update: {
        fromAmount: b.from,
        toAmount: b.to,
        fixedAmount: b.fixed,
        percentage: b.percent,
        excessOf: b.excess,
        order: b.order
      },
      create: {
        id: `bracket-sv-m-${b.order}`,
        taxTableId: isrSV.id,
        fromAmount: b.from,
        toAmount: b.to,
        fixedAmount: b.fixed,
        percentage: b.percent,
        excessOf: b.excess,
        order: b.order
      }
    });
  }

  console.log("👥 Seeding Employees...");
  for (const emp of employeesData) {
    const createdEmp = await prisma.employee.upsert({
      where: { employeeCode: emp.code },
      update: {
        locationId: emp.locationId,
        positionId: emp.positionId,
        dui: emp.dui,
        shiftId: emp.shiftId,
        costCenterId: emp.costCenterId,
        contractTypeId: emp.contractTypeId,
        afpTypeId: emp.afpTypeId,
        bankId: emp.bankId
      },
      create: {
        employeeCode: emp.code,
        firstName: emp.first,
        firstSurname: emp.last,
        fullName: `${emp.first} ${emp.last}`,
        dui: emp.dui,
        hireDate: new Date('2024-01-01'),
        locationId: emp.locationId,
        positionId: emp.positionId,
        countryId: emp.countryId,
        status: 'ACTIVE',
        shiftId: emp.shiftId,
        costCenterId: emp.costCenterId,
        contractTypeId: emp.contractTypeId,
        afpTypeId: emp.afpTypeId,
        bankId: emp.bankId
      }
    });

    const existingSalary = await prisma.salaryHistory.findFirst({
      where: { employeeId: createdEmp.id }
    });

    if (!existingSalary) {
      await prisma.salaryHistory.create({
        data: {
          employeeId: createdEmp.id,
          amount: emp.salary,
          currencyId: emp.currencyId,
          effectiveDate: new Date('2024-01-01')
        }
      });
    }
  }

  console.log('✅ Comprehensive Seeding complete.');
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
