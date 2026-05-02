import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const UpdateSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().optional().nullable(),
  departmentId: z.string().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = UpdateSchema.parse(body);

    const position = await prisma.position.update({
      where: { id },
      data,
      include: { department: true },
    });
    return NextResponse.json(position);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Error al actualizar puesto" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const inUse = await prisma.employee.count({ where: { positionId: id } });
    if (inUse > 0) {
      return NextResponse.json(
        { error: `No se puede eliminar: ${inUse} empleado(s) en este puesto.` },
        { status: 409 }
      );
    }

    await prisma.position.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error al eliminar puesto" }, { status: 500 });
  }
}
