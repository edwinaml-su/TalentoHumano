import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const payrollRun = await prisma.payrollRun.findUnique({
      where: { id }
    });

    if (!payrollRun) {
      return NextResponse.json({ error: "Payroll Run not found" }, { status: 404 });
    }

    if (payrollRun.status === "CLOSED") {
      return NextResponse.json({ error: "Payroll Run is already closed" }, { status: 400 });
    }

    if (payrollRun.status !== "PROCESSED") {
      return NextResponse.json({ error: "Only processed payroll runs can be closed" }, { status: 400 });
    }

    // AC: Close the payroll run
    const updatedRun = await prisma.payrollRun.update({
      where: { id },
      data: {
        status: "CLOSED"
      }
    });
    
    // AUDIT LOG
    await logAudit({
      action: "CLOSE_PAYROLL",
      entity: "PayrollRun",
      entityId: id,
      details: { previousStatus: payrollRun.status, newStatus: "CLOSED" },
      req
    });

    return NextResponse.json(updatedRun);
  } catch (error) {
    console.error("Payroll Closure Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
