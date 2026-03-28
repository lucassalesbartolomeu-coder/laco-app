import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, unauthorizedResponse, notFoundResponse, errorResponse } from "@/lib/api-helpers";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return unauthorizedResponse();

  try {
    const planner = await prisma.weddingPlanner.findUnique({ where: { userId: user.id } });
    if (!planner) return notFoundResponse("Perfil");

    const members = await prisma.plannerTeamMember.findMany({
      where: { plannerId: planner.id },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(members);
  } catch {
    return errorResponse();
  }
}

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return unauthorizedResponse();

  try {
    const planner = await prisma.weddingPlanner.findUnique({ where: { userId: user.id } });
    if (!planner) return notFoundResponse("Perfil");

    const { name, email, role, phone } = await req.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
    }

    const member = await prisma.plannerTeamMember.create({
      data: {
        plannerId: planner.id,
        name: name.trim(),
        email: email?.trim() ?? null,
        role: role?.trim() ?? "assistente",
        phone: phone?.trim() ?? null,
      },
    });

    return NextResponse.json(member, { status: 201 });
  } catch {
    return errorResponse();
  }
}
