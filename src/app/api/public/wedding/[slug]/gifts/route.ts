import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { slug } = await params;

  const wedding = await prisma.wedding.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!wedding) {
    return NextResponse.json({ error: "Casamento nao encontrado" }, { status: 404 });
  }

  const gifts = await prisma.gift.findMany({
    where: { weddingId: wedding.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      url: true,
      store: true,
      status: true,
      reservedBy: true,
    },
  });

  return NextResponse.json(gifts);
}
