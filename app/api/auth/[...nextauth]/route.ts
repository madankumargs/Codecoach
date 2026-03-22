// 📚 WHAT IS THIS FILE?
// This is the NextAuth API route handler.
// In Next.js App Router, files named "route.ts" inside app/api/ become API endpoints.
// This file handles ALL auth-related HTTP requests:
//   GET  /api/auth/session    → returns current user session
//   POST /api/auth/signin     → signs a user in
//   POST /api/auth/signout    → signs a user out
//   GET  /api/auth/csrf       → CSRF protection token
// NextAuth handles all of this for us automatically!

import { handlers } from "@/lib/auth";

// Export the GET and POST handlers directly from NextAuth
export const { GET, POST } = handlers;
