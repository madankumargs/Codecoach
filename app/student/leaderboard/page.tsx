"use client";

// 📚 STUDENT LEADERBOARD PAGE
// Shows all students ranked by total score.
// "use client" because we fetch data client-side with useEffect + fetch.
// Could also be a server component, but client fetch means we can add refresh easily.

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { LayoutDashboard, Code2, BookOpen, Trophy, BarChart3, Medal } from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
  { label: "Practice", href: "/student/practice", icon: Code2 },
  { label: "Exams", href: "/student/exams", icon: BookOpen },
  { label: "Leaderboard", href: "/student/leaderboard", icon: Trophy },
  { label: "Analytics", href: "/student/analytics", icon: BarChart3 },
];

type LeaderboardEntry = {
  rank: number;
  user: { id: string; name: string; email: string; image?: string };
  totalScore: number;
  timeTaken: number;
  isCurrentUser: boolean;
};

const medals = ["🥇", "🥈", "🥉"];
const rankColors = ["text-yellow-400", "text-slate-300", "text-amber-600"];

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); });
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar role="STUDENT" userName="Student" />

      <main className="flex-1 p-8 overflow-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Trophy className="text-yellow-400" size={32} /> Leaderboard
          </h1>
          <p className="text-slate-400 mt-1">Top coders ranked by total score across all exams</p>
        </div>

        {/* Top 3 podium */}
        {!loading && data.length >= 3 && (
          <div className="flex items-end justify-center gap-4 mb-8">
            {[data[1], data[0], data[2]].map((entry, i) => {
              const heights = ["h-24", "h-32", "h-20"];
              const podiumColors = ["bg-slate-500/20", "bg-yellow-500/20", "bg-amber-600/20"];
              const actualRank = i === 0 ? 1 : i === 1 ? 0 : 2;
              return (
                <div key={entry.rank} className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl font-bold">
                    {entry.user.name?.[0] || "?"}
                  </div>
                  <p className="text-sm font-medium">{entry.user.name?.split(" ")[0]}</p>
                  <p className="text-xs text-slate-400">{Math.round(entry.totalScore)} pts</p>
                  <div className={`w-20 ${heights[i]} ${podiumColors[i]} border border-slate-600/50 rounded-t-xl flex items-center justify-center`}>
                    <span className="text-2xl">{medals[actualRank]}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Full table */}
        <div className="glass overflow-hidden">
          <div className="p-5 border-b border-slate-700/50">
            <h2 className="font-semibold">All Rankings</h2>
          </div>
          {loading ? (
            <div className="p-8 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="skeleton h-14 rounded-xl" />
              ))}
            </div>
          ) : data.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Trophy size={40} className="text-slate-600 mx-auto mb-3" />
              <p>No submissions yet — be the first!</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700/30">
              {data.map((entry) => (
                <div
                  key={entry.rank}
                  className={`flex items-center gap-4 px-6 py-4 transition-colors ${
                    entry.isCurrentUser
                      ? "bg-blue-500/10 border-l-2 border-blue-500"
                      : "hover:bg-slate-700/20"
                  }`}
                >
                  {/* Rank */}
                  <div className={`w-8 text-center font-bold text-lg ${rankColors[entry.rank - 1] || "text-slate-400"}`}>
                    {entry.rank <= 3 ? medals[entry.rank - 1] : `#${entry.rank}`}
                  </div>

                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {entry.user.name?.[0] || "?"}
                  </div>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {entry.user.name}
                      {entry.isCurrentUser && <span className="ml-2 text-xs text-blue-400">(You)</span>}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{entry.user.email}</p>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      entry.totalScore >= 80 ? "text-green-400" :
                      entry.totalScore >= 50 ? "text-yellow-400" : "text-slate-300"
                    }`}>
                      {Math.round(entry.totalScore)}
                    </p>
                    <p className="text-xs text-slate-500">points</p>
                  </div>

                  {/* Time */}
                  <div className="text-right text-xs text-slate-400 w-16">
                    {formatTime(entry.timeTaken)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

