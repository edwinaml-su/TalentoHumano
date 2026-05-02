import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-utils";

export async function GET() {
  try {
    const session = await getSession();
    // For MVP simulator, if no session, just pick the first employee
    const employeeId = session?.employeeId;

    const query: any = {
      include: {
        payrollRun: true,
        employee: {
          include: { position: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    };

    if (employeeId) {
      query.where = { employeeId };
    }

    const stubs = await prisma.payrollRunEmployee.findMany(query);

    return NextResponse.json(stubs);
  } catch (error) {
    console.error("GET PAY STUBS ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
