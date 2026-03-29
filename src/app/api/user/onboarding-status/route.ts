export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";

// GET /api/user/onboarding-status
// Retorna o status de cada passo do checklist de ativação do casal.
export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    // Busca o casamento mais recente do usuário
    const wedding = await prisma.wedding.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        partnerUserId: true,
        _count: {
          select: {
            guests: true,
            identityKits: true,
          },
        },
      },
    });

    const hasWedding = !!wedding;
    const guestCount = wedding?._count.guests ?? 0;
    const hasIdentityKit = (wedding?._count.identityKits ?? 0) > 0;
    // siteSharedAt não existe no schema — usamos partnerUserId como proxy para "site compartilhado"
    // Na ausência de um campo dedicado, retornamos false por padrão
    const hasSiteShared = false;

    // Calcula passos concluídos:
    // 1. Criar casamento
    // 2. Adicionar 10+ convidados
    // 3. Gerar Identity Kit
    // 4. Compartilhar site
    // 5. Convidar parceiro(a)
    const steps = [
      hasWedding,
      guestCount >= 10,
      hasIdentityKit,
      hasSiteShared,
      !!wedding?.partnerUserId,
    ];
    const completedSteps = steps.filter(Boolean).length;

    return NextResponse.json({
      hasWedding,
      guestCount,
      hasIdentityKit,
      hasSiteShared,
      hasPartner: !!wedding?.partnerUserId,
      completedSteps,
      weddingId: wedding?.id ?? null,
    });
  } catch (error) {
    console.error("GET /api/user/onboarding-status error:", error);
    return errorResponse();
  }
}
