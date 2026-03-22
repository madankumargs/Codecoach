// 📚 EXAMS API
// GET  /api/exams  → List exams (students see theirs, admins see all)
// POST /api/exams  → Create a new exam (Admin only)

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = (session.user as any).role === "ADMIN";

  const exams = await prisma.exam.findMany({
    orderBy: { scheduledAt: "desc" },
    include: {
      syllabus: { select: { title: true, subject: true } },
      _count: {
        select: { questions: true, enrollments: true, submissions: true },
      },
    },
    // Admins see all exams; students only see upcoming/live
    where: isAdmin
      ? undefined
      : { status: { in: ["UPCOMING", "LIVE", "COMPLETED"] } },
  });

  return NextResponse.json(exams);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { title, syllabusId, duration, scheduledAt } = await req.json();

  const exam = await prisma.exam.create({
    data: {
      title,
      syllabusId,
      duration: parseInt(duration),
      scheduledAt: new Date(scheduledAt),
    },
    include: { syllabus: true },
  });

  return NextResponse.json(exam, { status: 201 });
}
