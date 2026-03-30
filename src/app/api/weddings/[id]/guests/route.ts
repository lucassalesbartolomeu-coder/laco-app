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

// GET /api/weddings/[id]/guests — Lista convidados (com filtros)
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
    const guestList = searchParams.get("guestList");

    const where: Record<string, unknown> = { weddingId: id };
    if (category) where.category = category;
    if (status) where.rsvpStatus = status;
    if (guestList) where.guestList = guestList;

    const guests = await prisma.guest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        state: true,
        ddd: true,
        category: true,
        guestList: true,
        rsvpStatus: true,
        plusOne: true,
        dietaryRestriction: true,
        accommodation: true,
        needsTransport: true,
        notes: true,
        createdAt: true,
      },
    });

    return NextResponse.json(guests);
  } catch (error) {
    console.error("GET /api/weddings/[id]/guests error:", error);
    return errorResponse();
  }
}

// POST /api/weddings/[id]/guests — Cria um convidado
export async function POST(request: Request, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const { error } = await verifyWeddingOwnership(id, user.id);
    if (error === "not_found") return notFoundResponse("Casamento");
    if (error === "forbidden") return forbiddenResponse();

    const body = await request.json();

    if (!body.name) {
      return validationError("name é obrigatório");
    }

    const guest = await prisma.guest.create({
      data: {
        weddingId: id,
        name: body.name,
        email: body.email,
        phone: body.phone,
        city: body.city,
        state: body.state,
        ddd: body.ddd,
        category: body.category,
        guestList: body.guestList || "A",
        rsvpStatus: body.rsvpStatus || body.status || "pendente",
        plusOne: body.plusOne ?? false,
        dietaryRestriction: body.dietaryRestriction,
        accommodation: body.accommodation ?? false,
        needsTransport: body.needsTransport ?? false,
        notes: body.notes,
      },
    });

    return NextResponse.json(guest, { status: 201 });
  } catch (error) {
    console.error("POST /api/weddings/[id]/guests error:", error);
    return errorResponse();
  }
}
