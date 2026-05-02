import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { getSession } from "@/lib/auth-utils";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const { status, notes } = await req.json();

    if (!["APPROVED", "REJECTED", "PENDING"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const vacation = await prisma.vacation.update({
      where: { id },
      data: { status }
    });

    // AUDIT LOG
    await logAudit({
      userId: session.userId,
      action: status === "APPROVED" ? "APPROVE_VACATION" : "REJECT_VACATION",
      entity: "Vacation",
      entityId: id,
      details: { status, notes },
      req
    });

    return NextResponse.json(vacation);
  } catch (error) {
    console.error("PATCH VACATION STATUS ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
