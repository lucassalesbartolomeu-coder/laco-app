import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getAuthenticatedUser,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  errorResponse,
  validationError,
} from "@/lib/api-helpers";

type Params = { params: Promise<{ id: string }> };

// PUT /api/planner/task-templates/[id]
export async function PUT(request: Request, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();
    if (user.role !== "PLANNER" && user.role !== "ADMIN") return forbiddenResponse();

    const { id } = await params;

    const planner = await prisma.weddingPlanner.findUnique({ where: { userId: user.id } });
    if (!planner) return notFoundResponse("Perfil de cerimonialista");

    const template = await prisma.taskTemplate.findUnique({ where: { id } });
    if (!template) return notFoundResponse("Template");
    if (template.plannerId !== planner.id) return forbiddenResponse();

    const body = await request.json();
    if (!body.name) return validationError("name é obrigatório");

    // Validate phase if provided
    const VALID_PHASES = ["TWELVE_MONTHS", "SIX_MONTHS", "THREE_MONTHS", "ONE_MONTH", "ONE_WEEK", "DAY_OF"];
    if (body.phase && !VALID_PHASES.includes(body.phase)) {
      return validationError(`phase inválido. Valores aceitos: ${VALID_PHASES.join(", ")}`);
    }

    // Validate items if provided
    const VALID_PRIORITIES = ["HIGH", "MEDIUM", "LOW"];
    if (Array.isArray(body.items)) {
      for (const item of body.items) {
        if (!item.title?.trim()) return validationError("Cada item precisa de um title");
        if (!item.priority || !VALID_PRIORITIES.includes(item.priority)) {
          return validationError(`priority inválido. Valores aceitos: ${VALID_PRIORITIES.join(", ")}`);
        }
        if (typeof item.daysBeforeWedding !== "number") {
          return validationError("daysBeforeWedding deve ser um número");
        }
      }
    }

    // Replace all items atomically: delete old, insert new
    const updated = await prisma.$transaction(async (tx) => {
      await tx.taskTemplateItem.deleteMany({ where: { templateId: id } });
      return tx.taskTemplate.update({
        where: { id },
        data: {
          name: body.name,
          description: body.description ?? null,
          phase: body.phase ?? template.phase,
          items: {
            create: (body.items ?? []).map((item: {
              title: string;
              description?: string;
              priority: string;
              daysBeforeWedding: number;
            }) => ({
              title: item.title,
              description: item.description ?? null,
              priority: item.priority,
              daysBeforeWedding: item.daysBeforeWedding,
            })),
          },
        },
        include: { items: { orderBy: { daysBeforeWedding: "asc" } } },
      });
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/planner/task-templates/[id] error:", error);
    return errorResponse();
  }
}

// DELETE /api/planner/task-templates/[id]
export async function DELETE(_request: Request, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();
    if (user.role !== "PLANNER" && user.role !== "ADMIN") return forbiddenResponse();

    const { id } = await params;

    const planner = await prisma.weddingPlanner.findUnique({ where: { userId: user.id } });
    if (!planner) return notFoundResponse("Perfil de cerimonialista");

    const template = await prisma.taskTemplate.findUnique({ where: { id } });
    if (!template) return notFoundResponse("Template");
    if (template.plannerId !== planner.id) return forbiddenResponse();

    await prisma.taskTemplate.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/planner/task-templates/[id] error:", error);
    return errorResponse();
  }
}
