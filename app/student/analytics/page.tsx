"use client";

// 📚 STUDENT ANALYTICS PAGE
// Shows the student's performance history using Recharts:
// - Score trend line chart over time
// - Average score by question type (MCQ vs Coding) bar chart
// - Submission history table

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { BarChart3, TrendingUp, Code2, ListChecks, Trophy } from "lucide-react";

type Submission = {
  id: string;
  totalScore: number;
  testScore: number;
  aiScore: number;
  language: string;
  submittedAt: string;
  timeTaken: number;
  exam: { title: string };
  question: { type: "MCQ" | "CODING"; content: string };
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm shadow-xl">
        <p className="text-slate-400 mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }} className="font-semibold">
            {p.name}: {Math.round(p.value)}
            {p.name.toLowerCase().includes("score") ? "%" : ""}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function StudentAnalyticsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/submissions")
      .then((r) => r.json())
      .then((d) => { setSubmissions(Array.isArray(d) ? d : []); setLoading(false); });
  }, []);

  // Build trend data: last 10 submissions in chronological order
  const trendData = [...submissions]
    .sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime())
    .slice(-10)
    .map((s, i) => ({
      name: `#${i + 1}`,
      "Total Score": Math.round(s.totalScore),
      "Test Score": Math.round(s.testScore),
      "AI Score": Math.round(s.aiScore),
      exam: s.exam.title,
    }));

  // MCQ vs Coding averages
  const mcqSubs = submissions.filter((s) => s.question.type === "MCQ");
  const codingSubs = submissions.filter((s) => s.question.type === "CODING");
  const typeData = [
    {
      type: "MCQ",
      "Avg Score": mcqSubs.length > 0 ? Math.round(mcqSubs.reduce((s, x) => s + x.totalScore, 0) / mcqSubs.length) : 0,
      count: mcqSubs.length,
    },
    {
      type: "Coding",
      "Avg Score": codingSubs.length > 0 ? Math.round(codingSubs.reduce((s, x) => s + x.totalScore, 0) / codingSubs.length) : 0,
      count: codingSubs.length,
    },
  ];

  const avgScore = submissions.length > 0
    ? Math.round(submissions.reduce((s, x) => s + x.totalScore, 0) / submissions.length)
    : 0;
  const bestScore = submissions.length > 0 ? Math.round(Math.max(...submissions.map((s) => s.totalScore))) : 0;

  const stats = [
    { label: "Total Submissions", value: submissions.length, icon: Code2, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Average Score", value: `${avgScore}%`, icon: BarChart3, color: "text-green-400", bg: "bg-green-500/10" },
    { label: "Best Score", value: `${bestScore}%`, icon: Trophy, color: "text-yellow-400", bg: "bg-yellow-500/10" },
    { label: "MCQ Solved", value: mcqSubs.length, icon: ListChecks, color: "text-purple-400", bg: "bg-purple-500/10" },
  ];

  if (loading) return (
    <div className="flex min-h-screen">
      <Sidebar role="STUDENT" userName="Student" />
      <main className="flex-1 p-8">
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
        <div className="skeleton h-64 rounded-2xl mb-6" />
        <div className="skeleton h-48 rounded-2xl" />
      </main>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      <Sidebar role="STUDENT" userName="Student" />

      <main className="flex-1 p-8 overflow-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <TrendingUp className="text-green-400" size={32} /> My Analytics
          </h1>
          <p className="text-slate-400 mt-1">Track your performance across all exams</p>
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

        {submissions.length === 0 ? (
          <div className="glass p-16 text-center">
            <BarChart3 size={48} className="text-slate-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Data Yet</h2>
            <p className="text-slate-400">Complete some exams to see your analytics here.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Score Trend */}
            <div className="glass p-6">
              <h2 className="text-lg font-semibold mb-6">Score Trend (Last 10 Submissions)</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="Total Score" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6", r: 4 }} />
                  <Line type="monotone" dataKey="Test Score" stroke="#22c55e" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                  <Line type="monotone" dataKey="AI Score" stroke="#a855f7" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* MCQ vs Coding */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass p-6">
                <h2 className="text-lg font-semibold mb-6">Avg Score by Question Type</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={typeData} barSize={48}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="type" stroke="#64748b" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="Avg Score" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Language breakdown */}
              <div className="glass p-6">
                <h2 className="text-lg font-semibold mb-4">Language Breakdown</h2>
                <div className="space-y-3">
                  {Object.entries(
                    submissions.reduce((acc, s) => {
                      acc[s.language] = (acc[s.language] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).sort((a, b) => b[1] - a[1]).map(([lang, count]) => {
                    const pct = Math.round((count / submissions.length) * 100);
                    return (
                      <div key={lang}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="capitalize text-slate-300">{lang}</span>
                          <span className="text-slate-400">{count} ({pct}%)</span>
                        </div>
                        <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Submission history */}
            <div className="glass overflow-hidden">
              <div className="p-5 border-b border-slate-700/50">
                <h2 className="font-semibold">Submission History</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-400 border-b border-slate-700/30">
                      <th className="px-5 py-3 font-medium">Exam</th>
                      <th className="px-5 py-3 font-medium">Type</th>
                      <th className="px-5 py-3 font-medium">Language</th>
                      <th className="px-5 py-3 font-medium">Test Score</th>
                      <th className="px-5 py-3 font-medium">AI Score</th>
                      <th className="px-5 py-3 font-medium">Total</th>
                      <th className="px-5 py-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/20">
                    {[...submissions]
                      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
                      .map((s) => (
                        <tr key={s.id} className="hover:bg-slate-700/20 transition-colors">
                          <td className="px-5 py-3 font-medium max-w-[180px] truncate">{s.exam.title}</td>
                          <td className="px-5 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              s.question.type === "MCQ"
                                ? "bg-purple-500/20 text-purple-400"
                                : "bg-blue-500/20 text-blue-400"
                            }`}>{s.question.type}</span>
                          </td>
                          <td className="px-5 py-3 text-slate-400 capitalize">{s.language}</td>
                          <td className="px-5 py-3">{Math.round(s.testScore)}</td>
                          <td className="px-5 py-3">{Math.round(s.aiScore)}</td>
                          <td className={`px-5 py-3 font-bold ${
                            s.totalScore >= 80 ? "text-green-400" :
                            s.totalScore >= 50 ? "text-yellow-400" : "text-red-400"
                          }`}>{Math.round(s.totalScore)}%</td>
                          <td className="px-5 py-3 text-slate-400">
                            {new Date(s.submittedAt).toLocaleDateString("en-IN", {
                              day: "numeric", month: "short"
                            })}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
