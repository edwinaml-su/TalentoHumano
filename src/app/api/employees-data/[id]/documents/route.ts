import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png"];
const maxSizeBytes = 10 * 1024 * 1024; // 10 MB

const MetaSchema = z.object({
  category: z.enum(["IDENTIFICATION", "CONTRACTUAL", "ACADEMIC", "PAYROLL", "LEGAL"]),
  title: z.string().min(1, "El título es requerido"),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const documents = await prisma.employeeDocument.findMany({
      where: { employeeId: id },
      orderBy: { uploadDate: "desc" },
    });
    return NextResponse.json(documents);
  } catch {
    return NextResponse.json({ error: "Error al obtener documentos" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const category = formData.get("category") as string;
    const title = formData.get("title") as string;

    // Validate metadata
    const meta = MetaSchema.parse({ category, title });

    // Validate file presence and constraints
    if (!file) {
      return NextResponse.json({ error: "El archivo es requerido" }, { status: 400 });
    }
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Solo se permiten archivos PDF, JPG o PNG" },
        { status: 400 }
      );
    }
    if (file.size > maxSizeBytes) {
      return NextResponse.json(
        { error: "El archivo no debe superar 10 MB" },
        { status: 400 }
      );
    }

    // Save file to local filesystem
    const timestamp = Date.now();
    const safeFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filename = `${timestamp}-${safeFilename}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "employees", id);
    const filePath = path.join(uploadDir, filename);

    await mkdir(uploadDir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/employees/${id}/${filename}`;

    // Create DB record
    const document = await prisma.employeeDocument.create({
      data: {
        employeeId: id,
        category: meta.category,
        title: meta.title,
        fileUrl,
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Error al subir documento" }, { status: 500 });
  }
}
