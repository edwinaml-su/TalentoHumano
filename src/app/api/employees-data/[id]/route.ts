import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { z } from "zod";

const UpdateSchema = z.object({
  firstName: z.string().min(2).optional(),
  firstSurname: z.string().min(2).optional(),
  fullName: z.string().min(4).optional(),
  employeeCode: z.string().min(1).optional(),
  status: z.enum(["ACTIVE", "SUSPENDED", "INACTIVE", "TERMINATED"]).optional(),
  baseSalary: z.number().or(z.string().transform(v => parseFloat(v) || 0)).optional(),
  // Allow other loosely typed fields since frontend sends full object
}).passthrough();

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        location: { include: { organization: true } },
        position: { include: { department: true } },
        country: true,
        salaryHistory: { include: { currency: true }, orderBy: { effectiveDate: 'desc' }, take: 1 },
        documents: true,
        financialObligations: true,
        studies: true,
        certifications: true
      },
    });

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    return NextResponse.json(employee);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch employee" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsedParams = UpdateSchema.parse(body);

    const { 
      location, position, country, salaryHistory, documents, financialObligations, studies, certifications,
      baseSalary, 
      ...updateData 
    } = parsedParams;
    
    // Check if salary changed
    const currentEmployee = await prisma.employee.findUnique({
      where: { id },
      include: {
        salaryHistory: {
          orderBy: { effectiveDate: 'desc' },
          take: 1
        }
      }
    });

    const isSalaryChanged = 
      baseSalary !== undefined && 
      currentEmployee?.salaryHistory[0]?.amount && 
      Number(currentEmployee.salaryHistory[0].amount) !== baseSalary;

    let historyAppend = {};
    if (isSalaryChanged && baseSalary !== undefined) {
      const currencyId = currentEmployee?.salaryHistory[0]?.currencyId;
      if (currencyId) {
        historyAppend = {
          salaryHistory: {
            create: {
              amount: baseSalary,
              effectiveDate: new Date(),
              currencyId
            }
          }
        };
      }
    }

    const employee = await prisma.employee.update({
      where: { id },
      data: {
        ...updateData,
        ...historyAppend
      },
    });
    return NextResponse.json(employee);
  } catch (error) {
    console.error("Update error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update employee" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Soft Delete Implementation
    await prisma.employee.update({
      where: { id },
      data: {
        status: "TERMINATED",
        terminationDate: new Date(),
        // Cannot literally delete historic employee due to foreign keys and compliance
      }
    });

    return NextResponse.json({ message: "Employee terminated successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to terminate employee" }, { status: 500 });
  }
}
