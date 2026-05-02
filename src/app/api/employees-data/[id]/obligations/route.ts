import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { z } from "zod";

const ObligationCreateSchema = z.object({
  type: z.enum(["HOSPITAL", "BANK_LOAN", "JUDICIAL_SEIZURE", "PROCURADURIA", "FOSOFAMILIA"]),
  totalAmount: z.number().or(z.string().transform(Number)),
  quota: z.number().or(z.string().transform(Number)),
  balance: z.number().or(z.string().transform(Number)),
  startDate: z.string(),
  status: z.boolean().optional().default(true),
  description: z.string().optional().nullable()
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const obligations = await prisma.financialObligation.findMany({
      where: { employeeId: id },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(obligations);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch obligations" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = ObligationCreateSchema.parse(body);

    const obligation = await prisma.financialObligation.create({
      data: {
        employeeId: id,
        type: data.type,
        totalAmount: data.totalAmount,
        quota: data.quota,
        balance: data.balance,
        startDate: new Date(data.startDate),
        status: data.status,
        description: data.description
      }
    });
    return NextResponse.json(obligation);
  } catch (error) {
    console.error("Create obligation error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create obligation" }, { status: 500 });
  }
}
