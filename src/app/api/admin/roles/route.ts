import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-utils";

export async function GET() {
  try {
    const roles = await prisma.role.findMany({
      include: {
        permissions: true,
        _count: { select: { users: true } }
      }
    });
    return NextResponse.json(roles);
  } catch (error) {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, permissionIds } = body;

    const role = await prisma.role.create({
      data: {
        name,
        description,
        permissions: {
          connect: permissionIds.map((id: string) => ({ id }))
        }
      }
    });

    return NextResponse.json(role);
  } catch (error) {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
