import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/api-helpers";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return unauthorizedResponse();

  const planner = await prisma.weddingPlanner.findUnique({
    where: { userId: user.id },
    include: {
      assignments: {
        where: { status: "ativo" },
        include: {
          wedding: {
            select: {
              id: true,
              partnerName1: true,
              partnerName2: true,
              weddingDate: true,
              venue: true,
              city: true,
              state: true,
              estimatedBudget: true,
              estimatedGuests: true,
            },
          },
        },
        orderBy: { assignedAt: "desc" },
      },
      opportunities: {
        where: { stage: { not: "perdido" } },
      },
    },
  });

  if (!planner) {
    return NextResponse.json({ error: "Planner not found" }, { status: 404 });
  }

  // Calculate KPIs
  const activeWeddings = planner.assignments.length;
  const now = new Date();

  const nextEvent = planner.assignments
    .filter((a) => a.wedding.weddingDate && new Date(a.wedding.weddingDate) > now)
    .sort((a, b) => new Date(a.wedding.weddingDate!).getTime() - new Date(b.wedding.weddingDate!).getTime())[0];

  const commissions = await prisma.weddingPlannerAssignment.aggregate({
    where: { plannerId: planner.id },
    _sum: { commissionAmount: true },
  });

  const pendingCommissions = await prisma.weddingPlannerAssignment.aggregate({
    where: { plannerId: planner.id, commissionPaid: false, commissionAmount: { not: null } },
    _sum: { commissionAmount: true },
  });

  const pipelineCount = planner.opportunities.filter((o) => o.stage !== "fechado").length;

  return NextResponse.json({
    planner: {
      id: planner.id,
      companyName: planner.companyName,
      slug: planner.slug,
    },
    kpis: {
      activeWeddings,
      nextEvent: nextEvent
        ? {
            date: nextEvent.wedding.weddingDate,
            couple: `${nextEvent.wedding.partnerName1} & ${nextEvent.wedding.partnerName2}`,
          }
        : null,
      totalCommissions: commissions._sum.commissionAmount || 0,
      pendingCommissions: pendingCommissions._sum.commissionAmount || 0,
      pipelineCount,
    },
    weddings: planner.assignments.map((a) => ({
      assignmentId: a.id,
      role: a.role,
      status: a.status,
      commissionAmount: a.commissionAmount,
      commissionPaid: a.commissionPaid,
      wedding: a.wedding,
    })),
  });
}
