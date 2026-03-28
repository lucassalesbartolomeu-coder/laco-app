import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";
import { assignReferralCode } from "@/lib/referral";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return unauthorizedResponse();

  try {
    const code = await assignReferralCode(user.id);
    const referralCount = await prisma.user.count({
      where: { referredBy: code },
    });

    return NextResponse.json({ referralCode: code, referralCount });
  } catch {
    return errorResponse();
  }
}
