import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ code: string }> };

// GET — preview couple info for a code (public, no auth)
export async function GET(_req: Request, { params }: Params) {
  try {
    const { code } = await params;
    const record = await prisma.plannerInviteCode.findUnique({
      where: { code: code.toUpperCase() },
      include: { wedding: { select: { partnerName1: true, partnerName2: true, weddingDate: true, city: true } } },
    });

    if (!record) return NextResponse.json({ valid: false, error: "Código não encontrado" }, { status: 404 });
    if (record.expiresAt < new Date()) return NextResponse.json({ valid: false, error: "Código expirado" }, { status: 410 });
    if (record.usedAt) return NextResponse.json({ valid: false, error: "Código já utilizado" }, { status: 409 });

    return NextResponse.json({
      valid: true,
      wedding: {
        partner1: record.wedding.partnerName1,
        partner2: record.wedding.partnerName2,
        date: record.wedding.weddingDate,
        city: record.wedding.city,
      },
    });
  } catch {
    return NextResponse.json({ valid: false, error: "Erro interno" }, { status: 500 });
  }
}
