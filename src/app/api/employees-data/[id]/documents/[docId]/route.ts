import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unlink } from "fs/promises";
import path from "path";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  try {
    const { id, docId } = await params;

    // Find the document
    const document = await prisma.employeeDocument.findUnique({
      where: { id: docId }
    });

    if (!document) {
      return NextResponse.json({ error: "Documento no encontrado" }, { status: 404 });
    }

    if (document.employeeId !== id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // Try deleting file from disk
    if (document.fileUrl) {
      try {
        const filePath = path.join(process.cwd(), "public", document.fileUrl);
        await unlink(filePath);
      } catch (err) {
        console.warn("Could not delete file from disk:", err);
      }
    }

    // Delete record from DB
    await prisma.employeeDocument.delete({
      where: { id: docId }
    });

    return NextResponse.json({ success: true, message: "Documento eliminado exitosamente" });
  } catch (error) {
    console.error("Delete Document Error:", error);
    return NextResponse.json({ error: "Error al eliminar documento" }, { status: 500 });
  }
}
