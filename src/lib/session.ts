import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { NextResponse } from "next/server";

export async function getAuthUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return session.user as { id: string; email: string; name?: string | null };
}

export function unauthorized() {
  return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
}
