/**
 * POST /api/user/link-planner
 *
 * Vincula a cerimonialista do casal pelo e-mail durante o onboarding.
 * Busca automaticamente o primeiro casamento do usuário autenticado.
 *
 * Body: { plannerEmail: string }
 *
 * Respostas:
 *   200 { linked: true, planner: { companyName } }  → vinculado com sucesso
 *   200 { linked: false, reason: "no_wedding" }      → casal ainda não criou casamento
 *   200 { linked: false, reason: "not_found" }       → cerimonialista não tem conta no Laço
 *   200 { linked: false, reason: "already_linked" }  → já vinculada
 */

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { plannerEmail } = await request.json();
    if (!plannerEmail?.trim()) {
      return NextResponse.json({ linked: false, reason: "no_email" });
    }

    // Busca o primeiro casamento do casal
    const wedding = await prisma.wedding.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
    });

    if (!wedding) {
      return NextResponse.json({ linked: false, reason: "no_wedding" });
    }

    // Busca a cerimonialista pelo e-mail
    const plannerUser = await prisma.user.findUnique({
      where: { email: plannerEmail.trim().toLowerCase() },
      include: { weddingPlanner: true },
    });

    if (!plannerUser?.weddingPlanner) {
      return NextResponse.json({ linked: false, reason: "not_found" });
    }

    // Verifica se já está vinculada
    const existing = await prisma.weddingPlannerAssignment.findUnique({
      where: {
        plannerId_weddingId: {
          plannerId: plannerUser.weddingPlanner.id,
          weddingId: wedding.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json({
        linked: true,
        alreadyLinked: true,
        planner: { companyName: plannerUser.weddingPlanner.companyName },
      });
    }

    // Cria o vínculo
    await prisma.weddingPlannerAssignment.create({
      data: {
        plannerId: plannerUser.weddingPlanner.id,
        weddingId: wedding.id,
        role: "principal",
        status: "ativo",
      },
    });

    return NextResponse.json({
      linked: true,
      planner: { companyName: plannerUser.weddingPlanner.companyName },
    });
  } catch (error) {
    console.error("POST /api/user/link-planner error:", error);
    return errorResponse();
  }
}
