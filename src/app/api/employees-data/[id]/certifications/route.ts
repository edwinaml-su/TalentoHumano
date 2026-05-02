import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const certifications = await prisma.certification.findMany({
      where: { employeeId: id },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(certifications);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch certifications" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const certification = await prisma.certification.create({
      data: {
        employeeId: id,
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
    console.error("Create certification error:", error);
    return NextResponse.json({ error: "Failed to create certification" }, { status: 500 });
  }
}
