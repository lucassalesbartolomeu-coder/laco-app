import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/api-helpers";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const contract = await prisma.contract.findUnique({
      where: { id: params.id },
      include: { wedding: { select: { userId: true } } },
    });

    if (!contract) {
      return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 });
    }

    if (contract.signedByCouple) {
      return NextResponse.json({ error: "Contrato já assinado" }, { status: 400 });
    }

    const body = await req.json();
    const { name } = body;
    if (!name?.trim()) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
    }

    const updated = await prisma.contract.update({
      where: { id: params.id },
      data: {
        signedByCouple: true,
        coupleName: name.trim(),
        coupleSignedAt: new Date(),
      },
    });

    return NextResponse.json(updated);
  } catch {
    return errorResponse();
  }
}
