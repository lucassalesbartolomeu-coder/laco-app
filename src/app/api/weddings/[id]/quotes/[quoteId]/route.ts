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

type Params = { params: Promise<{ id: string; quoteId: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id, quoteId } = await params;
    const wedding = await verifyWeddingOwnership(id, user.id);
    if (!wedding) return forbiddenResponse();

    const quote = await prisma.quote.findFirst({
      where: { id: quoteId, weddingId: id },
      include: { vendor: { select: { id: true, name: true, category: true } } },
    });
    if (!quote) return notFoundResponse("Orçamento");

    return NextResponse.json(quote);
  } catch (error) {
    console.error("GET /api/weddings/[id]/quotes/[quoteId] error:", error);
    return errorResponse();
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id, quoteId } = await params;
    const wedding = await verifyWeddingOwnership(id, user.id);
    if (!wedding) return forbiddenResponse();

    const existing = await prisma.quote.findFirst({ where: { id: quoteId, weddingId: id } });
    if (!existing) return notFoundResponse("Orçamento");

    const body = await request.json();
    const quote = await prisma.quote.update({
      where: { id: quoteId },
      data: {
        totalValue: body.totalValue !== undefined ? Number(body.totalValue) : undefined,
        items: body.items ?? undefined,
        status: body.status ?? undefined,
        paymentTerms: body.paymentTerms ?? undefined,
        installments: body.installments !== undefined ? Number(body.installments) : undefined,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        notes: body.notes ?? undefined,
      },
      include: { vendor: { select: { id: true, name: true, category: true } } },
    });

    return NextResponse.json(quote);
  } catch (error) {
    console.error("PUT /api/weddings/[id]/quotes/[quoteId] error:", error);
    return errorResponse();
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id, quoteId } = await params;
    const wedding = await verifyWeddingOwnership(id, user.id);
    if (!wedding) return forbiddenResponse();

    const existing = await prisma.quote.findFirst({ where: { id: quoteId, weddingId: id } });
    if (!existing) return notFoundResponse("Orçamento");

    await prisma.quote.delete({ where: { id: quoteId } });
    return NextResponse.json({ message: "Orçamento deletado" });
  } catch (error) {
    console.error("DELETE /api/weddings/[id]/quotes/[quoteId] error:", error);
    return errorResponse();
  }
}
