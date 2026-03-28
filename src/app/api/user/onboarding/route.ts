import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";

// GET — retorna o onboardingStep atual
export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { onboardingStep: true, role: true },
    });

    return NextResponse.json(dbUser ?? { onboardingStep: 0, role: "COUPLE" });
  } catch (error) {
    console.error("GET /api/user/onboarding error:", error);
    return errorResponse();
  }
}

// PATCH — atualiza o passo do onboarding
export async function PATCH(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const body = await request.json();
    const step = Number(body.step ?? 0);

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { onboardingStep: step },
      select: { onboardingStep: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/user/onboarding error:", error);
    return errorResponse();
  }
}
