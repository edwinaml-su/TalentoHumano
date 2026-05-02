import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { logAudit } from "@/lib/audit";

const VacationRequestSchema = z.object({
  employeeId: z.string().min(1),
  startDate: z.string().refine(val => !isNaN(Date.parse(val))),
  endDate: z.string().refine(val => !isNaN(Date.parse(val))),
  notes: z.string().optional()
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get('employeeId');

    if (!employeeId) {
      return NextResponse.json({ error: "employeeId is required" }, { status: 400 });
    }

    const vacations = await prisma.vacation.findMany({
      where: { employeeId },
      orderBy: { startDate: 'desc' }
    });

    return NextResponse.json(vacations);
  } catch (error) {
    console.error("GET VACATIONS ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = VacationRequestSchema.parse(body);

    const start = new Date(data.startDate);
    const end = new Date(data.endDate);

    // Basic validation: end must be after start
    if (end < start) {
      return NextResponse.json({ error: "La fecha de fin no puede ser anterior a la de inicio" }, { status: 400 });
    }

    // Calculate days (excluding weekends simplified for now, or just calendar days)
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const daysTaken = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Create the record
    const vacation = await prisma.vacation.create({
      data: {
        employeeId: data.employeeId,
        startDate: start,
        endDate: end,
        daysTaken,
        status: "PENDING" // Default for new requests
      }
    });

    // AUDIT LOG
    await logAudit({
      action: "REQUEST_VACATION",
      entity: "Vacation",
      entityId: vacation.id,
      details: { startDate: data.startDate, endDate: data.endDate, daysTaken },
      req
    });

    return NextResponse.json(vacation, { status: 201 });

  } catch (error) {
    console.error("POST VACATION ERROR:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Datos de solicitud inválidos" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
