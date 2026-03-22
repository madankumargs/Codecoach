import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/Sidebar";
import AdminAnalyticsCharts from "@/components/AdminAnalyticsCharts";
import { Users, BookOpen, Activity, BarChart3 } from "lucide-react";

export default async function AdminAnalyticsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if ((session.user as any).role !== "ADMIN") redirect("/student/dashboard");

  // Fetch all analytics data server-side
  const [totalStudents, totalExams, totalSubmissions, avgScoreResult, exams, submissionsRaw] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.exam.count(),
    prisma.submission.count(),
    prisma.submission.aggregate({ _avg: { totalScore: true } }),
    prisma.exam.findMany({
      include: {
        _count: { select: { submissions: true, questions: true } },
        submissions: { select: { totalScore: true } },
      },
      orderBy: { scheduledAt: "desc" },
      take: 10,
    }),
    prisma.submission.findMany({
      include: { user: { select: { name: true, email: true } }, exam: { select: { title: true } } },
      orderBy: { submittedAt: "desc" },
      take: 20,
    }),
  ]);

  const avgScore = Math.round(avgScoreResult._avg.totalScore || 0);

  const stats = [
    { label: "Total Students", value: totalStudents, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Total Exams", value: totalExams, icon: BookOpen, color: "text-purple-400", bg: "bg-purple-500/10" },
    { label: "Submissions", value: totalSubmissions, icon: Activity, color: "text-green-400", bg: "bg-green-500/10" },
    { label: "Class Average", value: `${avgScore}%`, icon: BarChart3, color: "text-yellow-400", bg: "bg-yellow-500/10" },
  ];

  // Build chart data: exam performance (avg score per exam)
  const examChartData = exams.map((e) => ({
    name: e.title.length > 20 ? e.title.slice(0, 20) + "…" : e.title,
    "Avg Score": e.submissions.length > 0
      ? Math.round(e.submissions.reduce((s, x) => s + x.totalScore, 0) / e.submissions.length)
      : 0,
    Submissions: e._count.submissions,
  }));

  // Score distribution buckets
  const allSubmissions = await prisma.submission.findMany({ select: { totalScore: true } });
  const buckets = [
    { range: "0–20", min: 0, max: 20 },
    { range: "21–40", min: 21, max: 40 },
    { range: "41–60", min: 41, max: 60 },
    { range: "61–80", min: 61, max: 80 },
    { range: "81–100", min: 81, max: 100 },
  ];
  const distributionData = buckets.map((b) => ({
    range: b.range,
    Students: allSubmissions.filter((s) => s.totalScore >= b.min && s.totalScore <= b.max).length,
  }));

  // Serialize for client component
  const chartProps = {
    examChartData,
    distributionData,
    recentSubmissions: submissionsRaw.map((s) => ({
      id: s.id,
      studentName: s.user.name || s.user.email,
      examTitle: s.exam.title,
      totalScore: Math.round(s.totalScore),
      submittedAt: s.submittedAt.toISOString(),
    })),
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar role="ADMIN" userName={session.user.name || "Admin"} />

      <main className="flex-1 p-8 overflow-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BarChart3 className="text-purple-400" size={32} /> Class Analytics
          </h1>
          <p className="text-slate-400 mt-1">Overview of student performance across all exams</p>
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

        {/* Charts rendered in client component */}
        <AdminAnalyticsCharts {...chartProps} />
      </main>
    </div>
  );
}
