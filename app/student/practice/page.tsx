"use client";

// 📚 PRACTICE PAGE
// Students can practice coding any time — no timer, unlimited tries, instant feedback.
// This is a "use client" component because it has interactive state:
// - The code they're typing (state)
// - The output from running code (state)
// - Loading spinner while code runs (state)

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import CodeEditor from "@/components/CodeEditor";
import { Play, Loader2, RotateCcw, CheckCircle2, XCircle, LayoutDashboard, Code2, BookOpen, Trophy, BarChart3 } from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
  { label: "Practice", href: "/student/practice", icon: Code2 },
  { label: "Exams", href: "/student/exams", icon: BookOpen },
  { label: "Leaderboard", href: "/student/leaderboard", icon: Trophy },
  { label: "Analytics", href: "/student/analytics", icon: BarChart3 },
];

const STARTER_CODE: Record<string, string> = {
  python: `# Write your Python code here\ndef solution():\n    print("Hello, CodeLab!")\n\nsolution()`,
  javascript: `// Write your JavaScript here\nfunction solution() {\n    console.log("Hello, CodeLab!");\n}\n\nsolution();`,
  java: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, CodeLab!");\n    }\n}`,
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, CodeLab!" << endl;\n    return 0;\n}`,
  c: `#include <stdio.h>\n\nint main() {\n    printf("Hello, CodeLab!\\n");\n    return 0;\n}`,
};

export default function PracticePage() {
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(STARTER_CODE.python);
  const [stdin, setStdin] = useState("");
  const [output, setOutput] = useState<{ stdout: string; stderr: string; exitCode: number } | null>(null);
  const [running, setRunning] = useState(false);

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    setCode(STARTER_CODE[lang]);
    setOutput(null);
  };

  const runCode = async () => {
    setRunning(true);
    setOutput(null);

    // 📚 fetch() is the browser's built-in way to make HTTP requests.
    // We call our own API route which proxies to Piston.
    const res = await fetch("/api/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, language, stdin }),
    });

    const data = await res.json();
    setOutput(data);
    setRunning(false);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar role="STUDENT" userName="Student" />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header bar */}
        <div className="border-b border-slate-700/50 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Practice Mode</h1>
            <p className="text-sm text-slate-400">Write code, run it instantly. No pressure.</p>
          </div>

          {/* Language selector */}
          <div className="flex items-center gap-2">
            {Object.keys(STARTER_CODE).map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  language === lang
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                }`}
              >
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden p-4 gap-4">
          {/* Code Editor (left) */}
          <div className="flex-1 flex flex-col gap-3 min-w-0">
            <CodeEditor
              value={code}
              onChange={setCode}
              language={language}
              height="calc(100vh - 320px)"
            />

            {/* stdin input */}
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Standard Input (stdin)</label>
              <textarea
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
                placeholder="Provide input for your program here (optional)..."
                className="input-field h-16 resize-none font-code text-sm"
              />
            </div>

            {/* Run button */}
            <div className="flex gap-3">
              <button
                onClick={runCode}
                disabled={running}
                className="btn-primary flex-1 justify-center"
              >
                {running ? (
                  <><Loader2 size={16} className="animate-spin" /> Running...</>
                ) : (
                  <><Play size={16} /> Run Code</>
                )}
              </button>
              <button
                onClick={() => { setCode(STARTER_CODE[language]); setOutput(null); }}
                className="btn-secondary px-4"
                title="Reset to starter code"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>

          {/* Output Panel (right) */}
          <div className="w-80 flex flex-col glass p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-sm">Output</h2>
              {output && (
                <div className="flex items-center gap-1.5">
                  {output.exitCode === 0 ? (
                    <><CheckCircle2 size={14} className="text-green-400" /><span className="text-xs text-green-400">Success</span></>
                  ) : (
                    <><XCircle size={14} className="text-red-400" /><span className="text-xs text-red-400">Error</span></>
                  )}
                </div>
              )}
            </div>

            <div className="flex-1 bg-[#0d1117] rounded-xl p-4 font-code text-sm overflow-auto min-h-0">
              {!output && !running && (
                <p className="text-slate-500 text-xs">Click "Run Code" to see output here</p>
              )}
              {running && (
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <Loader2 size={12} className="animate-spin" /> Executing...
                </div>
              )}
              {output?.stdout && (
                <pre className="text-green-300 whitespace-pre-wrap break-all text-xs">{output.stdout}</pre>
              )}
              {output?.stderr && (
                <pre className="text-red-400 whitespace-pre-wrap break-all text-xs mt-2">{output.stderr}</pre>
              )}
            </div>

            {/* 📚 Tip box */}
            <div className="mt-4 p-3 bg-blue-500/5 border border-blue-500/20 rounded-xl">
              <p className="text-xs text-blue-400 font-medium mb-1">💡 Learning Tip</p>
              <p className="text-xs text-slate-400">
                Use the stdin box to test your code with different inputs — like a user typing into your program!
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

