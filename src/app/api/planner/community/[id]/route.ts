import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";

// DELETE — delete own post
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const planner = await prisma.weddingPlanner.findUnique({ where: { userId: user.id } });
    if (!planner) return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });

    const post = await prisma.communityPost.findUnique({ where: { id: params.id } });
    if (!post || post.plannerId !== planner.id) {
      return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
    }

    await prisma.communityPost.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return errorResponse();
  }
}
