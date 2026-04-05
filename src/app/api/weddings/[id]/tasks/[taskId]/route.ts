import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getAuthenticatedUser,
  verifyWeddingOwnership,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  errorResponse,
  validationError,
} from "@/lib/api-helpers";
import { sendPushToUser } from "@/lib/webpush";

type Params = { params: Promise<{ id: string; taskId: string }> };

// PUT /api/weddings/[id]/tasks/[taskId]
export async function PUT(request: Request, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id, taskId } = await params;
    const { error } = await verifyWeddingOwnership(id, user.id);
    if (error === "not_found") return notFoundResponse("Casamento");
    if (error === "forbidden") return forbiddenResponse();

    const task = await prisma.weddingTask.findUnique({ where: { id: taskId } });
    if (!task || task.weddingId !== id) return notFoundResponse("Tarefa");

    const body = await request.json();

    const VALID_PRIORITIES = ["HIGH", "MEDIUM", "LOW"];
    const VALID_STATUSES = ["PENDING", "IN_PROGRESS", "DONE"];
    if (body.priority && !VALID_PRIORITIES.includes(body.priority)) {
      return validationError(`priority inválido. Valores aceitos: ${VALID_PRIORITIES.join(", ")}`);
    }
    if (body.status && !VALID_STATUSES.includes(body.status)) {
      return validationError(`status inválido. Valores aceitos: ${VALID_STATUSES.join(", ")}`);
    }

    if (body.dueDate) {
      const d = new Date(body.dueDate);
      if (isNaN(d.getTime())) return validationError("dueDate inválido");
    }

    const updated = await prisma.weddingTask.update({
      where: { id: taskId },
      data: {
        title: body.title?.trim() ?? task.title,
        description: body.description !== undefined ? body.description : task.description,
        priority: body.priority ?? task.priority,
        dueDate: body.dueDate !== undefined ? (body.dueDate ? new Date(body.dueDate) : null) : task.dueDate,
        status: body.status ?? task.status,
      },
      include: {
        createdBy: { select: { id: true, name: true, image: true } },
      },
    });

    // If task just got marked DONE, notify creator (if different from current user)
    if (body.status === "DONE" && task.status !== "DONE" && task.createdById !== user.id) {
      sendPushToUser(task.createdById, {
        title: "Tarefa concluída",
        body: updated.title,
      }).catch(() => {});
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/weddings/[id]/tasks/[taskId] error:", error);
    return errorResponse();
  }
}

// DELETE /api/weddings/[id]/tasks/[taskId]
export async function DELETE(_request: Request, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id, taskId } = await params;
    const { error } = await verifyWeddingOwnership(id, user.id);
    if (error === "not_found") return notFoundResponse("Casamento");
    if (error === "forbidden") return forbiddenResponse();

    const task = await prisma.weddingTask.findUnique({ where: { id: taskId } });
    if (!task || task.weddingId !== id) return notFoundResponse("Tarefa");

    await prisma.weddingTask.delete({ where: { id: taskId } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/weddings/[id]/tasks/[taskId] error:", error);
    return errorResponse();
  }
}
