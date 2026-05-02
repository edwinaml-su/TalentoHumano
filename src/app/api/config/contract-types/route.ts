import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const ContractTypeSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  isActive: z.boolean().optional().default(true),
});

export async function GET() {
  try {
    const contractTypes = await prisma.contractType.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(contractTypes);
  } catch {
    return NextResponse.json({ error: "Error al obtener tipos de contrato" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = ContractTypeSchema.parse(body);

    const contractType = await prisma.contractType.create({ data });
    return NextResponse.json(contractType, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Error al crear tipo de contrato" }, { status: 500 });
  }
}
