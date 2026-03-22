// 📚 SUBMISSION API
// POST /api/submissions
// When a student finishes a coding question:
// 1. Run their code against all test cases via Piston
// 2. Evaluate code quality via Gemini AI
// 3. Calculate final score = testScore (40%) + aiScore (60%)
// 4. Save everything to the database

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { runTestCases } from "@/lib/piston";
import { evaluateCode } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { examId, questionId, code, language, timeTaken } = await req.json();

  // Get the question to access test cases and problem statement
  const question = await prisma.question.findUnique({
    where: { id: questionId },
  });
  if (!question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  let testScore = 0;
  let aiScore = 0;
  let aiFeedback = "";
  let testResults = null;

  if (question.type === "CODING" && question.testCases) {
    const tcs = question.testCases as { input: string; expected: string }[];

    // ⚡ Run test cases and AI eval IN PARALLEL — biggest speed win
    // Test cases already run in parallel via Promise.all inside runTestCases()
    const [execution, evaluationResult] = await Promise.all([
      runTestCases(code, language, tcs),
      evaluateCode(question.content, code, language, 0, tcs.length).catch(() => null),
    ]);

    testResults = execution.results;
    testScore = (execution.passed / execution.total) * 40;

    if (evaluationResult) {
      aiScore = evaluationResult.aiScore;
      aiFeedback = JSON.stringify({
        feedback: evaluationResult.feedback,
        improvements: evaluationResult.improvements,
        timeComplexity: evaluationResult.timeComplexity,
        spaceComplexity: evaluationResult.spaceComplexity,
        scores: evaluationResult.scores,
      });
    } else {
      aiScore = Math.round((execution.passed / execution.total) * 60);
      aiFeedback = "AI evaluation unavailable. Score based on test cases.";
    }
  } else if (question.type === "MCQ") {
    // For MCQ, compare the submitted code (answer) with the correct answer
    const submitted = code.trim().toLowerCase();
    const correct = question.answer?.trim().toLowerCase();
    testScore = submitted === correct ? 40 : 0;
    aiScore = submitted === correct ? 60 : 0;
    aiFeedback = submitted === correct ? "Correct answer!" : `Incorrect. The correct answer was: ${question.answer}`;
  }

  const totalScore = Math.round(testScore + aiScore);

  // Save submission to database
  const submission = await prisma.submission.create({
    data: {
      userId: session.user.id!,
      examId,
      questionId,
      code,
      language,
      testScore,
      aiScore,
      totalScore,
      aiFeedback,
      timeTaken: timeTaken || 0,
    },
  });

  return NextResponse.json({
    submission,
    testResults,
    totalScore,
    feedback: aiFeedback,
  });
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const examId = searchParams.get("examId");

  const submissions = await prisma.submission.findMany({
    where: {
      userId: session.user.id!,
      ...(examId ? { examId } : {}),
    },
    include: { question: true, exam: true },
    orderBy: { submittedAt: "desc" },
  });

  return NextResponse.json(submissions);
}
