import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { email, password, name, role, plannerData } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e senha são obrigatórios" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Email já cadastrado" },
        { status: 409 }
      );
    }

    const validRole = role === "PLANNER" ? "PLANNER" : "COUPLE";
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, role: validRole },
    });

    // If planner, create WeddingPlanner profile
    if (validRole === "PLANNER" && plannerData) {
      const slug = (plannerData.companyName || name || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      await prisma.weddingPlanner.create({
        data: {
          userId: user.id,
          slug: slug || undefined,
          companyName: plannerData.companyName || "",
          cnpj: plannerData.cnpj || null,
          region: plannerData.region || "",
          specialties: plannerData.specialties || [],
          phone: plannerData.phone || "",
          bio: plannerData.bio || null,
          instagram: plannerData.instagram || null,
          website: plannerData.website || null,
        },
      });
    }

    return NextResponse.json(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
