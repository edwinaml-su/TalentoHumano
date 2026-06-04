import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-utils";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.employeeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { surveyId, score, comment } = body;

    if (!surveyId || score === undefined) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const response = await prisma.surveyResponse.create({
      data: {
        surveyId,
        employeeId: session.employeeId,
        score,
        comment
      }
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("SURVEY RESPONSE ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    if (type === 'QUICK_MOOD') {
      const survey = await prisma.survey.findFirst({
        where: { type: 'QUICK_MOOD', status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json(survey);
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
