import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getAuthenticatedUser,
  unauthorizedResponse,
  notFoundResponse,
  forbiddenResponse,
  errorResponse,
} from "@/lib/api-helpers";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const planner = await prisma.weddingPlanner.findUnique({ where: { userId: user.id } });
    if (!planner) return notFoundResponse("Cerimonialista");

    const { id } = await params;

    const questionnaire = await prisma.questionnaire.findUnique({
      where: { id },
      include: {
        wedding: {
          select: { id: true, partnerName1: true, partnerName2: true, weddingDate: true },
        },
      },
    });

    if (!questionnaire || questionnaire.plannerId !== planner.id) {
      return notFoundResponse("Questionário");
    }

    return NextResponse.json(questionnaire);
  } catch (error) {
    console.error("GET /api/planner/questionnaires/[id] error:", error);
    return errorResponse();
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const planner = await prisma.weddingPlanner.findUnique({ where: { userId: user.id } });
    if (!planner) return notFoundResponse("Cerimonialista");

    const { id } = await params;

    const questionnaire = await prisma.questionnaire.findUnique({ where: { id } });
    if (!questionnaire || questionnaire.plannerId !== planner.id) {
      return notFoundResponse("Questionário");
    }

    if (questionnaire.answeredAt) {
      return forbiddenResponse();
    }

    await prisma.questionnaire.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/planner/questionnaires/[id] error:", error);
    return errorResponse();
  }
}
