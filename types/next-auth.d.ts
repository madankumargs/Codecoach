// 📚 NEXTAUTH TYPE AUGMENTATION
// TypeScript doesn't know by default that our session has "role" and "id" fields —
// because we added them ourselves in the JWT callback.
// This file "augments" (extends) the built-in NextAuth types so TypeScript doesn't complain.
// It's a common pattern in TypeScript: extending third-party types.

import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      role?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    id?: string;
  }
}
