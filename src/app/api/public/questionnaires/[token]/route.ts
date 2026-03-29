import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validationError, errorResponse } from "@/lib/api-helpers";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const questionnaire = await prisma.questionnaire.findUnique({
      where: { token },
      select: {
        id: true,
        title: true,
        questions: true,
        answers: true,
        answeredAt: true,
        wedding: {
          select: { partnerName1: true, partnerName2: true, weddingDate: true },
        },
      },
    });

    if (!questionnaire) {
      return NextResponse.json({ error: "Questionário não encontrado" }, { status: 404 });
    }

    return NextResponse.json(questionnaire);
  } catch (error) {
    console.error("GET /api/public/questionnaires/[token] error:", error);
    return errorResponse();
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const questionnaire = await prisma.questionnaire.findUnique({ where: { token } });
    if (!questionnaire) {
      return NextResponse.json({ error: "Questionário não encontrado" }, { status: 404 });
    }

    if (questionnaire.answeredAt) {
      return NextResponse.json({ error: "Questionário já foi respondido" }, { status: 409 });
    }

    const body = await req.json();
    const { answers } = body;

    if (!answers || !Array.isArray(answers)) {
      return validationError("answers é obrigatório");
    }

    const updated = await prisma.questionnaire.update({
      where: { token },
      data: {
        answers,
        answeredAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, answeredAt: updated.answeredAt });
  } catch (error) {
    console.error("POST /api/public/questionnaires/[token] error:", error);
    return errorResponse();
  }
}
