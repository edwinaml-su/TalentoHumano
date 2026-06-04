import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-utils";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 1. Fetch employees in "Riesgo" or "Bajo Desempeño" cells
    // (In a real scenario, this would be based on the latest 9-box data)
    const criticalEmployees = await prisma.employee.findMany({
      where: {
        performanceReviews: {
          some: {
            score: { lt: 5 } // Low performance
          }
        },
        terminationDate: null
      },
      include: {
        enrollments: true
      }
    });

    // 2. Assign a default "Mejora de Desempeño" course if not already enrolled
    // For simulation, we'll look for a course named "Plan de Mejora"
    const pdiCourse = await prisma.trainingCourse.findFirst({
      where: { title: { contains: "Desempeño" } }
    });

    if (!pdiCourse) {
      return NextResponse.json({ message: "No se encontró curso de PDI adecuado." });
    }

    const assignments = await Promise.all(criticalEmployees.map(async (emp) => {
      const isEnrolled = emp.enrollments.some(en => en.courseId === pdiCourse.id);
      if (!isEnrolled) {
        return prisma.trainingEnrollment.create({
          data: {
            employeeId: emp.id,
            courseId: pdiCourse.id,
            status: "ENROLLED"
          }
        });
      }
      return null;
    }));

    return NextResponse.json({
      message: "Sincronización de PDI completada",
      assignedCount: assignments.filter(a => a !== null).length
    });
  } catch (error) {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
