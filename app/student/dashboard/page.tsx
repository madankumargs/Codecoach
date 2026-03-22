// 📚 STUDENT DASHBOARD
// This is a SERVER component (no "use client") — it runs on the server,
// fetches data, and sends ready-made HTML to the browser. Faster initial load!
// auth() reads the session from the JWT cookie to get the logged-in user.

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/Sidebar";
import { LayoutDashboard, Code2, BookOpen, Trophy, BarChart3, Zap } from "lucide-react";


export default async function StudentDashboard() {
  const session = await auth();

  // Protect route: if not logged in, redirect to login
  if (!session?.user) redirect("/login");

  // If admin tries to access student dashboard, redirect them
  if ((session.user as any).role === "ADMIN") redirect("/admin/dashboard");

  const userId = session.user.id!;

  // Fetch stats in parallel (Promise.all runs all queries simultaneously = faster)
  const [submissions, exams, recentSubmissions] = await Promise.all([
    prisma.submission.findMany({ where: { userId } }),
    prisma.exam.findMany({ where: { status: { in: ["UPCOMING", "LIVE"] } }, take: 3, orderBy: { scheduledAt: "asc" } }),
    prisma.submission.findMany({
      where: { userId },
      take: 5,
      orderBy: { submittedAt: "desc" },
      include: { exam: true, question: true },
    }),
  ]);

  // Calculate stats from submissions
  const totalScore = submissions.reduce((sum, s) => sum + s.totalScore, 0);
  const avgScore = submissions.length > 0 ? Math.round(totalScore / submissions.length) : 0;
  const bestScore = submissions.length > 0 ? Math.max(...submissions.map((s) => s.totalScore)) : 0;

  const stats = [
    { label: "Submissions", value: submissions.length, icon: Code2, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Avg Score", value: `${avgScore}%`, icon: BarChart3, color: "text-green-400", bg: "bg-green-500/10" },
    { label: "Best Score", value: `${Math.round(bestScore)}%`, icon: Trophy, color: "text-yellow-400", bg: "bg-yellow-500/10" },
    { label: "Exams Upcoming", value: exams.length, icon: BookOpen, color: "text-purple-400", bg: "bg-purple-500/10" },
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar role="STUDENT" userName={session.user.name || session.user.email || "Student"} />

      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Welcome back, <span className="gradient-text">{session.user.name?.split(" ")[0] || "Coder"}</span> 👋
          </h1>
          <p className="text-slate-400 mt-1">Ready to code? Your journey continues here.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="glass p-5">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                <stat.icon size={20} className={stat.color} />
              </div>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Exams */}
          <div className="glass p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BookOpen size={18} className="text-blue-400" /> Upcoming Exams
            </h2>
            {exams.length === 0 ? (
              <p className="text-slate-400 text-sm">No upcoming exams. Time to practice! 🚀</p>
            ) : (
              <div className="space-y-3">
                {exams.map((exam) => (
                  <a key={exam.id} href={`/student/exams/${exam.id}`}
                    className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl hover:bg-slate-700/50 transition-colors group">
                    <div>
                      <p className="font-medium group-hover:text-blue-400 transition-colors">{exam.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(exam.scheduledAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        {" · "}{exam.duration} mins
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      exam.status === "LIVE"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-blue-500/20 text-blue-400"
                    }`}>
                      {exam.status === "LIVE" ? "🟢 LIVE" : "Upcoming"}
                    </span>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Recent Submissions */}
          <div className="glass p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Zap size={18} className="text-purple-400" /> Recent Activity
            </h2>
            {recentSubmissions.length === 0 ? (
              <div className="text-center py-8">
                <Code2 size={32} className="text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No submissions yet.</p>
                <a href="/student/practice" className="btn-primary text-sm px-4 py-2 mt-3 inline-flex">
                  Start Practicing
                </a>
              </div>
            ) : (
              <div className="space-y-3">
                {recentSubmissions.map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{sub.exam.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {sub.language} · {new Date(sub.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className={`text-sm font-bold ml-3 ${
                      sub.totalScore >= 80 ? "text-green-400" :
                      sub.totalScore >= 50 ? "text-yellow-400" : "text-red-400"
                    }`}>
                      {Math.round(sub.totalScore)}%
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

