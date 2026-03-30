import { NextRequest, NextResponse } from "next/server";
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
import * as Sentry from "@sentry/nextjs";

type Params = { params: Promise<{ id: string }> };

// GET /api/weddings/[id]/timeline — Lista todos os eventos ordenados por order, depois time
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const { error } = await verifyWeddingOwnership(id, user.id);
    if (error === "not_found") return notFoundResponse("Casamento");
    if (error === "forbidden") return forbiddenResponse();

    const events = await prisma.timelineEvent.findMany({
      where: { weddingId: id },
      orderBy: [{ order: "asc" }, { time: "asc" }],
    });

    return NextResponse.json(events);
  } catch (error) {
    Sentry.captureException(error);
    return errorResponse();
  }
}

// POST /api/weddings/[id]/timeline — Cria novo evento
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const { error } = await verifyWeddingOwnership(id, user.id);
    if (error === "not_found") return notFoundResponse("Casamento");
    if (error === "forbidden") return forbiddenResponse();

    const body = await request.json();
    const { time, title, description, responsible, category, order } = body;

    if (!time || !title) {
      return validationError("Campos obrigatórios: time, title");
    }

    // Calcula order se não fornecido
    let eventOrder = order ?? 0;
    if (order === undefined || order === null) {
      const last = await prisma.timelineEvent.findFirst({
        where: { weddingId: id },
        orderBy: { order: "desc" },
        select: { order: true },
      });
      eventOrder = (last?.order ?? -1) + 1;
    }

    const event = await prisma.timelineEvent.create({
      data: {
        weddingId: id,
        time,
        title,
        description: description ?? null,
        responsible: responsible ?? null,
        category: category ?? "cerimonia",
        order: eventOrder,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    Sentry.captureException(error);
    return errorResponse();
  }
}
