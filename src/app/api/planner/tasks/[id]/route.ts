import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";

type Params = { params: Promise<{ id: string }> };

// PATCH — toggle done or update fields
export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const planner = await prisma.weddingPlanner.findUnique({ where: { userId: user.id } });
    if (!planner) return NextResponse.json({ error: "Planner not found" }, { status: 404 });

    const body = await request.json();

    const task = await prisma.plannerTask.updateMany({
      where: { id, plannerId: planner.id },
      data: body,
    });

    if (task.count === 0) return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 });
    const updated = await prisma.plannerTask.findUnique({ where: { id } });
    return NextResponse.json(updated);
  } catch {
    return errorResponse();
  }
}

// DELETE — remove task
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const planner = await prisma.weddingPlanner.findUnique({ where: { userId: user.id } });
    if (!planner) return NextResponse.json({ error: "Planner not found" }, { status: 404 });

    await prisma.plannerTask.deleteMany({ where: { id, plannerId: planner.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return errorResponse();
  }
}
