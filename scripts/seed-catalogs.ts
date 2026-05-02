// Seed inicial para catálogos de Nómina y RRHH
// Ejecutar: npx ts-node scripts/seed-catalogs.ts

import { PrismaClient } from "../src/generated/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding catalog data...");

  // --- ContractTypes ---
  const contractTypes = ["Indefinido", "Plazo Fijo", "Obra o Servicio", "Aprendizaje", "Período de Prueba"];
  for (const name of contractTypes) {
    await prisma.contractType.upsert({ where: { name }, update: {}, create: { name } });
  }
  console.log("✅ ContractTypes:", contractTypes.length);

  // --- Banks (El Salvador) ---
  const banks = [
    { name: "Banco Agrícola", code: "032" },
    { name: "Davivienda El Salvador", code: "030" },
    { name: "BAC El Salvador", code: "020" },
    { name: "Promerica", code: "036" },
    { name: "HSBC El Salvador", code: "028" },
    { name: "Banco Cuscatlán", code: "026" },
    { name: "Banco Azteca", code: "059" },
    { name: "Banco de América Central (BAC)", code: "024" },
  ];
  for (const bank of banks) {
    await prisma.bank.upsert({ where: { name: bank.name }, update: { code: bank.code }, create: bank });
  }
  console.log("✅ Banks:", banks.length);

  // --- AfpTypes (El Salvador) ---
  const afpTypes = [
    { name: "AFP CRECER", code: "CRE", rate: 0.0725 },
    { name: "AFP CONFIA", code: "CON", rate: 0.0725 },
    { name: "IPSFA", code: "IPS", rate: 0.065 },
  ];
  for (const afp of afpTypes) {
    await prisma.afpType.upsert({ where: { name: afp.name }, update: { rate: afp.rate }, create: afp });
  }
  console.log("✅ AfpTypes:", afpTypes.length);

  console.log("🎉 Catalog seed complete!");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
