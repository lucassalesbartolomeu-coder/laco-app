import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const { slug } = await params;

    const wedding = await prisma.wedding.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!wedding) {
      return NextResponse.json({ error: "Casamento não encontrado" }, { status: 404 });
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
  } catch (error) {
    console.error("GET /api/public/wedding/[slug]/gifts error:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
