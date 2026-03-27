import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ slug: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { slug } = await params;
  const { giftId, reservedBy } = await req.json();

  if (!giftId || !reservedBy) {
    return NextResponse.json({ error: "giftId e reservedBy obrigatorios" }, { status: 400 });
  }

  const wedding = await prisma.wedding.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!wedding) {
    return NextResponse.json({ error: "Casamento nao encontrado" }, { status: 404 });
  }

  const gift = await prisma.gift.findFirst({
    where: { id: giftId, weddingId: wedding.id },
  });

  if (!gift) {
    return NextResponse.json({ error: "Presente nao encontrado" }, { status: 404 });
  }

  if (gift.status !== "available") {
    return NextResponse.json({ error: "Presente ja reservado" }, { status: 409 });
  }

  const updated = await prisma.gift.update({
    where: { id: giftId },
    data: {
      status: "reserved",
      reservedBy,
      reservedAt: new Date(),
    },
  });

  return NextResponse.json(updated);
}
