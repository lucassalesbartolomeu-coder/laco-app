import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const planner = await prisma.weddingPlanner.findUnique({
    where: { slug },
    select: {
      companyName: true,
      bio: true,
      instagram: true,
      region: true,
      specialties: true,
      assignments: {
        where: { status: "concluído" },
        select: {
          wedding: {
            select: {
              partnerName1: true,
              partnerName2: true,
              weddingDate: true,
              venue: true,
              city: true,
              state: true,
              style: true,
            },
          },
        },
      },
    },
  });

  if (!planner) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    planner: {
      companyName: planner.companyName,
      bio: planner.bio,
      instagram: planner.instagram,
      region: planner.region,
      specialties: planner.specialties,
    },
    weddings: planner.assignments.map((a) => a.wedding),
  });
}
