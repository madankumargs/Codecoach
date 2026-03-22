// 📚 WHAT IS THIS FILE?
// Piston is a FREE public API that runs code in a sandbox environment.
// "Sandbox" means the code runs in an isolated container — so it can't
// access your system, delete files, or do anything harmful.
// No API key needed! It's completely open.

import axios from "axios";

const PISTON_URL = "https://emkc.org/api/v2/piston";

// Maps our language names to what Piston understands
// Piston needs both the language name and the version
const LANGUAGE_MAP: Record<string, { language: string; version: string }> = {
  python: { language: "python", version: "3.10.0" },
  javascript: { language: "javascript", version: "18.15.0" },
  java: { language: "java", version: "15.0.2" },
  cpp: { language: "c++", version: "10.2.0" },
  c: { language: "c", version: "10.2.0" },
};

export type ExecutionResult = {
  stdout: string;     // Normal output from the program
  stderr: string;     // Error messages (if any)
  exitCode: number;   // 0 = success, non-zero = error
  memoryUsed?: number;
};

/**
 * Executes code using the Piston API
 * @param code - The source code to run
 * @param language - Language key: "python", "javascript", "java", "cpp", "c"
 * @param stdin - Optional input to feed to the program (for test cases)
 */
export async function executeCode(
  code: string,
  language: string,
  stdin: string = ""
): Promise<ExecutionResult> {
  const langConfig = LANGUAGE_MAP[language];
  if (!langConfig) {
    throw new Error(`Unsupported language: ${language}`);
  }

  // This is the request body we send to Piston API
  const response = await axios.post(`${PISTON_URL}/execute`, {
    language: langConfig.language,
    version: langConfig.version,
    files: [
      {
        // The file that will be created and executed in the sandbox
        name: `main.${getExtension(language)}`,
        content: code,
      },
    ],
    stdin: stdin, // Input data (like typing in the terminal)
    run_timeout: 5000, // Kill execution after 5 seconds (prevents infinite loops)
    compile_timeout: 10000, // Kill compilation after 10 seconds
  });

  const { run } = response.data;

  return {
    stdout: run.stdout || "",
    stderr: run.stderr || "",
    exitCode: run.code ?? 0,
  };
}

/**
 * Runs code against multiple test cases and returns results
 * This is how we grade coding problems — run all test cases and see how many pass
 */
export async function runTestCases(
  code: string,
  language: string,
  testCases: { input: string; expected: string }[]
): Promise<{
  passed: number;
  total: number;
  results: { input: string; expected: string; actual: string; passed: boolean }[];
}> {
  // ⚡ Run ALL test cases in parallel — massive speed improvement!
  // Promise.all fires all requests simultaneously instead of waiting one-by-one
  const results = await Promise.all(
    testCases.map(async (tc) => {
      try {
        const result = await executeCode(code, language, tc.input);
        const actual = result.stdout.trim();
        const expected = tc.expected.trim();
        return { input: tc.input, expected, actual, passed: actual === expected };
      } catch {
        return { input: tc.input, expected: tc.expected.trim(), actual: "ERROR", passed: false };
      }
    })
  );

  const passed = results.filter((r) => r.passed).length;
  return { passed, total: testCases.length, results };
}

function getExtension(language: string): string {
  const map: Record<string, string> = {
    python: "py",
    javascript: "js",
    java: "java",
    cpp: "cpp",
    c: "c",
  };
  return map[language] || "txt";
}

export { LANGUAGE_MAP };
