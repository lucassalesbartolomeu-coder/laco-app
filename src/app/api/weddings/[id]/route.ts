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

type Params = { params: Promise<{ id: string }> };

// GET /api/weddings/[id] — Retorna um casamento com relações
export async function GET(_request: Request, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const { error } = await verifyWeddingOwnership(id, user.id);
    if (error === "not_found") return notFoundResponse("Casamento");
    if (error === "forbidden") return forbiddenResponse();

    const wedding = await prisma.wedding.findUnique({
      where: { id },
      include: {
        guests: { orderBy: { name: "asc" } },
        vendors: { orderBy: { name: "asc" } },
        budgetItems: { orderBy: { category: "asc" } },
      },
    });

    return NextResponse.json(wedding);
  } catch (error) {
    console.error("GET /api/weddings/[id] error:", error);
    return errorResponse();
  }
}

// PUT /api/weddings/[id] — Atualiza um casamento
export async function PUT(request: Request, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const { error } = await verifyWeddingOwnership(id, user.id);
    if (error === "not_found") return notFoundResponse("Casamento");
    if (error === "forbidden") return forbiddenResponse();

    const body = await request.json();

    if (!body.partnerName1 || !body.partnerName2) {
      return validationError("partnerName1 e partnerName2 são obrigatórios");
    }

    const wedding = await prisma.wedding.update({
      where: { id },
      data: {
        partnerName1: body.partnerName1,
        partnerName2: body.partnerName2,
        weddingDate: body.weddingDate ? new Date(body.weddingDate) : null,
        venue: body.venue,
        city: body.city,
        state: body.state,
        style: body.style,
        estimatedGuests: body.estimatedGuests ? Number(body.estimatedGuests) : null,
        estimatedBudget: body.estimatedBudget ? Number(body.estimatedBudget) : null,
      },
    });

    return NextResponse.json(wedding);
  } catch (error) {
    console.error("PUT /api/weddings/[id] error:", error);
    return errorResponse();
  }
}

// DELETE /api/weddings/[id] — Deleta um casamento (somente owner)
export async function DELETE(_request: Request, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const { error, role } = await verifyWeddingOwnership(id, user.id);
    if (error === "not_found") return notFoundResponse("Casamento");
    if (error === "forbidden") return forbiddenResponse();
    if (role !== "owner") return forbiddenResponse();

    await prisma.wedding.delete({ where: { id } });

    return NextResponse.json({ message: "Casamento deletado" });
  } catch (error) {
    console.error("DELETE /api/weddings/[id] error:", error);
    return errorResponse();
  }
}
