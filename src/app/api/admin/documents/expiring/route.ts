import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    // 1. Fetch expiring/expired documents
    const expiringDocuments = await prisma.employeeDocument.findMany({
      where: {
        expiryDate: {
          lte: thirtyDaysFromNow
        }
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            fullName: true,
            firstName: true,
            firstSurname: true
          }
        }
      },
      orderBy: {
        expiryDate: 'asc'
      }
    });

    // 2. Fetch expiring/expired certifications
    const expiringCertifications = await prisma.certification.findMany({
      where: {
        expiryDate: {
          lte: thirtyDaysFromNow
        }
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            fullName: true,
            firstName: true,
            firstSurname: true
          }
        }
      },
      orderBy: {
        expiryDate: 'asc'
      }
    });

    // 3. Map to a unified alert structure
    const documentAlerts = expiringDocuments.map(doc => {
      const daysRemaining = doc.expiryDate 
        ? Math.ceil((new Date(doc.expiryDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      return {
        id: doc.id,
        type: "DOCUMENT",
        title: doc.title,
        category: doc.category,
        employeeName: doc.employee.fullName,
        employeeCode: doc.employee.employeeCode,
        employeeId: doc.employee.id,
        expiryDate: doc.expiryDate,
        daysRemaining,
        isExpired: daysRemaining < 0
      };
    });

    const certAlerts = expiringCertifications.map(cert => {
      const daysRemaining = cert.expiryDate 
        ? Math.ceil((new Date(cert.expiryDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      return {
        id: cert.id,
        type: "CERTIFICATION",
        title: cert.name,
        category: "ACADEMIC",
        employeeName: cert.employee.fullName,
        employeeCode: cert.employee.employeeCode,
        employeeId: cert.employee.id,
        expiryDate: cert.expiryDate,
        daysRemaining,
        isExpired: daysRemaining < 0
      };
    });

    // Combine and sort by days remaining (expired first)
    const allAlerts = [...documentAlerts, ...certAlerts].sort((a, b) => a.daysRemaining - b.daysRemaining);

    return NextResponse.json(allAlerts);
  } catch (error) {
    console.error("Expiring Documents Fetch Error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
