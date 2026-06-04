import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-utils";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 1. Average Score
    const avgResult = await prisma.performanceReview.aggregate({
      _avg: { score: true }
    });

    // 2. Completion Status
    const totalReviews = await prisma.performanceReview.count();
    const completedReviews = await prisma.performanceReview.count({ where: { status: "COMPLETED" } });
    
    // 3. Top Performers (Top 5)
    const topPerformers = await prisma.performanceReview.findMany({
      where: { status: "COMPLETED" },
      orderBy: { score: 'desc' },
      take: 5,
      include: {
        employee: {
          include: { position: true }
        }
      }
    });

    // 4. Departmental Averages (Simplified for MVP)
    // In a full implementation, we'd group by departmentId
    
    return NextResponse.json({
      averageScore: avgResult._avg.score ? Number(avgResult._avg.score).toFixed(2) : "0.00",
      completionRate: totalReviews > 0 ? ((completedReviews / totalReviews) * 100).toFixed(0) : "0",
      totalReviews,
      topPerformers
    });
  } catch (error) {
    console.error("PERFORMANCE STATS ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
