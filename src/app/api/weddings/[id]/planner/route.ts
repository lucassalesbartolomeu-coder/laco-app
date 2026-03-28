import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, unauthorizedResponse, forbiddenResponse, notFoundResponse, errorResponse } from "@/lib/api-helpers";

type Params = { params: Promise<{ id: string }> };

// POST /api/weddings/[id]/planner — invite or accept planner
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const { action, plannerEmail, role } = await req.json();

    if (action === "invite") {
      // Couple invites planner by email
      const wedding = await prisma.wedding.findFirst({
        where: { id, userId: user.id },
      });
      if (!wedding) return notFoundResponse("Casamento");

      const plannerUser = await prisma.user.findUnique({
        where: { email: plannerEmail },
        include: { weddingPlanner: true },
      });

      if (!plannerUser?.weddingPlanner) {
        return notFoundResponse("Cerimonialista");
      }

      const existing = await prisma.weddingPlannerAssignment.findUnique({
        where: {
          plannerId_weddingId: {
            plannerId: plannerUser.weddingPlanner.id,
            weddingId: id,
          },
        },
      });

      if (existing) {
        return NextResponse.json({ error: "Cerimonialista já vinculada" }, { status: 409 });
      }

      const assignment = await prisma.weddingPlannerAssignment.create({
        data: {
          plannerId: plannerUser.weddingPlanner.id,
          weddingId: id,
          role: role || "principal",
          status: "ativo",
        },
      });

      return NextResponse.json(assignment, { status: 201 });
    }

    if (action === "accept") {
      // Planner accepts invitation (self-link by wedding code/id)
      const planner = await prisma.weddingPlanner.findUnique({
        where: { userId: user.id },
      });
      if (!planner) return forbiddenResponse();

      const wedding = await prisma.wedding.findUnique({ where: { id } });
      if (!wedding) return notFoundResponse("Casamento");

      const existing = await prisma.weddingPlannerAssignment.findUnique({
        where: {
          plannerId_weddingId: { plannerId: planner.id, weddingId: id },
        },
      });

      if (existing) {
        return NextResponse.json({ error: "Já vinculada" }, { status: 409 });
      }

      const assignment = await prisma.weddingPlannerAssignment.create({
        data: {
          plannerId: planner.id,
          weddingId: id,
          role: role || "principal",
          status: "ativo",
        },
      });

      return NextResponse.json(assignment, { status: 201 });
    }

    return NextResponse.json({ error: "action inválida" }, { status: 400 });
  } catch (error) {
    console.error("POST /api/weddings/[id]/planner error:", error);
    return errorResponse();
  }
}
