/**
 * Webhook público — recebe mensagens de resposta dos convidados via Z-API.
 *
 * Configure no painel Z-API:
 *   Webhook URL: https://seu-dominio/api/webhooks/whatsapp
 *   Eventos: "Ao receber mensagem"
 *
 * Fluxo:
 * 1. Convidado recebe o convite e responde: "1", "2" ou "3"
 * 2. Z-API envia POST para este endpoint
 * 3. Encontramos o convidado pelo telefone
 * 4. Atualizamos rsvpStatus + confirmed
 * 5. Enviamos mensagem de feedback (confirmação ou recusa)
 */

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  parseRsvpReply,
  sendText,
  confirmationMessage,
  declineAck,
  normalizePhone,
  type ZApiWebhookPayload,
} from "@/lib/whatsapp";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ZApiWebhookPayload;

    // Ignore messages sent by us or group messages
    if (body.fromMe || body.isGroup) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    if (!body.phone || !body.message) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    const replyStatus = parseRsvpReply(body.message);
    if (!replyStatus) {
      // Unrecognized reply — don't update status, don't crash
      return NextResponse.json({ ok: true, ignored: true, reason: "unrecognized_reply" });
    }

    // Normalize phone for DB lookup (strip country code for matching)
    const normalizedIncoming = normalizePhone(body.phone);
    // Try matching last 11, 10, or 9 digits (handles different stored formats)
    const phoneSuffix = normalizedIncoming.slice(-11);

    // Find the guest — search by phone suffix
    const guest = await prisma.guest.findFirst({
      where: {
        phone: { endsWith: phoneSuffix },
        rsvpStatus: { in: ["pendente", "talvez"] }, // only update unresolved
      },
      include: { wedding: { select: { partnerName1: true, partnerName2: true } } },
    });

    if (!guest) {
      return NextResponse.json({ ok: true, ignored: true, reason: "guest_not_found" });
    }

    // Update rsvpStatus + confirmed
    await prisma.guest.update({
      where: { id: guest.id },
      data: {
        rsvpStatus: replyStatus,
        confirmed: replyStatus === "confirmado",
      },
    });

    // Send feedback message
    const coupleName = `${guest.wedding.partnerName1} & ${guest.wedding.partnerName2}`;
    if (replyStatus === "confirmado") {
      await sendText(body.phone, confirmationMessage(coupleName));
    } else if (replyStatus === "recusado") {
      await sendText(body.phone, declineAck(guest.name.split(" ")[0]));
    }
    // "talvez" — no feedback message

    return NextResponse.json({
      ok: true,
      guestId: guest.id,
      newStatus: replyStatus,
    });
  } catch (err) {
    console.error("POST /api/webhooks/whatsapp error:", err);
    // Always return 200 to Z-API to avoid retries
    return NextResponse.json({ ok: false, error: "internal" }, { status: 200 });
  }
}
