// 📚 WHAT IS THIS FILE?
// Prisma v7 uses a new "client" engine that requires an explicit DB adapter.
// We use @prisma/adapter-pg which connects to PostgreSQL via the `pg` library.
// The DATABASE_URL from .env.local is used to configure the connection pool.
//
// WHY A POOL?
// A "connection pool" keeps several DB connections open and reuses them.
// Without it, every request would open and close a new DB connection (slow!).

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// We declare a global variable to hold the Prisma instance
// This prevents hot-reload from creating hundreds of DB connections in dev
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  // Create the PostgreSQL adapter using the connection URL from .env.local
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
