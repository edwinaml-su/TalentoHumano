import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-utils";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // In a real multi-tenant app, we would filter by organizationId or unitId from session
    const requests = await prisma.vacation.findMany({
      include: {
        employee: {
          include: {
            position: true
          }
        }
      },
      orderBy: { startDate: 'desc' }
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error("ADMIN GET VACATIONS ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
