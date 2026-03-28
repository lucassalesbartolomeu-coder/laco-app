/**
 * POST /api/payments/webhook
 *
 * Webhook do Pagar.me — processa eventos de pagamento confirmado/cancelado.
 * Adaptado do Colo — mesma lógica HMAC, domain Wedding.
 *
 * Requer env var: PAGARME_WEBHOOK_SECRET
 */

import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/auditLog";
import { sendGiftReceivedEmail, sendPaymentConfirmationEmail } from "@/lib/emails";

// ─── HMAC verification ──────────────────────────────────────

function verifyWebhookSignature(payload: string, signature: string): boolean {
  const secret = process.env.PAGARME_WEBHOOK_SECRET;
  if (!secret) {
    console.warn("[webhook] PAGARME_WEBHOOK_SECRET não configurada — pulando verificação HMAC");
    return true; // falha aberta em dev (sem secret)
  }

  const expected = createHmac("sha256", secret).update(payload).digest("hex");

  try {
    return timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

// ─── Handler ─────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  // Verificação HMAC
  const signature = req.headers.get("x-hub-signature") ?? "";
  const cleanSig = signature.replace(/^sha256=/, "");

  if (!verifyWebhookSignature(rawBody, cleanSig)) {
    console.error("[webhook] Assinatura HMAC inválida");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let event: Record<string, unknown>;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const type = event.type as string;
  const data = event.data as Record<string, Record<string, unknown> | string | undefined> | undefined;

  // Log do evento recebido
  console.log("[webhook] Evento recebido:", type);

  // ─── Pix/Boleto pago ────────────────────────────────────
  if (type === "order.paid" || type === "charge.paid") {
    const orderId = ((data?.id ?? (data?.order as Record<string, unknown>)?.id)) as string | undefined;
    if (!orderId) {
      return NextResponse.json({ error: "orderId ausente" }, { status: 400 });
    }

    // Busca o payment pelo externalId
    const payment = await prisma.payment.findFirst({
      where: { externalId: orderId },
      include: {
        gift: true,
        wedding: true,
      },
    });

    if (!payment) {
      // Pode ser um evento de outro sistema ou já processado — não é erro
      console.warn("[webhook] Payment não encontrado para orderId:", orderId);
      return NextResponse.json({ ok: true });
    }

    // Idempotência: ignora se já foi pago
    if (payment.status === "paid") {
      return NextResponse.json({ ok: true });
    }

    // Atualiza payment + marca presente como presenteado
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "paid",
          paidAt: new Date(),
        },
      }),
      prisma.gift.update({
        where: { id: payment.giftId },
        data: {
          isGifted: true,
          giftedBy: payment.guestName,
          giftedAt: new Date(),
        },
      }),
      // Incrementa totalRaised no Wedding
      prisma.wedding.update({
        where: { id: payment.weddingId },
        data: {
          totalRaised: {
            increment: payment.netAmount,
          },
        },
      }),
    ]);

    await createAuditLog({
      action: "PAYMENT_CONFIRMED",
      details: {
        paymentId: payment.id,
        orderId,
        amount: payment.amount,
        giftId: payment.giftId,
      },
    });

    // Emails assíncronos (não bloqueia resposta)
    const wedding = payment.wedding;

    // Email para o casal
    if (wedding.email) {
      sendGiftReceivedEmail({
        coupleEmail: wedding.email,
        coupleName: `${wedding.partnerName1} & ${wedding.partnerName2}`,
        guestName: payment.guestName,
        giftName: payment.gift.name,
        amount: payment.amount,
        message: payment.message,
      }).catch((e) => console.error("[webhook] Erro ao enviar email para casal:", e));
    }

    // Email para o convidado (se tem email)
    if (payment.guestEmail) {
      sendPaymentConfirmationEmail({
        guestEmail: payment.guestEmail,
        guestName: payment.guestName,
        coupleName: `${wedding.partnerName1} & ${wedding.partnerName2}`,
        giftName: payment.gift.name,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod as "pix" | "boleto" | "credit_card",
      }).catch((e) => console.error("[webhook] Erro ao enviar email para convidado:", e));
    }

    return NextResponse.json({ ok: true });
  }

  // ─── Pagamento cancelado/expirado ────────────────────────
  if (
    type === "order.canceled" ||
    type === "order.payment_failed" ||
    type === "charge.payment_failed"
  ) {
    const orderId = ((data?.id ?? (data?.order as Record<string, unknown>)?.id)) as string | undefined;
    if (orderId) {
      await prisma.payment.updateMany({
        where: { externalId: orderId, status: "pending" },
        data: { status: "canceled" },
      });

      await createAuditLog({
        action: "PAYMENT_CANCELED",
        details: { orderId, eventType: type },
      });
    }

    return NextResponse.json({ ok: true });
  }

  // Evento desconhecido — apenas loga e retorna 200
  console.log("[webhook] Evento ignorado:", type);
  return NextResponse.json({ ok: true });
}
