// 📚 LEADERBOARD API
// GET /api/leaderboard?examId=xxx
// Returns students ranked by their total scores for a given exam
// Aggregates multiple submissions (takes best score per student)

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const examId = searchParams.get("examId");

  // Group submissions by user and sum their total scores
  const leaderboard = await prisma.submission.groupBy({
    by: ["userId"],
    where: examId ? { examId } : {},
    _sum: { totalScore: true },
    _min: { timeTaken: true },
    orderBy: [
      { _sum: { totalScore: "desc" } }, // Rank by score first
      { _min: { timeTaken: "asc" } },   // Then by speed (lower time = better)
    ],
    take: 50, // Top 50 students
  });

  // Enrich with user names
  const userIds = leaderboard.map((l) => l.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, email: true, image: true },
  });
  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

  const ranked = leaderboard.map((entry, index) => ({
    rank: index + 1,
    user: userMap[entry.userId],
    totalScore: entry._sum.totalScore || 0,
    timeTaken: entry._min.timeTaken || 0,
    isCurrentUser: entry.userId === session.user.id,
  }));

  return NextResponse.json(ranked);
}
