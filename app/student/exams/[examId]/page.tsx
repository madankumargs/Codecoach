"use client";

// 📚 STUDENT EXAM PAGE
// The most critical page — fullscreen timed exam with:
// - Left panel: questions list (MCQ + Coding)
// - Right panel: Monaco editor (for coding) or radio buttons (for MCQ)
// - Top bar: countdown timer + question progress
// - Auto-submit when timer hits zero

import { useState, useEffect, useRef, useCallback, use } from "react";
import CodeEditor from "@/components/CodeEditor";
import {
  Clock, ChevronRight, ChevronLeft, Send, AlertTriangle,
  CheckCircle2, Code2, ListChecks, Maximize2, Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";

type TestCase = { input: string; expected: string };
type Question = {
  id: string;
  type: "MCQ" | "CODING";
  content: string;
  difficulty: string;
  options?: string[] | null;
  answer?: string | null;
  testCases?: TestCase[] | null;
  points: number;
};
type Exam = {
  id: string;
  title: string;
  duration: number;
  questions: Question[];
};

const STARTER_CODE: Record<string, string> = {
  python: "# Write your solution here\n",
  javascript: "// Write your solution here\n",
  java: "public class Main {\n    public static void main(String[] args) {\n        // Write your solution here\n    }\n}",
  cpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}",
  c: "#include <stdio.h>\n\nint main() {\n    // Write your solution here\n    return 0;\n}",
};

