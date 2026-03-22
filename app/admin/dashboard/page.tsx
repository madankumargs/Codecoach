import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import { LayoutDashboard, BookOpen, BarChart3, FileText, PlusCircle, Activity, Users } from "lucide-react";


export default async function AdminDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if ((session.user as any).role !== "ADMIN") redirect("/student/dashboard");

  const [syllabi, exams, submissions, users] = await Promise.all([
    prisma.syllabus.count(),
    prisma.exam.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { questions: true, submissions: true, enrollments: true } }, syllabus: true },
    }),
    prisma.submission.count(),
    prisma.user.count({ where: { role: "STUDENT" } }),
  ]);

  const avgScore = await prisma.submission.aggregate({ _avg: { totalScore: true } });

  const stats = [
    { label: "Total Students", value: users, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Total Exams", value: exams.length, icon: BookOpen, color: "text-purple-400", bg: "bg-purple-500/10" },
    { label: "Submissions", value: submissions, icon: Activity, color: "text-green-400", bg: "bg-green-500/10" },
    { label: "Avg Score", value: `${Math.round(avgScore._avg.totalScore || 0)}%`, icon: BarChart3, color: "text-yellow-400", bg: "bg-yellow-500/10" },
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar role="ADMIN" userName={session.user.name || session.user.email || "Admin"} />

      <main className="flex-1 p-8 overflow-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-slate-400 mt-1">Manage exams, syllabi, and student performance</p>
          </div>
          <Link href="/admin/exams/new" className="btn-primary">
            <PlusCircle size={16} /> New Exam
          </Link>
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

        {/* Recent Exams */}
        <div className="glass p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold">Recent Exams</h2>
            <Link href="/admin/exams" className="text-sm text-blue-400 hover:text-blue-300">View all →</Link>
          </div>
          {exams.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen size={40} className="text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 mb-4">No exams yet. Create your first one!</p>
              <Link href="/admin/exams/new" className="btn-primary inline-flex">
                <PlusCircle size={16} /> Create Exam
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-slate-400 border-b border-slate-700/50">
                    <th className="pb-3 font-medium">Exam Title</th>
                    <th className="pb-3 font-medium">Subject</th>
                    <th className="pb-3 font-medium">Questions</th>
                    <th className="pb-3 font-medium">Submissions</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {exams.map((exam) => (
                    <tr key={exam.id} className="hover:bg-slate-700/20 transition-colors">
                      <td className="py-4">
                        <Link href={`/admin/exams/${exam.id}`} className="font-medium hover:text-blue-400 transition-colors">
                          {exam.title}
                        </Link>
                      </td>
                      <td className="py-4 text-slate-400 text-sm">{exam.syllabus.subject}</td>
                      <td className="py-4 text-sm">{exam._count.questions}</td>
                      <td className="py-4 text-sm">{exam._count.submissions}</td>
                      <td className="py-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          exam.status === "LIVE" ? "bg-green-500/20 text-green-400" :
                          exam.status === "COMPLETED" ? "bg-slate-500/20 text-slate-400" :
                          "bg-blue-500/20 text-blue-400"
                        }`}>
                          {exam.status}
                        </span>
                      </td>
                      <td className="py-4 text-slate-400 text-sm">
                        {new Date(exam.scheduledAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

