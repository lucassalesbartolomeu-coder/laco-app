import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getAuthenticatedUser,
  verifyWeddingOwnership,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  errorResponse,
} from "@/lib/api-helpers";

type Params = { params: Promise<{ id: string }> };

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no O, 0, I, 1
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// GET — return active code if exists
export async function GET(_req: Request, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();
    const { id } = await params;
    const { error } = await verifyWeddingOwnership(id, user.id);
    if (error === "not_found") return notFoundResponse("Casamento");
    if (error === "forbidden") return forbiddenResponse();

    const code = await prisma.plannerInviteCode.findFirst({
      where: { weddingId: id, expiresAt: { gt: new Date() }, usedAt: null },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ code: code?.code ?? null });
  } catch {
    return errorResponse();
  }
}

// POST — generate new code
export async function POST(_req: Request, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();
    const { id } = await params;
    const { error } = await verifyWeddingOwnership(id, user.id);
    if (error === "not_found") return notFoundResponse("Casamento");
    if (error === "forbidden") return forbiddenResponse();

    // Invalidate existing unused codes for this wedding
    await prisma.plannerInviteCode.updateMany({
      where: { weddingId: id, usedAt: null },
      data: { expiresAt: new Date() },
    });

    // Generate unique code
    let code = generateCode();
    let attempts = 0;
    while (attempts < 10) {
      const exists = await prisma.plannerInviteCode.findUnique({ where: { code } });
      if (!exists) break;
      code = generateCode();
      attempts++;
    }

    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72h
    const record = await prisma.plannerInviteCode.create({
      data: { weddingId: id, code, expiresAt },
    });

    return NextResponse.json({ code: record.code, expiresAt: record.expiresAt });
  } catch {
    return errorResponse();
  }
}
