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

// GET /api/weddings/[id]/budget/summary — Resumo do orçamento
export async function GET(_request: Request, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const { error } = await verifyWeddingOwnership(id, user.id);
    if (error === "not_found") return notFoundResponse("Casamento");
    if (error === "forbidden") return forbiddenResponse();

    const items = await prisma.budgetItem.findMany({
      where: { weddingId: id },
    });

    const totalEstimated = items.reduce((sum, item) => sum + item.estimatedCost, 0);
    const totalActual = items.reduce((sum, item) => sum + (item.actualCost || 0), 0);
    const totalPaid = items.reduce((sum, item) => sum + item.paidAmount, 0);
    const totalPending = totalActual - totalPaid;

    const categoryMap = new Map<string, { estimated: number; actual: number; paid: number }>();
    for (const item of items) {
      const existing = categoryMap.get(item.category) || { estimated: 0, actual: 0, paid: 0 };
      existing.estimated += item.estimatedCost;
      existing.actual += item.actualCost || 0;
      existing.paid += item.paidAmount;
      categoryMap.set(item.category, existing);
    }

    const byCategory = Array.from(categoryMap.entries()).map(([category, totals]) => ({
      category,
      totalEstimated: totals.estimated,
      totalActual: totals.actual,
      totalPaid: totals.paid,
      totalPending: totals.actual - totals.paid,
    }));

    return NextResponse.json({
      totalEstimated,
      totalActual,
      totalPaid,
      totalPending,
      byCategory,
    });
  } catch (error) {
    console.error("GET /api/weddings/[id]/budget/summary error:", error);
    return errorResponse();
  }
}
