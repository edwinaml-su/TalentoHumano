import { PrismaClient } from "../src/generated/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Performance Goals...");

  const employees = await prisma.employee.findMany({
    take: 5,
    include: { position: true }
  });

  for (const emp of employees) {
    // Goal 1: Operational
    await prisma.performanceGoal.create({
      data: {
        employeeId: emp.id,
        title: `Optimización de procesos en ${emp.position?.title || 'Departamento'}`,
        description: "Reducir el tiempo de respuesta en solicitudes internas en un 15%.",
        weight: 40,
        targetValue: "15%",
        startDate: new Date("2026-01-01"),
        endDate: new Date("2026-06-30"),
        status: "IN_PROGRESS"
      }
    });

    // Goal 2: Strategic
    await prisma.performanceGoal.create({
      data: {
        employeeId: emp.id,
        title: "Capacitación Técnica Avanzada",
        description: "Completar al menos 2 certificaciones relevantes para el puesto.",
        weight: 30,
        targetValue: "2 Certificaciones",
        startDate: new Date("2026-01-01"),
        endDate: new Date("2026-12-31"),
        status: "IN_PROGRESS"
      }
    });

    // Goal 3: Soft Skills
    await prisma.performanceGoal.create({
      data: {
        employeeId: emp.id,
        title: "Liderazgo y Colaboración",
        description: "Participar activamente en el programa de mentores de Inversiones Avante.",
        weight: 30,
        targetValue: "Mentoria activa",
        startDate: new Date("2026-01-01"),
        endDate: new Date("2026-12-31"),
        status: "IN_PROGRESS"
      }
    });
  }

  console.log("✅ Performance Goals seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
