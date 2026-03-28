import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, unauthorizedResponse, notFoundResponse, errorResponse } from "@/lib/api-helpers";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        name: true,
        email: true,
        role: true,
        createdAt: true,
        referralCode: true,
      },
    });

    if (!profile) return notFoundResponse("Usuário");

    return NextResponse.json(profile);
  } catch (error) {
    console.error("GET /api/profile error:", error);
    return errorResponse();
  }
}
