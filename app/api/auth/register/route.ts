// 📚 WHAT IS THIS FILE?
// This is the user REGISTRATION API endpoint.
// When someone signs up, their browser sends a POST request to /api/auth/register
// We validate the data, hash the password, and save to the database.
// 
// IMPORTANT: We NEVER store plain text passwords!
// We use "bcrypt" to hash passwords — hashing is a one-way transformation.
// Even if someone steals your database, they can't reverse the hashes to get passwords.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    // req.json() parses the JSON body sent from the frontend
    const { name, email, password, role } = await req.json();

    // Basic validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 } // 400 = Bad Request
      );
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 } // 409 = Conflict
      );
    }

    // Hash the password with bcrypt
    // The "10" is the "salt rounds" — higher = more secure but slower (10 is standard)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user in the database
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role === "ADMIN" ? "ADMIN" : "STUDENT", // Default to STUDENT for safety
      },
      select: {
        // Only return non-sensitive fields
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json(
      { message: "Account created successfully", user },
      { status: 201 } // 201 = Created
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 } // 500 = Internal Server Error
    );
  }
}
