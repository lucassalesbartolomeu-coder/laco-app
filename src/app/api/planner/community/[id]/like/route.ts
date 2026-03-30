import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";

// POST — toggle like
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const planner = await prisma.weddingPlanner.findUnique({ where: { userId: user.id } });
    if (!planner) return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });

    const existing = await prisma.communityLike.findUnique({
      where: { postId_plannerId: { postId: params.id, plannerId: planner.id } },
    });

    if (existing) {
      await prisma.communityLike.delete({ where: { id: existing.id } });
      return NextResponse.json({ liked: false });
    } else {
      await prisma.communityLike.create({ data: { postId: params.id, plannerId: planner.id } });
      return NextResponse.json({ liked: true });
    }
  } catch {
    return errorResponse();
  }
}
