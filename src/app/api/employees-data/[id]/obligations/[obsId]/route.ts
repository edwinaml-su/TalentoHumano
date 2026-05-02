import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";
import { z } from "zod";

const ObligationUpdateSchema = z.object({
  type: z.enum(["HOSPITAL", "BANK_LOAN", "JUDICIAL_SEIZURE", "PROCURADURIA", "FOSOFAMILIA"]).optional(),
  totalAmount: z.number().or(z.string().transform(Number)).optional(),
  quota: z.number().or(z.string().transform(Number)).optional(),
  balance: z.number().or(z.string().transform(Number)).optional(),
  startDate: z.string().optional(),
  status: z.boolean().optional(),
  description: z.string().optional().nullable()
});

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string, obsId: string }> }
) {
  try {
    const { obsId } = await params;
    const body = await req.json();
    const data = ObligationUpdateSchema.parse(body);
    
    const obligation = await prisma.financialObligation.update({
      where: { id: obsId },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined
      }
    });
    return NextResponse.json(obligation);
  } catch (error) {
    console.error("Update obligation error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update obligation" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string, obsId: string }> }
) {
  try {
    const { obsId } = await params;
    // SOFTS DELETE for Financial Obligations
    await prisma.financialObligation.update({
      where: { id: obsId },
      data: { status: false }
    });
    return NextResponse.json({ message: "Obligation set to inactive successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to set obligation inactive" }, { status: 500 });
  }
}
