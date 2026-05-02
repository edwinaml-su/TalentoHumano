import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const AttendanceMarkSchema = z.object({
  employeeId: z.string().min(1, "Employee ID required"),
  type: z.enum(["IN", "OUT"]),
  clockTime: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid clock time"),
  locationName: z.string().optional() // E.g., GPS coords or office name
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get("date");
    const date = dateStr ? new Date(dateStr) : new Date();

    const unitIds = searchParams.get("unitIds")?.split(",") || [];
    
    // Set to start of day for comparison
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const whereClause: any = {
      date: {
        gte: startOfDay,
        lte: endOfDay
      }
    };

    if (unitIds.length > 0) {
      whereClause.employee = {
        locationId: { in: unitIds }
      };
    }

    const attendances = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        employee: {
          select: {
            fullName: true,
            employeeCode: true,
            location: { select: { name: true } },
            position: { select: { title: true } }
          }
        },
        shift: true
      },
      orderBy: { clockIn: 'desc' }
    });

    return NextResponse.json(attendances);
  } catch (error) {
    console.error("Attendance GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = AttendanceMarkSchema.parse(body);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (data.type === 'IN') {
      // Lookup employee's default shift
      const employee = await prisma.employee.findUnique({
        where: { id: data.employeeId },
        select: { shiftId: true }
      });

      const attendance = await prisma.attendance.create({
        data: {
          employeeId: data.employeeId,
          date: today,
          clockIn: new Date(data.clockTime),
          location: data.locationName || "Marcación Web", 
          shiftId: employee?.shiftId || null,
          status: 'PRESENT' // Future enhancement: compare clockIn vs shift.startTime for 'LATE'
        }
      });
      return NextResponse.json(attendance, { status: 201 });
    } else {
      // Find existing attendance to clock out
      const existing = await prisma.attendance.findFirst({
        where: {
          employeeId: data.employeeId,
          date: today,
          clockOut: null
        }
      });

      if (!existing) {
        return NextResponse.json({ error: "No open clock-in found for today" }, { status: 400 });
      }

      const attendance = await prisma.attendance.update({
        where: { id: existing.id },
        data: {
          clockOut: new Date(data.clockTime),
          // Optionally compute totalHours here if needed
        }
      });
      return NextResponse.json(attendance);
    }
  } catch (error) {
    console.error("Attendance POST Error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Estructura de payload inválida" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to process attendance" }, { status: 500 });
  }
}
