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

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const wedding = await verifyWeddingOwnership(id, user.id);
    if (!wedding) return forbiddenResponse();

    const quotes = await prisma.quote.findMany({
      where: { weddingId: id },
      include: { vendor: { select: { id: true, name: true, category: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(quotes);
  } catch (error) {
    console.error("GET /api/weddings/[id]/quotes error:", error);
    return errorResponse();
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const wedding = await verifyWeddingOwnership(id, user.id);
    if (!wedding) return forbiddenResponse();

    const body = await request.json();
    if (!body.vendorId || body.totalValue === undefined) {
      return validationError("vendorId e totalValue são obrigatórios");
    }

    // Ensure vendor belongs to this wedding
    const vendor = await prisma.vendor.findFirst({
      where: { id: body.vendorId, weddingId: id },
    });
    if (!vendor) return notFoundResponse("Fornecedor");

    const quote = await prisma.quote.create({
      data: {
        vendorId: body.vendorId,
        weddingId: id,
        totalValue: Number(body.totalValue),
        items: body.items ?? [],
        status: body.status ?? "pendente",
        paymentTerms: body.paymentTerms ?? null,
        installments: body.installments ? Number(body.installments) : null,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        notes: body.notes ?? null,
        rawOcrText: body.rawOcrText ?? null,
      },
      include: { vendor: { select: { id: true, name: true, category: true } } },
    });

    return NextResponse.json(quote, { status: 201 });
  } catch (error) {
    console.error("POST /api/weddings/[id]/quotes error:", error);
    return errorResponse();
  }
}
