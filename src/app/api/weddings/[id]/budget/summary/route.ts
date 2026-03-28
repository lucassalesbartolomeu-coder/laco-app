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

    // Run totals aggregation and category groupBy in parallel — single round-trip each
    const [totals, byCategory] = await Promise.all([
      prisma.budgetItem.aggregate({
        where: { weddingId: id },
        _sum: {
          estimatedCost: true,
          actualCost: true,
          paidAmount: true,
        },
      }),
      prisma.budgetItem.groupBy({
        by: ["category"],
        where: { weddingId: id },
        _sum: {
          estimatedCost: true,
          actualCost: true,
          paidAmount: true,
        },
      }),
    ]);

    const totalEstimated = totals._sum.estimatedCost ?? 0;
    const totalActual = totals._sum.actualCost ?? 0;
    const totalPaid = totals._sum.paidAmount ?? 0;
    const totalPending = totalActual - totalPaid;

    return NextResponse.json({
      totalEstimated,
      totalActual,
      totalPaid,
      totalPending,
      byCategory: byCategory.map((c) => ({
        category: c.category,
        totalEstimated: c._sum.estimatedCost ?? 0,
        totalActual: c._sum.actualCost ?? 0,
        totalPaid: c._sum.paidAmount ?? 0,
        totalPending: (c._sum.actualCost ?? 0) - (c._sum.paidAmount ?? 0),
      })),
    });
  } catch (error) {
    console.error("GET /api/weddings/[id]/budget/summary error:", error);
    return errorResponse();
  }
}
