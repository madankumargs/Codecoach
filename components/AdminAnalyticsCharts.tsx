"use client";

// 📚 ADMIN ANALYTICS CHARTS
// This is a "use client" component because Recharts needs the browser to render.
// The parent (admin/analytics/page.tsx) is a Server Component that fetches data
// and passes it as props here — best of both worlds!

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line, Legend
} from "recharts";

type Props = {
  examChartData: { name: string; "Avg Score": number; Submissions: number }[];
  distributionData: { range: string; Students: number }[];
  recentSubmissions: { id: string; studentName: string | null; examTitle: string; totalScore: number; submittedAt: string }[];
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm shadow-xl">
        <p className="text-slate-400 mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }} className="font-semibold">
            {p.name}: {Math.round(p.value)}{p.name.includes("Score") ? "%" : ""}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminAnalyticsCharts({ examChartData, distributionData, recentSubmissions }: Props) {
  return (
    <div className="space-y-6">
      {examChartData.length === 0 ? (
        <div className="glass p-16 text-center">
          <p className="text-slate-400">No submission data yet. Create exams and let students submit!</p>
        </div>
      ) : (
        <>
          {/* Exam Performance */}
          <div className="glass p-6">
            <h2 className="text-lg font-semibold mb-6">Average Score per Exam</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={examChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Avg Score" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Submissions" fill="#a855f7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Score Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass p-6">
              <h2 className="text-lg font-semibold mb-6">Score Distribution</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={distributionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="range" stroke="#64748b" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="Students" fill="#22c55e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Recent submissions */}
            <div className="glass overflow-hidden">
              <div className="p-4 border-b border-slate-700/50">
                <h2 className="font-semibold">Recent Submissions</h2>
              </div>
              <div className="divide-y divide-slate-700/20 max-h-[240px] overflow-auto">
                {recentSubmissions.map((s) => (
                  <div key={s.id} className="flex items-center justify-between px-4 py-3 hover:bg-slate-700/20">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{s.studentName}</p>
                      <p className="text-xs text-slate-500 truncate">{s.examTitle}</p>
                    </div>
                    <div className="ml-3 text-right">
                      <p className={`text-sm font-bold ${
                        s.totalScore >= 80 ? "text-green-400" :
                        s.totalScore >= 50 ? "text-yellow-400" : "text-red-400"
                      }`}>{s.totalScore}%</p>
                      <p className="text-xs text-slate-500">
                        {new Date(s.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                  </div>
                ))}
                {recentSubmissions.length === 0 && (
                  <p className="px-4 py-8 text-center text-slate-500 text-sm">No submissions yet</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
