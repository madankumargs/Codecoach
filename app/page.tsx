"use client";

// 📚 LANDING PAGE (app/page.tsx)
// This is what users see at "/" (the root URL)
// It's a "use client" page because we use animations and browser interactions
// Framer Motion handles the smooth animations

import { motion } from "framer-motion";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Code2, Brain, Trophy, Zap, Shield, BarChart3, ArrowRight, CheckCircle } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Question Generation",
    description: "Gemini AI creates unique questions from your syllabus every time. No two exams are the same.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    icon: Code2,
    title: "Live Code Editor",
    description: "Monaco editor (same as VS Code) with syntax highlighting, multi-language support, and instant execution.",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
  {
    icon: Brain,
    title: "AI Code Evaluation",
    description: "Goes beyond test cases. AI evaluates code quality, complexity, readability, and best practices.",
    color: "text-green-400",
    bg: "bg-green-500/10",
  },
  {
    icon: Trophy,
    title: "Real-time Leaderboard",
    description: "Live rankings based on score, speed, and accuracy. Motivates students to perform their best.",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
  },
  {
    icon: Shield,
    title: "Exam Integrity",
    description: "Fullscreen lock, tab-switch detection, and server-side time validation prevent cheating.",
    color: "text-red-400",
    bg: "bg-red-500/10",
  },
  {
    icon: BarChart3,
    title: "Deep Analytics",
    description: "Students see weak areas; admins get class-wide insights and question difficulty tracking.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
  },
];

const stats = [
  { value: "∞", label: "AI-Generated Questions" },
  { value: "5+", label: "Languages Supported" },
  { value: "100%", label: "Fair Evaluation" },
  { value: "0", label: "Cheating Possible" },
];

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // If already logged in, redirect to appropriate dashboard
  useEffect(() => {
    if (status === "authenticated") {
      const role = (session?.user as any)?.role;
      router.push(role === "ADMIN" ? "/admin/dashboard" : "/student/dashboard");
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden">
      {/* ─── NAVBAR ─────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[#0F172A]/80 border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Code2 size={16} className="text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">CodeLab</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-secondary text-sm py-2 px-4">
              Sign In
            </Link>
            <Link href="/register" className="btn-primary text-sm py-2 px-4">
              Get Started <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO ───────────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 px-6">
        {/* Background orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm font-medium mb-6">
              <Zap size={14} /> AI-Powered Coding Assessment Platform
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold leading-tight mb-6"
          >
            Code Exams,{" "}
            <span className="gradient-text">Reimagined</span>
            <br />with AI
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-slate-400 max-w-2xl mx-auto mb-10"
          >
            Upload your syllabus. AI generates unique questions. Students code in real-time.
            AI evaluates quality, not just correctness. The future of coding education is here.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/register?role=ADMIN" className="btn-primary text-base px-8 py-4">
              Start as Teacher <ArrowRight size={16} />
            </Link>
            <Link href="/register?role=STUDENT" className="btn-secondary text-base px-8 py-4">
              Join as Student
            </Link>
          </motion.div>
        </div>

        {/* Floating code window mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-4xl mx-auto mt-20"
        >
          <div className="glass p-1 glow-blue">
            <div className="bg-[#0d1117] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-3 text-xs text-slate-500 font-code">exam_solution.py</span>
              </div>
              <pre className="font-code text-sm text-left overflow-hidden">
                <span className="text-slate-500"># AI-Generated Question: Find the longest palindromic substring</span>{"\n"}
                <span className="text-blue-400">def</span>{" "}
                <span className="text-yellow-300">longest_palindrome</span>
                <span className="text-white">(s: </span>
                <span className="text-green-400">str</span>
                <span className="text-white">) -{">"} </span>
                <span className="text-green-400">str</span>
                <span className="text-white">:</span>{"\n"}
                {"    "}<span className="text-blue-400">if not</span>{" "}
                <span className="text-white">s: </span>
                <span className="text-blue-400">return</span>{" "}
                <span className="text-orange-400">""</span>{"\n"}
                {"    "}<span className="text-white">res = </span>
                <span className="text-orange-400">""</span>{"\n"}
                {"    "}<span className="text-blue-400">for</span>{" "}
                <span className="text-white">i </span>
                <span className="text-blue-400">in</span>{" "}
                <span className="text-yellow-300">range</span>
                <span className="text-white">(</span>
                <span className="text-yellow-300">len</span>
                <span className="text-white">(s)):</span>{"\n"}
                {"        "}<span className="text-slate-400"># Expand around center...</span>{"\n"}
                {"        "}<span className="text-white">odd = </span>
                <span className="text-yellow-300">expand</span>
                <span className="text-white">(s, i, i)</span>{"\n"}
                {"        "}<span className="text-white">even = </span>
                <span className="text-yellow-300">expand</span>
                <span className="text-white">(s, i, i+</span>
                <span className="text-purple-400">1</span>
                <span className="text-white">)</span>{"\n"}
                {"    "}<span className="text-blue-400">return</span>{" "}
                <span className="text-white">res</span>
              </pre>
              <div className="mt-3 pt-3 border-t border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-green-400">
                  <CheckCircle size={12} />
                  <span>3/3 test cases passed</span>
                </div>
                <div className="text-xs text-slate-400">
                  AI Score: <span className="text-blue-400 font-bold">54/60</span> · Total: <span className="text-green-400 font-bold">94/100</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── STATS ──────────────────────────────────────────────────────────── */}
      <section className="py-16 px-6 border-y border-slate-700/50">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="text-4xl font-bold gradient-text mb-1">{stat.value}</div>
              <div className="text-sm text-slate-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── FEATURES ───────────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">
              Everything you need to{" "}
              <span className="gradient-text">assess real skill</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Built from the ground up for modern coding education. Not a Google Form. Not an MCQ quiz.
              A real evaluation engine.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="glass p-6 hover:scale-[1.02] transition-transform duration-200"
              >
                <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4`}>
                  <feature.icon size={24} className={feature.color} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ────────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto glass p-12 text-center glow-blue"
        >
          <h2 className="text-4xl font-bold mb-4">
            Ready to build the future of <span className="gradient-text">coding education?</span>
          </h2>
          <p className="text-slate-400 mb-8 text-lg">
            Join CodeLab today. Free. No credit card. Real AI. Real results.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register?role=ADMIN" className="btn-primary text-base px-8 py-4">
              Create Your First Exam <ArrowRight size={16} />
            </Link>
            <Link href="/register?role=STUDENT" className="btn-secondary text-base px-8 py-4">
              Practice Coding Now
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ─── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-700/50 py-8 px-6 text-center text-slate-500 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Code2 size={12} className="text-white" />
          </div>
          <span className="font-semibold text-slate-300">CodeLab</span>
        </div>
        <p>AI-Powered Coding Assessment. Built for real education.</p>
      </footer>
    </div>
  );
}
