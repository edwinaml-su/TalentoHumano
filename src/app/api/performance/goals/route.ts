import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-utils";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get("employeeId");

    const goals = await prisma.performanceGoal.findMany({
      where: employeeId ? { employeeId } : {},
      include: { employee: true },
      orderBy: { endDate: 'asc' }
    });

    return NextResponse.json(goals);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { employeeId, title, description, weight, targetValue, startDate, endDate } = body;

    const goal = await prisma.performanceGoal.create({
      data: {
        employeeId,
        title,
        description,
        weight,
        targetValue,
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      }
    });

    return NextResponse.json(goal);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
