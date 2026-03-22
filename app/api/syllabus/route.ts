// 📚 SYLLABUS API
// POST /api/syllabus  → Create a new syllabus (Admin only)
// GET  /api/syllabus  → List all syllabi

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const syllabi = await prisma.syllabus.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { exams: true } } },
  });

  return NextResponse.json(syllabi);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  // Role check: only admins can create syllabi
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { title, subject, content } = await req.json();
  if (!title || !subject || !content) {
    return NextResponse.json({ error: "All fields required" }, { status: 400 });
  }

  const syllabus = await prisma.syllabus.create({
    data: {
      title,
      subject,
      content,
      adminId: session.user.id!,
    },
  });

  return NextResponse.json(syllabus, { status: 201 });
}
