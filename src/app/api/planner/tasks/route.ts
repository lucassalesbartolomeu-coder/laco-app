import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";

// GET — list pending tasks ordered by dueDate
export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const planner = await prisma.weddingPlanner.findUnique({ where: { userId: user.id } });
    if (!planner) return NextResponse.json({ error: "Planner not found" }, { status: 404 });

    const tasks = await prisma.plannerTask.findMany({
      where: { plannerId: planner.id, done: false },
      orderBy: [{ dueDate: "asc" }, { createdAt: "asc" }],
    });

    return NextResponse.json(tasks);
  } catch {
    return errorResponse();
  }
}

// POST — create task
export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const planner = await prisma.weddingPlanner.findUnique({ where: { userId: user.id } });
    if (!planner) return NextResponse.json({ error: "Planner not found" }, { status: 404 });

    const { title, dueDate, weddingId, priority } = await request.json();
    if (!title?.trim()) return NextResponse.json({ error: "Título obrigatório" }, { status: 400 });

    const task = await prisma.plannerTask.create({
      data: {
        plannerId: planner.id,
        title: title.trim(),
        dueDate: dueDate ? new Date(dueDate) : null,
        weddingId: weddingId || null,
        priority: priority || "normal",
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch {
    return errorResponse();
  }
}
