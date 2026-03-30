import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

async function verifyWedding(weddingId: string, userId: string) {
  return prisma.wedding.findFirst({
    where: { id: weddingId, OR: [{ userId }, { partnerUserId: userId }] },
  });
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const wedding = await verifyWedding(params.id, user.id);
  if (!wedding) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const events = await prisma.weddingEvent.findMany({
    where: { weddingId: params.id },
    orderBy: { date: "asc" },
  });
  return NextResponse.json(events);
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const wedding = await verifyWedding(params.id, user.id);
  if (!wedding) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { name, date, venue, notes } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const event = await prisma.weddingEvent.create({
    data: {
      weddingId: params.id,
      name: name.trim(),
      date: date ? new Date(date) : null,
      venue: venue?.trim() || null,
      notes: notes?.trim() || null,
    },
  });
  return NextResponse.json(event, { status: 201 });
}
