import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getAuthenticatedUser,
  unauthorizedResponse,
  errorResponse,
  validationError,
} from "@/lib/api-helpers";

// GET /api/weddings — Lista todos os casamentos do usuário
export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const weddings = await prisma.wedding.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(weddings);
  } catch (error) {
    console.error("GET /api/weddings error:", error);
    return errorResponse();
  }
}

// POST /api/weddings — Cria um novo casamento
export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const body = await request.json();

    if (!body.partnerName1 || !body.partnerName2) {
      return validationError("partnerName1 e partnerName2 são obrigatórios");
    }

    // Generate slug from partner names
    const baseSlug = `${body.partnerName1}-e-${body.partnerName2}`
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    // Ensure unique slug
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.wedding.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const wedding = await prisma.wedding.create({
      data: {
        userId: user.id,
        slug,
        partnerName1: body.partnerName1,
        partnerName2: body.partnerName2,
        weddingDate: body.weddingDate ? new Date(body.weddingDate) : null,
        venue: body.venue,
        venueAddress: body.venueAddress,
        ceremonyVenue: body.ceremonyVenue,
        ceremonyAddress: body.ceremonyAddress,
        city: body.city,
        state: body.state,
        style: body.style,
        storyText: body.storyText,
        estimatedGuests: body.estimatedGuests ? Number(body.estimatedGuests) : null,
        estimatedBudget: body.estimatedBudget ? Number(body.estimatedBudget) : null,
      },
    });

    return NextResponse.json(wedding, { status: 201 });
  } catch (error) {
    console.error("POST /api/weddings error:", error);
    return errorResponse();
  }
}
