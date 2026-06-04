import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { z } from "zod";

const EmployeeCreateSchema = z.object({
  firstName: z.string().min(2, "Primer nombre requerido"),
  middleName: z.string().optional(),
  thirdName: z.string().optional(),
  firstSurname: z.string().min(2, "Primer apellido requerido"),
  secondSurname: z.string().optional(),
  fullName: z.string().min(4, "Nombre completo requerido"),
  dui: z.string().optional(),
  nit: z.string().optional(),
  isssNumber: z.string().optional(),
  nupNumber: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Correo no válido").optional().or(z.literal("")),
  emergencyContact: z.string().optional(),
  employeeCode: z.string().min(1, "Código de empleado requerido"),
  hireDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Fecha de ingreso inválida"),
  contractType: z.string().optional(),
  contractTypeId: z.string().optional(), // Adding this if they pass contract type id
  bankName: z.string().optional(),
  bankAccountType: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  baseSalary: z.number().or(z.string().transform(v => parseFloat(v) || 0)).optional(),
  locationId: z.string().min(1, "Sede requerida"),
  positionId: z.string().min(1, "Cargo requerido"),
  countryId: z.string().min(1, "País requerido"),
  shiftId: z.string().optional(),
});

export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      where: { status: { not: "TERMINATED" } },
      include: {
        location: { include: { organization: true } },
        position: { include: { department: true } },
        country: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = EmployeeCreateSchema.parse(body);

    const defaultCurrency = await prisma.currency.findFirst({ where: { code: 'USD' } });
    if (!defaultCurrency) throw new Error("Moneda base (USD) no encontrada");

    const employee = await prisma.employee.create({
      data: {
        firstName: data.firstName,
        middleName: data.middleName || null,
        thirdName: data.thirdName || null,
        firstSurname: data.firstSurname,
        secondSurname: data.secondSurname || null,
        fullName: data.fullName,
        dui: data.dui || null,
        nit: data.nit || null,
        isssNumber: data.isssNumber || null,
        nupNumber: data.nupNumber || null,
        address: data.address || null,
        phone: data.phone || null,
        personalEmail: data.email || null,
        emergencyContact: data.emergencyContact || null,
        employeeCode: data.employeeCode,
        hireDate: new Date(data.hireDate),
        contractTypeId: data.contractTypeId || null, // Updated mapping
        locationId: data.locationId,
        positionId: data.positionId,
        countryId: data.countryId,
        shiftId: data.shiftId || null,
        status: "ACTIVE",
        salaryHistory: {
          create: { 
            amount: data.baseSalary || 0,
            effectiveDate: new Date(data.hireDate),
            currencyId: defaultCurrency.id
          },
        },
      },
    });

    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    console.error("Error creating employee:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Datos inválidos" }, { status: 400 });
    }
    return NextResponse.json({ error: "No se pudo crear el expediente. Revise duplicados o restricciones de clave." }, { status: 500 });
  }
}
