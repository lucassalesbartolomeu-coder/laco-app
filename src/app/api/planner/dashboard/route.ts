import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, unauthorizedResponse, notFoundResponse, errorResponse } from "@/lib/api-helpers";

export async function GET() {
  try {
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
          select: { id: true, stage: true, estimatedBudget: true },
        },
      },
    });

    if (!planner) {
      return notFoundResponse("Cerimonialista");
    }

    // Parallelize the two commission aggregation queries
    const [commissions, pendingCommissions] = await Promise.all([
      prisma.weddingPlannerAssignment.aggregate({
        where: { plannerId: planner.id },
        _sum: { commissionAmount: true },
      }),
      prisma.weddingPlannerAssignment.aggregate({
        where: { plannerId: planner.id, commissionPaid: false, commissionAmount: { not: null } },
        _sum: { commissionAmount: true },
      }),
    ]);

    // Calculate KPIs from already-fetched data (no extra DB calls)
    const activeWeddings = planner.assignments.length;
    const now = new Date();

    const nextEvent = planner.assignments
      .filter((a) => a.wedding.weddingDate && new Date(a.wedding.weddingDate) > now)
      .sort((a, b) => new Date(a.wedding.weddingDate!).getTime() - new Date(b.wedding.weddingDate!).getTime())[0];

    const openOpps = planner.opportunities.filter((o) => o.stage !== "fechado");
    const pipelineCount = openOpps.length;
    const pipelineValue = openOpps.reduce((sum, o) => sum + (o.estimatedBudget ?? 0), 0);

    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const weddingsSoon = planner.assignments.filter(
      (a) => a.wedding.weddingDate && new Date(a.wedding.weddingDate) > now && new Date(a.wedding.weddingDate) <= thirtyDaysFromNow
    ).length;

    return NextResponse.json({
      planner: {
        id: planner.id,
        companyName: planner.companyName,
        slug: planner.slug,
      },
      kpis: {
        activeWeddings,
        weddingsSoon,
        nextEvent: nextEvent
          ? {
              date: nextEvent.wedding.weddingDate,
              couple: `${nextEvent.wedding.partnerName1} & ${nextEvent.wedding.partnerName2}`,
            }
          : null,
        totalCommissions: commissions._sum.commissionAmount || 0,
        pendingCommissions: pendingCommissions._sum.commissionAmount || 0,
        pipelineCount,
        pipelineValue,
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
  } catch (error) {
    console.error("GET /api/planner/dashboard error:", error);
    return errorResponse();
  }
}
