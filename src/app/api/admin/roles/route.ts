import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  try {
    const roles = await prisma.role.findMany({
      include: {
        _count: {
          select: { users: true }
        }
      }
    });
    return NextResponse.json(roles);
  } catch (error) {
    console.error("GET ROLES ERROR:", error);
    return NextResponse.json({ error: "Failed to fetch roles" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, description } = await req.json();
    const role = await prisma.role.create({
      data: { name, description }
    });
    return NextResponse.json(role, { status: 201 });
  } catch (error) {
    console.error("POST ROLE ERROR:", error);
    return NextResponse.json({ error: "Failed to create role" }, { status: 500 });
  }
}
