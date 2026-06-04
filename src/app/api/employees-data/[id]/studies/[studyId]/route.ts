import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string, studyId: string }> }
) {
  try {
    const { studyId } = await params;
    await prisma.academicStudy.delete({
      where: { id: studyId }
    });
    return NextResponse.json({ message: "Study deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete study" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string, studyId: string }> }
) {
  try {
    const { studyId } = await params;
    const body = await req.json();
    const study = await prisma.academicStudy.update({
      where: { id: studyId },
      data: {
        degree: body.degree,
        institution: body.institution,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        status: body.status
      }
    });
    return NextResponse.json(study);
  } catch (error) {
    console.error("Update study error:", error);
    return NextResponse.json({ error: "Failed to update study" }, { status: 500 });
  }
}
