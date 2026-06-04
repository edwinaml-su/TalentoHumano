import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { jobPostingId, candidateName, candidateEmail, candidatePhone } = body;

    if (!jobPostingId || !candidateName || !candidateEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const application = await prisma.jobApplication.create({
      data: {
        jobPostingId,
        candidateName,
        candidateEmail,
        candidatePhone,
        status: "NEW"
      }
    });

    return NextResponse.json(application);
  } catch (error) {
    console.error("APPLY API ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
