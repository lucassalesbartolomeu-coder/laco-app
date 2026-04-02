"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import BottomNav from "@/components/bottom-nav";

// ── Design tokens ─────────────────────────────────────────────────
const GOLD   = "#A98950";
const BROWN  = "#3D322A";
const CREME  = "#FAF6EF";
const BG_DARK = "#F0E8DA";

/* ─── Page ──────────────────────────────────────────────────────────── */

export default function MaisPage() {
  const params = useParams();
  const weddingId = params?.id as string;
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: CREME }}>
        <div className="w-7 h-7 border-[1.5px] border-t-transparent rounded-full animate-spin"
          style={{ borderColor: `${GOLD} transparent ${GOLD} ${GOLD}` }} />
      </div>
    );
  }
  if (!session) return null;

  const base = `/casamento/${weddingId}`;

  const services = [
    {
      category: "Cerimonialista / Assessor(a)",
      items: [
        { icon: "👩‍💼", label: "Conectar Cerimonialista", desc: "Vincule seu(a) assessor(a) para acompanhar lista, fornecedores e timeline", href: `${base}/cerimonialista`, available: true },
        { icon: "📋", label: "Questionários", desc: "Responda questionários de preferências da sua cerimonialista", href: `${base}/questionarios`, available: true },
        { icon: "💬", label: "Confirmação via WhatsApp", desc: "Serviço de confirmação 100% dos convidados via WhatsApp", href: `${base}/whatsapp-confirmacao`, available: true },
      ],
    },
    {
      category: "Conta Digital Laço",
      items: [
        { icon: "💳", label: "Conta do Casamento", desc: "Conta digital compartilhada entre os noivos para gerenciar gastos", href: `${base}/conta-casamento`, available: true },
        { icon: "📊", label: "Extrato de Gastos", desc: "Categorizado automaticamente — quanto gastou com cada fornecedor", href: `${base}/orcamento`, available: true },
        { icon: "💸", label: "Pix dos Presentes", desc: "Receba presentes em dinheiro direto na conta do casamento", href: `${base}/presentes`, available: true },
      ],
    },
    {
      category: "Serviços Premium",
      items: [
        { icon: "💳", label: "Maquininha de Casamento", desc: "Receba presentes e pagamentos com maquininha personalizada no dia", href: `${base}/maquininha`, available: true },
        { icon: "👔", label: "Gravata Premium", desc: "Identity Kit exclusivo — convite digital animado, menu, save the date", href: `${base}/identity-kit`, available: true },
      ],
    },
    {
      category: "Sua Conta",
      items: [
        { icon: "👤", label: "Perfil", desc: "Dados pessoais, notificações, preferências", href: "/perfil", available: true },
        { icon: "💍", label: "Dados do Casamento", desc: "Editar data, local, nomes, estilo", href: `${base}/conta-casamento`, available: true },
        { icon: "🤝", label: "Planejar Juntos", desc: "Convide o noivo/noiva para planejar juntos", href: "/dashboard", available: true },
      ],
    },
  ];

  return (
    <div className="min-h-screen pb-24" style={{ background: CREME }}>

      {/* ── Header ── */}
      <div className="px-5 pt-10 pb-6">
        <p className="text-[9px] tracking-[0.28em] uppercase mb-1"
          style={{ color: "rgba(61,50,42,0.36)", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
          Configurações e Serviços
        </p>
        <h1 className="text-[30px] font-light leading-tight mb-1"
          style={{ color: BROWN, fontFamily: "'Cormorant Garamond', serif" }}>
          Mais
        </h1>
        <p className="text-[12px] leading-relaxed" style={{ color: "rgba(61,50,42,0.58)" }}>
          Serviços, cerimonialista, conta digital e configurações.
        </p>
      </div>

      {/* ── Ornamental divider ── */}
      <div className="flex items-center gap-2.5 mx-5 mb-5">
        <div className="flex-1 h-px" style={{ background: "rgba(169,137,80,0.16)" }} />
        <div className="w-[5px] h-[5px] rotate-45 opacity-55 flex-shrink-0" style={{ background: GOLD }} />
        <div className="flex-1 h-px" style={{ background: "rgba(169,137,80,0.16)" }} />
      </div>

      <div className="px-5 space-y-5 pb-4">

        {/* ── Service sections ── */}
        {services.map((section) => (
          <div key={section.category}>
            <p className="text-[9.5px] tracking-[0.3em] uppercase pb-2.5"
              style={{ color: GOLD, fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
              {section.category}
            </p>
            <div className="rounded-2xl overflow-hidden"
              style={{ background: "white", border: "1.5px solid rgba(169,137,80,0.16)", boxShadow: "0 1px 6px rgba(61,50,42,0.05)" }}>
              {section.items.map((item, idx) => {
                const row = (
                  <div className="flex items-center gap-3.5 px-4 py-3.5">
                    <div className="w-[38px] h-[38px] rounded-xl flex items-center justify-center flex-shrink-0 text-[18px]"
                      style={{ background: item.available ? BG_DARK : "rgba(61,50,42,0.04)" }}>
                      <span style={{ filter: item.available ? "none" : "grayscale(1)", opacity: item.available ? 1 : 0.35 }}>
                        {item.icon}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] font-medium leading-tight"
                        style={{ color: item.available ? BROWN : "rgba(61,50,42,0.30)" }}>
                        {item.label}
                      </p>
                      <p className="text-[11px] mt-0.5 leading-snug"
                        style={{ color: item.available ? "rgba(61,50,42,0.50)" : "rgba(61,50,42,0.25)" }}>
                        {item.desc}
                      </p>
                    </div>
                    {item.available ? (
                      <span className="text-[18px] flex-shrink-0" style={{ color: "rgba(169,137,80,0.40)" }}>›</span>
                    ) : (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                          style={{ color: "rgba(61,50,42,0.25)" }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span className="text-[10px]" style={{ color: "rgba(61,50,42,0.28)", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>Breve</span>
                      </div>
                    )}
                  </div>
                );
                return (
                  <div key={item.label}
                    style={idx > 0 ? { borderTop: "1px solid rgba(169,137,80,0.09)" } : undefined}>
                    {item.available ? (
                      <Link href={item.href} className="block transition-colors active:bg-stone-50">
                        {row}
                      </Link>
                    ) : (
                      <div className="cursor-default">{row}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* ── Logout ── */}
        <div className="pt-1 pb-2">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full py-3 rounded-2xl text-[11.5px] tracking-[0.18em] uppercase transition-all active:scale-[0.98]"
            style={{
              fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300,
              border: "1.5px solid rgba(200,80,80,0.22)",
              color: "rgba(200,80,80,0.70)",
              background: "transparent",
            }}>
            Sair da conta
          </button>
        </div>

      </div>

      <BottomNav weddingId={weddingId} />
    </div>
  );
}
