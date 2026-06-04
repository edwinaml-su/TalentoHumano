import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-utils";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { status, notes } = await req.json();

    const updated = await prisma.jobApplication.update({
      where: { id },
      data: { 
        status,
        notes: notes !== undefined ? notes : undefined
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("UPDATE CANDIDATE STATUS ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
