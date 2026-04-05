import { NextResponse } from "next/server";
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

type Params = { params: Promise<{ id: string; vendorId: string }> };

// GET /api/weddings/[id]/vendors/[vendorId]
export async function GET(_request: Request, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id, vendorId } = await params;
    const { error } = await verifyWeddingOwnership(id, user.id);
    if (error === "not_found") return notFoundResponse("Casamento");
    if (error === "forbidden") return forbiddenResponse();

    const vendor = await prisma.vendor.findFirst({
      where: { id: vendorId, weddingId: id },
    });
    if (!vendor) return notFoundResponse("Fornecedor");

    return NextResponse.json(vendor);
  } catch (error) {
    Sentry.captureException(error);
    return errorResponse();
  }
}

// PUT /api/weddings/[id]/vendors/[vendorId]
export async function PUT(request: Request, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id, vendorId } = await params;
    const { error } = await verifyWeddingOwnership(id, user.id);
    if (error === "not_found") return notFoundResponse("Casamento");
    if (error === "forbidden") return forbiddenResponse();

    const existing = await prisma.vendor.findFirst({
      where: { id: vendorId, weddingId: id },
    });
    if (!existing) return notFoundResponse("Fornecedor");

    const body = await request.json();

    if (!body.name || !body.category) {
      return validationError("name e category são obrigatórios");
    }

    const vendor = await prisma.vendor.update({
      where: { id: vendorId },
      data: {
        name: body.name,
        category: body.category,
        phone: body.phone,
        email: body.email,
        website: body.website,
        budget: body.budget !== undefined ? Number(body.budget) : undefined,
        status: body.status,
        notes: body.notes,
      },
    });

    return NextResponse.json(vendor);
  } catch (error) {
    Sentry.captureException(error);
    return errorResponse();
  }
}

// DELETE /api/weddings/[id]/vendors/[vendorId]
export async function DELETE(_request: Request, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id, vendorId } = await params;
    const { error } = await verifyWeddingOwnership(id, user.id);
    if (error === "not_found") return notFoundResponse("Casamento");
    if (error === "forbidden") return forbiddenResponse();

    const existing = await prisma.vendor.findFirst({
      where: { id: vendorId, weddingId: id },
    });
    if (!existing) return notFoundResponse("Fornecedor");

    await prisma.vendor.delete({ where: { id: vendorId } });

    return NextResponse.json({ message: "Fornecedor deletado" });
  } catch (error) {
    Sentry.captureException(error);
    return errorResponse();
  }
}

// PATCH /api/weddings/[id]/vendors/[vendorId] — Atualiza campos parciais (ex: contractStatus)
export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id, vendorId } = await params;
    const { error } = await verifyWeddingOwnership(id, user.id);
    if (error === "not_found") return notFoundResponse("Casamento");
    if (error === "forbidden") return forbiddenResponse();

    const existing = await prisma.vendor.findFirst({
      where: { id: vendorId, weddingId: id },
    });
    if (!existing) return notFoundResponse("Fornecedor");

    const body = await request.json();

    const VALID_CONTRACT_STATUSES = ["NONE", "PENDING", "SIGNED"];
    if (body.contractStatus !== undefined && !VALID_CONTRACT_STATUSES.includes(body.contractStatus)) {
      return validationError("contractStatus inválido");
    }

    const vendor = await prisma.vendor.update({
      where: { id: vendorId },
      data: {
        ...(body.contractStatus !== undefined && { contractStatus: body.contractStatus }),
      },
    });

    return NextResponse.json(vendor);
  } catch (error) {
    Sentry.captureException(error);
    return errorResponse();
  }
}
