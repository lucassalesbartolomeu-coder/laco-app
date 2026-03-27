import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getAuthenticatedUser,
  verifyWeddingOwnership,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  errorResponse,
  validationError,
} from "@/lib/api-helpers";

type Params = { params: Promise<{ id: string; giftId: string }> };

// GET /api/weddings/[id]/gifts/[giftId]
export async function GET(_request: Request, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id, giftId } = await params;
    const { error } = await verifyWeddingOwnership(id, user.id);
    if (error === "not_found") return notFoundResponse("Casamento");
    if (error === "forbidden") return forbiddenResponse();

    const gift = await prisma.gift.findFirst({
      where: { id: giftId, weddingId: id },
    });
    if (!gift) return notFoundResponse("Presente");

    return NextResponse.json(gift);
  } catch (error) {
    console.error("GET /api/weddings/[id]/gifts/[giftId] error:", error);
    return errorResponse();
  }
}

// PUT /api/weddings/[id]/gifts/[giftId]
export async function PUT(request: Request, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id, giftId } = await params;
    const { error } = await verifyWeddingOwnership(id, user.id);
    if (error === "not_found") return notFoundResponse("Casamento");
    if (error === "forbidden") return forbiddenResponse();

    const existing = await prisma.gift.findFirst({
      where: { id: giftId, weddingId: id },
    });
    if (!existing) return notFoundResponse("Presente");

    const body = await request.json();

    if (!body.name) {
      return validationError("name é obrigatório");
    }

    const gift = await prisma.gift.update({
      where: { id: giftId },
      data: {
        name: body.name,
        description: body.description,
        price: body.price !== undefined ? Number(body.price) : undefined,
        url: body.url,
        store: body.store,
        status: body.status,
        reservedBy: body.reservedBy,
        reservedAt: body.reservedAt ? new Date(body.reservedAt) : undefined,
      },
    });

    return NextResponse.json(gift);
  } catch (error) {
    console.error("PUT /api/weddings/[id]/gifts/[giftId] error:", error);
    return errorResponse();
  }
}

// DELETE /api/weddings/[id]/gifts/[giftId]
export async function DELETE(_request: Request, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id, giftId } = await params;
    const { error } = await verifyWeddingOwnership(id, user.id);
    if (error === "not_found") return notFoundResponse("Casamento");
    if (error === "forbidden") return forbiddenResponse();

    const existing = await prisma.gift.findFirst({
      where: { id: giftId, weddingId: id },
    });
    if (!existing) return notFoundResponse("Presente");

    await prisma.gift.delete({ where: { id: giftId } });

    return NextResponse.json({ message: "Presente deletado" });
  } catch (error) {
    console.error("DELETE /api/weddings/[id]/gifts/[giftId] error:", error);
    return errorResponse();
  }
}
