import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, unauthorizedResponse, notFoundResponse, errorResponse } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return unauthorizedResponse();

  try {
    const planner = await prisma.weddingPlanner.findUnique({ where: { userId: user.id } });
    if (!planner) return notFoundResponse("Perfil");

    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month"); // YYYY-MM
    const status = searchParams.get("status") ?? "all"; // paid | pending | all

    const assignments = await prisma.weddingPlannerAssignment.findMany({
      where: {
        plannerId: planner.id,
        ...(status === "paid" ? { commissionPaid: true } : {}),
        ...(status === "pending" ? { commissionPaid: false, commissionAmount: { not: null } } : {}),
      },
      include: {
        wedding: {
          select: {
            id: true,
            partnerName1: true,
            partnerName2: true,
            weddingDate: true,
            city: true,
          },
        },
        teamMember: { select: { id: true, name: true } },
      },
      orderBy: { assignedAt: "desc" },
    });

    // filter by month if provided
    const filtered = month
      ? assignments.filter((a) => {
          if (!a.wedding.weddingDate) return false;
          const d = new Date(a.wedding.weddingDate);
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` === month;
        })
      : assignments;

    const totalPending = filtered
      .filter((a) => !a.commissionPaid && a.commissionAmount)
      .reduce((s, a) => s + (a.commissionAmount ?? 0), 0);

    const totalPaid = filtered
      .filter((a) => a.commissionPaid && a.commissionAmount)
      .reduce((s, a) => s + (a.commissionAmount ?? 0), 0);

    return NextResponse.json({ assignments: filtered, totalPending, totalPaid });
  } catch {
    return errorResponse();
  }
}
