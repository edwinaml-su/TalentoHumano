import { PrismaClient } from '../src/generated/client/index.js';

const prisma = new PrismaClient();

async function main() {
  const sv = await prisma.country.findFirst({ where: { isoCode: 'SV' } });
  if (!sv) throw new Error("Country SV not found");

  console.log("Seeding ISR Tables for El Salvador...");

  // 1. Monthly Table
  await prisma.taxTable.create({
    data: {
      name: "ISR El Salvador - Mensual (Decreto 75)",
      countryId: sv.id,
      frequency: "MONTHLY",
      brackets: {
        create: [
          { fromAmount: 0.01, toAmount: 316.67, fixedAmount: 0, percentage: 0, excessOf: 0, order: 1 },
          { fromAmount: 316.68, toAmount: 469.05, fixedAmount: 4.77, percentage: 0.10, excessOf: 316.67, order: 2 },
          { fromAmount: 469.06, toAmount: 761.91, fixedAmount: 4.77, percentage: 0.10, excessOf: 228.57, order: 3 },
          { fromAmount: 761.92, toAmount: 1904.69, fixedAmount: 60.00, percentage: 0.20, excessOf: 761.91, order: 4 },
          { fromAmount: 1904.70, toAmount: null, fixedAmount: 228.57, percentage: 0.30, excessOf: 1904.69, order: 5 },
        ]
      }
    }
  });

  // 2. Biweekly Table
  await prisma.taxTable.create({
    data: {
      name: "ISR El Salvador - Quincenal (Decreto 75)",
      countryId: sv.id,
      frequency: "BIWEEKLY",
      brackets: {
        create: [
          { fromAmount: 0.01, toAmount: 158.33, fixedAmount: 0, percentage: 0, excessOf: 0, order: 1 },
          { fromAmount: 158.34, toAmount: 234.52, fixedAmount: 2.38, percentage: 0.10, excessOf: 158.33, order: 2 },
          { fromAmount: 234.53, toAmount: 380.95, fixedAmount: 2.38, percentage: 0.10, excessOf: 114.29, order: 3 },
          { fromAmount: 380.96, toAmount: 952.34, fixedAmount: 30.00, percentage: 0.20, excessOf: 380.95, order: 4 },
          { fromAmount: 952.35, toAmount: null, fixedAmount: 114.29, percentage: 0.30, excessOf: 952.34, order: 5 },
        ]
      }
    }
  });

  // 3. Weekly Table
  await prisma.taxTable.create({
    data: {
      name: "ISR El Salvador - Semanal (Decreto 75)",
      countryId: sv.id,
      frequency: "WEEKLY",
      brackets: {
        create: [
          { fromAmount: 0.01, toAmount: 79.17, fixedAmount: 0, percentage: 0, excessOf: 0, order: 1 },
          { fromAmount: 79.18, toAmount: 117.26, fixedAmount: 1.19, percentage: 0.10, excessOf: 79.17, order: 2 },
          { fromAmount: 117.27, toAmount: 190.48, fixedAmount: 1.19, percentage: 0.10, excessOf: 57.14, order: 3 },
          { fromAmount: 190.49, toAmount: 476.11, fixedAmount: 15.00, percentage: 0.20, excessOf: 190.48, order: 4 },
          { fromAmount: 476.12, toAmount: null, fixedAmount: 57.14, percentage: 0.30, excessOf: 476.11, order: 5 },
        ]
      }
    }
  });

  console.log("ISR Tables seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
