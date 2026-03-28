import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import {
  getAuthenticatedUser,
  verifyWeddingOwnership,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  errorResponse,
} from "@/lib/api-helpers";

type Params = { params: Promise<{ id: string }> };

// POST /api/weddings/[id]/partner — Gera token de convite para o parceiro
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

    // Generate a secure random token
    const token = randomBytes(24).toString("hex");

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
