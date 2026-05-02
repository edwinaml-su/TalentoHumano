import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const AfpTypeSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  code: z.string().optional().nullable(),
  rate: z.number().min(0).max(1).optional().default(0.0725),
  isActive: z.boolean().optional().default(true),
});

export async function GET() {
  try {
    const afpTypes = await prisma.afpType.findMany({
      orderBy: { name: "asc" },
    });
    // Serialize Decimal rate to number
    const result = afpTypes.map((a) => ({ ...a, rate: Number(a.rate) }));
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Error al obtener AFP" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = AfpTypeSchema.parse(body);

    const afpType = await prisma.afpType.create({ data });
    return NextResponse.json({ ...afpType, rate: Number(afpType.rate) }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Error al crear AFP" }, { status: 500 });
  }
}
