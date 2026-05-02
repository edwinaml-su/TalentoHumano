import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const BankSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  code: z.string().optional().nullable(),
  isActive: z.boolean().optional().default(true),
});

export async function GET() {
  try {
    const banks = await prisma.bank.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(banks);
  } catch {
    return NextResponse.json({ error: "Error al obtener bancos" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = BankSchema.parse(body);

    const bank = await prisma.bank.create({ data });
    return NextResponse.json(bank, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Error al crear banco" }, { status: 500 });
  }
}
