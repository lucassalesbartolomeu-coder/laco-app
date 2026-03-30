import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";

// POST — add comment
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const planner = await prisma.weddingPlanner.findUnique({ where: { userId: user.id } });
    if (!planner) return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });

    const { content } = await req.json();
    if (!content?.trim()) return NextResponse.json({ error: "Comentário vazio" }, { status: 400 });

    const comment = await prisma.communityComment.create({
      data: { postId: params.id, plannerId: planner.id, content: content.trim() },
      include: { planner: { select: { id: true, companyName: true } } },
    });

    return NextResponse.json({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      author: { id: comment.planner.id, name: comment.planner.companyName },
      isOwn: true,
    }, { status: 201 });
  } catch {
    return errorResponse();
  }
}
