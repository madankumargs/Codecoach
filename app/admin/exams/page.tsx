import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import { PlusCircle, BookOpen, Clock, Users, CheckCircle2, Zap, Calendar } from "lucide-react";

// Admin can change exam status using a small form action
async function setExamStatus(examId: string, status: string) {
  "use server";
  const { prisma: db } = await import("@/lib/prisma");
  await db.exam.update({ where: { id: examId }, data: { status: status as any } });
}

export default async function AdminExamsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if ((session.user as any).role !== "ADMIN") redirect("/student/dashboard");

  const exams = await prisma.exam.findMany({
    orderBy: { scheduledAt: "desc" },
    include: {
      syllabus: { select: { title: true, subject: true } },
      _count: { select: { questions: true, submissions: true, enrollments: true } },
    },
  });

  const statusConfig = {
    UPCOMING: { label: "Upcoming", cls: "bg-blue-500/20 text-blue-400" },
    LIVE: { label: "🟢 Live", cls: "bg-green-500/20 text-green-400" },
    COMPLETED: { label: "Completed", cls: "bg-slate-500/20 text-slate-400" },
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar role="ADMIN" userName={session.user.name || "Admin"} />

      <main className="flex-1 p-8 overflow-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Exams</h1>
            <p className="text-slate-400 mt-1">Manage and monitor all exams</p>
          </div>
          <Link href="/admin/exams/new" className="btn-primary">
            <PlusCircle size={16} /> New Exam
          </Link>
        </div>

        {exams.length === 0 ? (
          <div className="glass p-16 text-center">
            <BookOpen size={48} className="text-slate-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Exams Yet</h2>
            <p className="text-slate-400 mb-6">Create your first exam and let AI generate the questions.</p>
            <Link href="/admin/exams/new" className="btn-primary inline-flex">
              <PlusCircle size={16} /> Create Exam
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {exams.map((exam) => {
              const cfg = statusConfig[exam.status];
              return (
                <div key={exam.id} className="glass p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-lg">{exam.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${cfg.cls}`}>{cfg.label}</span>
                      </div>
                      <p className="text-sm text-slate-400">{exam.syllabus.subject} — {exam.syllabus.title}</p>
                    </div>

                    {/* Status control */}
                    <div className="flex gap-2 ml-4">
                      {exam.status === "UPCOMING" && (
                        <form action={async () => { "use server"; await setExamStatus(exam.id, "LIVE"); }}>
                          <button type="submit" className="btn-primary text-xs px-3 py-1.5">
                            <Zap size={12} /> Go Live
                          </button>
                        </form>
                      )}
                      {exam.status === "LIVE" && (
                        <form action={async () => { "use server"; await setExamStatus(exam.id, "COMPLETED"); }}>
                          <button type="submit" className="btn-secondary text-xs px-3 py-1.5">
                            <CheckCircle2 size={12} /> End Exam
                          </button>
                        </form>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-6 mt-4 text-sm text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={13} />
                      {new Date(exam.scheduledAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                      })}
                    </span>
                    <span className="flex items-center gap-1.5"><Clock size={13} /> {exam.duration} mins</span>
                    <span className="flex items-center gap-1.5"><BookOpen size={13} /> {exam._count.questions} questions</span>
                    <span className="flex items-center gap-1.5"><Users size={13} /> {exam._count.enrollments} enrolled</span>
                    <span className="flex items-center gap-1.5"><CheckCircle2 size={13} /> {exam._count.submissions} submissions</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
