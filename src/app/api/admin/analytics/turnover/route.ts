import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-utils";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const months = [];
    const now = new Date();
    
    // Generate last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        name: date.toLocaleString('es-ES', { month: 'short' }),
        fullDate: date,
        month: date.getMonth(),
        year: date.getFullYear()
      });
    }

    const data = await Promise.all(months.map(async (m) => {
      const nextMonth = new Date(m.year, m.month + 1, 1);
      
      // Hires in this month
      const hires = await prisma.employee.count({
        where: {
          hireDate: {
            gte: m.fullDate,
            lt: nextMonth
          }
        }
      });

      // Terminations in this month
      const terminations = await prisma.employee.count({
        where: {
          terminationDate: {
            gte: m.fullDate,
            lt: nextMonth
          }
        }
      });

      // Total headcount at the end of this month
      const headcount = await prisma.employee.count({
        where: {
          hireDate: { lt: nextMonth },
          OR: [
            { terminationDate: null },
            { terminationDate: { gte: nextMonth } }
          ]
        }
      });

      // Turnover rate = (Terminations / Headcount) * 100
      const turnoverRate = headcount > 0 ? (terminations / headcount) * 100 : 0;

      return {
        name: m.name,
        contrataciones: hires,
        bajas: terminations,
        headcount,
        turnover: parseFloat(turnoverRate.toFixed(2))
      };
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("TURNOVER ANALYTICS ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
