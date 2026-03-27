import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/api-helpers";

async function getPlanner(userId: string) {
  return prisma.weddingPlanner.findUnique({ where: { userId } });
}

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return unauthorizedResponse();
  const planner = await getPlanner(user.id);
  if (!planner) return NextResponse.json({ error: "Not a planner" }, { status: 403 });

  const opportunities = await prisma.opportunity.findMany({
    where: { plannerId: planner.id },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(opportunities);
}

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return unauthorizedResponse();
  const planner = await getPlanner(user.id);
  if (!planner) return NextResponse.json({ error: "Not a planner" }, { status: 403 });

  const body = await req.json();

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
}
