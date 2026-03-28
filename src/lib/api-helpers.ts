/**
 * Helpers para Route Handlers da API.
 */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function getAuthenticatedUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return session.user as { id: string; email: string; name?: string | null; role?: string };
}

export async function verifyWeddingOwnership(weddingId: string, userId: string) {
  const wedding = await prisma.wedding.findUnique({ where: { id: weddingId } });
  if (!wedding) return { error: "not_found" as const, wedding: null, role: null };

  // Owner
  if (wedding.userId === userId) {
    return { error: null, wedding, role: "owner" as const };
  }

  // Partner
  if (wedding.partnerUserId === userId) {
    return { error: null, wedding, role: "partner" as const };
  }

  // Planner com assignment ativo
  const assignment = await prisma.weddingPlannerAssignment.findFirst({
    where: { weddingId, status: "ativo", planner: { userId } },
  });
  if (assignment) {
    return { error: null, wedding, role: "planner" as const };
  }

  return { error: "forbidden" as const, wedding: null, role: null };
}

// ─── Response helpers ─────────────────────────────────────────────────────────

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
}

export function forbiddenResponse() {
  return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
}

export function notFoundResponse(entity = "Recurso") {
  return NextResponse.json({ error: `${entity} não encontrado` }, { status: 404 });
}

export function errorResponse(message = "Erro interno do servidor") {
  return NextResponse.json({ error: message }, { status: 500 });
}

export function validationError(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

/**
 * Valida que o Content-Type da request é application/json.
 * Retorna NextResponse com 415 se inválido, ou null se válido.
 */
export function validateContentType(req: NextRequest): NextResponse | null {
  const ct = req.headers.get("content-type") ?? "";
  if (!ct.includes("application/json")) {
    return NextResponse.json(
      { error: "Content-Type deve ser application/json" },
      { status: 415 }
    );
  }
  return null;
}

/**
 * Extrai o IP real da request (considerando proxies Vercel/Cloudflare).
 */
export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}
