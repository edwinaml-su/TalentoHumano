import { prisma } from "@/lib/prisma";

export async function validateUnitAccess(userId: string, unitIds: string[]) {
  // Fetch user assignments
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      assignments: {
        include: { role: true }
      }
    }
  });

  if (!user) return false;

  const isGlobalAdmin = user.assignments.some(a => a.role.isCorporate);
  if (isGlobalAdmin) return true; // Global admins have no restrictions

  const assignedUnitIds = user.assignments.map(a => a.locationId);
  
  // Check if every requested unitId is within assignedUnitIds
  const hasAccess = unitIds.every(id => assignedUnitIds.includes(id));
  
  if (!hasAccess) {
    console.error(`[SECURITY AUDIT] User ${userId} attempted unauthorized access to units: ${unitIds.filter(id => !assignedUnitIds.includes(id)).join(', ')}`);
  }

  return hasAccess;
}
