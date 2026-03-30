import { NextResponse } from "next/server";
import { getAuthenticatedUser, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getAuthenticatedUser();
  if (!user) return unauthorizedResponse();

  try {
    const wedding = await prisma.wedding.findFirst({
      where: {
        id: params.id,
        OR: [{ userId: user.id }, { partnerUserId: user.id }],
      },
      select: { id: true },
    });

    if (!wedding) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const contracts = await prisma.contract.findMany({
      where: { weddingId: params.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        terms: true,
        value: true,
        signedByPlanner: true,
        signedByCouple: true,
        plannerName: true,
        coupleName: true,
        plannerSignedAt: true,
        coupleSignedAt: true,
        createdAt: true,
        planner: {
          select: {
            companyName: true,
            user: { select: { name: true } },
          },
        },
      },
    });

    return NextResponse.json(contracts);
  } catch {
    return errorResponse();
  }
}
