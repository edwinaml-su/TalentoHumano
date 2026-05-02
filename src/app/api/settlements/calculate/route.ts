import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateSettlement } from "@/lib/hr-engine";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get('employeeId');

    if (!employeeId) {
      return NextResponse.json({ error: "employeeId is required" }, { status: 400 });
    }

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        salaryHistory: { orderBy: { effectiveDate: 'desc' }, take: 1 }
      }
    });

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    const baseSalary = Number(employee.salaryHistory[0]?.amount || 0);
    const settlement = calculateSettlement(baseSalary, employee.hireDate);

    return NextResponse.json({
      employeeId,
      baseSalary,
      hireDate: employee.hireDate,
      ...settlement
    });
  } catch (error) {
    console.error("Settlement Calculation Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
