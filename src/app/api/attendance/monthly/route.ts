import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const RecordSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), "Fecha inválida"),
  status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED", "INC", "VAC", "AUS", "LIC"]),
  totalHours: z.number().nullable()
});

const BulkAttendanceSchema = z.object({
  records: z.array(RecordSchema)
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const month = parseInt(searchParams.get("month") || "");
    const year = parseInt(searchParams.get("year") || "");
    const unitIds = searchParams.get("unitIds")?.split(",") || [];

    if (isNaN(month) || isNaN(year)) {
      return NextResponse.json({ error: "Invalid month or year" }, { status: 400 });
    }

    // Get all employees for the selected units
    const employees = await prisma.employee.findMany({
      where: {
        locationId: { in: unitIds }
      },
      include: {
        location: true,
        position: { include: { department: true } }
      }
    });

    // Get all attendance records for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const attendances = await prisma.attendance.findMany({
      where: {
        employeeId: { in: employees.map(e => e.id) },
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    return NextResponse.json({ employees, attendances });
  } catch (error) {
    console.error("Monthly Attendance Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = BulkAttendanceSchema.parse(body);

    // Use a transaction for bulk save
    await prisma.$transaction(
      data.records.map((rec: any) => 
        prisma.attendance.upsert({
          where: {
            employeeId_date: {
              employeeId: rec.employeeId,
              date: new Date(rec.date)
            }
          },
          update: {
            // Note: DB schema AttendanceStatus only maps PRESENT, LATE, ABSENT, EXCUSED
            // UI codes like INC, VAC might need to be converted or stored in 'notes' if schema strict
            status: ['INC', 'VAC', 'AUS', 'LIC'].includes(rec.status) ? 'EXCUSED' : rec.status,
            totalHours: rec.totalHours,
            notes: ['INC', 'VAC', 'AUS', 'LIC'].includes(rec.status) ? rec.status : null,
            clockIn: null, // Clear clock-in for manual entry
            clockOut: null
          },
          create: {
            employeeId: rec.employeeId,
            date: new Date(rec.date),
            status: ['INC', 'VAC', 'AUS', 'LIC'].includes(rec.status) ? 'EXCUSED' : rec.status,
            totalHours: rec.totalHours,
            notes: ['INC', 'VAC', 'AUS', 'LIC'].includes(rec.status) ? rec.status : null,
          }
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Bulk attendance save error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Datos de carga inválidos. Revise el archivo Excel o la tabla." }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to save records" }, { status: 500 });
  }
}
