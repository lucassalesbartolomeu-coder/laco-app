import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, unauthorizedResponse, notFoundResponse, errorResponse } from "@/lib/api-helpers";

export async function PATCH(req: NextRequest, { params }: { params: { assignmentId: string } }) {
  const user = await getAuthenticatedUser();
  if (!user) return unauthorizedResponse();

  try {
    const planner = await prisma.weddingPlanner.findUnique({ where: { userId: user.id } });
    if (!planner) return notFoundResponse("Perfil");

    const assignment = await prisma.weddingPlannerAssignment.findUnique({
      where: { id: params.assignmentId },
    });
    if (!assignment || assignment.plannerId !== planner.id) return notFoundResponse("Atribuição");

    const body = await req.json();
    const updateData: Record<string, unknown> = {};

    if (body.commissionPaid !== undefined) updateData.commissionPaid = Boolean(body.commissionPaid);
    if (body.commissionAmount !== undefined)
      updateData.commissionAmount = body.commissionAmount ? Number(body.commissionAmount) : null;

    const updated = await prisma.weddingPlannerAssignment.update({
      where: { id: params.assignmentId },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch {
    return errorResponse();
  }
}
