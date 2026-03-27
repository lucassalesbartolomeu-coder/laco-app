import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/api-helpers";

type Params = { params: Promise<{ id: string }> };

async function getPlanner(userId: string) {
  return prisma.weddingPlanner.findUnique({ where: { userId } });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const user = await getAuthenticatedUser();
  if (!user) return unauthorizedResponse();
  const planner = await getPlanner(user.id);
  if (!planner) return NextResponse.json({ error: "Not a planner" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.opportunity.findFirst({
    where: { id, plannerId: planner.id },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.opportunity.update({
    where: { id },
    data: {
      coupleName: body.coupleName ?? existing.coupleName,
      contactPhone: body.contactPhone !== undefined ? body.contactPhone : existing.contactPhone,
      contactEmail: body.contactEmail !== undefined ? body.contactEmail : existing.contactEmail,
      weddingDate: body.weddingDate !== undefined ? (body.weddingDate ? new Date(body.weddingDate) : null) : existing.weddingDate,
      venue: body.venue !== undefined ? body.venue : existing.venue,
      estimatedBudget: body.estimatedBudget !== undefined ? Number(body.estimatedBudget) : existing.estimatedBudget,
      source: body.source ?? existing.source,
      stage: body.stage ?? existing.stage,
      notes: body.notes !== undefined ? body.notes : existing.notes,
      lostReason: body.lostReason !== undefined ? body.lostReason : existing.lostReason,
      commissionEstimate: body.commissionEstimate !== undefined ? Number(body.commissionEstimate) : existing.commissionEstimate,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const user = await getAuthenticatedUser();
  if (!user) return unauthorizedResponse();
  const planner = await getPlanner(user.id);
  if (!planner) return NextResponse.json({ error: "Not a planner" }, { status: 403 });

  const { id } = await params;

  const existing = await prisma.opportunity.findFirst({
    where: { id, plannerId: planner.id },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.opportunity.delete({ where: { id } });
  return NextResponse.json({ message: "Deleted" });
}
