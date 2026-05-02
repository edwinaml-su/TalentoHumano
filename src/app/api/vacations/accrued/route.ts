import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateAccruedVacations } from "@/lib/hr-engine";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get('employeeId');

    if (!employeeId) {
      return NextResponse.json({ error: "employeeId is required" }, { status: 400 });
    }

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { vacations: true }
    });

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    const accrued = calculateAccruedVacations(employee.hireDate);
    const taken = employee.vacations.reduce((acc, v) => acc + v.daysTaken, 0);
    const balance = accrued - taken;

    return NextResponse.json({
      employeeId,
      hireDate: employee.hireDate,
      accruedDays: accrued,
      takenDays: taken,
      availableBalance: Number(balance.toFixed(2))
    });
  } catch (error) {
    console.error("Vacation Accrual Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
