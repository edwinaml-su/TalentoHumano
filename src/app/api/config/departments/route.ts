import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      include: { 
        organization: true,
        gerencia: true
      },
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(departments);
  } catch (error) {
    return NextResponse.json({ error: "Error fetching departments" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { name, organizationId, gerenciaId } = data;
    
    const department = await prisma.department.create({
      data: { name, organizationId, gerenciaId }
    });
    return NextResponse.json(department);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
