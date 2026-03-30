"use client";

import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import BottomNav from "@/components/bottom-nav";

/* ─── Page ──────────────────────────────────────────────────────────── */

export default function ContaCasamentoPage() {
  const params = useParams();
  const weddingId = params.id as string;
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-midnight border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-ivory pb-24">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-midnight to-midnight/80 px-5 pt-12 pb-10">
        <span className="inline-block font-body text-[11px] font-semibold tracking-wider uppercase px-3 py-1 rounded-full bg-gold/20 text-gold mb-4">
          Em breve
        </span>
        <h1 className="font-heading text-3xl text-white mb-2">
          Conta Digital Laço
        </h1>
        <p className="font-body text-sm text-white/70 leading-relaxed max-w-sm">
          Conta compartilhada entre os noivos para centralizar todos os gastos do casamento em um só lugar.
        </p>
      </div>

      {/* ── Feature cards ────────────────────────────────────────────── */}
      <div className="px-4 -mt-3 relative z-10 space-y-3">
        {[
          {
            icon: "💳",
            title: "Conta Compartilhada",
            desc: "Ambos os noivos acessam e movimentam a conta com controle total",
          },
          {
            icon: "📊",
            title: "Extrato Automático",
            desc: "Cada gasto categorizado automaticamente: buffet, decoração, fotografia...",
          },
          {
            icon: "💸",
            title: "Pix dos Presentes",
            desc: "Receba presentes em dinheiro diretamente na conta do casamento",
          },
        ].map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-4 flex items-start gap-4"
          >
            <span className="text-2xl flex-shrink-0">{card.icon}</span>
            <div>
              <p className="font-body text-sm font-semibold text-midnight mb-0.5">
                {card.title}
              </p>
              <p className="font-body text-[13px] text-gray-500 leading-snug">
                {card.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Why a separate account ───────────────────────────────────── */}
      <div className="px-4 mt-6">
        <h2 className="font-heading text-xl text-midnight mb-4">
          Por que ter uma conta separada?
        </h2>
        <div className="space-y-3">
          {[
            "Não mistura com as finanças pessoais do casal",
            "Ambos os noivos têm visibilidade total dos gastos",
            "Relatório pronto para o imposto de renda",
          ].map((bullet) => (
            <div key={bullet} className="flex items-start gap-3">
              <span className="text-gold font-heading text-base leading-snug flex-shrink-0 mt-px">
                ✦
              </span>
              <p className="font-body text-sm text-midnight/80 leading-relaxed">
                {bullet}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Notify CTA ───────────────────────────────────────────────── */}
      <div className="px-4 mt-8">
        <div className="bg-gold/5 border border-gold/20 rounded-2xl p-5">
          <h3 className="font-heading text-xl text-midnight mb-1">
            Seja o primeiro a saber
          </h3>
          <p className="font-body text-sm text-midnight/70 leading-relaxed mb-5">
            A conta Laço está em desenvolvimento. Cadastre seu interesse e te
            avisamos quando lançar.
          </p>
          <a
            href="https://wa.me/5511999999999?text=Ol%C3%A1!%20Quero%20ser%20avisado%20quando%20a%20Conta%20Digital%20La%C3%A7o%20lan%C3%A7ar"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-gold text-white font-body text-sm font-semibold rounded-xl hover:bg-gold/90 transition-colors active:scale-[0.98]"
          >
            <span>💬</span>
            Me avise no WhatsApp
          </a>
        </div>
      </div>

      <BottomNav weddingId={weddingId} />
    </div>
  );
}
