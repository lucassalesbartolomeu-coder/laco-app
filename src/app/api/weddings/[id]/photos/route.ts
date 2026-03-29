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

// GET /api/weddings/[id]/photos — Lista fotos do casamento
export async function GET(_request: Request, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const { error } = await verifyWeddingOwnership(id, user.id);
    if (error === "not_found") return notFoundResponse("Casamento");
    if (error === "forbidden") return forbiddenResponse();

    const photos = await prisma.photo.findMany({
      where: { weddingId: id },
      orderBy: { sortOrder: "asc" },
      select: { id: true, url: true, caption: true, sortOrder: true, createdAt: true },
    });

    return NextResponse.json(photos);
  } catch (error) {
    console.error("GET /api/weddings/[id]/photos error:", error);
    return errorResponse();
  }
}

// POST /api/weddings/[id]/photos — Adiciona uma ou mais fotos
export async function POST(request: Request, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const { error } = await verifyWeddingOwnership(id, user.id);
    if (error === "not_found") return notFoundResponse("Casamento");
    if (error === "forbidden") return forbiddenResponse();

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Body inválido" }, { status: 400 });
    }

    // Aceita { url, caption?, sortOrder? } ou array de fotos
    const items: { url: string; caption?: string; sortOrder?: number }[] = Array.isArray(body)
      ? body
      : [body];

    if (items.length === 0) {
      return NextResponse.json({ error: "Nenhuma foto fornecida" }, { status: 400 });
    }

    // Validação básica
    for (const item of items) {
      if (!item.url || typeof item.url !== "string") {
        return NextResponse.json({ error: "URL da foto é obrigatória" }, { status: 400 });
      }
    }

    // Determina sortOrder inicial baseado nas fotos existentes
    const existing = await prisma.photo.count({ where: { weddingId: id } });

    const created = await prisma.$transaction(
      items.map((item, idx) =>
        prisma.photo.create({
          data: {
            weddingId: id,
            url: item.url,
            caption: item.caption ?? null,
            sortOrder: item.sortOrder ?? existing + idx,
          },
          select: { id: true, url: true, caption: true, sortOrder: true, createdAt: true },
        })
      )
    );

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("POST /api/weddings/[id]/photos error:", error);
    return errorResponse();
  }
}

// PATCH /api/weddings/[id]/photos — Atualiza ordem/legenda de fotos
export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const { error } = await verifyWeddingOwnership(id, user.id);
    if (error === "not_found") return notFoundResponse("Casamento");
    if (error === "forbidden") return forbiddenResponse();

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Body inválido" }, { status: 400 });
    }

    // Aceita array de { id, caption?, sortOrder? }
    const items: { id: string; caption?: string | null; sortOrder?: number }[] = Array.isArray(body)
      ? body
      : [body];

    const updated = await prisma.$transaction(
      items.map((item) =>
        prisma.photo.update({
          where: { id: item.id },
          data: {
            ...(item.caption !== undefined ? { caption: item.caption } : {}),
            ...(item.sortOrder !== undefined ? { sortOrder: item.sortOrder } : {}),
          },
          select: { id: true, url: true, caption: true, sortOrder: true },
        })
      )
    );

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/weddings/[id]/photos error:", error);
    return errorResponse();
  }
}

// DELETE /api/weddings/[id]/photos — Remove uma foto (por query param ?photoId=)
export async function DELETE(request: Request, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const { error } = await verifyWeddingOwnership(id, user.id);
    if (error === "not_found") return notFoundResponse("Casamento");
    if (error === "forbidden") return forbiddenResponse();

    const url = new URL(request.url);
    const photoId = url.searchParams.get("photoId");

    if (!photoId) {
      return NextResponse.json({ error: "photoId é obrigatório" }, { status: 400 });
    }

    // Verifica que a foto pertence ao casamento
    const photo = await prisma.photo.findFirst({ where: { id: photoId, weddingId: id } });
    if (!photo) return notFoundResponse("Foto");

    await prisma.photo.delete({ where: { id: photoId } });

    return NextResponse.json({ message: "Foto removida com sucesso" });
  } catch (error) {
    console.error("DELETE /api/weddings/[id]/photos error:", error);
    return errorResponse();
  }
}
