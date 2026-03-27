import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/api-helpers";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return unauthorizedResponse();

  const planner = await prisma.weddingPlanner.findUnique({
    where: { userId: user.id },
  });

  if (!planner) {
    return NextResponse.json({ error: "Planner not found" }, { status: 404 });
  }

  const assignments = await prisma.weddingPlannerAssignment.findMany({
    where: { plannerId: planner.id },
    include: {
      wedding: {
        include: {
          _count: { select: { guests: true, vendors: true, gifts: true } },
        },
      },
    },
    orderBy: { assignedAt: "desc" },
  });

  return NextResponse.json(assignments);
}
