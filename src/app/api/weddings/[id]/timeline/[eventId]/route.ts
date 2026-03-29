import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getAuthenticatedUser,
  verifyWeddingOwnership,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  errorResponse,
} from "@/lib/api-helpers";

type Params = { params: Promise<{ id: string; eventId: string }> };

// PATCH /api/weddings/[id]/timeline/[eventId] — Atualiza evento (status, título, etc.)
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id, eventId } = await params;
    const { error } = await verifyWeddingOwnership(id, user.id);
    if (error === "not_found") return notFoundResponse("Casamento");
    if (error === "forbidden") return forbiddenResponse();

    const existing = await prisma.timelineEvent.findFirst({
      where: { id: eventId, weddingId: id },
    });
    if (!existing) return notFoundResponse("Evento");

    const body = await request.json();
    const { time, title, description, responsible, status, category, order } = body;

    const updated = await prisma.timelineEvent.update({
      where: { id: eventId },
      data: {
        ...(time !== undefined && { time }),
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(responsible !== undefined && { responsible }),
        ...(status !== undefined && { status }),
        ...(category !== undefined && { category }),
        ...(order !== undefined && { order }),
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    return errorResponse(err);
  }
}

// DELETE /api/weddings/[id]/timeline/[eventId] — Remove evento
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id, eventId } = await params;
    const { error } = await verifyWeddingOwnership(id, user.id);
    if (error === "not_found") return notFoundResponse("Casamento");
    if (error === "forbidden") return forbiddenResponse();

    const existing = await prisma.timelineEvent.findFirst({
      where: { id: eventId, weddingId: id },
    });
    if (!existing) return notFoundResponse("Evento");

    await prisma.timelineEvent.delete({ where: { id: eventId } });

    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err);
  }
}
