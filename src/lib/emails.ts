/**
 * Templates de email transacional do Laço via Resend.
 * Adaptado do Colo — domínio casamento, branding Laço.
 *
 * Requer env var: RESEND_API_KEY
 */

const RESEND_API = "https://api.resend.com/emails";
const FROM = "Laço <nao-responda@laco.app>";

// ─── Helpers ────────────────────────────────────────────────

function baseLayout(content: string): string {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#FAF8F4;margin:0;padding:40px 20px;">
      <div style="max-width:520px;margin:0 auto;">
        <!-- Header -->
        <div style="text-align:center;margin-bottom:24px;">
          <span style="font-size:28px;font-weight:700;color:#1A1F3A;letter-spacing:-0.5px;">Laço</span>
        </div>
        <!-- Card -->
        <div style="background:#ffffff;border-radius:16px;padding:36px 32px;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
          <div style="height:3px;background:linear-gradient(90deg,#1A1F3A,#C9A96E);border-radius:3px;margin-bottom:28px;"></div>
          ${content}
        </div>
        <!-- Footer -->
        <p style="text-align:center;font-size:12px;color:#9CA3AF;margin-top:24px;">
          © ${new Date().getFullYear()} Laço — lista de presentes de casamento<br>
          <a href="https://laco.app" style="color:#9CA3AF;">laco.app</a>
        </p>
      </div>
    </body>
    </html>
  `;
}

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[emails] RESEND_API_KEY não configurada — email não enviado:", subject);
    return;
  }

  const res = await fetch(RESEND_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[emails] Erro ao enviar email:", res.status, text);
  }
}

// ─── Email: Confirmação de presente recebido (casal) ────────

export async function sendGiftReceivedEmail(params: {
  coupleEmail: string;
  coupleName: string; // ex: "Ana & Pedro"
  guestName: string;
  giftName: string;
  amount: number; // em centavos
  message?: string | null;
}): Promise<void> {
  const amountFormatted = (params.amount / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const html = baseLayout(`
    <h1 style="font-size:22px;color:#1A1A1A;margin:0 0 8px;">Você recebeu um presente! 🎁</h1>
    <p style="color:#6B7280;font-size:15px;line-height:1.6;margin:0 0 24px;">
      <strong>${params.guestName}</strong> presenteou vocês com <strong>${params.giftName}</strong>.
    </p>

    <div style="background:#F0F7F4;border-radius:12px;padding:20px;margin-bottom:24px;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:14px;color:#6B7280;">Valor recebido</span>
        <span style="font-size:22px;font-weight:700;color:#1A1F3A;">${amountFormatted}</span>
      </div>
    </div>

    ${
      params.message
        ? `<div style="background:#FFF8F5;border-left:3px solid #C9A96E;padding:14px 16px;border-radius:0 8px 8px 0;margin-bottom:24px;">
        <p style="font-size:14px;color:#374151;font-style:italic;margin:0;">"${params.message}"</p>
      </div>`
        : ""
    }

    <p style="color:#6B7280;font-size:13px;margin:0;">
      Acesse seu painel para acompanhar todos os presentes recebidos.
    </p>

    <a href="https://laco.app/app/dashboard" style="display:inline-block;margin-top:20px;padding:12px 28px;background:#1A1F3A;color:#fff;text-decoration:none;font-size:14px;font-weight:600;border-radius:40px;">
      Ver meu painel →
    </a>
  `);

  await sendEmail(
    params.coupleEmail,
    `${params.guestName} presenteou vocês com ${params.giftName}! 🎁`,
    html
  );
}

// ─── Email: Confirmação de pagamento (convidado) ─────────────

export async function sendPaymentConfirmationEmail(params: {
  guestEmail: string;
  guestName: string;
  coupleName: string;
  giftName: string;
  amount: number; // em centavos
  paymentMethod: "pix" | "boleto" | "credit_card";
}): Promise<void> {
  const amountFormatted = (params.amount / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const methodLabels: Record<string, string> = {
    pix: "Pix",
    boleto: "Boleto",
    credit_card: "Cartão de crédito",
  };

  const html = baseLayout(`
    <h1 style="font-size:22px;color:#1A1A1A;margin:0 0 8px;">Presente confirmado! ✨</h1>
    <p style="color:#6B7280;font-size:15px;line-height:1.6;margin:0 0 24px;">
      Seu presente para <strong>${params.coupleName}</strong> foi registrado com sucesso.
    </p>

    <div style="background:#F0F7F4;border-radius:12px;padding:20px;margin-bottom:24px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="font-size:13px;color:#6B7280;padding:4px 0;">Presente</td>
          <td style="font-size:13px;color:#1A1A1A;font-weight:600;text-align:right;">${params.giftName}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#6B7280;padding:4px 0;">Valor</td>
          <td style="font-size:13px;color:#1A1A1A;font-weight:600;text-align:right;">${amountFormatted}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#6B7280;padding:4px 0;">Método</td>
          <td style="font-size:13px;color:#1A1A1A;font-weight:600;text-align:right;">${methodLabels[params.paymentMethod] ?? params.paymentMethod}</td>
        </tr>
      </table>
    </div>

    <p style="color:#6B7280;font-size:13px;margin:0;">
      Obrigado por presentear <strong>${params.coupleName}</strong>! O casal ficará muito feliz. 💚
    </p>
  `);

  await sendEmail(
    params.guestEmail,
    `Presente confirmado para ${params.coupleName}! ✨`,
    html
  );
}

// ─── Email: Confirmação de RSVP ──────────────────────────────

export async function sendRsvpConfirmationEmail(params: {
  guestEmail: string;
  guestName: string;
  coupleName: string;
  weddingDate?: string | null;
  venue?: string | null;
  confirmed: boolean;
}): Promise<void> {
  const statusText = params.confirmed ? "Confirmada sua presença" : "Ausência registrada";
  const statusEmoji = params.confirmed ? "🎉" : "😢";

  const html = baseLayout(`
    <h1 style="font-size:22px;color:#1A1A1A;margin:0 0 8px;">${statusText} ${statusEmoji}</h1>
    <p style="color:#6B7280;font-size:15px;line-height:1.6;margin:0 0 24px;">
      ${
        params.confirmed
          ? `Ótimo! Sua presença no casamento de <strong>${params.coupleName}</strong> foi confirmada.`
          : `Sua ausência no casamento de <strong>${params.coupleName}</strong> foi registrada. Sentiremos sua falta!`
      }
    </p>

    ${
      params.confirmed && (params.weddingDate || params.venue)
        ? `<div style="background:#F0F7F4;border-radius:12px;padding:20px;margin-bottom:24px;">
        ${
          params.weddingDate
            ? `<p style="font-size:14px;color:#374151;margin:0 0 8px;">
            📅 <strong>Data:</strong> ${params.weddingDate}
          </p>`
            : ""
        }
        ${
          params.venue
            ? `<p style="font-size:14px;color:#374151;margin:0;">
            📍 <strong>Local:</strong> ${params.venue}
          </p>`
            : ""
        }
      </div>`
        : ""
    }

    <p style="color:#6B7280;font-size:13px;margin:0;">
      Você pode alterar sua confirmação a qualquer momento pelo link de convite.
    </p>
  `);

  await sendEmail(
    params.guestEmail,
    `${statusText} — Casamento de ${params.coupleName}`,
    html
  );
}

// ─── Email: Boas-vindas ao Laço ──────────────────────────────

export async function sendWelcomeEmail(params: {
  userEmail: string;
  userName: string;
}): Promise<void> {
  const html = baseLayout(`
    <h1 style="font-size:22px;color:#1A1A1A;margin:0 0 8px;">Bem-vindo ao Laço, ${params.userName}! 💚</h1>
    <p style="color:#6B7280;font-size:15px;line-height:1.6;margin:0 0 24px;">
      Estamos aqui para tornar a organização do seu casamento mais simples e especial.
      Com o Laço, você cria sua lista de presentes, gerencia convidados e recebe tudo com segurança.
    </p>

    <div style="background:#F0F7F4;border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="font-size:14px;font-weight:600;color:#1A1F3A;margin:0 0 12px;">Por onde começar:</p>
      <p style="font-size:13px;color:#374151;margin:0 0 8px;">🎁 Crie sua lista de presentes</p>
      <p style="font-size:13px;color:#374151;margin:0 0 8px;">👥 Adicione seus convidados</p>
      <p style="font-size:13px;color:#374151;margin:0 0 8px;">💳 Configure o recebimento via Pix</p>
      <p style="font-size:13px;color:#374151;margin:0;">🌐 Compartilhe seu site personalizado</p>
    </div>

    <a href="https://laco.app/app/dashboard" style="display:inline-block;padding:14px 32px;background:#1A1F3A;color:#fff;text-decoration:none;font-size:15px;font-weight:600;border-radius:40px;">
      Começar agora →
    </a>
  `);

  await sendEmail(params.userEmail, "Bem-vindo ao Laço! 💚", html);
}

// ─── Email: Saque solicitado ─────────────────────────────────

export async function sendWithdrawalRequestedEmail(params: {
  userEmail: string;
  userName: string;
  amount: number; // em centavos
  weddingName: string;
}): Promise<void> {
  const amountFormatted = (params.amount / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const html = baseLayout(`
    <h1 style="font-size:22px;color:#1A1A1A;margin:0 0 8px;">Saque solicitado 💸</h1>
    <p style="color:#6B7280;font-size:15px;line-height:1.6;margin:0 0 24px;">
      Seu saque foi solicitado com sucesso e será processado em até 2 dias úteis.
    </p>

    <div style="background:#F0F7F4;border-radius:12px;padding:20px;margin-bottom:24px;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:14px;color:#6B7280;">Valor solicitado</span>
        <span style="font-size:22px;font-weight:700;color:#1A1F3A;">${amountFormatted}</span>
      </div>
      <p style="font-size:13px;color:#6B7280;margin:8px 0 0;">Lista: ${params.weddingName}</p>
    </div>

    <p style="color:#6B7280;font-size:13px;margin:0;">
      O valor será transferido para a conta cadastrada. Em caso de dúvidas, entre em contato com nosso suporte.
    </p>
  `);

  await sendEmail(params.userEmail, `Saque de ${amountFormatted} solicitado`, html);
}
