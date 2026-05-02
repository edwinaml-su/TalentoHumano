import { prisma } from "./prisma";

export async function logAudit({
  userId,
  action,
  entity,
  entityId,
  details,
  req
}: {
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: any;
  req?: Request;
}) {
  try {
    const ipAddress = req?.headers.get("x-forwarded-for") || req?.headers.get("x-real-ip") || null;

    return await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        details: details ? JSON.parse(JSON.stringify(details)) : undefined,
        ipAddress: typeof ipAddress === 'string' ? ipAddress : null
      }
    });
  } catch (error) {
    console.error("[AUDIT LOG ERROR]:", error);
  }
}
