import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-utils";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    // Get certifications expiring soon or already expired
    const alerts = await prisma.certification.findMany({
      where: {
        expiryDate: {
          lte: thirtyDaysFromNow
        }
      },
      include: {
        employee: {
          include: { position: true }
        }
      },
      orderBy: { expiryDate: 'asc' }
    });

    return NextResponse.json(alerts);
  } catch (error) {
    console.error("CERT ALERTS ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
