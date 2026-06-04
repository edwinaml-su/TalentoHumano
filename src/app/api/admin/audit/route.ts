import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-utils";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100 // Last 100 actions
    });

    const userIds = Array.from(new Set(logs.map(log => log.userId).filter(Boolean))) as string[];
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, email: true }
    });

    const userMap = new Map(users.map(u => [u.id, u.email]));

    const mappedLogs = logs.map(log => {
      const email = log.userId ? userMap.get(log.userId) : null;
      const username = email ? email.split('@')[0] : 'Sistema';
      
      return {
        ...log,
        user: {
          username: username
        },
        module: log.entity || "General"
      };
    });

    return NextResponse.json(mappedLogs);
  } catch (error) {
    console.error("AUDIT LOG API ERROR:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
