import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (!body.name || !body.status) {
      return NextResponse.json(
        { error: "name e status são obrigatórios" },
        { status: 400 }
      );
    }

    const wedding = await prisma.wedding.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!wedding) {
      return NextResponse.json({ error: "Casamento não encontrado" }, { status: 404 });
    }

    // Find guest by name (case-insensitive partial match)
    const guest = await prisma.guest.findFirst({
      where: {
        weddingId: id,
        name: { contains: body.name, mode: "insensitive" },
      },
    });

    if (guest) {
      // Update existing guest
      const updated = await prisma.guest.update({
        where: { id: guest.id },
        data: {
          rsvpStatus: body.status,
          plusOne: body.plusOne ?? guest.plusOne,
          dietaryRestriction: body.dietaryRestriction ?? guest.dietaryRestriction,
          notes: body.companionName
            ? `Acompanhante: ${body.companionName}`
            : guest.notes,
        },
      });
      return NextResponse.json({ found: true, guest: updated });
    }

    // Create new guest if not found
    const newGuest = await prisma.guest.create({
      data: {
        weddingId: id,
        name: body.name,
        rsvpStatus: body.status,
        plusOne: body.plusOne ?? false,
        dietaryRestriction: body.dietaryRestriction,
        notes: body.companionName
          ? `Acompanhante: ${body.companionName}`
          : undefined,
      },
    });

    return NextResponse.json({ found: false, guest: newGuest }, { status: 201 });
  } catch (error) {
    console.error("POST /api/weddings/[id]/rsvp error:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
