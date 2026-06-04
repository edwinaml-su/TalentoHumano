import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-utils";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Group exit responses by common causes
    const responses = await prisma.surveyResponse.findMany({
      where: {
        survey: { type: 'EXIT' }
      },
      select: { comment: true, score: true }
    });

    return NextResponse.json(responses);
  } catch (error) {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
