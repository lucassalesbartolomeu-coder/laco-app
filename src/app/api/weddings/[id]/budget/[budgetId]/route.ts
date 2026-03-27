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

type Params = { params: Promise<{ id: string; budgetId: string }> };

// GET /api/weddings/[id]/budget/[budgetId]
export async function GET(_request: Request, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id, budgetId } = await params;
    const { error } = await verifyWeddingOwnership(id, user.id);
    if (error === "not_found") return notFoundResponse("Casamento");
    if (error === "forbidden") return forbiddenResponse();

    const item = await prisma.budgetItem.findFirst({
      where: { id: budgetId, weddingId: id },
    });
    if (!item) return notFoundResponse("Item de orçamento");

    return NextResponse.json(item);
  } catch (error) {
    console.error("GET /api/weddings/[id]/budget/[budgetId] error:", error);
    return errorResponse();
  }
}

// PUT /api/weddings/[id]/budget/[budgetId]
export async function PUT(request: Request, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id, budgetId } = await params;
    const { error } = await verifyWeddingOwnership(id, user.id);
    if (error === "not_found") return notFoundResponse("Casamento");
    if (error === "forbidden") return forbiddenResponse();

    const existing = await prisma.budgetItem.findFirst({
      where: { id: budgetId, weddingId: id },
    });
    if (!existing) return notFoundResponse("Item de orçamento");

    const body = await request.json();

    const item = await prisma.budgetItem.update({
      where: { id: budgetId },
      data: {
        category: body.category,
        description: body.description,
        estimatedCost: body.estimatedCost !== undefined ? Number(body.estimatedCost) : undefined,
        actualCost: body.actualCost !== undefined ? Number(body.actualCost) : undefined,
        paidAmount: body.paidAmount !== undefined ? Number(body.paidAmount) : undefined,
        paidBy: body.paidBy,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        status: body.status,
        notes: body.notes,
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error("PUT /api/weddings/[id]/budget/[budgetId] error:", error);
    return errorResponse();
  }
}

// DELETE /api/weddings/[id]/budget/[budgetId]
export async function DELETE(_request: Request, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id, budgetId } = await params;
    const { error } = await verifyWeddingOwnership(id, user.id);
    if (error === "not_found") return notFoundResponse("Casamento");
    if (error === "forbidden") return forbiddenResponse();

    const existing = await prisma.budgetItem.findFirst({
      where: { id: budgetId, weddingId: id },
    });
    if (!existing) return notFoundResponse("Item de orçamento");

    await prisma.budgetItem.delete({ where: { id: budgetId } });

    return NextResponse.json({ message: "Item de orçamento deletado" });
  } catch (error) {
    console.error("DELETE /api/weddings/[id]/budget/[budgetId] error:", error);
    return errorResponse();
  }
}
