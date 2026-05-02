import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const positionSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().optional().nullable(),
  departmentId: z.string().min(1, "El departamento es requerido"),
  parentPositionId: z.string().optional().nullable().transform(val => val === "" ? null : val)
});

export async function GET() {
  try {
    const positions = await prisma.position.findMany({
      where: { isActive: true },
      include: {
        department: {
          select: { id: true, name: true, organizationId: true }
        },
        parentPosition: true,
        _count: {
          select: { employees: true, subordinates: true }
        }
      },
      orderBy: { title: 'asc' }
    });
    return NextResponse.json(positions);
  } catch (error) {
    console.error("Error fetching positions:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = positionSchema.parse(body);

    const position = await prisma.position.create({
      data: validatedData
    });

    return NextResponse.json(position, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors[0].message }, { status: 400 });
    }
    console.error("Error creating position:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
