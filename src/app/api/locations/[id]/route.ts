import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    const updated = await prisma.location.update({
      where: { id },
      data: {
        name: body.name,
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update Location Error:", error);
    return NextResponse.json({ error: "Failed to update location" }, { status: 500 });
  }
}
