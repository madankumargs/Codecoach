// 📚 SINGLE EXAM API
// GET /api/exams/[examId]
// Returns exam details + all questions (without answers for students)
// Used by the student exam page to load the exam content

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ examId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { examId } = await params;

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      syllabus: { select: { title: true, subject: true } },
      questions: {
        select: {
          id: true,
          type: true,
          content: true,
          difficulty: true,
          options: true,
          testCases: true,
          points: true,
          // NOTE: we deliberately exclude "answer" so students can't cheat
        },
        orderBy: { type: "asc" }, // MCQ first, then CODING
      },
    },
  });

  if (!exam) {
    return NextResponse.json({ error: "Exam not found" }, { status: 404 });
  }

  // Students can only enter LIVE exams
  const isAdmin = (session.user as any).role === "ADMIN";
  if (!isAdmin && exam.status !== "LIVE") {
    return NextResponse.json(
      { error: `Exam is ${exam.status.toLowerCase()}. Wait for it to go live.` },
      { status: 403 }
    );
  }

  return NextResponse.json(exam);
}


export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ examId: string }> }
) {
  // Admin-only: update exam status (UPCOMING → LIVE → COMPLETED)
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { examId } = await params;
  const { status } = await req.json();
  const exam = await prisma.exam.update({
    where: { id: examId },
    data: { status },
  });

  return NextResponse.json(exam);
}
