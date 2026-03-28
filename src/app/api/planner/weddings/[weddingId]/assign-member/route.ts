import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, unauthorizedResponse, notFoundResponse, errorResponse } from "@/lib/api-helpers";

export async function PATCH(req: NextRequest, { params }: { params: { weddingId: string } }) {
  const user = await getAuthenticatedUser();
  if (!user) return unauthorizedResponse();

  try {
    const planner = await prisma.weddingPlanner.findUnique({ where: { userId: user.id } });
    if (!planner) return notFoundResponse("Perfil");

    const assignment = await prisma.weddingPlannerAssignment.findUnique({
      where: { plannerId_weddingId: { plannerId: planner.id, weddingId: params.weddingId } },
    });
    if (!assignment) return notFoundResponse("Atribuição");

    const { teamMemberId } = await req.json();

    // Validate team member belongs to this planner
    if (teamMemberId) {
      const member = await prisma.plannerTeamMember.findUnique({ where: { id: teamMemberId } });
      if (!member || member.plannerId !== planner.id) return notFoundResponse("Membro");
    }

    const updated = await prisma.weddingPlannerAssignment.update({
      where: { id: assignment.id },
      data: { assignedTeamMemberId: teamMemberId ?? null },
      include: { teamMember: { select: { id: true, name: true, role: true } } },
    });

    return NextResponse.json(updated);
  } catch {
    return errorResponse();
  }
}
