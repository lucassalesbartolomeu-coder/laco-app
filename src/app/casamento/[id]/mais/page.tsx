"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import BottomNav from "@/components/bottom-nav";

// ── Design tokens ─────────────────────────────────────────────────
const GOLD  = "#A98950";
const BROWN = "#3D322A";
const CREME = "#FAF6EF";

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

      {/* ── Hero header ── */}
      <div className="relative overflow-hidden px-5 pt-12 pb-10"
        style={{ background: `linear-gradient(135deg, ${BROWN} 0%, #2A2019 100%)` }}>
        <div className="absolute top-4 right-0 w-48 h-48 rounded-full blur-3xl pointer-events-none"
          style={{ background: "rgba(169,137,80,0.18)" }} />
        <div className="absolute -bottom-4 left-0 w-32 h-32 rounded-full blur-3xl pointer-events-none"
          style={{ background: "rgba(169,137,80,0.10)" }} />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: GOLD }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="text-[9px] tracking-[0.26em] uppercase"
              style={{ color: GOLD, fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
              Configurações e Serviços
            </span>
          </div>
          <h1 className="text-4xl font-light text-white mb-1 leading-tight"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Mais
          </h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.62)" }}>
            Serviços, cerimonialista, conta e configurações
          </p>
        </div>
      </div>

      {/* ── Sections ── */}
      <div className="px-4 -mt-4 relative z-10 space-y-6 pb-4">
        {services.map((section) => (
          <div key={section.category}>
            <h2 className="text-[9.5px] tracking-[0.28em] uppercase mb-3 px-1"
              style={{ color: GOLD, fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
              {section.category}
            </h2>
            <div className="rounded-2xl overflow-hidden"
              style={{ background: "white", border: "1px solid rgba(169,137,80,0.14)", boxShadow: "0 1px 6px rgba(61,50,42,0.05)" }}>
              {section.items.map((item, idx) => {
                const inner = (
                  <div className="flex items-center gap-4 px-4 py-3.5">
                    <span className={`text-xl flex-shrink-0 ${!item.available ? "grayscale opacity-40" : ""}`}>
                      {item.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-tight"
                        style={{ color: item.available ? BROWN : "rgba(61,50,42,0.35)" }}>
                        {item.label}
                      </p>
                      <p className="text-xs leading-snug mt-0.5"
                        style={{ color: item.available ? "rgba(61,50,42,0.52)" : "rgba(61,50,42,0.30)" }}>
                        {item.desc}
                      </p>
                    </div>
                    {item.available ? (
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                        style={{ color: "rgba(169,137,80,0.35)" }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    ) : (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                          style={{ color: "rgba(61,50,42,0.25)" }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span className="text-[10px]" style={{ color: "rgba(61,50,42,0.28)" }}>Breve</span>
                      </div>
                    )}
                  </div>
                );

                return (
                  <div key={item.label}
                    style={idx > 0 ? { borderTop: "1px solid rgba(169,137,80,0.08)" } : undefined}>
                    {item.available ? (
                      <Link href={item.href}
                        className="block transition-colors duration-100"
                        style={{ background: "transparent" }}>
                        {inner}
                      </Link>
                    ) : (
                      <div className="cursor-default">{inner}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* ── Logout ── */}
        <div className="pt-2">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full py-3 rounded-2xl text-sm transition-all active:scale-[0.98]"
            style={{ border: "1px solid rgba(200,80,80,0.20)", color: "rgba(200,80,80,0.70)", background: "transparent" }}
          >
            Sair da conta
          </button>
        </div>
      </div>

      <BottomNav weddingId={weddingId} />
    </div>
  );
}
