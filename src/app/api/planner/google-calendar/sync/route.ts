import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return unauthorizedResponse();

  try {
    const { weddingId } = await req.json();
    if (!weddingId) {
      return NextResponse.json({ error: "weddingId é obrigatório" }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { googleAccessToken: true, googleRefreshToken: true, googleCalendarId: true },
    });

    if (!dbUser?.googleAccessToken) {
      return NextResponse.json({ error: "Google Calendar não conectado" }, { status: 400 });
    }

    const wedding = await prisma.wedding.findUnique({
      where: { id: weddingId },
      select: {
        partnerName1: true,
        partnerName2: true,
        weddingDate: true,
        venue: true,
        venueAddress: true,
        city: true,
        state: true,
      },
    });

    if (!wedding) {
      return NextResponse.json({ error: "Casamento não encontrado" }, { status: 404 });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXTAUTH_URL}/api/planner/google-calendar/callback`
    );

    oauth2Client.setCredentials({
      access_token: dbUser.googleAccessToken,
      refresh_token: dbUser.googleRefreshToken,
    });

    // Refresh token if needed and persist
    oauth2Client.on("tokens", async (tokens) => {
      if (tokens.access_token) {
        await prisma.user.update({
          where: { id: user.id },
          data: { googleAccessToken: tokens.access_token },
        });
      }
    });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const summary = `Casamento: ${wedding.partnerName1} & ${wedding.partnerName2}`;
    const location = [wedding.venue, wedding.venueAddress, wedding.city, wedding.state]
      .filter(Boolean)
      .join(", ");

    const weddingDate = wedding.weddingDate ? new Date(wedding.weddingDate) : new Date();
    const endDate = new Date(weddingDate.getTime() + 8 * 60 * 60 * 1000); // +8h

    const event = await calendar.events.insert({
      calendarId: dbUser.googleCalendarId ?? "primary",
      requestBody: {
        summary,
        location: location || undefined,
        description: `Casamento gerenciado pelo Laço — laco.app`,
        start: { dateTime: weddingDate.toISOString(), timeZone: "America/Sao_Paulo" },
        end: { dateTime: endDate.toISOString(), timeZone: "America/Sao_Paulo" },
      },
    });

    return NextResponse.json({ eventId: event.data.id, htmlLink: event.data.htmlLink });
  } catch (err) {
    console.error("Google Calendar sync error:", err);
    return errorResponse("Erro ao sincronizar com Google Calendar");
  }
}
