export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getAuthenticatedUser,
  verifyWeddingOwnership,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  errorResponse,
  validationError,
} from "@/lib/api-helpers";
import {
  isWhatsappConfigured,
  sendText,
  inviteMessage,
  reminderMessage,
} from "@/lib/whatsapp";

type Params = { params: Promise<{ id: string }> };

// Delay helper for rate limiting (1 msg/sec)
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Format wedding date in Portuguese
function formatDatePt(iso: string | Date | null): string {
  if (!iso) return "data a confirmar";
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

// ─── GET — stats ──────────────────────────────────────────────────────────────

export async function GET(_req: Request, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const { error } = await verifyWeddingOwnership(id, user.id);
    if (error === "not_found") return notFoundResponse("Casamento");
    if (error === "forbidden") return forbiddenResponse();

    const guests = await prisma.guest.findMany({
      where: { weddingId: id },
      select: { rsvpStatus: true, whatsappSentAt: true, phone: true },
    });

    const total = guests.length;
    const sent = guests.filter((g) => g.whatsappSentAt).length;
    const confirmed = guests.filter((g) => g.rsvpStatus === "confirmado").length;
    const declined = guests.filter((g) => g.rsvpStatus === "recusado").length;
    const maybe = guests.filter((g) => g.rsvpStatus === "talvez").length;
    const pending = total - confirmed - declined - maybe;
    const withPhone = guests.filter((g) => g.phone).length;

    return NextResponse.json({
      configured: isWhatsappConfigured(),
      stats: { total, sent, confirmed, declined, maybe, pending, withPhone },
    });
  } catch (err) {
    console.error("GET /api/weddings/[id]/whatsapp error:", err);
    return errorResponse();
  }
}

// ─── POST — send invites or reminders ────────────────────────────────────────
//
// Body: { action: "invite" | "reminder", guestIds?: string[] }
// If guestIds is omitted:
//   action=invite → send to all guests with phone + rsvpStatus=pendente that haven't been sent yet
//   action=reminder → send to all guests with phone + rsvpStatus=pendente that HAVE been sent
// Rate limit: 1 message per second.

export async function POST(request: Request, { params }: Params) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const { error, wedding } = await verifyWeddingOwnership(id, user.id);
    if (error === "not_found") return notFoundResponse("Casamento");
    if (error === "forbidden") return forbiddenResponse();

    if (!isWhatsappConfigured()) {
      return NextResponse.json(
        {
          error: "WhatsApp não configurado. Adicione WHATSAPP_API_URL e WHATSAPP_API_TOKEN ao .env.",
          configured: false,
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { action, guestIds } = body as { action: "invite" | "reminder"; guestIds?: string[] };

    if (!["invite", "reminder"].includes(action)) {
      return validationError("action deve ser 'invite' ou 'reminder'");
    }

    const coupleName = `${wedding!.partnerName1} & ${wedding!.partnerName2}`;
    const weddingDateStr = formatDatePt(wedding!.weddingDate);
    const daysLeft = wedding!.weddingDate
      ? Math.ceil((new Date(wedding!.weddingDate).getTime() - Date.now()) / 86_400_000)
      : 0;

    // Determine which guests to contact
    let whereClause: Record<string, unknown> = { weddingId: id };

    if (guestIds?.length) {
      whereClause = { ...whereClause, id: { in: guestIds } };
    } else if (action === "invite") {
      // First-time invite: pending + not yet sent
      whereClause = { ...whereClause, rsvpStatus: "pendente", whatsappSentAt: null };
    } else {
      // Reminder: pending + already sent at least once
      whereClause = {
        ...whereClause,
        rsvpStatus: "pendente",
        whatsappSentAt: { not: null },
      };
    }

    const guests = await prisma.guest.findMany({
      where: { ...whereClause, phone: { not: null } },
      select: { id: true, name: true, phone: true },
    });

    if (guests.length === 0) {
      return NextResponse.json({ sent: 0, failed: 0, total: 0, message: "Nenhum convidado elegível." });
    }

    let sentCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (const guest of guests) {
      const msg =
        action === "invite"
          ? inviteMessage(guest.name.split(" ")[0], coupleName, weddingDateStr)
          : reminderMessage(guest.name.split(" ")[0], coupleName, daysLeft);

      const result = await sendText(guest.phone!, msg);

      if (result.ok) {
        sentCount++;
        await prisma.guest.update({
          where: { id: guest.id },
          data: { whatsappSentAt: new Date() },
        });
      } else {
        failedCount++;
        errors.push(`${guest.name}: ${result.error}`);
      }

      // Rate limit: 1 msg/sec
      if (guests.indexOf(guest) < guests.length - 1) {
        await sleep(1000);
      }
    }

    return NextResponse.json({
      sent: sentCount,
      failed: failedCount,
      total: guests.length,
      errors: errors.slice(0, 10), // max 10 erros retornados
    });
  } catch (err) {
    console.error("POST /api/weddings/[id]/whatsapp error:", err);
    return errorResponse();
  }
}
