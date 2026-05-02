import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const orgs = await prisma.organization.findMany({
      include: {
        country: {
          include: { currency: true }
        },
        locations: {
          include: {
            _count: {
              select: { employees: true }
            }
          }
        }
      }
    });

    return NextResponse.json(orgs);
  } catch (error) {
    console.error("Fetch Organizations Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
