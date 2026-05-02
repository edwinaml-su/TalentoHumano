import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const CostCenterSchema = z.object({
  code: z.string().min(1, "El código es requerido"),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  description: z.string().optional().nullable(),
  budget: z.number().or(z.string().transform(Number)).optional().nullable(),
  locationId: z.string().min(1, "La unidad operativa es requerida")
});

export async function GET() {
  try {
    const costCenters = await prisma.costCenter.findMany({
      include: {
        location: true,
        _count: {
          select: { employees: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(costCenters);
  } catch (error) {
    console.error("Fetch cost centers error:", error);
    return NextResponse.json({ error: "Failed to fetch cost centers" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = CostCenterSchema.parse(body);

    const existingCode = await prisma.costCenter.findUnique({
      where: { code: data.code }
    });

    if (existingCode) {
      return NextResponse.json({ error: "El código de centro de costo ya existe" }, { status: 400 });
    }

    const costCenter = await prisma.costCenter.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        budget: data.budget,
        locationId: data.locationId
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
    console.error("Create cost center error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Datos de formulario inválidos" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create cost center" }, { status: 500 });
  }
}
