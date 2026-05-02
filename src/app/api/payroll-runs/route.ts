import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const ManualPayrollRunSchema = z.object({
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid startDate"),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid endDate"),
  name: z.string().optional(),
  payrollType: z.string().optional(),
  locationId: z.string().min(1, "Location ID is required")
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const unitIds = searchParams.get('unitIds')?.split(',') || [];
    
    const whereClause = unitIds.length > 0 ? {
      locationId: { in: unitIds }
    } : {};

    const runs = await prisma.payrollRun.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        location: true,
        _count: {
          select: { employees: true }
        }
      }
    });
    return NextResponse.json(runs);
  } catch (error) {
    console.error("Fetch Payroll Runs Error:", error);
    return NextResponse.json({ error: "Failed to fetch payroll runs" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = ManualPayrollRunSchema.parse(body);
    
    const run = await prisma.payrollRun.create({
      data: {
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        status: "DRAFT",
        payrollType: data.payrollType || "QUINCENAL",
        locationId: data.locationId
      }
    });
    
    return NextResponse.json(run);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Payload inválido. Revisa campos obligatorios." }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create payroll run" }, { status: 500 });
  }
}
