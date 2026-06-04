import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-utils";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.employeeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { period, comments } = await req.json();

    // Find if there's already a review for this period to update it
    const existingReview = await prisma.performanceReview.findFirst({
      where: {
        employeeId: session.employeeId,
        period: period
      }
    });

    if (existingReview) {
      const updated = await prisma.performanceReview.update({
        where: { id: existingReview.id },
        data: { selfEvaluation: comments }
      });
      return NextResponse.json(updated);
    } else {
      // Create a pending review with the self evaluation
      const created = await prisma.performanceReview.create({
        data: {
          employeeId: session.employeeId,
          evaluatorId: "PENDING", // To be assigned when manager evaluates
          period,
          selfEvaluation: comments,
          status: "IN_PROGRESS"
        }
      });
      return NextResponse.json(created);
    }
  } catch (error) {
    console.error("SELF EVALUATE ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
