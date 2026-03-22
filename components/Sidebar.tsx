// 📚 SHARED SIDEBAR COMPONENT
// Used by both Student and Admin dashboards
// "use client" because it uses usePathname() — a React hook for current URL
"use client";

// 📚 WHY THIS CHANGE?
// In Next.js App Router, Server Components can only pass SERIALIZABLE data to Client Components.
// Lucide React icons are functions/objects — they can't be serialized over the network.
// FIX: We define nav items INSIDE this Client Component itself, so icons never need to cross the server-client boundary.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Code2, LogOut, LayoutDashboard, BookOpen, Trophy,
  BarChart3, FileText, Users, Activity, GraduationCap
} from "lucide-react";

// Nav items are defined HERE (client-side), not passed from the server
const STUDENT_NAV = [
  { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
  { label: "Practice", href: "/student/practice", icon: Code2 },
  { label: "Exams", href: "/student/exams", icon: BookOpen },
  { label: "Leaderboard", href: "/student/leaderboard", icon: Trophy },
  { label: "Analytics", href: "/student/analytics", icon: BarChart3 },
];

const ADMIN_NAV = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Syllabi", href: "/admin/syllabus", icon: FileText },
  { label: "Exams", href: "/admin/exams", icon: BookOpen },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
];

interface SidebarProps {
  role: "STUDENT" | "ADMIN";
  userName: string;
}

export default function Sidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname();
  const navItems = role === "ADMIN" ? ADMIN_NAV : STUDENT_NAV;

  return (
    <aside className="w-64 min-h-screen bg-[#0d1521] border-r border-slate-700/50 flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Code2 size={16} className="text-white" />
          </div>
          <span className="text-lg font-bold gradient-text">CodeLab</span>
        </div>
        <div className="mt-3">
          <p className="text-sm font-medium text-slate-200 truncate">{userName}</p>
          <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${
            role === "ADMIN"
              ? "bg-purple-500/20 text-purple-400"
              : "bg-blue-500/20 text-blue-400"
          }`}>
            {role === "ADMIN" ? "Admin" : "Student"}
          </span>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/40"
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="p-4 border-t border-slate-700/50">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 w-full transition-all"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

