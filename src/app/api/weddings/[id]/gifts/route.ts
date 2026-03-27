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

type Params = { params: Promise<{ id: string }> };

// GET /api/weddings/[id]/gifts — Lista presentes (com filtro de status)
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const { error } = await verifyWeddingOwnership(id, user.id);
    if (error === "not_found") return notFoundResponse("Casamento");
    if (error === "forbidden") return forbiddenResponse();

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");

    const where: Record<string, unknown> = { weddingId: id };
    if (status) where.status = status;

    const gifts = await prisma.gift.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(gifts);
  } catch (error) {
    console.error("GET /api/weddings/[id]/gifts error:", error);
    return errorResponse();
  }
}

// POST /api/weddings/[id]/gifts — Cria um presente
export async function POST(request: Request, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const { error } = await verifyWeddingOwnership(id, user.id);
    if (error === "not_found") return notFoundResponse("Casamento");
    if (error === "forbidden") return forbiddenResponse();

    const body = await request.json();

    if (!body.name) {
      return validationError("name é obrigatório");
    }

    const gift = await prisma.gift.create({
      data: {
        weddingId: id,
        name: body.name,
        description: body.description,
        price: body.price ? Number(body.price) : null,
        url: body.url,
        store: body.store,
        status: body.status || "available",
        reservedBy: body.reservedBy,
        reservedAt: body.reservedAt ? new Date(body.reservedAt) : null,
      },
    });

    return NextResponse.json(gift, { status: 201 });
  } catch (error) {
    console.error("POST /api/weddings/[id]/gifts error:", error);
    return errorResponse();
  }
}
