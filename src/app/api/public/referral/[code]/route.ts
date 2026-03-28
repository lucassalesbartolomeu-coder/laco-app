import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { code: string } }) {
  const user = await prisma.user.findUnique({
    where: { referralCode: params.code },
    select: { id: true, name: true },
  });

  if (!user) {
    return NextResponse.json({ valid: false }, { status: 404 });
  }

  return NextResponse.json({ valid: true, referrerName: user.name });
}
