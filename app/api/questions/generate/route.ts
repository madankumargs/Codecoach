// 📚 QUESTION GENERATION API
// POST /api/questions/generate
// Admin sends: syllabusId, type (MCQ/CODING), count, difficulty
// We fetch the syllabus text and ask Gemini to generate questions
// Then we save them to the database linked to an exam

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateQuestions } from "@/lib/gemini";
import { Prisma } from "@prisma/client";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { syllabusId, examId, type, count, difficulty } = await req.json();

  // Fetch the syllabus text from DB
  const syllabus = await prisma.syllabus.findUnique({
    where: { id: syllabusId },
  });
  if (!syllabus) {
    return NextResponse.json({ error: "Syllabus not found" }, { status: 404 });
  }

  // Call Gemini to generate questions
  const questions = await generateQuestions(
    syllabus.content,
    type,
    count,
    difficulty
  );

  // Save generated questions to the database
  // Prisma requires Prisma.DbNull (not native null) for nullable JSON fields
  const saved = await prisma.question.createMany({
    data: questions.map((q) => ({
      examId,
      type: q.type,
      content: q.content,
      difficulty: q.difficulty,
      options: q.options ? (q.options as Prisma.InputJsonValue) : Prisma.DbNull,
      answer: q.answer || undefined,
      testCases: q.testCases ? (q.testCases as Prisma.InputJsonValue) : Prisma.DbNull,
      points: q.points,
    })),
  });

  return NextResponse.json({
    message: `Generated and saved ${saved.count} questions`,
    count: saved.count,
  });
}
