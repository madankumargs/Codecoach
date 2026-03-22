"use client";

// 📚 STUDENT: EXAMS LIST PAGE
// Shows all available exams — upcoming, live, and completed.
// Students can click into any exam they're eligible to take.

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import { BookOpen, Clock, Calendar, CheckCircle2, Zap, Lock } from "lucide-react";

type Exam = {
  id: string;
  title: string;
  duration: number;
  scheduledAt: string;
  status: "UPCOMING" | "LIVE" | "COMPLETED";
  syllabus: { title: string; subject: string };
  _count: { questions: number; submissions: number };
};

const statusConfig = {
  LIVE: { label: "🟢 LIVE NOW", cls: "bg-green-500/20 text-green-400 border-green-500/30" },
  UPCOMING: { label: "📅 Upcoming", cls: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  COMPLETED: { label: "✅ Completed", cls: "bg-slate-500/20 text-slate-400 border-slate-500/30" },
};

export default function StudentExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/exams")
      .then((r) => r.json())
      .then((d) => { setExams(Array.isArray(d) ? d : []); setLoading(false); });
  }, []);

  const live = exams.filter((e) => e.status === "LIVE");
  const upcoming = exams.filter((e) => e.status === "UPCOMING");
  const completed = exams.filter((e) => e.status === "COMPLETED");

  const ExamCard = ({ exam }: { exam: Exam }) => {
    const cfg = statusConfig[exam.status];
    const canEnter = exam.status === "LIVE";
    return (
      <div className={`glass p-6 transition-all ${canEnter ? "hover:border-green-500/40 cursor-pointer" : ""}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{exam.title}</h3>
            <p className="text-sm text-slate-400 mt-0.5">{exam.syllabus.subject}</p>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full border ml-3 flex-shrink-0 ${cfg.cls}`}>
            {cfg.label}
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
          <span className="flex items-center gap-1.5">
            <Clock size={13} /> {exam.duration} mins
          </span>
          <span className="flex items-center gap-1.5">
            <BookOpen size={13} /> {exam._count.questions} questions
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar size={13} />
            {new Date(exam.scheduledAt).toLocaleDateString("en-IN", {
              day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
            })}
          </span>
        </div>

        {canEnter ? (
          <Link
            href={`/student/exams/${exam.id}`}
            className="btn-primary w-full justify-center text-sm"
          >
            <Zap size={14} /> Enter Exam
          </Link>
        ) : exam.status === "COMPLETED" ? (
          <div className="flex items-center gap-2 text-sm text-slate-500 justify-center py-1">
            <CheckCircle2 size={14} /> Exam Ended — Results Available
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-slate-500 justify-center py-1">
            <Lock size={14} /> Starts{" "}
            {new Date(exam.scheduledAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar role="STUDENT" userName="Student" />

      <main className="flex-1 p-8 overflow-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Exams</h1>
          <p className="text-slate-400 mt-1">All scheduled and completed exams</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-48 rounded-2xl" />)}
          </div>
        ) : exams.length === 0 ? (
          <div className="glass p-16 text-center">
            <BookOpen size={48} className="text-slate-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Exams Yet</h2>
            <p className="text-slate-400">Your instructor hasn't scheduled any exams yet. Check back later!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {live.length > 0 && (
              <section>
                <h2 className="text-sm font-medium text-green-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" /> Live Now
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {live.map((e) => <ExamCard key={e.id} exam={e} />)}
                </div>
              </section>
            )}
            {upcoming.length > 0 && (
              <section>
                <h2 className="text-sm font-medium text-blue-400 uppercase tracking-wider mb-4">Upcoming</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {upcoming.map((e) => <ExamCard key={e.id} exam={e} />)}
                </div>
              </section>
            )}
            {completed.length > 0 && (
              <section>
                <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Past Exams</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {completed.map((e) => <ExamCard key={e.id} exam={e} />)}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