export default function ExamPage({ params }: { params: Promise<{ examId: string }> }) {
  const { examId } = use(params);
  const router = useRouter();
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Exam state
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({}); // questionId → answer/code
  const [languages, setLanguages] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [tabWarning, setTabWarning] = useState(0);
  const startTime = useRef(Date.now());

  // Fetch exam data
  useEffect(() => {
    fetch(`/api/exams/${examId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setError(data.error); setLoading(false); return; }
        setExam(data);
        setTimeLeft(data.duration * 60); // convert minutes to seconds
        setLoading(false);
      })
      .catch(() => { setError("Failed to load exam"); setLoading(false); });
  }, [examId]);

  // Countdown timer
  useEffect(() => {
    if (!exam || submitted || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(interval); handleSubmit(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [exam, submitted]);

  // Tab visibility detection (anti-cheat)
  useEffect(() => {
    const handleBlur = () => {
      setTabWarning((w) => w + 1);
    };
    document.addEventListener("visibilitychange", handleBlur);
    return () => document.removeEventListener("visibilitychange", handleBlur);
  }, []);

  // Request fullscreen on load
  useEffect(() => {
    if (!loading && exam) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    }
  }, [loading, exam]);

  const handleSubmit = useCallback(async () => {
    if (submitting || submitted || !exam) return;
    setSubmitting(true);
    document.exitFullscreen?.().catch(() => {});

    const timeTaken = Math.round((Date.now() - startTime.current) / 1000);
    const submissionResults = [];

    for (const question of exam.questions) {
      const code = answers[question.id] || "";
      const language = languages[question.id] || "python";
      if (!code.trim()) continue;

      try {
        const res = await fetch("/api/submissions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            examId: exam.id,
            questionId: question.id,
            code,
            language,
            timeTaken,
          }),
        });
        const data = await res.json();
        submissionResults.push({ questionId: question.id, ...data });
      } catch (err) {
        console.error("Submission error for question", question.id, err);
      }
    }

    setResults(submissionResults);
    setSubmitted(true);
    setSubmitting(false);
  }, [exam, answers, languages, submitting, submitted]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const timerColor = timeLeft < 300 ? "text-red-400" : timeLeft < 600 ? "text-yellow-400" : "text-green-400";

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 size={40} className="animate-spin text-blue-400 mx-auto mb-4" />
        <p className="text-slate-400">Loading exam...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="glass p-8 text-center max-w-md">
        <AlertTriangle size={40} className="text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Exam Error</h2>
        <p className="text-slate-400 mb-4">{error}</p>
        <button onClick={() => router.push("/student/exams")} className="btn-primary">Back to Exams</button>
      </div>
    </div>
  );

  // ─── RESULTS SCREEN ───────────────────────────────
  if (submitted) {
    const totalScore = results.reduce((sum, r) => sum + (r.totalScore || 0), 0);
    const maxScore = (exam?.questions.length || 1) * 100;
    const pct = Math.round((totalScore / maxScore) * 100);

    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-2xl w-full">
          <div className="glass p-8 text-center mb-6">
            <div className={`text-7xl font-black mb-2 ${pct >= 80 ? "text-green-400" : pct >= 50 ? "text-yellow-400" : "text-red-400"}`}>
              {pct}%
            </div>
            <h1 className="text-2xl font-bold mb-1">Exam Submitted!</h1>
            <p className="text-slate-400">Total: {totalScore} / {maxScore} points</p>
          </div>

          {results.map((r, i) => {
            let feedback: any = {};
            try { feedback = JSON.parse(r.feedback || "{}"); } catch {}
            return (
              <div key={i} className="glass p-6 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Question {i + 1}</h3>
                  <span className={`text-lg font-bold ${r.totalScore >= 80 ? "text-green-400" : r.totalScore >= 50 ? "text-yellow-400" : "text-red-400"}`}>
                    {r.totalScore}/100
                  </span>
                </div>
                {r.testResults && (
                  <div className="flex gap-2 mb-3">
                    {r.testResults.map((tc: any, j: number) => (
                      <span key={j} className={`text-xs px-2 py-1 rounded-full ${tc.passed ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                        Test {j + 1}: {tc.passed ? "✓" : "✗"}
                      </span>
                    ))}
                  </div>
                )}
                {feedback.feedback && (
                  <p className="text-sm text-slate-300 mt-2">{feedback.feedback}</p>
                )}
                {feedback.timeComplexity && (
                  <p className="text-xs text-slate-500 mt-1">Complexity: {feedback.timeComplexity}</p>
                )}
              </div>
            );
          })}

          <button onClick={() => router.push("/student/dashboard")} className="btn-primary w-full justify-center mt-4">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentQ = exam!.questions?.[currentIdx];
  const answeredCount = exam!.questions?.filter((q) => answers[q.id]?.trim()).length ?? 0;

  if (!currentQ) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="glass p-8 text-center max-w-md">
        <AlertTriangle size={40} className="text-yellow-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">No Questions</h2>
        <p className="text-slate-400 mb-4">This exam has no questions yet.</p>
        <button onClick={() => router.push("/student/exams")} className="btn-primary">Back to Exams</button>
      </div>
    </div>
  );

  // ─── EXAM UI ──────────────────────────────────────
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#0a0f1a]">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <Code2 size={16} className="text-blue-400" />
          </div>
          <div>
            <h1 className="font-semibold text-sm">{exam!.title}</h1>
            <p className="text-xs text-slate-500">{answeredCount}/{exam!.questions.length} answered</p>
          </div>
        </div>

        {tabWarning > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-lg">
            <AlertTriangle size={14} className="text-red-400" />
            <span className="text-xs text-red-400">Tab switch detected ({tabWarning})</span>
          </div>
        )}

        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 font-mono text-xl font-bold ${timerColor}`}>
            <Clock size={18} />
            {formatTime(timeLeft)}
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary text-sm"
          >
            {submitting ? <><Loader2 size={14} className="animate-spin" /> Submitting...</> : <><Send size={14} /> Submit Exam</>}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Question Panel */}
        <div className="w-[340px] flex-shrink-0 border-r border-slate-700/50 flex flex-col overflow-hidden">
          {/* Question Navigation */}
          <div className="p-3 border-b border-slate-700/50 flex flex-wrap gap-2">
            {exam!.questions.map((q, i) => (
              <button
                key={q.id}
                onClick={() => setCurrentIdx(i)}
                className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                  i === currentIdx
                    ? "bg-blue-500 text-white"
                    : answers[q.id]?.trim()
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "bg-slate-700/50 text-slate-400 hover:bg-slate-600/50"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {/* Question Content */}
          <div className="flex-1 overflow-auto p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-xs px-2 py-1 rounded-full border ${
                currentQ.type === "MCQ"
                  ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                  : "bg-blue-500/20 text-blue-400 border-blue-500/30"
              }`}>
                {currentQ.type === "MCQ" ? <ListChecks size={10} className="inline mr-1" /> : <Code2 size={10} className="inline mr-1" />}
                {currentQ.type}
              </span>
              <span className="text-xs text-slate-500 capitalize">{currentQ.difficulty}</span>
              <span className="text-xs text-slate-500 ml-auto">{currentQ.points} pts</span>
            </div>

            <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap mb-4">
              {currentQ.content}
            </div>

            {/* MCQ Options */}
            {currentQ.type === "MCQ" && currentQ.options && (
              <div className="space-y-2">
                {currentQ.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => setAnswers((a) => ({ ...a, [currentQ.id]: opt }))}
                    className={`w-full text-left p-3 rounded-xl text-sm transition-all border ${
                      answers[currentQ.id] === opt
                        ? "bg-blue-500/20 border-blue-500 text-blue-300"
                        : "bg-slate-800/50 border-slate-700/50 hover:border-slate-600 text-slate-300"
                    }`}
                  >
                    <span className="font-bold mr-2">{String.fromCharCode(65 + i)}.</span>
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {/* Test Cases (Coding) */}
            {currentQ.type === "CODING" && currentQ.testCases && (
              <div className="mt-4">
                <p className="text-xs text-slate-500 font-medium mb-2">Sample Test Cases:</p>
                {(currentQ.testCases as TestCase[]).slice(0, 2).map((tc, i) => (
                  <div key={i} className="bg-[#0d1117] rounded-lg p-3 mb-2 font-code text-xs">
                    <p className="text-slate-400">Input: <span className="text-green-300">{tc.input}</span></p>
                    <p className="text-slate-400">Output: <span className="text-blue-300">{tc.expected}</span></p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Prev / Next */}
          <div className="p-3 border-t border-slate-700/50 flex gap-2">
            <button
              onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
              disabled={currentIdx === 0}
              className="btn-secondary flex-1 justify-center text-sm disabled:opacity-40"
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <button
              onClick={() => setCurrentIdx((i) => Math.min(exam!.questions.length - 1, i + 1))}
              disabled={currentIdx === exam!.questions.length - 1}
              className="btn-secondary flex-1 justify-center text-sm disabled:opacity-40"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Right: Editor / MCQ Already handled in panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {currentQ.type === "CODING" ? (
            <>
              {/* Language selector */}
              <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-700/50 bg-slate-900/50">
                <span className="text-xs text-slate-400">Language:</span>
                {Object.keys(STARTER_CODE).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      setLanguages((l) => ({ ...l, [currentQ.id]: lang }));
                      if (!answers[currentQ.id]) {
                        setAnswers((a) => ({ ...a, [currentQ.id]: STARTER_CODE[lang] }));
                      }
                    }}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                      (languages[currentQ.id] || "python") === lang
                        ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>

              {/* Monaco Editor */}
              <div className="flex-1 overflow-hidden">
                <CodeEditor
                  value={answers[currentQ.id] ?? STARTER_CODE[languages[currentQ.id] || "python"]}
                  onChange={(val) => setAnswers((a) => ({ ...a, [currentQ.id]: val || "" }))}
                  language={languages[currentQ.id] || "python"}
                  height="100%"
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-slate-500">
                <ListChecks size={48} className="mx-auto mb-3 text-slate-700" />
                <p className="text-sm">Select your answer in the question panel on the left</p>
                {answers[currentQ.id] && (
                  <p className="text-green-400 text-sm mt-2">
                    ✓ Selected: {answers[currentQ.id]}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
