import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-utils";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.employeeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const enrollments = await prisma.trainingEnrollment.findMany({
      where: { employeeId: session.employeeId },
      include: {
        course: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(enrollments);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { employeeId, courseId } = body;

    const enrollment = await prisma.trainingEnrollment.create({
      data: {
        employeeId,
        courseId,
        status: "ENROLLED"
      }
    });

    return NextResponse.json(enrollment);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
