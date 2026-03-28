/**
 * Magic link via Resend — usado pelo EmailProvider do NextAuth.
 * Copiado do Colo com branding Laço.
 */
import type { SendVerificationRequestParams } from "next-auth/providers/email";

export async function sendVerificationRequest({
  identifier,
  url,
}: SendVerificationRequestParams) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[resend] RESEND_API_KEY não configurada — magic link não enviado");
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head><meta charset="utf-8"></head>
    <body style="font-family:-apple-system,sans-serif;background:#FAF8F4;padding:40px 20px;">
      <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;padding:32px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <div style="height:4px;background:linear-gradient(90deg,#1A3A33,#C4734F);border-radius:4px;margin-bottom:28px;"></div>
        <h1 style="font-size:24px;color:#1A1A1A;margin:0 0 12px;">Seu link de acesso ao Laço</h1>
        <p style="color:#6B7280;font-size:15px;line-height:1.6;margin:0 0 24px;">
          Clique no botão abaixo para entrar. O link expira em 10 minutos.
        </p>
        <a href="${url}" style="display:inline-block;padding:14px 32px;background:#1A3A33;color:#fff;text-decoration:none;font-size:15px;font-weight:600;border-radius:40px;">
          Entrar no Laço →
        </a>
        <p style="margin:24px 0 0;font-size:12px;color:#9CA3AF;">
          Se você não solicitou este link, ignore este email.
        </p>
      </div>
    </body>
    </html>
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Laço <nao-responda@laco.app>",
      to: identifier,
      subject: "Seu link de acesso ao Laço",
      html,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[resend] Erro ao enviar magic link:", res.status, text);
  }
}
