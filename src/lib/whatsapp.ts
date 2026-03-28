/**
 * WhatsApp Business service — adapter Z-API (z-api.io).
 *
 * Env vars necessárias (adicionar no .env):
 *   WHATSAPP_API_URL      = https://api.z-api.io/instances/{INSTANCE_ID}/token/{TOKEN}
 *   WHATSAPP_API_TOKEN    = seu Client-Token do Z-API
 *   WHATSAPP_INSTANCE_ID  = ID da instância (usado para validar webhooks)
 *
 * Quando as variáveis não estão configuradas, todas as funções de envio
 * retornam { ok: false, error: "not_configured" } — o resto do código
 * trata isso gracefully mostrando o estado de "configure primeiro".
 *
 * Para trocar de Z-API para Evolution API no futuro: basta atualizar
 * a função `sendText` abaixo. O resto do código não muda.
 */

export type WhatsappResult =
  | { ok: true; messageId: string }
  | { ok: false; error: "not_configured" | "send_failed" | string };

export function isWhatsappConfigured(): boolean {
  return !!(process.env.WHATSAPP_API_URL && process.env.WHATSAPP_API_TOKEN);
}

/**
 * Normaliza número para o padrão E.164 sem "+".
 * "(11) 99999-9999" → "5511999999999"
 */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("55") && digits.length >= 12) return digits;
  return `55${digits}`;
}

/**
 * Envia uma mensagem de texto via Z-API.
 */
export async function sendText(phone: string, message: string): Promise<WhatsappResult> {
  if (!isWhatsappConfigured()) {
    return { ok: false, error: "not_configured" };
  }

  const formattedPhone = normalizePhone(phone);

  try {
    const res = await fetch(`${process.env.WHATSAPP_API_URL}/send-messages/send-text`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Client-Token": process.env.WHATSAPP_API_TOKEN!,
      },
      body: JSON.stringify({ phone: formattedPhone, message }),
    });

    if (!res.ok) {
      const text = await res.text();
      return { ok: false, error: `Z-API ${res.status}: ${text.slice(0, 300)}` };
    }

    const data = await res.json();
    return { ok: true, messageId: data.messageId ?? data.id ?? formattedPhone };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "send_failed" };
  }
}

// ─── Message Templates ────────────────────────────────────────────────────────

export function inviteMessage(
  guestName: string,
  coupleName: string,
  weddingDate: string
): string {
  return (
    `Olá, ${guestName}! 💍\n\n` +
    `Você está convidado(a) para o casamento de *${coupleName}*, no dia *${weddingDate}*.\n\n` +
    `Confirma sua presença?\n\n` +
    `1️⃣ Sim, estarei lá!\n` +
    `2️⃣ Não poderei ir\n` +
    `3️⃣ Talvez`
  );
}

export function reminderMessage(
  guestName: string,
  coupleName: string,
  daysLeft: number
): string {
  const days =
    daysLeft <= 0
      ? "é hoje"
      : daysLeft === 1
      ? "falta *1 dia*"
      : `faltam *${daysLeft} dias*`;
  return (
    `Olá, ${guestName}! 💍\n\n` +
    `${days} para o casamento de *${coupleName}* e ainda não temos sua confirmação.\n\n` +
    `Consegue confirmar?\n\n` +
    `1️⃣ Sim\n` +
    `2️⃣ Não`
  );
}

export function confirmationMessage(coupleName: string): string {
  return (
    `Presença confirmada! 🎉\n\n` +
    `Você está na lista do casamento de *${coupleName}*. Nos vemos lá! 💚\n\n` +
    `Qualquer mudança, é só responder aqui.`
  );
}

export function declineAck(guestName: string): string {
  return (
    `Tudo bem, ${guestName}. 🙏\n\n` +
    `Sentiremos sua falta! Se mudar de ideia, é só nos avisar.`
  );
}

// ─── Webhook payload (Z-API) ──────────────────────────────────────────────────

export interface ZApiWebhookPayload {
  instanceId?: string;
  phone?: string;        // sender phone in E.164 without "+"
  message?: string;      // text content
  fromMe?: boolean;      // true if sent by us
  isGroup?: boolean;
  messageId?: string;
}

/**
 * Parses the reply text from a guest and returns their new rsvpStatus.
 * "1" or "sim" → confirmado
 * "2" or "não/nao" → recusado
 * "3" or "talvez" → talvez
 * null → unrecognized
 */
export function parseRsvpReply(text: string): "confirmado" | "recusado" | "talvez" | null {
  const t = text.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (t === "1" || t.startsWith("sim") || t.startsWith("s ") || t === "s") return "confirmado";
  if (t === "2" || t.startsWith("nao") || t.startsWith("n ") || t === "n") return "recusado";
  if (t === "3" || t.startsWith("talvez") || t.startsWith("quem sabe")) return "talvez";
  return null;
}
