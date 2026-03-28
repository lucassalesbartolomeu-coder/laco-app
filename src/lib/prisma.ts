/**
 * Prisma client singleton com PrismaPg adapter para connection pooling.
 * Usa pg Pool diretamente (mais performático que Prisma direto no serverless Vercel).
 * Copiado do Colo — funciona em produção.
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL!;

function createPrismaClient() {
  const pool = new Pool({ connectionString, max: 10 });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);
}

const globalForPrisma = global as unknown as { prisma: ReturnType<typeof createPrismaClient> };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
