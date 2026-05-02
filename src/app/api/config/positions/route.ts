import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const PositionSchema = z.object({
  title: z.string().min(2, "El título debe tener al menos 2 caracteres"),
  description: z.string().optional().nullable(),
  departmentId: z.string().min(1, "El departamento es requerido"),
});

export async function GET() {
  try {
    const positions = await prisma.position.findMany({
      include: { department: true },
      orderBy: { title: "asc" },
    });
    return NextResponse.json(positions);
  } catch {
    return NextResponse.json({ error: "Error fetching positions" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = PositionSchema.parse(body);

    const position = await prisma.position.create({
      data,
      include: { department: true },
    });
    return NextResponse.json(position, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Error al crear puesto" }, { status: 500 });
  }
}
