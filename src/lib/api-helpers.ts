import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "./auth";
import { prisma } from "./prisma";

export async function getAuthenticatedUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return session.user as { id: string; email: string; name?: string };
}

export async function verifyWeddingOwnership(weddingId: string, userId: string) {
  const wedding = await prisma.wedding.findUnique({
    where: { id: weddingId },
  });
  if (!wedding) return { error: "not_found" as const, wedding: null };
  if (wedding.userId !== userId) return { error: "forbidden" as const, wedding: null };
  return { error: null, wedding };
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
}

export function forbiddenResponse() {
  return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
}

export function notFoundResponse(resource = "Recurso") {
  return NextResponse.json({ error: `${resource} não encontrado` }, { status: 404 });
}

export function errorResponse(message = "Erro interno do servidor") {
  return NextResponse.json({ error: message }, { status: 500 });
}

export function validationError(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}
