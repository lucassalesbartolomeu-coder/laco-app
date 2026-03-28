import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, unauthorizedResponse, notFoundResponse, errorResponse } from "@/lib/api-helpers";

export async function PATCH(req: NextRequest, { params }: { params: { memberId: string } }) {
  const user = await getAuthenticatedUser();
  if (!user) return unauthorizedResponse();

  try {
    const planner = await prisma.weddingPlanner.findUnique({ where: { userId: user.id } });
    if (!planner) return notFoundResponse("Perfil");

    const member = await prisma.plannerTeamMember.findUnique({ where: { id: params.memberId } });
    if (!member || member.plannerId !== planner.id) return notFoundResponse("Membro");

    const { name, email, role, phone } = await req.json();
    const updated = await prisma.plannerTeamMember.update({
      where: { id: params.memberId },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(email !== undefined && { email: email?.trim() ?? null }),
        ...(role !== undefined && { role: role.trim() }),
        ...(phone !== undefined && { phone: phone?.trim() ?? null }),
      },
    });

    return NextResponse.json(updated);
  } catch {
    return errorResponse();
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { memberId: string } }) {
  const user = await getAuthenticatedUser();
  if (!user) return unauthorizedResponse();

  try {
    const planner = await prisma.weddingPlanner.findUnique({ where: { userId: user.id } });
    if (!planner) return notFoundResponse("Perfil");

    const member = await prisma.plannerTeamMember.findUnique({ where: { id: params.memberId } });
    if (!member || member.plannerId !== planner.id) return notFoundResponse("Membro");

    await prisma.plannerTeamMember.delete({ where: { id: params.memberId } });
    return NextResponse.json({ ok: true });
  } catch {
    return errorResponse();
  }
}
