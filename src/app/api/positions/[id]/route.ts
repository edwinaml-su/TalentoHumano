import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const positionSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().optional().nullable(),
  departmentId: z.string().min(1, "El departamento es requerido"),
  parentPositionId: z.string().optional().nullable().transform(val => val === "" ? null : val)
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const validatedData = positionSchema.parse(body);

    if (validatedData.parentPositionId === id) {
      return NextResponse.json({ error: "Una posición no puede ser su propio superior" }, { status: 400 });
    }

    const position = await prisma.position.update({
      where: { id },
      data: validatedData
    });

    return NextResponse.json(position);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors[0].message }, { status: 400 });
    }
    console.error("Error updating position:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if there are subordinates or employees
    const pos = await prisma.position.findUnique({
      where: { id },
      include: { _count: { select: { subordinates: true, employees: true } } }
    });

    if (pos?._count.employees! > 0 || pos?._count.subordinates! > 0) {
      return NextResponse.json({ 
        error: "No se puede desactivar un puesto con empleados o subordinados asignados." 
      }, { status: 400 });
    }

    await prisma.position.update({ 
      where: { id },
      data: { isActive: false }
    });
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting position:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
