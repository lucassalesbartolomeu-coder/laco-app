import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getAuthenticatedUser,
  verifyWeddingOwnership,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  errorResponse,
} from "@/lib/api-helpers";

type Params = { params: Promise<{ id: string }> };

export interface ActivityItem {
  type: "gift" | "rsvp";
  message: string;
  time: string; // ISO date string
  icon: string;
}

// GET /api/weddings/[id]/activity — últimas 10 atividades do casamento
export async function GET(_req: Request, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const { error } = await verifyWeddingOwnership(id, user.id);
    if (error === "not_found") return notFoundResponse("Casamento");
    if (error === "forbidden") return forbiddenResponse();

    // Buscar últimas 5 reservas/presentes
    const recentGifts = await prisma.gift.findMany({
      where: {
        weddingId: id,
        OR: [{ isGifted: true }, { reservedBy: { not: null } }],
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        reservedBy: true,
        giftedBy: true,
        updatedAt: true,
      },
    });

    // Buscar últimas 5 confirmações de RSVP
    const recentRsvp = await prisma.guest.findMany({
      where: {
        weddingId: id,
        rsvpStatus: "confirmado",
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        updatedAt: true,
      },
    });

    // Montar array unificado
    const activities: ActivityItem[] = [
      ...recentGifts.map((g) => {
        const who = g.giftedBy ?? g.reservedBy ?? "Alguém";
        return {
          type: "gift" as const,
          message: `💝 ${who} reservou ${g.name}`,
          time: g.updatedAt.toISOString(),
          icon: "💝",
        };
      }),
      ...recentRsvp.map((g) => ({
        type: "rsvp" as const,
        message: `✅ ${g.name} confirmou presença`,
        time: g.updatedAt.toISOString(),
        icon: "✅",
      })),
    ];

    // Ordenar por data mais recente primeiro e limitar a 10
    activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    const top10 = activities.slice(0, 10);

    return NextResponse.json(top10);
  } catch (error) {
    console.error("GET /api/weddings/[id]/activity error:", error);
    return errorResponse();
  }
}
