// 📚 DEMO DATA SEEDER
// Run with: npx tsx prisma/seed.ts
// Creates: 1 admin, 5 students, 2 syllabi, 2 exams with questions, and submissions
// Uses bcrypt to hash passwords — all users have password "demo1234"

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding CodeLab demo data...\n");

  // Clean existing seed data
  await prisma.submission.deleteMany();
  await prisma.question.deleteMany();
  await prisma.examEnrollment.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.syllabus.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany({ where: { email: { endsWith: "@demo.codelab" } } });

  const hashedPassword = await bcrypt.hash("demo1234", 10);

  // ── 1. Create Admin ──────────────────────────────────────────────────────
  const admin = await prisma.user.create({
    data: {
      name: "Prof. Rajan",
      email: "admin@demo.codelab",
      password: hashedPassword,
      role: "ADMIN",
    },
  });
  console.log("✅ Admin created:", admin.email);

  // ── 2. Create Students ───────────────────────────────────────────────────
  const studentData = [
    { name: "Arjun Sharma", email: "arjun@demo.codelab" },
    { name: "Priya Nair", email: "priya@demo.codelab" },
    { name: "Vikram Bose", email: "vikram@demo.codelab" },
    { name: "Sneha Reddy", email: "sneha@demo.codelab" },
    { name: "Kiran Mehta", email: "kiran@demo.codelab" },
  ];
  const students = await Promise.all(
    studentData.map((s) =>
      prisma.user.create({ data: { ...s, password: hashedPassword, role: "STUDENT" } })
    )
  );
  console.log(`✅ ${students.length} students created`);

  // ── 3. Create Syllabi ────────────────────────────────────────────────────
  const syllabus1 = await prisma.syllabus.create({
    data: {
      title: "Data Structures Fundamentals",
      subject: "Computer Science",
      content: `Unit 1: Arrays and Strings
- Array traversal, searching, sorting (bubble, merge, quick)
- Two-pointer technique, sliding window
- String manipulation: palindrome, anagram detection

Unit 2: Linked Lists
- Singly and doubly linked list operations
- Reversal, cycle detection (Floyd's algorithm)
- Merge sorted lists

Unit 3: Stacks and Queues
- Stack operations: push, pop, peek
- Queue: enqueue, dequeue
- Applications: balanced parentheses, BFS

Unit 4: Trees
- Binary tree, Binary Search Tree
- Tree traversal: inorder, preorder, postorder
- Height, diameter, lowest common ancestor

Unit 5: Graphs
- Adjacency list and matrix representation
- BFS and DFS algorithms
- Shortest path: Dijkstra's algorithm`,
      adminId: admin.id,
    },
  });

  const syllabus2 = await prisma.syllabus.create({
    data: {
      title: "Python Programming Basics",
      subject: "Programming",
      content: `Unit 1: Python Basics
- Variables, data types, operators
- Input/output functions
- String formatting and methods

Unit 2: Control Flow
- if/elif/else conditions
- for and while loops
- break, continue, pass

Unit 3: Functions
- Defining and calling functions
- Arguments and return values
- Lambda functions, map, filter

Unit 4: Data Structures
- Lists, tuples, dictionaries, sets
- List comprehensions
- File I/O basics`,
      adminId: admin.id,
    },
  });
  console.log("✅ 2 syllabi created");

  // ── 4. Create Exams with Questions ──────────────────────────────────────
  const exam1 = await prisma.exam.create({
    data: {
      title: "Data Structures Midterm",
      syllabusId: syllabus1.id,
      duration: 60,
      scheduledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      status: "COMPLETED",
    },
  });

  const exam2 = await prisma.exam.create({
    data: {
      title: "Python Fundamentals Quiz",
      syllabusId: syllabus2.id,
      duration: 45,
      scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      status: "UPCOMING",
    },
  });

  // Questions for Exam 1
  const q1 = await prisma.question.create({
    data: {
      examId: exam1.id,
      type: "MCQ",
      content: "What is the time complexity of binary search on a sorted array of n elements?",
      difficulty: "easy",
      options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
      answer: "O(log n)",
      points: 10,
    },
  });

  const q2 = await prisma.question.create({
    data: {
      examId: exam1.id,
      type: "MCQ",
      content: "Which data structure uses LIFO (Last In First Out) ordering?",
      difficulty: "easy",
      options: ["Queue", "Stack", "Linked List", "Tree"],
      answer: "Stack",
      points: 10,
    },
  });

  const q3 = await prisma.question.create({
    data: {
      examId: exam1.id,
      type: "CODING",
      content: `Write a function that reverses a string.

Input: A single string s
Output: The reversed string

Example:
Input: "hello"
Output: "olleh"

Input: "CodeLab"
Output: "baLedoC"`,
      difficulty: "easy",
      testCases: [
        { input: "hello", expected: "olleh" },
        { input: "CodeLab", expected: "baLedoC" },
        { input: "abcde", expected: "edcba" },
      ],
      points: 40,
    },
  });

  const q4 = await prisma.question.create({
    data: {
      examId: exam1.id,
      type: "CODING",
      content: `Find the maximum element in an array.

Input: Space-separated integers on a single line
Output: The maximum integer

Example:
Input: 5 3 8 1 9 2
Output: 9`,
      difficulty: "easy",
      testCases: [
        { input: "5 3 8 1 9 2", expected: "9" },
        { input: "1", expected: "1" },
        { input: "-5 -3 -8", expected: "-3" },
      ],
      points: 40,
    },
  });

  console.log("✅ Exam 1 created with 4 questions");
  console.log("✅ Exam 2 created (upcoming)");

  // ── 5. Create Submissions ────────────────────────────────────────────────
  const submissionData = [
    { student: students[0], q: q1, code: "O(log n)", lang: "python", testScore: 40, aiScore: 60 },
    { student: students[0], q: q3, code: 'def reverse(s):\n    return s[::-1]\nprint(reverse(input()))', lang: "python", testScore: 40, aiScore: 55 },
    { student: students[1], q: q1, code: "O(n)", lang: "python", testScore: 0, aiScore: 0 },
    { student: students[1], q: q3, code: 'print(input()[::-1])', lang: "python", testScore: 40, aiScore: 58 },
    { student: students[2], q: q2, code: "Stack", lang: "python", testScore: 40, aiScore: 60 },
    { student: students[2], q: q4, code: 'nums = list(map(int, input().split()))\nprint(max(nums))', lang: "python", testScore: 40, aiScore: 52 },
    { student: students[3], q: q1, code: "O(log n)", lang: "javascript", testScore: 40, aiScore: 60 },
    { student: students[4], q: q3, code: 'print(input()[::-1])', lang: "python", testScore: 40, aiScore: 48 },
  ];

  for (const s of submissionData) {
    await prisma.submission.create({
      data: {
        userId: s.student.id,
        examId: exam1.id,
        questionId: s.q.id,
        code: s.code,
        language: s.lang,
        testScore: s.testScore,
        aiScore: s.aiScore,
        totalScore: s.testScore + s.aiScore,
        aiFeedback: JSON.stringify({
          feedback: "Good solution! Clean and concise.",
          timeComplexity: "O(n)",
          improvements: ["Could add input validation"],
        }),
        timeTaken: Math.floor(Math.random() * 1200) + 300,
        submittedAt: new Date(Date.now() - Math.random() * 48 * 60 * 60 * 1000),
      },
    });
  }
  console.log(`✅ ${submissionData.length} submissions created`);

  console.log("\n🎉 Demo data seeded successfully!");
  console.log("\n📧 Login credentials (password: demo1234):");
  console.log("  Admin:   admin@demo.codelab");
  console.log("  Student: arjun@demo.codelab");
  console.log("  Student: priya@demo.codelab");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
