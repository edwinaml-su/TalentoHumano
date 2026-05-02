import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const countryCode = searchParams.get("country");
  const frequency = searchParams.get("frequency");

  try {
    const table = await prisma.taxTable.findFirst({
      where: {
        country: { isoCode: countryCode || undefined },
        frequency: frequency || undefined,
      },
      include: {
        brackets: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!table) return NextResponse.json(null);

    // Transform Decimals to Numbers for JSON serialization
    const sanitizedTable = {
      ...table,
      brackets: table.brackets.map(b => ({
        ...b,
        fromAmount: Number(b.fromAmount),
        toAmount: b.toAmount ? Number(b.toAmount) : null,
        fixedAmount: Number(b.fixedAmount),
        percentage: Number(b.percentage),
        excessOf: Number(b.excessOf),
      }))
    };

    return NextResponse.json(sanitizedTable);
  } catch (error) {
    console.error("Fetch Tax Table Error:", error);
    return NextResponse.json({ error: "Failed to fetch tax table" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tableId, brackets } = body;

    // Transaction to update brackets
    await prisma.$transaction([
      // Delete old brackets
      prisma.taxBracket.deleteMany({
        where: { taxTableId: tableId },
      }),
      // Create new brackets
      prisma.taxBracket.createMany({
        data: brackets.map((b: any, idx: number) => ({
          taxTableId: tableId,
          fromAmount: b.fromAmount,
          toAmount: b.toAmount === "null" || !b.toAmount ? null : b.toAmount,
          fixedAmount: b.fixedAmount,
          percentage: b.percentage,
          excessOf: b.excessOf,
          order: idx,
        })),
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Save Tax Table Error:", error);
    return NextResponse.json({ error: "Failed to save tax table" }, { status: 500 });
  }
}
