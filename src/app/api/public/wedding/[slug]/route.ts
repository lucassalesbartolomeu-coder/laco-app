import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const { slug } = await params;

    const wedding = await prisma.wedding.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        partnerName1: true,
        partnerName2: true,
        weddingDate: true,
        venue: true,
        venueAddress: true,
        ceremonyVenue: true,
        ceremonyAddress: true,
        city: true,
        state: true,
        style: true,
        storyText: true,
        estimatedGuests: true,
        coverImage: true,
        message: true,
        theme: true,
        photos: {
          select: { id: true, url: true, caption: true, sortOrder: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!wedding) {
      return NextResponse.json({ error: "Casamento não encontrado" }, { status: 404 });
    }

    return NextResponse.json(wedding, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch (error) {
    console.error("GET /api/public/wedding/[slug] error:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
