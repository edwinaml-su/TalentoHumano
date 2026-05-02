import { PrismaClient } from '../src/generated/client';
const prisma = new PrismaClient();

async function findIds() {
  const unit = await prisma.location.findFirst();
  const emp = await prisma.employee.findFirst({ where: { locationId: unit?.id } });
  
  if (unit && emp) {
    console.log(`VALID_UNIT_ID=${unit.id}`);
    console.log(`VALID_EMP_ID=${emp.id}`);
  } else {
    console.error("No units or employees found in DB");
  }
}

findIds().catch(console.error).finally(() => prisma.$disconnect());
