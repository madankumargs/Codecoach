// Prisma v7 config — the database URL is set here, not in schema.prisma
// We load .env.local so our local keys are available
import { loadEnvConfig } from "@next/env";
import { defineConfig } from "prisma/config";

// Load .env.local (Next.js style)
const projectDir = process.cwd();
loadEnvConfig(projectDir);

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
