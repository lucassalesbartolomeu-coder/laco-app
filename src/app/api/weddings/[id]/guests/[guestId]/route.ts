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

type Params = { params: Promise<{ id: string; guestId: string }> };

// GET /api/weddings/[id]/guests/[guestId]
export async function GET(_request: Request, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id, guestId } = await params;
    const { error } = await verifyWeddingOwnership(id, user.id);
    if (error === "not_found") return notFoundResponse("Casamento");
    if (error === "forbidden") return forbiddenResponse();

    const guest = await prisma.guest.findFirst({
      where: { id: guestId, weddingId: id },
    });
    if (!guest) return notFoundResponse("Convidado");

    return NextResponse.json(guest);
  } catch (error) {
    console.error("GET /api/weddings/[id]/guests/[guestId] error:", error);
    return errorResponse();
  }
}

// PUT /api/weddings/[id]/guests/[guestId]
export async function PUT(request: Request, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id, guestId } = await params;
    const { error } = await verifyWeddingOwnership(id, user.id);
    if (error === "not_found") return notFoundResponse("Casamento");
    if (error === "forbidden") return forbiddenResponse();

    const existing = await prisma.guest.findFirst({
      where: { id: guestId, weddingId: id },
    });
    if (!existing) return notFoundResponse("Convidado");

    const body = await request.json();

    if (!body.name) {
      return validationError("name é obrigatório");
    }

    const guest = await prisma.guest.update({
      where: { id: guestId },
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        city: body.city,
        state: body.state,
        ddd: body.ddd,
        category: body.category,
        rsvpStatus: body.rsvpStatus || body.status,
        plusOne: body.plusOne,
        dietaryRestriction: body.dietaryRestriction,
        accommodation: body.accommodation,
        needsTransport: body.needsTransport,
        notes: body.notes,
      },
    });

    return NextResponse.json(guest);
  } catch (error) {
    console.error("PUT /api/weddings/[id]/guests/[guestId] error:", error);
    return errorResponse();
  }
}

// DELETE /api/weddings/[id]/guests/[guestId]
export async function DELETE(_request: Request, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id, guestId } = await params;
    const { error } = await verifyWeddingOwnership(id, user.id);
    if (error === "not_found") return notFoundResponse("Casamento");
    if (error === "forbidden") return forbiddenResponse();

    const existing = await prisma.guest.findFirst({
      where: { id: guestId, weddingId: id },
    });
    if (!existing) return notFoundResponse("Convidado");

    await prisma.guest.delete({ where: { id: guestId } });

    return NextResponse.json({ message: "Convidado deletado" });
  } catch (error) {
    console.error("DELETE /api/weddings/[id]/guests/[guestId] error:", error);
    return errorResponse();
  }
}
