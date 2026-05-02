import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const firstNames = ["Juan", "Maria", "Jose", "Ana", "Carlos", "Elena", "Luis", "Carmen", "Mario", "Rosa", "Jorge", "Lucia", "Pedro", "Sofia", "Miguel", "Isabel", "Rafael", "Blanca", "Francisco", "Gloria"];
const lastNames = ["Garcia", "Rodriguez", "Lopez", "Martinez", "Gonzalez", "Hernandez", "Perez", "Sanchez", "Ramirez", "Torres", "Flores", "Rivera", "Gomez", "Diaz", "Cruz", "Morales", "Reyes", "Gutierrez", "Ortiz", "Castillo"];

async function main() {
  console.log("Starting seeding of 50 employees for El Salvador...");

  const countryId = "cmmuous850003f49chzwnxg2n";
  const locationId = "loc-sv-001";
  const positionId = "cmmuous8f000hf49cq13ddoyv";
  const currencyId = "cmmuous800000f49c0rwg2se3";

  for (let i = 1; i <= 50; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const firstSurname = lastNames[Math.floor(Math.random() * lastNames.length)];
    const secondSurname = lastNames[Math.floor(Math.random() * lastNames.length)];
    const code = `EMP-SV-${i.toString().padStart(3, '0')}`;
    const dui = `${Math.floor(10000000 + Math.random() * 90000000)}-${Math.floor(Math.random() * 10)}`;
    const nit = `${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(100000 + Math.random() * 900000)}-${Math.floor(100 + Math.random() * 900)}-${Math.floor(Math.random() * 10)}`;
    const salary = 500 + Math.floor(Math.random() * 2500);

    const employee = await prisma.employee.create({
      data: {
        employeeCode: code,
        firstName,
        firstSurname,
        secondSurname,
        fullName: `${firstName} ${firstSurname} ${secondSurname}`,
        dui,
        nit,
        hireDate: new Date("2024-01-01"),
        status: "ACTIVE",
        locationId,
        positionId,
        countryId,
        salaryHistory: {
          create: {
            amount: salary,
            currencyId,
            effectiveDate: new Date("2024-01-01")
          }
        }
      }
    });
    console.log(`Created employee ${i}/50: ${employee.fullName} (${code})`);
  }

  console.log("Seeding finished successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
