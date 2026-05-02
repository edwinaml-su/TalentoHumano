import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await req.json();
    const { name, startTime, endTime, gracePeriod, departments, locations } = data;

    if (gracePeriod < 0) {
      return NextResponse.json({ error: "El tiempo de tolerancia no puede ser negativo" }, { status: 400 });
    }

    const isOvernight = startTime > endTime;

    const shift = await prisma.shift.update({
      where: { id },
      data: {
        name,
        startTime,
        endTime,
        gracePeriod,
        isOvernight,
        departments: {
          set: departments.map((d: any) => ({ id: d.id }))
        },
        locations: {
          set: locations.map((l: any) => ({ id: l.id }))
        }
      }
    });
    return NextResponse.json(shift);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Soft Delete (Dev QA Correction)
    await prisma.shift.update({ 
      where: { id },
      data: { isActive: false }
    });
    
    return NextResponse.json({ success: true, action: "soft_delete" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
