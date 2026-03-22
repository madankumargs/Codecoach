"use client";

// 📚 ADMIN: CREATE SYLLABUS PAGE
// Admins type/paste their syllabus content here.
// The text is saved to the DB and used by Gemini to generate exam questions.

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { useRouter } from "next/navigation";
import { LayoutDashboard, BookOpen, FileText, BarChart3, PlusCircle, Loader2, CheckCircle } from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Syllabi", href: "/admin/syllabus", icon: FileText },
  { label: "Exams", href: "/admin/exams", icon: BookOpen },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
];

export default function AdminSyllabusPage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: "", subject: "", content: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/syllabus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const d = await res.json();
      setError(d.error || "Failed to save");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/admin/exams/new"), 1500);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar role="ADMIN" userName="Admin" />

      <main className="flex-1 p-8 overflow-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Add Syllabus</h1>
          <p className="text-slate-400 mt-1">
            Paste your syllabus content — Gemini AI will read this to generate exam questions.
          </p>
        </div>

        {success ? (
          <div className="glass p-8 text-center">
            <CheckCircle className="text-green-400 mx-auto mb-3" size={48} />
            <h2 className="text-xl font-bold text-green-400 mb-2">Syllabus Saved!</h2>
            <p className="text-slate-400">Redirecting you to create an exam...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass p-8 space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Syllabus Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Data Structures Midterm 2025"
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Subject</label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                  placeholder="e.g. Computer Science"
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Syllabus Content
                <span className="ml-2 text-xs text-slate-500">
                  (Paste the full syllabus text — topics, concepts, chapters)
                </span>
              </label>
              <textarea
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                placeholder={`Example:\n\nUnit 1: Arrays and Strings\n- Array traversal, sorting algorithms\n- String manipulation, palindromes\n\nUnit 2: Linked Lists\n- Singly linked list operations\n- Reversal, cycle detection\n\nUnit 3: Trees and Graphs\n- Binary trees, BST operations\n- BFS and DFS algorithms`}
                className="input-field min-h-[300px] resize-y font-code text-sm"
                required
              />
              <p className="text-xs text-slate-500 mt-2">
                💡 The more detailed your syllabus, the better questions the AI generates. Include topics, subtopics, and key concepts.
              </p>
            </div>

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Saving...</>
              ) : (
                <><PlusCircle size={16} /> Save Syllabus & Create Exam</>
              )}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}

