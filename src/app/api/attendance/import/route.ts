import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { records } = body; // Array of { employeeCode, date, clockIn, clockOut }

    if (!records || !Array.isArray(records)) {
      return NextResponse.json({ error: "Invalid records format" }, { status: 400 });
    }

    const results = [];
    for (const record of records) {
      const { employeeCode, date, clockIn, clockOut } = record;
      
      const employee = await prisma.employee.findUnique({
        where: { employeeCode }
      });

      if (!employee) {
        results.push({ employeeCode, status: "SKIPPED", reason: "Employee code not found" });
        continue;
      }

      // Create or update attendance record
      await prisma.attendance.upsert({
        where: {
          employeeId_date: {
            employeeId: employee.id,
            date: new Date(date)
          }
        },
        update: {
          clockIn: clockIn ? new Date(clockIn) : undefined,
          clockOut: clockOut ? new Date(clockOut) : undefined
        },
        create: {
          employeeId: employee.id,
          date: new Date(date),
          clockIn: clockIn ? new Date(clockIn) : undefined,
          clockOut: clockOut ? new Date(clockOut) : undefined,
          status: "PRESENT"
        }
      });

      results.push({ employeeCode, status: "IMPORTED" });
    }

    return NextResponse.json({ summary: results });
  } catch (error) {
    console.error("Biometric Import Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
