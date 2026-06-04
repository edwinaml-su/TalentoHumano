import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-utils";

export async function GET(req: Request) {
  try {
    const jobs = await prisma.jobPosting.findMany({
      include: {
        location: true,
        department: true,
        _count: {
          select: { applications: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(jobs);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { title, description, requirements, salaryRange, locationId, departmentId, positionId } = body;

    const job = await prisma.jobPosting.create({
      data: {
        title,
        description,
        requirements,
        salaryRange,
        locationId,
        departmentId,
        positionId
      }
    });

    return NextResponse.json(job);
  } catch (error) {
    console.error("POST JOB ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
