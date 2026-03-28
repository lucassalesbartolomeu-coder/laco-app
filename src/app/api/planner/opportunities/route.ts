import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, unauthorizedResponse, forbiddenResponse, errorResponse } from "@/lib/api-helpers";

async function getPlanner(userId: string) {
  return prisma.weddingPlanner.findUnique({ where: { userId } });
}

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();
    const planner = await getPlanner(user.id);
    if (!planner) return forbiddenResponse();

    const opportunities = await prisma.opportunity.findMany({
      where: { plannerId: planner.id },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(opportunities);
  } catch (error) {
    console.error("GET /api/planner/opportunities error:", error);
    return errorResponse();
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();
    const planner = await getPlanner(user.id);
    if (!planner) return forbiddenResponse();

    const body = await req.json();

    if (!body.coupleName) {
      return NextResponse.json({ error: "coupleName é obrigatório" }, { status: 400 });
    }

    const opp = await prisma.opportunity.create({
      data: {
        plannerId: planner.id,
        coupleName: body.coupleName,
        contactPhone: body.contactPhone,
        contactEmail: body.contactEmail,
        weddingDate: body.weddingDate ? new Date(body.weddingDate) : null,
        venue: body.venue,
        estimatedBudget: body.estimatedBudget ? Number(body.estimatedBudget) : null,
        source: body.source || "outro",
        stage: body.stage || "lead",
        notes: body.notes,
        commissionEstimate: body.commissionEstimate ? Number(body.commissionEstimate) : null,
      },
    });

    return NextResponse.json(opp, { status: 201 });
  } catch (error) {
    console.error("POST /api/planner/opportunities error:", error);
    return errorResponse();
  }
}
