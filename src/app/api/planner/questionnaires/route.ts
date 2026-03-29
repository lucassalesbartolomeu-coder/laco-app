import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getAuthenticatedUser,
  unauthorizedResponse,
  notFoundResponse,
  validationError,
  errorResponse,
} from "@/lib/api-helpers";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const planner = await prisma.weddingPlanner.findUnique({ where: { userId: user.id } });
    if (!planner) return notFoundResponse("Cerimonialista");

    const questionnaires = await prisma.questionnaire.findMany({
      where: { plannerId: planner.id },
      include: {
        wedding: {
          select: { id: true, partnerName1: true, partnerName2: true, weddingDate: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(questionnaires);
  } catch (error) {
    console.error("GET /api/planner/questionnaires error:", error);
    return errorResponse();
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const planner = await prisma.weddingPlanner.findUnique({ where: { userId: user.id } });
    if (!planner) return notFoundResponse("Cerimonialista");

    const body = await req.json();
    const { weddingId, title, questions } = body;

    if (!weddingId || !questions || !Array.isArray(questions) || questions.length === 0) {
      return validationError("weddingId e questions são obrigatórios");
    }

    // Verify the planner is assigned to this wedding
    const assignment = await prisma.weddingPlannerAssignment.findFirst({
      where: { plannerId: planner.id, weddingId },
    });
    if (!assignment) {
      return NextResponse.json(
        { error: "Planner não está associado a este casamento" },
        { status: 403 }
      );
    }

    const questionnaire = await prisma.questionnaire.create({
      data: {
        plannerId: planner.id,
        weddingId,
        title: title || "Questionário de Preferências",
        questions,
      },
      include: {
        wedding: {
          select: { id: true, partnerName1: true, partnerName2: true, weddingDate: true },
        },
      },
    });

    return NextResponse.json(questionnaire, { status: 201 });
  } catch (error) {
    console.error("POST /api/planner/questionnaires error:", error);
    return errorResponse();
  }
}
