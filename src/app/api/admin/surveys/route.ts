import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-utils";

export async function GET() {
  try {
    const surveys = await prisma.survey.findMany({
      include: {
        _count: {
          select: { responses: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(surveys);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { title, description, type } = body;

    const survey = await prisma.survey.create({
      data: {
        title,
        description,
        type
      }
    });

    return NextResponse.json(survey);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
