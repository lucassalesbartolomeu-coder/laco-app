import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return unauthorizedResponse();

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { googleAccessToken: true, googleCalendarId: true },
    });

    return NextResponse.json({ connected: !!dbUser?.googleAccessToken });
  } catch {
    return errorResponse();
  }
}
