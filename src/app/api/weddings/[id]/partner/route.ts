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

// Human-friendly 6-char code, no ambiguous chars (O/0, I/1)
function generateShortCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

type Params = { params: Promise<{ id: string }> };

// POST /api/weddings/[id]/partner — Gera código de convite para o parceiro
export async function POST(_request: Request, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const { error, wedding } = await verifyWeddingOwnership(id, user.id);
    if (error === "not_found") return notFoundResponse("Casamento");
    if (error === "forbidden") return forbiddenResponse();

    // Only the original owner can generate invite tokens
    if (wedding!.userId !== user.id) return forbiddenResponse();

    // Generate a short human-friendly code (6 chars)
    let token = generateShortCode();
    // Retry if collision (very unlikely)
    for (let i = 0; i < 5; i++) {
      const exists = await prisma.wedding.findUnique({ where: { partnerInviteToken: token } });
      if (!exists) break;
      token = generateShortCode();
    }

    const updated = await prisma.wedding.update({
      where: { id },
      data: { partnerInviteToken: token },
      select: { id: true, partnerInviteToken: true, partnerUserId: true },
    });

    return NextResponse.json({
      token: updated.partnerInviteToken,
      inviteUrl: `/parceiro/${updated.partnerInviteToken}`,
      alreadyLinked: !!wedding!.partnerUserId,
    });
  } catch (error) {
    console.error("POST /api/weddings/[id]/partner error:", error);
    return errorResponse();
  }
}

// DELETE /api/weddings/[id]/partner — Remove o parceiro vinculado
export async function DELETE(_request: Request, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const { error, wedding } = await verifyWeddingOwnership(id, user.id);
    if (error === "not_found") return notFoundResponse("Casamento");
    if (error === "forbidden") return forbiddenResponse();

    // Only the original owner can unlink partner
    if (wedding!.userId !== user.id) return forbiddenResponse();

    await prisma.wedding.update({
      where: { id },
      data: { partnerUserId: null, partnerInviteToken: null },
    });

    return NextResponse.json({ message: "Parceiro desvinculado" });
  } catch (error) {
    console.error("DELETE /api/weddings/[id]/partner error:", error);
    return errorResponse();
  }
}
