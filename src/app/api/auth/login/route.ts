import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { z } from "zod";
import { login } from "@/lib/auth-utils";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = LoginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Datos de acceso inválidos" }, { status: 400 });
    }

    const { email, password } = result.data;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        assignments: {
          include: {
            role: true,
            location: true
          }
        }
      }
    });

    if (!user) {
      // Avoid timing attacks by still "checking" something or just generic error
      return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json({ error: "Usuario inactivo. Contacte al administrador." }, { status: 403 });
    }

    // GENERATE SECURE SESSION
    await login({
      id: user.id,
      email: user.email,
      employeeId: user.employeeId
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        employeeId: user.employeeId,
        assignments: user.assignments.map(a => ({
          unitId: a.locationId,
          unitName: a.location.name,
          role: a.role.name,
          isCorporate: a.role.isCorporate,
          isDefault: a.isDefault
        }))
      }
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
