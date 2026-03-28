import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getAuthenticatedUser,
  unauthorizedResponse,
  errorResponse,
} from "@/lib/api-helpers";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return unauthorizedResponse();

  try {
    const planner = await prisma.weddingPlanner.findUnique({
      where: { userId: user.id },
    });
    if (!planner) return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });

    const contracts = await prisma.contract.findMany({
      where: { plannerId: planner.id },
      include: {
        wedding: {
          select: {
            id: true,
            partnerName1: true,
            partnerName2: true,
            weddingDate: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(contracts);
  } catch {
    return errorResponse();
  }
}

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return unauthorizedResponse();

  try {
    const body = await req.json();
    const { weddingId, terms, value } = body;

    if (!weddingId || !terms) {
      return NextResponse.json({ error: "weddingId e terms são obrigatórios" }, { status: 400 });
    }

    const planner = await prisma.weddingPlanner.findUnique({
      where: { userId: user.id },
    });
    if (!planner) return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });

    // Verify planner is assigned to this wedding
    const assignment = await prisma.weddingPlannerAssignment.findUnique({
      where: { plannerId_weddingId: { plannerId: planner.id, weddingId } },
    });
    if (!assignment) {
      return NextResponse.json({ error: "Casamento não encontrado nas suas atribuições" }, { status: 403 });
    }

    const contract = await prisma.contract.create({
      data: { plannerId: planner.id, weddingId, terms, value: value ? Number(value) : null },
      include: {
        wedding: { select: { id: true, partnerName1: true, partnerName2: true, weddingDate: true } },
      },
    });

    return NextResponse.json(contract, { status: 201 });
  } catch {
    return errorResponse();
  }
}
