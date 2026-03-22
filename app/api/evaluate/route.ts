// 📚 AI CODE EVALUATION API
// POST /api/evaluate
// Takes student code + problem statement → Gemini evaluates code quality
// Returns structured score (0-60) + detailed feedback
// This is called from the submissions route after test cases run

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { evaluateCode } from "@/lib/gemini";

// VERY IMPORTANT for Vercel: overrides the default 10-second timeout
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { problemStatement, code, language, testsPassed, testsTotal } = await req.json();

  if (!code || !language) {
    return NextResponse.json({ error: "Code and language are required" }, { status: 400 });
  }

  try {
    const evaluation = await evaluateCode(
      problemStatement || "Solve the given programming problem.",
      code,
      language,
      testsPassed ?? 0,
      testsTotal ?? 1
    );

    return NextResponse.json(evaluation);
  } catch (err: any) {
    return NextResponse.json(
      { error: "AI evaluation failed", details: err.message },
      { status: 500 }
    );
  }
}
