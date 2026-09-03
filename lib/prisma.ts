import { PrismaClient } from "@prisma/client";

// Evita múltiplas instâncias do PrismaClient em dev (hot reload) e mantém
// uma única conexão pooled por processo em produção (serverless).
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
