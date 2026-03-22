// 📚 WHAT IS THIS FILE?
// NextAuth.js handles all authentication (login/logout/sessions) for us.
// "Credentials Provider" means users log in with email + password (not Google/GitHub).
// NextAuth validates credentials, creates a session cookie, and keeps users logged in.
//
// HOW SESSIONS WORK:
// 1. User logs in → NextAuth creates a JWT (JSON Web Token) — a secure, encoded string
// 2. JWT is stored in a cookie in the user's browser
// 3. On every request, Next.js reads the cookie to know who the user is
// 4. When they log out, the cookie is deleted

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  // Where to redirect for sign-in
  pages: {
    signIn: "/login",
  },

  // Session strategy: "jwt" = store session in a JWT cookie (no DB needed)
  session: { strategy: "jwt" },

  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      // This function runs when a user tries to log in
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Look up the user in the database
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) return null;

        // bcrypt.compare safely checks if the password matches the hashed version
        // NEVER store plain text passwords — always hash them!
        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) return null;

        // Return user object — NextAuth puts this in the JWT token
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    // jwt callback: called when a token is created/updated
    // We add the user's role and id to the token here
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = (user as any).id;
      }
      return token;
    },

    // session callback: called when we call auth() or getServerSession()
    // We expose role and id from token to session so we can use it in pages
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
