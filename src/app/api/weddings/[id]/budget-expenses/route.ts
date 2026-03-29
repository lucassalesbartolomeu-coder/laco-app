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

// GET /api/weddings/[id]/budget-expenses — Lista gastos + total gasto
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const { error } = await verifyWeddingOwnership(id, user.id);
    if (error === "not_found") return notFoundResponse("Casamento");
    if (error === "forbidden") return forbiddenResponse();

    const [expenses, aggregate] = await Promise.all([
      prisma.budgetExpense.findMany({
        where: { weddingId: id },
        orderBy: { date: "desc" },
      }),
      prisma.budgetExpense.aggregate({
        where: { weddingId: id },
        _sum: { amount: true },
      }),
    ]);

    return NextResponse.json({
      expenses,
      totalSpent: aggregate._sum.amount ?? 0,
    });
  } catch (err) {
    console.error("GET /api/weddings/[id]/budget-expenses error:", err);
    return errorResponse();
  }
}

// POST /api/weddings/[id]/budget-expenses — Registra um novo gasto
export async function POST(request: Request, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const { error } = await verifyWeddingOwnership(id, user.id);
    if (error === "not_found") return notFoundResponse("Casamento");
    if (error === "forbidden") return forbiddenResponse();

    const body = await request.json().catch(() => null);
    if (!body) return validationError("Body inválido");

    if (!body.description || body.amount === undefined) {
      return validationError("description e amount são obrigatórios");
    }

    const expense = await prisma.budgetExpense.create({
      data: {
        weddingId: id,
        description: String(body.description),
        amount: Number(body.amount),
        date: body.date ? new Date(body.date) : new Date(),
        method: body.method || "pix",
        status: body.status || "pago",
        category: body.category || null,
        notes: body.notes || null,
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (err) {
    console.error("POST /api/weddings/[id]/budget-expenses error:", err);
    return errorResponse();
  }
}
