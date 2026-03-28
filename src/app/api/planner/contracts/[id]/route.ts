import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getAuthenticatedUser,
  unauthorizedResponse,
  notFoundResponse,
  errorResponse,
} from "@/lib/api-helpers";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthenticatedUser();
  if (!user) return unauthorizedResponse();

  try {
    const planner = await prisma.weddingPlanner.findUnique({ where: { userId: user.id } });
    if (!planner) return notFoundResponse("Perfil");

    const contract = await prisma.contract.findUnique({ where: { id: params.id } });
    if (!contract || contract.plannerId !== planner.id) return notFoundResponse("Contrato");

    const body = await req.json();
    const { action, name, terms, value } = body;

    let updateData: Record<string, unknown> = {};

    if (action === "sign-planner") {
      if (!name) return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
      updateData = {
        signedByPlanner: true,
        plannerName: name,
        plannerSignedAt: new Date(),
      };
    } else {
      if (terms !== undefined) updateData.terms = terms;
      if (value !== undefined) updateData.value = value ? Number(value) : null;
    }

    const updated = await prisma.contract.update({
      where: { id: params.id },
      data: updateData,
      include: {
        wedding: { select: { id: true, partnerName1: true, partnerName2: true, weddingDate: true } },
      },
    });

    return NextResponse.json(updated);
  } catch {
    return errorResponse();
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthenticatedUser();
  if (!user) return unauthorizedResponse();

  try {
    const planner = await prisma.weddingPlanner.findUnique({ where: { userId: user.id } });
    if (!planner) return notFoundResponse("Perfil");

    const contract = await prisma.contract.findUnique({ where: { id: params.id } });
    if (!contract || contract.plannerId !== planner.id) return notFoundResponse("Contrato");

    if (contract.signedByCouple) {
      return NextResponse.json({ error: "Não é possível excluir um contrato já assinado pelo casal" }, { status: 400 });
    }

    await prisma.contract.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return errorResponse();
  }
}
