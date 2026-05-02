import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const UpdateSchema = z.object({
  name: z.string().min(2).optional(),
  code: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = UpdateSchema.parse(body);

    const bank = await prisma.bank.update({
      where: { id },
      data,
    });
    return NextResponse.json(bank);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Error al actualizar banco" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const inUse = await prisma.employee.count({ where: { bankId: id } });
    if (inUse > 0) {
      return NextResponse.json(
        { error: `No se puede eliminar: ${inUse} empleado(s) con este banco asignado.` },
        { status: 409 }
      );
    }

    await prisma.bank.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error al eliminar banco" }, { status: 500 });
  }
}
