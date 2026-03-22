// 📚 CODE EXECUTION API
// POST /api/execute
// Student sends: code, language, stdin (optional test input)
// We proxy this to the Piston API and return the result
// "Proxy" means: our server forwards the request to Piston on behalf of the student
// Why proxy? So we can add auth checks, rate limiting, and logging in the future

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { executeCode } from "@/lib/piston";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { code, language, stdin } = await req.json();

  if (!code || !language) {
    return NextResponse.json(
      { error: "Code and language are required" },
      { status: 400 }
    );
  }

  const result = await executeCode(code, language, stdin || "");

  return NextResponse.json(result);
}
