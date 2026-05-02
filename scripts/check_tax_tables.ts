import { PrismaClient } from '../src/generated/client/index.js';

const prisma = new PrismaClient();

async function check() {
  const tables = await prisma.taxTable.findMany({
    include: { brackets: true }
  });
  console.log("Found Tables:", tables.length);
  tables.forEach(t => {
    console.log(`Table: ${t.name}, Frequency: ${t.frequency}, Brackets: ${t.brackets.length}`);
  });
}

check().finally(() => prisma.$disconnect());
