import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";

export async function POST() {
  const user = await getAuthenticatedUser();
  if (!user) return unauthorizedResponse();

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        googleAccessToken: null,
        googleRefreshToken: null,
        googleCalendarId: null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return errorResponse();
  }
}
