import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-utils";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const reviews = await prisma.performanceReview.findMany({
      include: {
        employee: true,
        evaluator: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(reviews);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { employeeId, period, score, feedback } = body;

    const review = await prisma.performanceReview.create({
      data: {
        employeeId,
        evaluatorId: session.employeeId || "ADMIN", // Fallback if admin has no employeeId
        period,
        score,
        feedback,
        status: "COMPLETED"
      }
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error("POST REVIEW ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
