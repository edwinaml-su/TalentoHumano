import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const payrollRunId = searchParams.get('payrollRunId');

    if (!payrollRunId) {
      return NextResponse.json({ error: "payrollRunId is required" }, { status: 400 });
    }

    const payrollRun = await prisma.payrollRun.findUnique({
      where: { id: payrollRunId },
      include: {
        employees: {
          include: {
            employee: true
          }
        }
      }
    });

    if (!payrollRun) {
      return NextResponse.json({ error: "Payroll Run not found" }, { status: 404 });
    }

    // ISSS Institutional Report Layout (CSV)
    // ISSSNum, Name, BaseSalary, Deduction, PatronalContribution
    const header = "isss_number,employee_name,taxable_salary,isss_deduction_3,isss_contribution_7.5\n";
    const rows = payrollRun.employees.map(e => {
      const isssNum = e.employee.isssNumber || "PENDIENTE";
      const name = `${e.employee.firstName} ${e.employee.firstSurname}`;
      const taxable = e.baseSalary.toFixed(2);
      const deduction = e.isssHealthDeduction.toFixed(2);
      const patronal = (Number(e.baseSalary) * 0.075).toFixed(2); // 7.5% capped handled by engine usually, here simplified
      return `${isssNum},${name},${taxable},${deduction},${patronal}`;
    }).join("\n");

    const content = header + rows;
    const filename = `ISSS_Report_${payrollRunId}.csv`;

    return new Response(content, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`
      }
    });
  } catch (error) {
    console.error("ISSS Export Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
