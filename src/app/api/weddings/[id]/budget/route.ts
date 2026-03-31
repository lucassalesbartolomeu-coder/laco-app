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

// GET /api/weddings/[id]/budget — Lista itens do orçamento (com filtros)
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const { error } = await verifyWeddingOwnership(id, user.id);
    if (error === "not_found") return notFoundResponse("Casamento");
    if (error === "forbidden") return forbiddenResponse();

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const status = searchParams.get("status");

    const where: Record<string, unknown> = { weddingId: id };
    if (category) where.category = category;
    if (status) where.status = status;

    const items = await prisma.budgetItem.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        eventId: true,
        category: true,
        description: true,
        estimatedCost: true,
        actualCost: true,
        paidAmount: true,
        paidBy: true,
        dueDate: true,
        status: true,
        notes: true,
        createdAt: true,
      },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("GET /api/weddings/[id]/budget error:", error);
    return errorResponse();
  }
}

// POST /api/weddings/[id]/budget — Cria um item de orçamento
export async function POST(request: Request, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const { error } = await verifyWeddingOwnership(id, user.id);
    if (error === "not_found") return notFoundResponse("Casamento");
    if (error === "forbidden") return forbiddenResponse();

    const body = await request.json();

    if (!body.category || !body.description || body.estimatedCost === undefined) {
      return validationError("category, description e estimatedCost são obrigatórios");
    }

    const item = await prisma.budgetItem.create({
      data: {
        weddingId: id,
        eventId: body.eventId || null,
        category: body.category,
        description: body.description,
        estimatedCost: Number(body.estimatedCost),
        actualCost: body.actualCost !== undefined ? Number(body.actualCost) : null,
        paidAmount: body.paidAmount ? Number(body.paidAmount) : 0,
        paidBy: body.paidBy,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        status: body.status || "pendente",
        notes: body.notes,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("POST /api/weddings/[id]/budget error:", error);
    return errorResponse();
  }
}
