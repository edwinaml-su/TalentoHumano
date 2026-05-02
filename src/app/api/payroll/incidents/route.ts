import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { logAudit } from "@/lib/audit";

const IncidentSchema = z.object({
  payrollRunId: z.string().min(1),
  employeeId: z.string().min(1),
  type: z.string().min(1),
  amount: z.number().or(z.string().regex(/^\d+(\.\d{1,2})?$/).transform(Number)),
  quantity: z.number().or(z.string().regex(/^\d+(\.\d{1,2})?$/).transform(Number)).optional().nullable(),
  notes: z.string().optional().nullable(),
  date: z.string().optional()
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const payrollRunId = searchParams.get('payrollRunId');
    const employeeId = searchParams.get('employeeId');

    if (!payrollRunId) {
      return NextResponse.json({ error: "payrollRunId is required" }, { status: 400 });
    }

    const where: any = { payrollRunId };
    if (employeeId) where.employeeId = employeeId;

    const incidents = await prisma.payrollIncident.findMany({
      where,
      orderBy: { date: 'desc' }
    });

    return NextResponse.json(incidents);
  } catch (error) {
    console.error("Fetch incidents error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = IncidentSchema.parse(body);

    const payrollRun = await prisma.payrollRun.findUnique({
      where: { id: data.payrollRunId }
    });

    if (!payrollRun || payrollRun.status === "CLOSED") {
      return NextResponse.json({ 
        error: "Cannot add incidents to a closed or non-existent payroll run" 
      }, { status: 400 });
    }

    // Upsert Protection: Find if there's already an incident of this type for this run/employee
    const existing = await prisma.payrollIncident.findFirst({
      where: {
        payrollRunId: data.payrollRunId,
        employeeId: data.employeeId,
        type: data.type as any
      }
    });

    let incident;
    if (existing) {
      incident = await prisma.payrollIncident.update({
        where: { id: existing.id },
        data: {
          amount: data.amount,
          quantity: data.quantity,
          notes: data.notes,
          date: data.date ? new Date(data.date) : undefined
        }
      });
    } else {
      incident = await prisma.payrollIncident.create({
        data: {
          payrollRunId: data.payrollRunId,
          employeeId: data.employeeId,
          type: data.type as any,
          amount: data.amount,
          quantity: data.quantity,
          notes: data.notes,
          date: data.date ? new Date(data.date) : undefined
        }
      });
    }

    // AUDIT LOG
    await logAudit({
      action: existing ? "UPDATE_INCIDENT" : "CREATE_INCIDENT",
      entity: "PayrollIncident",
      entityId: incident.id,
      details: data,
      req
    });

    return NextResponse.json(incident);
  } catch (error) {
    console.error("Create incident error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Payload inválido. Verifica montos y cantidades." }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
