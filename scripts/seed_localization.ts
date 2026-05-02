import { PrismaClient } from '../src/generated/client/index.js';

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding localization data (Countries & Currencies)...");

  // --- Currencies ---
  const usd = await prisma.currency.upsert({
    where: { code: 'USD' },
    update: {},
    create: {
      code: 'USD',
      name: 'United States Dollar',
      symbol: '$'
    }
  });

  // --- Countries ---
  const sv = await prisma.country.upsert({
    where: { isoCode: 'SV' },
    update: { currencyId: usd.id },
    create: {
      isoCode: 'SV',
      name: 'El Salvador',
      currencyId: usd.id
    }
  });

  console.log("✅ Localization seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
