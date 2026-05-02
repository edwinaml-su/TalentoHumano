import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const gerencias = await prisma.gerencia.findMany({
      include: { organization: true },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(gerencias);
  } catch (error) {
    return NextResponse.json({ error: "Error fetching gerencias" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { name, organizationId } = data;
    
    const gerencia = await prisma.gerencia.create({
      data: { name, organizationId }
    });
    return NextResponse.json(gerencia);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
