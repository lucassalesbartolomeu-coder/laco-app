export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, unauthorizedResponse, errorResponse } from "@/lib/api-helpers";
import { MonthlyReportDocument } from "@/lib/report-pdf";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const planner = await prisma.weddingPlanner.findUnique({
      where: { userId: user.id },
      include: {
        assignments: {
          where: { status: "ativo" },
          include: {
            wedding: {
              select: {
                partnerName1: true,
                partnerName2: true,
                weddingDate: true,
                venue: true,
                city: true,
                estimatedBudget: true,
              },
            },
          },
        },
        opportunities: {
          where: { stage: { not: "perdido" } },
          select: { stage: true, estimatedBudget: true },
        },
        tasks: {
          orderBy: { dueDate: "asc" },
          take: 20,
          select: { title: true, dueDate: true, done: true, priority: true },
        },
      },
    });

    if (!planner) return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });

    const pendingCommissions = await prisma.weddingPlannerAssignment.aggregate({
      where: { plannerId: planner.id, commissionPaid: false, commissionAmount: { not: null } },
      _sum: { commissionAmount: true },
    });

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const period = now.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    const periodCapitalized = period.charAt(0).toUpperCase() + period.slice(1);

    const weddingsSoon = planner.assignments.filter(
      (a) =>
        a.wedding.weddingDate &&
        new Date(a.wedding.weddingDate) >= now &&
        new Date(a.wedding.weddingDate) <= thirtyDaysFromNow
    ).length;

    const pipelineValue = planner.opportunities
      .filter((o) => o.stage !== "fechado")
      .reduce((sum, o) => sum + (o.estimatedBudget ?? 0), 0);

    const reportData = {
      planner: {
        companyName: planner.companyName ?? "",
        email: user.email ?? "",
      },
      period: periodCapitalized,
      kpis: {
        activeWeddings: planner.assignments.length,
        pipelineCount: planner.opportunities.filter((o) => o.stage !== "fechado").length,
        pipelineValue,
        pendingCommissions: pendingCommissions._sum.commissionAmount ?? 0,
        weddingsSoon,
      },
      weddings: planner.assignments.map((a) => ({
        couple: `${a.wedding.partnerName1} & ${a.wedding.partnerName2}`,
        weddingDate: a.wedding.weddingDate?.toISOString() ?? null,
        venue: a.wedding.venue,
        city: a.wedding.city,
      })),
      tasks: planner.tasks.map((t) => ({
        title: t.title,
        dueDate: t.dueDate?.toISOString() ?? null,
        done: t.done,
        priority: t.priority,
      })),
    };

    const element = createElement(MonthlyReportDocument, { data: reportData });
    const pdfBuffer = await renderToBuffer(element as Parameters<typeof renderToBuffer>[0]);

    const emailTo = user.email!;
    const { error } = await resend.emails.send({
      from: "Laço <nao-responda@laco.app>",
      to: emailTo,
      subject: `Seu relatório mensal — ${periodCapitalized} | Laço`,
      html: `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head><meta charset="utf-8"></head>
        <body style="font-family:-apple-system,sans-serif;background:#FAF8F4;padding:40px 20px;">
          <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;padding:32px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
            <div style="height:4px;background:linear-gradient(90deg,#1A1F3A,#B87333);border-radius:4px;margin-bottom:28px;"></div>
            <h1 style="font-size:22px;color:#1A1F3A;margin:0 0 8px;">Relatório de ${periodCapitalized}</h1>
            <p style="color:#6B7280;font-size:14px;line-height:1.6;margin:0 0 20px;">
              Seu resumo mensal do Laço está em anexo. Aqui vai o destaque:
            </p>
            <div style="background:#FAF7F2;border-radius:12px;padding:16px;margin-bottom:20px;">
              <table style="width:100%;border-collapse:collapse;">
                <tr>
                  <td style="padding:6px 0;font-size:13px;color:#374151;">Casamentos ativos</td>
                  <td style="padding:6px 0;font-size:13px;font-weight:600;color:#1A1F3A;text-align:right;">${reportData.kpis.activeWeddings}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-size:13px;color:#374151;">Leads no pipeline</td>
                  <td style="padding:6px 0;font-size:13px;font-weight:600;color:#1A1F3A;text-align:right;">${reportData.kpis.pipelineCount}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-size:13px;color:#374151;">Comissões pendentes</td>
                  <td style="padding:6px 0;font-size:13px;font-weight:600;color:#B87333;text-align:right;">${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(reportData.kpis.pendingCommissions)}</td>
                </tr>
              </table>
            </div>
            <p style="margin:0;font-size:12px;color:#9CA3AF;">Relatório PDF completo em anexo.</p>
          </div>
        </body>
        </html>
      `,
      attachments: [
        {
          filename: `relatorio-${periodCapitalized.toLowerCase().replace(/\s/g, "-")}.pdf`,
          content: Buffer.from(pdfBuffer).toString("base64"),
        },
      ],
    });

    if (error) {
      console.error("[report] Resend error:", error);
      return NextResponse.json({ error: "Erro ao enviar email" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, sentTo: emailTo });
  } catch (err) {
    console.error("[report] Error:", err);
    return errorResponse();
  }
}
