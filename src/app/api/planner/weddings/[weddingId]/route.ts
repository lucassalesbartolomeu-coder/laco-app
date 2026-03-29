import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, unauthorizedResponse, forbiddenResponse, notFoundResponse, errorResponse } from "@/lib/api-helpers";

type Params = { params: Promise<{ weddingId: string }> };

// GET /api/planner/weddings/[weddingId] — cerimonialista vinculada acessa dados do casamento
export async function GET(_req: Request, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { weddingId } = await params;

    // Verifica se o usuário é uma cerimonialista vinculada a este casamento
    const planner = await prisma.weddingPlanner.findUnique({
      where: { userId: user.id },
    });
    if (!planner) return forbiddenResponse();

    const assignment = await prisma.weddingPlannerAssignment.findUnique({
      where: {
        plannerId_weddingId: { plannerId: planner.id, weddingId },
      },
    });
    if (!assignment) return notFoundResponse("Casamento");
    if (assignment.status !== "ativo") {
      return NextResponse.json({ error: "Vinculo pendente ou inativo." }, { status: 403 });
    }

    const wedding = await prisma.wedding.findUnique({
      where: { id: weddingId },
      include: {
        guests: { orderBy: { name: "asc" } },
        vendors: { orderBy: { name: "asc" } },
        budgetItems: { orderBy: { category: "asc" } },
      },
    });

    if (!wedding) return notFoundResponse("Casamento");

    return NextResponse.json(wedding);
  } catch (error) {
    console.error("GET /api/planner/weddings/[weddingId] error:", error);
    return errorResponse();
  }
}
