import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const UpdateSchema = z.object({
  name: z.string().min(1).optional(),
  code: z.string().optional().nullable(),
  rate: z.number().min(0).max(1).optional(),
  isActive: z.boolean().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = UpdateSchema.parse(body);

    const afpType = await prisma.afpType.update({
      where: { id },
      data,
    });
    return NextResponse.json({ ...afpType, rate: Number(afpType.rate) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Error al actualizar AFP" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const inUse = await prisma.employee.count({ where: { afpTypeId: id } });
    if (inUse > 0) {
      return NextResponse.json(
        { error: `No se puede eliminar: ${inUse} empleado(s) afiliado(s) a esta AFP.` },
        { status: 409 }
      );
    }

    await prisma.afpType.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error al eliminar AFP" }, { status: 500 });
  }
}
