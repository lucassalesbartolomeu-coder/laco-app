import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const planner = await prisma.weddingPlanner.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!planner) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: {
    coupleName?: string;
    contactEmail?: string;
    contactPhone?: string;
    weddingDate?: string;
    message?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.coupleName) {
    return NextResponse.json({ error: "coupleName é obrigatório" }, { status: 400 });
  }

  const opportunity = await prisma.opportunity.create({
    data: {
      plannerId: planner.id,
      coupleName: body.coupleName,
      contactEmail: body.contactEmail ?? null,
      contactPhone: body.contactPhone ?? null,
      weddingDate: body.weddingDate ? new Date(body.weddingDate) : null,
      notes: body.message ?? null,
      source: "portfolio",
      stage: "lead",
    },
  });

  return NextResponse.json({ id: opportunity.id }, { status: 201 });
}
