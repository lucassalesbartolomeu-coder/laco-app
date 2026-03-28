import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: Params) {
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
      theme: true,
    },
  });

  if (!wedding) {
    return NextResponse.json({ error: "Casamento nao encontrado" }, { status: 404 });
  }

  return NextResponse.json(wedding);
}
