import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";
import { assignReferralCode } from "@/lib/referral";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return unauthorizedResponse();

  try {
    const code = await assignReferralCode(user.id);

    // All users referred by this code
    const referred = await prisma.user.findMany({
      where: { referredBy: code },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        role: true,
        weddings: {
          select: { id: true },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // "Converted" = referred user who has at least one wedding
    const convertedCount = referred.filter((u) => u.weddings.length > 0).length;
    const referralCount = referred.length;

    // History for display
    const history = referred.map((u) => ({
      id: u.id,
      name: u.name ?? u.email,
      createdAt: u.createdAt.toISOString(),
      converted: u.weddings.length > 0,
    }));

    // Commission rate (planners only — from WeddingPlanner profile)
    let commissionRate: number | null = null;
    if (user.role === "PLANNER" || user.role === "ADMIN") {
      const planner = await prisma.weddingPlanner.findUnique({
        where: { userId: user.id },
        select: { commissionRate: true },
      });
      commissionRate = planner?.commissionRate ?? null;
    }

    return NextResponse.json({
      referralCode: code,
      referralCount,
      convertedCount,
      history,
      commissionRate,
    });
  } catch {
    return errorResponse();
  }
}
