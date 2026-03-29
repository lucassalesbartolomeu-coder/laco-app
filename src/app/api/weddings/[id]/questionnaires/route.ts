import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getAuthenticatedUser,
  unauthorizedResponse,
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

    const { id: weddingId } = await params;

    // Verify ownership or partner access
    const wedding = await prisma.wedding.findUnique({ where: { id: weddingId } });
    if (!wedding) return NextResponse.json({ error: "Casamento não encontrado" }, { status: 404 });
    if (wedding.userId !== user.id && wedding.partnerUserId !== user.id) {
      return forbiddenResponse();
    }

    const questionnaires = await prisma.questionnaire.findMany({
      where: { weddingId },
      select: {
        id: true,
        title: true,
        token: true,
        answeredAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(questionnaires);
  } catch (error) {
    console.error("GET /api/weddings/[id]/questionnaires error:", error);
    return errorResponse();
  }
}
