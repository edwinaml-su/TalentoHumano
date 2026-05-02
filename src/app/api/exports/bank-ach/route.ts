import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const payrollRunId = searchParams.get('payrollRunId');
    const bank = searchParams.get('bank') || 'BAC';

    if (!payrollRunId) {
      return NextResponse.json({ error: "payrollRunId is required" }, { status: 400 });
    }

    const payrollRun = await prisma.payrollRun.findUnique({
      where: { id: payrollRunId },
      include: {
        employees: {
          include: {
            employee: {
              include: {
                bank: true
              }
            }
          }
        }
      }
    });

    if (!payrollRun) {
      return NextResponse.json({ error: "Payroll Run not found" }, { status: 404 });
    }

    // ACH Layout Generation
    let content = "";
    
    if (bank === 'BAC') {
      // BAC Layout Example (Simplified)
      // AccountNum | Amount | Currency | Name
      content = payrollRun.employees.map(e => {
        const accountNumber = e.employee.bankAccountNumber || "000000000";
        const amount = e.netPay.toFixed(2).padStart(10, '0');
        const name = `${e.employee.firstName} ${e.employee.firstSurname}`.padEnd(30, ' ');
        return `${accountNumber.padEnd(15, ' ')}${amount}USD${name}`;
      }).join("\n");
    } else if (bank === 'AGRICOLA') {
      // Agricola Layout (CSV style)
      content = payrollRun.employees.map(e => {
        return `${e.employee.bankAccountNumber},${e.netPay.toFixed(2)},USD,${e.employee.firstName} ${e.employee.firstSurname}`;
      }).join("\n");
    } else {
      // Default fallback
      content = payrollRun.employees.map(e => `${e.employee.bankAccountNumber}\t${e.netPay.toFixed(2)}`).join("\n");
    }

    const filename = `ACH_${bank}_${payrollRunId}.txt`;

    return new Response(content, {
      headers: {
        "Content-Type": "text/plain",
        "Content-Disposition": `attachment; filename="${filename}"`
      }
    });
  } catch (error) {
    console.error("ACH Export Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
