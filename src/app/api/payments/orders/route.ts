/**
 * POST /api/payments/orders
 *
 * Cria um pedido de pagamento (Pix, Boleto, Cartão) para um presente.
 * Adaptado do Colo — Event→Wedding, gift flow de casamento.
 *
 * Body: paymentSchema (validators.ts)
 * Returns: { orderId, qr_code?, qr_code_url?, expires_at?, boleto_url?, boleto_barcode? }
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPixOrder, calculateFees } from "@/lib/pagarme";
import { paymentSchema } from "@/lib/validators";
import { validateContentType, getClientIp } from "@/lib/api-helpers";
import { createAuditLog } from "@/lib/auditLog";
import { rateLimit } from "@/lib/rateLimit";
import { encryptCPF } from "@/lib/crypto";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { sendGiftReceivedEmail, sendPaymentConfirmationEmail } from "@/lib/emails";

export async function POST(req: NextRequest) {
  // Rate limit: 10 pedidos por IP a cada 10 minutos
  const ip = getClientIp(req);
  const allowed = await rateLimit(`payment:${ip}`, 10, 10 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Muitas tentativas. Aguarde alguns minutos." },
      { status: 429 }
    );
  }

  // Content-type check
  const ctError = validateContentType(req);
  if (ctError) return ctError;

  // Parse + validação
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = paymentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const data = parsed.data;

  // Busca o presente
  const gift = await prisma.gift.findUnique({
    where: { id: data.giftId },
    include: { wedding: true },
  });

  if (!gift) {
    return NextResponse.json({ error: "Presente não encontrado" }, { status: 404 });
  }

  if (gift.weddingId !== data.weddingId) {
    return NextResponse.json({ error: "Presente não pertence a este casamento" }, { status: 403 });
  }

  // Verifica se o presente já foi presenteado (amount fixo)
  if (gift.isGifted) {
    return NextResponse.json({ error: "Este presente já foi escolhido" }, { status: 409 });
  }

  // Determina o valor — usa o valor do presente se definido, ou rejeita
  if (!gift.amount || gift.amount < 100) {
    return NextResponse.json(
      { error: "Este presente não possui valor definido para pagamento online" },
      { status: 400 }
    );
  }

  const amount = gift.amount;
  const { serviceFee, netAmount } = calculateFees(amount, data.paymentMethod);

  // Criptografa CPF antes de salvar
  const encryptedCpf = data.guestCpf ? encryptCPF(data.guestCpf) : null;

  // Cria o pedido no Pagar.me (por agora apenas Pix)
  if (data.paymentMethod !== "pix") {
    return NextResponse.json(
      { error: "Por enquanto apenas Pix está disponível" },
      { status: 400 }
    );
  }

  let pagarmeOrder;
  try {
    pagarmeOrder = await createPixOrder({
      amount,
      guestName: data.guestName,
      guestEmail: data.guestEmail ?? undefined,
      guestCpf: data.guestCpf ?? undefined,
      guestPhone: data.guestPhone ?? undefined,
      description: `${gift.name} — ${gift.wedding.partnerName1} & ${gift.wedding.partnerName2}`,
      metadata: {
        giftId: gift.id,
        weddingId: gift.weddingId,
        guestName: data.guestName,
      },
    });
  } catch (err) {
    console.error("[payments/orders] Pagar.me error:", err);
    return NextResponse.json(
      { error: "Erro ao criar pedido de pagamento. Tente novamente." },
      { status: 502 }
    );
  }

  // Salva o Payment no banco
  const payment = await prisma.payment.create({
    data: {
      weddingId: data.weddingId,
      giftId: data.giftId,
      guestName: data.guestName,
      guestEmail: data.guestEmail ?? null,
      guestPhone: data.guestPhone ?? null,
      guestCpf: encryptedCpf,
      message: data.message ?? null,
      amount,
      serviceFee,
      netAmount,
      paymentMethod: data.paymentMethod,
      status: "pending",
      externalId: pagarmeOrder.id,
    },
  });

  // Audit
  await createAuditLog({
    action: "PAYMENT_CREATED",
    details: { paymentId: payment.id, giftId: data.giftId, amount },
    ip,
  });

  return NextResponse.json({
    orderId: pagarmeOrder.id,
    paymentId: payment.id,
    qr_code: pagarmeOrder.qr_code,
    qr_code_url: pagarmeOrder.qr_code_url,
    expires_at: pagarmeOrder.expires_at,
    amount,
    serviceFee,
    netAmount,
  });
}
