import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    const updated = await prisma.organization.update({
      where: { id },
      data: {
        commercialName: body.commercialName,
        legalName: body.legalName,
        taxId: body.taxId,
        countryId: body.countryId
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update Organization Error:", error);
    return NextResponse.json({ error: "Failed to update organization" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.organization.delete({
      where: { id }
    });
    return NextResponse.json({ message: "Organization deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete organization" }, { status: 500 });
  }
}
