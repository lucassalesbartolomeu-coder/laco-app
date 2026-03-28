import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";

type Params = { params: Promise<{ token: string }> };

// GET — Valida o token e retorna info do casamento (para mostrar na tela de convite)
export async function GET(_request: Request, { params }: Params) {
  try {
    const { token } = await params;

    const wedding = await prisma.wedding.findUnique({
      where: { partnerInviteToken: token },
      select: {
        id: true,
        partnerName1: true,
        partnerName2: true,
        weddingDate: true,
        city: true,
        partnerUserId: true,
      },
    });

    if (!wedding) {
      return NextResponse.json({ error: "Convite inválido ou expirado" }, { status: 404 });
    }

    if (wedding.partnerUserId) {
      return NextResponse.json({ error: "Este convite já foi utilizado" }, { status: 409 });
    }

    return NextResponse.json({
      weddingId: wedding.id,
      couple: `${wedding.partnerName1} & ${wedding.partnerName2}`,
      weddingDate: wedding.weddingDate,
      city: wedding.city,
    });
  } catch (error) {
    console.error("GET /api/weddings/invite/[token] error:", error);
    return errorResponse();
  }
}

// POST — Aceita o convite e vincula o usuário como parceiro
export async function POST(_request: Request, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { token } = await params;

    const wedding = await prisma.wedding.findUnique({
      where: { partnerInviteToken: token },
    });

    if (!wedding) {
      return NextResponse.json({ error: "Convite inválido ou expirado" }, { status: 404 });
    }

    if (wedding.partnerUserId) {
      // Already linked — check if it's the same user
      if (wedding.partnerUserId === user.id) {
        return NextResponse.json({ weddingId: wedding.id, alreadyLinked: true });
      }
      return NextResponse.json({ error: "Este convite já foi utilizado" }, { status: 409 });
    }

    if (wedding.userId === user.id) {
      return NextResponse.json(
        { error: "Você já é o dono deste casamento" },
        { status: 400 }
      );
    }

    // Link partner
    const updated = await prisma.wedding.update({
      where: { id: wedding.id },
      data: {
        partnerUserId: user.id,
        // Keep token so owner can see it's been accepted, but it's now "used"
      },
      select: { id: true, partnerName1: true, partnerName2: true },
    });

    return NextResponse.json({
      weddingId: updated.id,
      couple: `${updated.partnerName1} & ${updated.partnerName2}`,
      message: "Você foi vinculado ao casamento com sucesso!",
    });
  } catch (error) {
    console.error("POST /api/weddings/invite/[token] error:", error);
    return errorResponse();
  }
}
