"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import BottomNav from "@/components/bottom-nav";

// ── Design tokens ─────────────────────────────────────────────────
const GOLD  = "#A98950";
const BROWN = "#3D322A";
const CREME = "#FAF6EF";

/* ─── Types ─────────────────────────────────────────────────────────── */

interface GuestStats {
  total: number;
  confirmed: number;
  pending: number;
  declined: number;
}

/* ─── Page ──────────────────────────────────────────────────────────── */

export default function ExecucaoPage() {
  const params = useParams();
  const weddingId = params?.id as string;
  const { data: session, status } = useSession();

  const [guestStats, setGuestStats] = useState<GuestStats>({ total: 0, confirmed: 0, pending: 0, declined: 0 });

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`/api/weddings/${weddingId}/guests/stats`);
      if (res.ok) {
        const data = await res.json();
        setGuestStats(data);
      }
    } catch { /* ignore */ }
  }, [weddingId]);

  useEffect(() => {
    if (status === "authenticated") fetchStats();
  }, [status, fetchStats]);

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
  const pctConfirmed = guestStats.total > 0 ? Math.round((guestStats.confirmed / guestStats.total) * 100) : 0;

  const sections = [
    {
      category: "Convidados",
      items: [
        { href: `${base}/convidados`, icon: "👥", label: "Lista de Convidados", desc: "Lista A/B/C, categorias, status RSVP e confirmações", badge: guestStats.total > 0 ? `${guestStats.total}` : null },
        { href: `${base}/whatsapp-confirmacao`, icon: "💌", label: "Enviar Convite / Save the Date", desc: "Disparo com 1 clique para os grupos que você definir", badge: null },
      ],
    },
    {
      category: "Financeiro",
      items: [
        { href: `${base}/orcamento`, icon: "💰", label: "Orçamento Real", desc: "Custos reais vs estimados, parcelas, pagamentos", badge: null },
        { href: `${base}/presentes`, icon: "🎁", label: "Lista de Presentes", desc: "Presentes recebidos, valores, agradecimentos", badge: null },
      ],
    },
    {
      category: "Fornecedores e Contratos",
      items: [
        { href: `${base}/fornecedores`, icon: "🏢", label: "Meus Fornecedores", desc: "Contratos, orçamentos, status de cada fornecedor", badge: null },
        { href: `${base}/contratos`, icon: "📝", label: "Contratos", desc: "Contratos digitais com assinatura dupla", badge: null },
      ],
    },
    {
      category: "Dia D",
      items: [
        { href: `${base}/timeline`, icon: "🗓️", label: "Timeline do Dia", desc: "Cronograma completo do grande dia, passo a passo", badge: null },
      ],
    },
    {
      category: "Lua de Mel",
      items: [
        { href: `${base}/lua-de-mel`, icon: "✈️", label: "Planejar Lua de Mel", desc: "Destinos, pacotes e dicas para a viagem dos sonhos", badge: null },
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <span className="text-[9px] tracking-[0.26em] uppercase"
              style={{ color: GOLD, fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
              Gestão e Acompanhamento
            </span>
          </div>
          <h1 className="text-4xl font-light text-white mb-2 leading-tight"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Organizar
          </h1>
          <p className="text-sm leading-relaxed max-w-md"
            style={{ color: "rgba(255,255,255,0.62)" }}>
            Gerencie convidados, orçamento, fornecedores, contratos e o cronograma do grande dia.
          </p>
        </div>
      </div>

      {/* ── Guest stats bar ── */}
      {guestStats.total > 0 && (
        <div className="px-4 -mt-4 relative z-10 mb-4">
          <div className="rounded-2xl p-4"
            style={{ background: "white", border: "1px solid rgba(169,137,80,0.14)", boxShadow: "0 2px 12px rgba(61,50,42,0.07)" }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[9.5px] tracking-[0.24em] uppercase"
                style={{ color: GOLD, fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
                Confirmação de presença
              </span>
              <span className="text-sm font-medium" style={{ color: BROWN,  fontFamily: "'Cormorant Garamond', serif", fontSize: "18px" }}>
                {pctConfirmed}%
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "rgba(169,137,80,0.10)" }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pctConfirmed}%`, background: `linear-gradient(90deg, ${GOLD}, #E8D5B0)` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px]" style={{ color: "rgba(61,50,42,0.48)" }}>{guestStats.confirmed} confirmados</span>
              <span className="text-[10px]" style={{ color: "rgba(61,50,42,0.48)" }}>{guestStats.pending} pendentes</span>
              <span className="text-[10px]" style={{ color: "rgba(61,50,42,0.48)" }}>{guestStats.declined} recusados</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Sections ── */}
      <div className="px-4 space-y-7 pb-4" style={{ marginTop: guestStats.total > 0 ? undefined : "-1rem" }}>
        {sections.map((section) => (
          <div key={section.category}>
            <h2 className="text-[9.5px] tracking-[0.28em] uppercase mb-3 px-1"
              style={{ color: GOLD, fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
              {section.category}
            </h2>
            <div className="space-y-2">
              {section.items.map((item) => (
                <Link key={item.href} href={item.href}
                  className="flex items-center gap-4 rounded-2xl p-4 transition-all active:scale-[0.98]"
                  style={{ background: "white", border: "1px solid rgba(169,137,80,0.14)", boxShadow: "0 1px 6px rgba(61,50,42,0.05)" }}>
                  <span className="text-2xl flex-shrink-0">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: BROWN }}>{item.label}</p>
                    <p className="text-xs leading-snug mt-0.5" style={{ color: "rgba(61,50,42,0.52)" }}>{item.desc}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {item.badge && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                        style={{ background: "rgba(169,137,80,0.10)", color: GOLD }}>
                        {item.badge}
                      </span>
                    )}
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                      style={{ color: "rgba(169,137,80,0.35)" }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <BottomNav weddingId={weddingId} />
    </div>
  );
}
