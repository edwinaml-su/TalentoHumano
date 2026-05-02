import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const shifts = await prisma.shift.findMany({
      where: { isActive: true },
      include: {
        departments: { select: { id: true, name: true } },
        locations: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(shifts);
  } catch (error) {
    return NextResponse.json({ error: "Error fetching shifts" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { name, startTime, endTime, gracePeriod, departments, locations } = data;
    
    // Validación de QAF: No se permiten tolerancias negativas
    if (gracePeriod < 0) {
      return NextResponse.json({ error: "El tiempo de tolerancia no puede ser negativo" }, { status: 400 });
    }

    // Validación de QAF: Turnos nocturnos
    const isOvernight = startTime > endTime;
    
    // Get organization ID from a default or session (mocking for now)
    const org = await prisma.organization.findFirst();
    if (!org) throw new Error("No organization found");

    const shift = await prisma.shift.create({
      data: {
        name,
        startTime,
        endTime,
        gracePeriod,
        isOvernight,
        organizationId: org.id,
        departments: {
          connect: departments.map((d: any) => ({ id: d.id }))
        },
        locations: {
          connect: locations.map((l: any) => ({ id: l.id }))
        }
      }
    });
    return NextResponse.json(shift);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
