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

// POST /api/planner/task-templates/[id]/apply
// Body: { weddingId: string, weddingDate: string (ISO) }
export async function POST(request: Request, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();
    if (user.role !== "PLANNER" && user.role !== "ADMIN") return forbiddenResponse();

    const { id } = await params;
    const body = await request.json();

    if (!body.weddingId) return validationError("weddingId é obrigatório");
    if (!body.weddingDate) return validationError("weddingDate é obrigatório");

    // Validate weddingDate is a valid date
    const weddingDate = new Date(body.weddingDate);
    if (isNaN(weddingDate.getTime())) return validationError("weddingDate inválido");

    const planner = await prisma.weddingPlanner.findUnique({ where: { userId: user.id } });
    if (!planner) return notFoundResponse("Perfil de cerimonialista");

    // Verify template belongs to planner
    const template = await prisma.taskTemplate.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!template) return notFoundResponse("Template");
    if (template.plannerId !== planner.id) return forbiddenResponse();

    // Verify planner has access to the wedding
    const assignment = await prisma.weddingPlannerAssignment.findFirst({
      where: { weddingId: body.weddingId, plannerId: planner.id },
    });
    if (!assignment) return forbiddenResponse();

    // Create one WeddingTask per template item (atomic)
    const tasks = await prisma.$transaction(
      template.items.map((item) => {
        const dueDate = new Date(weddingDate);
        dueDate.setDate(dueDate.getDate() + item.daysBeforeWedding);
        return prisma.weddingTask.create({
          data: {
            weddingId: body.weddingId,
            createdById: user.id,
            title: item.title,
            description: item.description ?? null,
            priority: item.priority,
            dueDate,
            templateItemId: item.id,
            status: "PENDING",
          },
        });
      })
    );

    return NextResponse.json({ created: tasks.length, tasks }, { status: 201 });
  } catch (error) {
    console.error("POST /api/planner/task-templates/[id]/apply error:", error);
    return errorResponse();
  }
}
