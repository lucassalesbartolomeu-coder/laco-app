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

// POST /api/weddings/[id]/guests/bulk — Importação em massa de convidados
export async function POST(request: Request, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const { error } = await verifyWeddingOwnership(id, user.id);
    if (error === "not_found") return notFoundResponse("Casamento");
    if (error === "forbidden") return forbiddenResponse();

    const body = await request.json();

    if (!body.guests || !Array.isArray(body.guests) || body.guests.length === 0) {
      return validationError("guests deve ser um array com pelo menos 1 item");
    }

    // Validate that every guest has a name
    for (let i = 0; i < body.guests.length; i++) {
      if (!body.guests[i].name) {
        return validationError(`guest[${i}].name é obrigatório`);
      }
    }

    const data = body.guests.map(
      (g: {
        name: string;
        phone?: string;
        email?: string;
        city?: string;
        state?: string;
        ddd?: string;
        category?: string;
        guestList?: string;
        rsvpStatus?: string;
      }) => ({
        weddingId: id,
        name: g.name,
        phone: g.phone ?? null,
        email: g.email ?? null,
        city: g.city ?? null,
        state: g.state ?? null,
        ddd: g.ddd ?? null,
        category: g.category ?? null,
        guestList: g.guestList ?? body.guestList ?? "A",
        rsvpStatus: g.rsvpStatus ?? "pendente",
      }),
    );

    const result = await prisma.guest.createMany({ data });

    return NextResponse.json({ imported: result.count }, { status: 201 });
  } catch (err) {
    console.error("POST /api/weddings/[id]/guests/bulk error:", err);
    return errorResponse();
  }
}
