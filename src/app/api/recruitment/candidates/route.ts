import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-utils";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const candidates = await prisma.jobApplication.findMany({
      include: {
        jobPosting: {
          include: {
            location: true,
            department: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(candidates);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
