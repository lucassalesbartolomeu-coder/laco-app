import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const contract = await prisma.contract.findUnique({
    where: { id: params.id },
    include: {
      wedding: { select: { partnerName1: true, partnerName2: true, weddingDate: true } },
      planner: { select: { companyName: true, phone: true } },
    },
  });

  if (!contract) {
    return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 });
  }

  return NextResponse.json(contract);
}
