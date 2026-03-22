// 📚 WHAT IS THIS FILE?
// This is our Gemini AI client — the helper that talks to Google's AI.
// We use it for TWO things:
//   1. Generating exam questions from syllabus text
//   2. Evaluating student code quality (giving it a score out of 60)

import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini client with your API key
// process.env reads from .env.local — the ! tells TypeScript "trust me, this exists"
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// gemini-2.0-flash is significantly faster than 1.5-flash with better quality
export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  generationConfig: {
    // Lower temperature = more deterministic JSON output (less retries)
    temperature: 0.4,
    // Limit output tokens — we only need structured JSON, not essays
    maxOutputTokens: 2048,
  },
});

// ─── QUESTION GENERATION ───────────────────────────────────────────────────────

export type GeneratedQuestion = {
  type: "MCQ" | "CODING";
  content: string;
  difficulty: string;
  options?: string[]; // Only for MCQ questions
  answer?: string; // Only for MCQ questions
  testCases?: { input: string; expected: string }[]; // Only for CODING questions
  points: number;
};

/**
 * Generates exam questions from syllabus content using Gemini AI
 * @param syllabusText - The extracted text from the syllabus
 * @param type - "MCQ" or "CODING"
 * @param count - How many questions to generate
 * @param difficulty - "easy", "medium", or "hard"
 */
export async function generateQuestions(
  syllabusText: string,
  type: "MCQ" | "CODING",
  count: number,
  difficulty: string = "medium"
): Promise<GeneratedQuestion[]> {
  // We write a "prompt" — this is the instruction we give the AI
  // Good prompts = good results. This is called "prompt engineering"
  const prompt =
    type === "MCQ"
      ? `You are an expert educator. Based on the following syllabus content, generate ${count} multiple choice questions at ${difficulty} difficulty level.

SYLLABUS:
${syllabusText}

Rules:
- Questions must be directly based on the syllabus content
- Each question must have exactly 4 options (A, B, C, D)
- Clearly indicate the correct answer
- Make distractors (wrong answers) plausible but clearly wrong

Return ONLY a valid JSON array, no markdown, no explanation:
[
  {
    "type": "MCQ",
    "content": "question text here",
    "difficulty": "${difficulty}",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "Option A",
    "points": 10
  }
]`
      : `You are an expert programming educator. Based on the following syllabus content, generate ${count} coding problems at ${difficulty} difficulty level.

SYLLABUS:
${syllabusText}

Rules:
- Problems must relate to concepts in the syllabus
- Include clear problem statements with examples
- Provide at least 3 test cases (input/expected output pairs)
- Problems should be solvable in Python, JavaScript, Java, or C++

Return ONLY a valid JSON array, no markdown, no explanation:
[
  {
    "type": "CODING",
    "content": "Full problem description with examples and constraints",
    "difficulty": "${difficulty}",
    "testCases": [
      {"input": "5", "expected": "25"},
      {"input": "0", "expected": "0"},
      {"input": "10", "expected": "100"}
    ],
    "points": 20
  }
]`;

  const result = await geminiModel.generateContent(prompt);
  const text = result.response.text();
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  // Strip any leading non-JSON text before the array
  const jsonStart = cleaned.indexOf("[");
  const parsed = cleaned.slice(jsonStart === -1 ? 0 : jsonStart);
  return JSON.parse(parsed) as GeneratedQuestion[];
}

// ─── CODE EVALUATION ───────────────────────────────────────────────────────────

export type CodeEvaluationResult = {
  aiScore: number; // 0-60
  feedback: string;
  improvements: string[];
  timeComplexity: string;
  spaceComplexity: string;
  scores: {
    correctness: number;
    efficiency: number;
    readability: number;
    bestPractices: number;
  };
};

/**
 * Evaluates student code quality using Gemini AI
 * @param problem - The original problem statement
 * @param code - The student's submitted code
 * @param language - Programming language used
 * @param testsPassed - How many test cases passed (affects AI context)
 */
export async function evaluateCode(
  problem: string,
  code: string,
  language: string,
  testsPassed: number,
  totalTests: number
): Promise<CodeEvaluationResult> {
  const prompt = `You are an expert code reviewer evaluating a student's coding exam submission.

PROBLEM:
${problem}

STUDENT'S CODE (${language}):
${code}

TEST RESULTS: ${testsPassed}/${totalTests} test cases passed.

Evaluate the code on these 4 criteria (each out of 15 points, total 60):
1. Correctness & Logic (15pts): Is the approach logically sound?
2. Efficiency (15pts): Is the time/space complexity optimal?
3. Readability (15pts): Is the code clean, well-named, easy to understand?
4. Best Practices (15pts): Error handling, edge cases, coding conventions?

Return ONLY valid JSON, no markdown:
{
  "aiScore": 45,
  "timeComplexity": "O(n)",
  "spaceComplexity": "O(1)",
  "feedback": "Your solution demonstrates a solid understanding of the problem. You correctly identified the core algorithm needed. However, there are some areas for improvement...",
  "improvements": [
    "Consider using a HashMap for O(1) lookup instead of nested loops",
    "Add input validation to handle edge cases like empty arrays",
    "Variable names like 'x' and 'y' make the code harder to understand — use descriptive names"
  ],
  "scores": {
    "correctness": 13,
    "efficiency": 10,
    "readability": 12,
    "bestPractices": 10
  }
}`;

  const result = await geminiModel.generateContent(prompt);
  const text = result.response.text();
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const jsonStart = cleaned.indexOf("{");
  const parsed = cleaned.slice(jsonStart === -1 ? 0 : jsonStart);
  return JSON.parse(parsed) as CodeEvaluationResult;
}
