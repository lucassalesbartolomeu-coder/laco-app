import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getAuthenticatedUser,
  unauthorizedResponse,
  forbiddenResponse,
  errorResponse,
  notFoundResponse,
  validationError,
} from "@/lib/api-helpers";

// GET /api/planner/task-templates
export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();
    if (user.role !== "PLANNER" && user.role !== "ADMIN") return forbiddenResponse();

    const planner = await prisma.weddingPlanner.findUnique({
      where: { userId: user.id },
    });
    if (!planner) return notFoundResponse("Perfil de cerimonialista");

    const templates = await prisma.taskTemplate.findMany({
      where: { plannerId: planner.id },
      include: { items: { orderBy: { daysBeforeWedding: "asc" } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error("GET /api/planner/task-templates error:", error);
    return errorResponse();
  }
}

// POST /api/planner/task-templates
export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();
    if (user.role !== "PLANNER" && user.role !== "ADMIN") return forbiddenResponse();

    const planner = await prisma.weddingPlanner.findUnique({
      where: { userId: user.id },
    });
    if (!planner) return notFoundResponse("Perfil de cerimonialista");

    const body = await request.json();

    if (!body.name) return validationError("name é obrigatório");
    if (!body.phase) return validationError("phase é obrigatório");
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return validationError("items deve ser um array não vazio");
    }

    const VALID_PHASES = ["TWELVE_MONTHS", "SIX_MONTHS", "THREE_MONTHS", "ONE_MONTH", "ONE_WEEK", "DAY_OF"];
    if (!VALID_PHASES.includes(body.phase)) {
      return validationError(`phase inválido. Valores aceitos: ${VALID_PHASES.join(", ")}`);
    }

    const VALID_PRIORITIES = ["HIGH", "MEDIUM", "LOW"];
    for (const item of body.items) {
      if (!item.title?.trim()) return validationError("Cada item precisa de um title");
      if (!item.priority || !VALID_PRIORITIES.includes(item.priority)) {
        return validationError(`priority inválido. Valores aceitos: ${VALID_PRIORITIES.join(", ")}`);
      }
      if (typeof item.daysBeforeWedding !== "number") {
        return validationError("daysBeforeWedding deve ser um número");
      }
    }

    const template = await prisma.taskTemplate.create({
      data: {
        plannerId: planner.id,
        name: body.name,
        description: body.description ?? null,
        phase: body.phase,
        items: {
          create: body.items.map((item: {
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

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error("POST /api/planner/task-templates error:", error);
    return errorResponse();
  }
}
