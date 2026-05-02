import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { z } from "zod";

const UserCreateSchema = z.object({
  email: z.string().email("Formato de correo inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  roleId: z.string().optional(),
  employeeId: z.string().optional(),
  unitIds: z.array(z.string()).optional()
});

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        employee: true,
        assignments: {
          include: { 
            location: true,
            role: true
          }
        }
      }
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error("GET USERS ERROR:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = UserCreateSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues?.[0]?.message || "Datos inválidos" }, { status: 400 });
    }

    const { email, password, roleId, employeeId, unitIds } = result.data;

    // Validación Fantasma: No permitir unidades sin rol asignado
    if (unitIds && unitIds.length > 0 && !roleId) {
      return NextResponse.json({ error: "Debe asignar un rol para poder vincular unidades" }, { status: 400 });
    }

    // Inconsistencia Relacional de Empleados
    const parsedEmployeeId = employeeId === "" ? null : employeeId;

    // Hasheo criptográfico
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        employeeId: parsedEmployeeId,
        assignments: unitIds && roleId ? {
          create: unitIds.map((id: string) => ({
            locationId: id,
            roleId: roleId,
            isDefault: false
          }))
        } : undefined
      }
    });
    return NextResponse.json(user, { status: 201 });
  } catch (error: any) {
    console.error("POST USER ERROR:", error);
    if (error.code === 'P2002') {
       return NextResponse.json({ error: "Ya existe un usuario con este correo electrónico o vinculado a este empleado." }, { status: 400 });
    }
    return NextResponse.json({ error: "Ocurrió un error interno al crear el usuario." }, { status: 500 });
  }
}
