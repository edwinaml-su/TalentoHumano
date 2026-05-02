import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const employees = await prisma.payrollRunEmployee.findMany({
      where: { payrollRunId: id },
      include: {
        employee: {
          include: {
            location: { include: { organization: true } },
            position: { include: { department: true } },
            country: true,
          }
        }
      },
      orderBy: { correlativo: 'asc' }
    });
    
    return NextResponse.json(employees);
  } catch (error) {
    console.error("Fetch Payroll Employees Error:", error);
    return NextResponse.json({ error: "Failed to fetch payroll employees" }, { status: 500 });
  }
}
