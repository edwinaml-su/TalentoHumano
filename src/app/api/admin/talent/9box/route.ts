import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-utils";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Fetch employees with their latest performance reviews
    const employees = await prisma.employee.findMany({
      where: { terminationDate: null },
      include: {
        performanceReviews: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        position: true
      }
    });

    const matrix = employees.map(e => {
      const latestReview = e.performanceReviews[0];
      const performance = latestReview ? Number(latestReview.score) : 0;
      // Potential is currently mocked as a fixed value or based on goals, 
      // in a real app it would be a separate assessment.
      const potential = Math.random() * 10; 

      return {
        id: e.id,
        name: `${e.firstName} ${e.firstSurname}`,
        position: e.position?.title,
        performance: parseFloat(performance.toFixed(1)),
        potential: parseFloat(potential.toFixed(1)),
        // Map to 9-box category
        category: get9BoxCategory(performance, potential)
      };
    });

    return NextResponse.json(matrix);
  } catch (error) {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

function get9BoxCategory(perf: number, pot: number) {
  if (perf >= 7 && pot >= 7) return "Estrella";
  if (perf >= 7 && pot >= 4) return "Alto Potencial";
  if (perf >= 7) return "Profesional de Élite";
  if (pot >= 7 && perf >= 4) return "Enigma";
  if (pot >= 4 && perf >= 4) return "Columna Vertebral";
  if (perf >= 4) return "Diligente";
  if (pot >= 7) return "Diamante en Bruto";
  if (pot >= 4) return "Potencial Inconsistente";
  return "Bajo Desempeño";
}
