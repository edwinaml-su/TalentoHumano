import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const UpdateSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").optional(),
  isActive: z.boolean().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = UpdateSchema.parse(body);

    const contractType = await prisma.contractType.update({
      where: { id },
      data,
    });
    return NextResponse.json(contractType);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Error al actualizar tipo de contrato" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    // Check if in use
    const inUse = await prisma.employee.count({ where: { contractTypeId: id } });
    if (inUse > 0) {
      return NextResponse.json(
        { error: `No se puede desactivar: ${inUse} empleado(s) asignados a este tipo de contrato.` },
        { status: 409 }
      );
    }

    await prisma.contractType.update({ where: { id }, data: { isActive: false } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error al desactivar tipo de contrato" }, { status: 500 });
  }
}
