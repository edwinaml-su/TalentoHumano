import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Hardcoded user for demo purposes (admin@global.com created in seed)
    const user = await prisma.user.findFirst({
      where: { email: 'admin@global.com' },
      include: {
        assignments: {
          include: {
            role: true
          }
        }
      }
    });

    if (!user) {
      console.warn("User admin@global.com not found in Access API");
      return NextResponse.json({ units: [] });
    }

    const isGlobalAdmin = user.assignments.some(a => a.role.isCorporate);
    let unitsData;

    if (isGlobalAdmin) {
      // If Global Admin, fetch ALL units in the system
      const allLocations = await prisma.location.findMany({
        include: {
          organization: {
            include: {
              country: {
                include: {
                  currency: true
                }
              }
            }
          }
        }
      });

      unitsData = allLocations.map(loc => {
        const org = loc.organization as any;
        const country = org.country as any;
        return {
          id: loc.id,
          name: loc.name,
          organizationId: loc.organizationId,
          organizationName: org.commercialName,
          countryId: org.countryId,
          countryName: country.name,
          currencySymbol: country.currency?.symbol || "$",
          currencyCode: country.currency?.code || "USD",
          roleName: "Administrador Global",
          isCorporate: true,
          isDefault: loc.id === 'loc-sv-001'
        };
      });
    } else {
      // Fetch only assigned units
      const assignedUser = await prisma.user.findFirst({
        where: { id: user.id },
        include: {
          assignments: {
            include: {
              location: {
                include: {
                  organization: { include: { country: { include: { currency: true } } } }
                }
              },
              role: true
            }
          }
        }
      });
      
      unitsData = (assignedUser?.assignments || []).map(a => {
        const loc = a.location as any;
        const org = loc.organization as any;
        const country = org.country as any;
        return {
          id: loc.id,
          name: loc.name,
          organizationId: loc.organizationId,
          organizationName: org.commercialName,
          countryId: org.countryId,
          countryName: country.name,
          currencySymbol: country.currency?.symbol || "$",
          currencyCode: country.currency?.code || "USD",
          roleName: a.role.name,
          isCorporate: a.role.isCorporate,
          isDefault: a.isDefault
        };
      });
    }

    return NextResponse.json({ units: unitsData });
  } catch (error) {
    console.error("Access API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
