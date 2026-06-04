import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string, certId: string }> }
) {
  try {
    const { certId } = await params;
    await prisma.certification.delete({
      where: { id: certId }
    });
    return NextResponse.json({ message: "Certification deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete certification" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string, certId: string }> }
) {
  try {
    const { certId } = await params;
    const body = await req.json();
    const certification = await prisma.certification.update({
      where: { id: certId },
      data: {
        name: body.name,
        issuingEntity: body.issuingEntity,
        issueDate: body.issueDate ? new Date(body.issueDate) : null,
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
        credentialId: body.credentialId,
        credentialUrl: body.credentialUrl
      }
    });
    return NextResponse.json(certification);
  } catch (error) {
    console.error("Update certification error:", error);
    return NextResponse.json({ error: "Failed to update certification" }, { status: 500 });
  }
}
