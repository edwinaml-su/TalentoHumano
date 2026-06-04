import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const CostCenterUpdateSchema = z.object({
  code: z.string().min(1, "El código es requerido").optional(),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").optional(),
  description: z.string().optional().nullable(),
  budget: z.number().or(z.string().transform(Number)).optional().nullable(),
  locationId: z.string().min(1, "La unidad operativa es requerida").optional(),
  isActive: z.boolean().optional()
});

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = CostCenterUpdateSchema.parse({ ...body, isActive: body.isActive === "true" || body.isActive === true });
    
    // Check if updating code to an existing one
    if (data.code) {
      const existing = await prisma.costCenter.findFirst({
        where: { code: data.code, id: { not: id } }
      });
      if (existing) {
        return NextResponse.json({ error: "El código de centro de costo ya existe en otro registro" }, { status: 400 });
      }
    }

    const costCenter = await prisma.costCenter.update({
      where: { id },
      data: {
        ...data,
        budget: data.budget ? Number(data.budget) : null
      },
      include: {
        location: true,
        _count: {
          select: { employees: true }
        }
      }
    });

    return NextResponse.json(costCenter);
  } catch (error) {
    console.error("Update cost center error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Datos de formulario inválidos" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update cost center" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Soft Delete protocol
    await prisma.costCenter.update({
      where: { id },
      data: { isActive: false }
    });

    return NextResponse.json({ message: "Centro de costo inactivado exitosamente" });
  } catch (error) {
    console.error("Delete cost center error:", error);
    return NextResponse.json({ error: "No se pudo inactivar el centro de costo" }, { status: 500 });
  }
}
