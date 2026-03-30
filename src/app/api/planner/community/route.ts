import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";

// GET — paginated feed
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const planner = await prisma.weddingPlanner.findUnique({ where: { userId: user.id } });
    if (!planner) return NextResponse.json({ posts: [] });

    const cursor = req.nextUrl.searchParams.get("cursor");

    const posts = await prisma.communityPost.findMany({
      orderBy: { createdAt: "desc" },
      take: 15,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      include: {
        planner: { select: { id: true, companyName: true } },
        likes: { select: { plannerId: true } },
        comments: {
          orderBy: { createdAt: "asc" },
          include: { planner: { select: { id: true, companyName: true } } },
        },
      },
    });

    const result = posts.map((p) => ({
      id: p.id,
      content: p.content,
      createdAt: p.createdAt,
      author: { id: p.planner.id, name: p.planner.companyName },
      likeCount: p.likes.length,
      likedByMe: p.likes.some((l) => l.plannerId === planner.id),
      isOwn: p.plannerId === planner.id,
      comments: p.comments.map((c) => ({
        id: c.id,
        content: c.content,
        createdAt: c.createdAt,
        author: { id: c.planner.id, name: c.planner.companyName },
        isOwn: c.plannerId === planner.id,
      })),
    }));

    const nextCursor = posts.length === 15 ? posts[posts.length - 1].id : null;

    return NextResponse.json({ posts: result, nextCursor });
  } catch {
    return errorResponse();
  }
}

// POST — create post
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const planner = await prisma.weddingPlanner.findUnique({ where: { userId: user.id } });
    if (!planner) return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });

    const { content } = await req.json();
    if (!content?.trim()) return NextResponse.json({ error: "Conteúdo obrigatório" }, { status: 400 });

    const post = await prisma.communityPost.create({
      data: { plannerId: planner.id, content: content.trim() },
    });

    return NextResponse.json({ id: post.id }, { status: 201 });
  } catch {
    return errorResponse();
  }
}
