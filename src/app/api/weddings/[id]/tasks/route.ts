import { NextRequest, NextResponse } from "next/server";
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

type Params = { params: Promise<{ id: string }> };

// GET /api/weddings/[id]/tasks
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const { error } = await verifyWeddingOwnership(id, user.id);
    if (error === "not_found") return notFoundResponse("Casamento");
    if (error === "forbidden") return forbiddenResponse();

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");

    const where: Record<string, unknown> = { weddingId: id };
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const tasks = await prisma.weddingTask.findMany({
      where,
      include: {
        createdBy: { select: { id: true, name: true, image: true } },
      },
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("GET /api/weddings/[id]/tasks error:", error);
    return errorResponse();
  }
}

// POST /api/weddings/[id]/tasks
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const { error } = await verifyWeddingOwnership(id, user.id);
    if (error === "not_found") return notFoundResponse("Casamento");
    if (error === "forbidden") return forbiddenResponse();

    const body = await request.json();
    if (!body.title?.trim()) return validationError("title é obrigatório");

    const VALID_PRIORITIES = ["HIGH", "MEDIUM", "LOW"];
    if (!body.priority || !VALID_PRIORITIES.includes(body.priority)) {
      return validationError(`priority inválido. Valores aceitos: ${VALID_PRIORITIES.join(", ")}`);
    }

    const task = await prisma.weddingTask.create({
      data: {
        weddingId: id,
        createdById: user.id,
        title: body.title.trim(),
        description: body.description ?? null,
        priority: body.priority,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        status: "PENDING",
      },
      include: {
        createdBy: { select: { id: true, name: true, image: true } },
      },
    });

    // Notify the other side: find other users associated with this wedding
    // (co-owner, planner) who are not the creator
    const weddingForNotif = await prisma.wedding.findUnique({
      where: { id },
      select: {
        userId: true,
        plannerAssignments: {
          select: { planner: { select: { user: { select: { id: true } } } } },
        },
      },
    });

    if (weddingForNotif) {
      const recipientIds = new Set<string>();
      if (weddingForNotif.userId && weddingForNotif.userId !== user.id) {
        recipientIds.add(weddingForNotif.userId);
      }
      weddingForNotif.plannerAssignments?.forEach((a) => {
        const uid = a.planner?.user?.id;
        if (uid && uid !== user.id) recipientIds.add(uid);
      });

      recipientIds.forEach((recipientId) => {
        sendPushToUser(recipientId, {
          title: "Nova tarefa criada",
          body: task.title,
        }).catch(() => {});
      });
    }

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("POST /api/weddings/[id]/tasks error:", error);
    return errorResponse();
  }
}
