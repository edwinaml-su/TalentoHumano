import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const studies = await prisma.academicStudy.findMany({
      where: { employeeId: id },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(studies);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch studies" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const study = await prisma.academicStudy.create({
      data: {
        employeeId: id,
        degree: body.degree,
        institution: body.institution,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        status: body.status || "COMPLETED"
      }
    });
    return NextResponse.json(study);
  } catch (error) {
    console.error("Create study error:", error);
    return NextResponse.json({ error: "Failed to create study" }, { status: 500 });
  }
}
