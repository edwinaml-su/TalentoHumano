import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-utils";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 1. Fetch all active cost centers with their budget
    const costCenters = await prisma.costCenter.findMany({
      where: { isActive: true },
      include: {
        employees: {
          include: {
            payrollRuns: {
              include: {
                payrollRun: true
              }
            }
          }
        }
      }
    });

    // 2. Calculate actual spend per cost center
    // For this MVP, we'll sum the netPay of the last processed payroll runs
    const report = await Promise.all(costCenters.map(async (cc) => {
      // Get all payroll records for employees in this cost center
      const payrollRecords = await prisma.payrollRunEmployee.findMany({
        where: {
          employee: { costCenterId: cc.id },
          payrollRun: { status: "CLOSED" } // Only closed payrolls count as actual spend
        }
      });

      const actualSpend = payrollRecords.reduce((acc, curr) => acc + Number(curr.netPay), 0);
      const budget = Number(cc.budget || 0);
      const utilization = budget > 0 ? (actualSpend / budget) * 100 : 0;

      return {
        id: cc.id,
        name: cc.name,
        code: cc.code,
        budget: budget,
        actual: actualSpend,
        utilization: parseFloat(utilization.toFixed(2)),
        status: utilization > 100 ? "OVER_BUDGET" : utilization > 80 ? "WARNING" : "HEALTHY"
      };
    }));

    return NextResponse.json(report);
  } catch (error) {
    console.error("PAYROLL VS BUDGET ANALYTICS ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
