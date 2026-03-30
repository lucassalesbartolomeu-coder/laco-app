import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";

// POST { code } — planner accepts an invite code and gets linked to the wedding
export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { code } = await request.json();
    if (!code?.trim()) {
      return NextResponse.json({ error: "Código obrigatório" }, { status: 400 });
    }

    const record = await prisma.plannerInviteCode.findUnique({
      where: { code: (code as string).toUpperCase().trim() },
      include: { wedding: true },
    });

    if (!record) return NextResponse.json({ error: "Código não encontrado" }, { status: 404 });
    if (record.expiresAt < new Date()) return NextResponse.json({ error: "Código expirado" }, { status: 410 });
    if (record.usedAt) return NextResponse.json({ error: "Código já utilizado" }, { status: 409 });

    // Get planner profile
    const planner = await prisma.weddingPlanner.findUnique({ where: { userId: user.id } });
    if (!planner) return NextResponse.json({ error: "Perfil de cerimonialista não encontrado" }, { status: 400 });

    // Check not already linked
    const existing = await prisma.weddingPlannerAssignment.findUnique({
      where: { plannerId_weddingId: { plannerId: planner.id, weddingId: record.weddingId } },
    });
    if (existing) return NextResponse.json({ error: "Você já está vinculada a este casamento" }, { status: 409 });

    // Create assignment + mark code as used
    await prisma.$transaction([
      prisma.weddingPlannerAssignment.create({
        data: { plannerId: planner.id, weddingId: record.weddingId, role: "principal", status: "ativo" },
      }),
      prisma.plannerInviteCode.update({
        where: { id: record.id },
        data: { usedAt: new Date(), usedBy: user.id },
      }),
    ]);

    return NextResponse.json({
      weddingId: record.weddingId,
      couple: `${record.wedding.partnerName1} & ${record.wedding.partnerName2}`,
    });
  } catch {
    return errorResponse();
  }
}
