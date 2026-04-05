import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getAuthenticatedUser,
  unauthorizedResponse,
  errorResponse,
  notFoundResponse,
  validationError,
} from "@/lib/api-helpers";

// GET /api/planner/task-templates
export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const planner = await prisma.weddingPlanner.findFirst({
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

    const planner = await prisma.weddingPlanner.findFirst({
      where: { userId: user.id },
    });
    if (!planner) return notFoundResponse("Perfil de cerimonialista");

    const body = await request.json();

    if (!body.name) return validationError("name é obrigatório");
    if (!body.phase) return validationError("phase é obrigatório");
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return validationError("items deve ser um array não vazio");
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
      include: { items: true },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error("POST /api/planner/task-templates error:", error);
    return errorResponse();
  }
}
