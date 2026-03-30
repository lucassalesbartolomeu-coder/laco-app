import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

async function verifyWedding(weddingId: string, userId: string) {
  return prisma.wedding.findFirst({
    where: { id: weddingId, OR: [{ userId }, { partnerUserId: userId }] },
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string; eventId: string } }
) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const wedding = await verifyWedding(params.id, user.id);
  if (!wedding) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.weddingEvent.delete({ where: { id: params.eventId } });
  return NextResponse.json({ ok: true });
}
