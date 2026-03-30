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

// GET /api/weddings/[id]/vendors — Lista fornecedores (com filtros)
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

    const vendors = await prisma.vendor.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        category: true,
        phone: true,
        email: true,
        website: true,
        budget: true,
        status: true,
        notes: true,
        createdAt: true,
      },
    });

    return NextResponse.json(vendors);
  } catch (error) {
    console.error("GET /api/weddings/[id]/vendors error:", error);
    return errorResponse();
  }
}

// POST /api/weddings/[id]/vendors — Cria um fornecedor
export async function POST(request: Request, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const { error } = await verifyWeddingOwnership(id, user.id);
    if (error === "not_found") return notFoundResponse("Casamento");
    if (error === "forbidden") return forbiddenResponse();

    const body = await request.json();

    if (!body.name || !body.category) {
      return validationError("name e category são obrigatórios");
    }

    const vendor = await prisma.vendor.create({
      data: {
        weddingId: id,
        name: body.name,
        category: body.category,
        phone: body.phone,
        email: body.email,
        website: body.website,
        budget: body.budget ? Number(body.budget) : null,
        status: body.status || "cotado",
        notes: body.notes,
      },
    });

    return NextResponse.json(vendor, { status: 201 });
  } catch (error) {
    console.error("POST /api/weddings/[id]/vendors error:", error);
    return errorResponse();
  }
}
