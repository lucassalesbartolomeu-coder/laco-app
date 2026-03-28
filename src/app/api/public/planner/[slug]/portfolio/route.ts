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
      id: true,
      companyName: true,
      bio: true,
      instagram: true,
      region: true,
      specialties: true,
      isVerified: true,
      createdAt: true,
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

  const yearsExperience = new Date().getFullYear() - new Date(planner.createdAt).getFullYear();

  return NextResponse.json({
    planner: {
      companyName: planner.companyN