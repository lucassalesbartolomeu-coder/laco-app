/**
 * Distributed rate limiter backed by PostgreSQL (Supabase).
 * Copiado do Colo — battle-tested em produção.
 *
 * Substitui implementações in-memory que quebram no Vercel serverless
 * (cada invocação é um processo isolado, então o Map fica sempre vazio).
 * Usa INSERT … ON CONFLICT DO UPDATE — atômico, sem race conditions.
 */
import { prisma } from "./prisma";

let tableReady = false;

async function ensureTable(): Promise<void> {
  if (tableReady) return;
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS rate_limits (
      key      TEXT PRIMARY KEY,
      count    INTEGER NOT NULL DEFAULT 0,
      reset_at TIMESTAMPTZ NOT NULL
    )
  `);
  tableReady = true;
}

/**
 * Returns `true` if the request is allowed, `false` if it should be blocked.
 *
 * @param key         Unique string identifying the caller (e.g. `"login:email@x.com"`)
 * @param maxRequests Maximum number of requests allowed in the window
 * @param windowMs    Window duration in milliseconds
 */
export async function rateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
): Promise<boolean> {
  try {
    await ensureTable();
    const windowInterval = `${windowMs} milliseconds`;
    const rows = await prisma.$queryRaw<{ count: number }[]>`
      INSERT INTO rate_limits (key, count, reset_at)
      VALUES (
        ${key},
        1,
        NOW() + ${windowInterval}::interval
      )
      ON CONFLICT (key) DO UPDATE
        SET count    = CASE
                         WHEN rate_limits.reset_at < NOW() THEN 1
                         ELSE rate_limits.count + 1
                       END,
            reset_at = CASE
                         WHEN rate_limits.reset_at < NOW()
                           THEN NOW() + ${windowInterval}::interval
                         ELSE rate_limits.reset_at
                       END
      RETURNING count
    `;
    return (rows[0]?.count ?? 1) <= maxRequests;
  } catch {
    // Fail open: se o DB está inacessível, permite a request em vez de bloquear usuários legítimos
    return true;
  }
}
