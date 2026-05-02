import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { isActive, email, roleId, unitIds } = body;

    if (unitIds && unitIds.length > 0 && !roleId) {
      return NextResponse.json({ error: "Debe asignar un rol para poder vincular unidades" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        email,
        isActive,
        assignments: unitIds ? {
          deleteMany: {},
          create: unitIds.map((locId: string) => ({
            locationId: locId,
            roleId: roleId,
            isDefault: false
          }))
        } : undefined
      }
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("PATCH USER ERROR:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Check if user exists
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Instead of actual delete, maybe just deactivate? 
    // The user said "Desactivar" in the UI.
    // But usually DELETE removes the record.
    // I'll make it a real DELETE for now, or PATCH for deactivation.
    // Let's do DELETE as requested.
    
    // First delete assignments to avoid FK issues
    await prisma.userUnitAssignment.deleteMany({ where: { userId: id } });
    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ message: "User deleted" });
  } catch (error) {
    console.error("DELETE USER ERROR:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
