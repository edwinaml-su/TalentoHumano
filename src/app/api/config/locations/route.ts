import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const locations = await prisma.location.findMany({
      include: { organization: true },
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(locations);
  } catch (error) {
    return NextResponse.json({ error: "Error fetching locations" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { name, organizationId } = data;
    const location = await prisma.location.create({
      data: { name, organizationId }
    });
    return NextResponse.json(location);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
