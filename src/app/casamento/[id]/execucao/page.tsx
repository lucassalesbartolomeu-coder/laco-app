"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import BottomNav from "@/components/bottom-nav";

// ── Design tokens ─────────────────────────────────────────────────
const GOLD    = "#A98950";
const BROWN   = "#3D322A";
const CREME   = "#FAF6EF";
const BG_DARK = "#F0E8DA";

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

      {/* ── Header ── */}
      <div className="px-5 pt-10 pb-6">
        <p className="text-[9px] tracking-[0.28em] uppercase mb-1"
          style={{ color: "rgba(61,50,42,0.36)", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
          Gestão e Acompanhamento
        </p>
        <h1 className="text-[30px] font-light leading-tight mb-1"
          style={{ color: BROWN, fontFamily: "'Cormorant Garamond', serif" }}>
          Organizar
        </h1>
        <p className="text-[12px] leading-relaxed" style={{ color: "rgba(61,50,42,0.58)" }}>
          Convidados, orçamento, fornecedores, contratos e o cronograma do grande dia.
        </p>
      </div>

      {/* ── Ornamental divider ── */}
      <div className="flex items-center gap-2.5 mx-5 mb-5">
        <div className="flex-1 h-px" style={{ background: "rgba(169,137,80,0.16)" }} />
        <div className="w-[5px] h-[5px] rotate-45 opacity-55 flex-shrink-0" style={{ background: GOLD }} />
        <div className="flex-1 h-px" style={{ background: "rgba(169,137,80,0.16)" }} />
      </div>

      <div className="px-5 space-y-5 pb-4">

        {/* ── RSVP mini card (only when guestStats.total > 0) ── */}
        {guestStats.total > 0 && (
          <div className="rounded-2xl p-4"
            style={{ background: "white", border: "1.5px solid rgba(169,137,80,0.16)", boxShadow: "0 1px 6px rgba(61,50,42,0.05)" }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[9.5px] tracking-[0.3em] uppercase"
                style={{ color: GOLD, fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
                Confirmação de presença
              </p>
              <p className="text-[20px] font-light" style={{ color: GOLD, fontFamily: "'Cormorant Garamond', serif" }}>
                {pctConfirmed}%
              </p>
            </div>
            <div className="w-full h-[4px] rounded-full overflow-hidden mb-2" style={{ background: BG_DARK }}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pctConfirmed}%`, background: `linear-gradient(90deg, ${GOLD}, #D4B888)` }} />
            </div>
            <div className="flex justify-between">
              <span className="text-[10.5px]" style={{ color: "rgba(61,50,42,0.36)" }}>{guestStats.confirmed} confirmados</span>
              <span className="text-[10.5px]" style={{ color: "rgba(61,50,42,0.36)" }}>{guestStats.pending} pendentes</span>
              <span className="text-[10.5px]" style={{ color: "rgba(61,50,42,0.36)" }}>{guestStats.declined} recusados</span>
            </div>
          </div>
        )}

        {/* ── Sections ── */}
        {sections.map((section) => (
          <div key={section.category}>
            <p className="text-[9.5px] tracking-[0.3em] uppercase pb-2.5"
              style={{ color: GOLD, fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
              {section.category}
            </p>
            <div className="rounded-2xl overflow-hidden"
              style={{ background: "white", border: "1.5px solid rgba(169,137,80,0.16)", boxShadow: "0 1px 6px rgba(61,50,42,0.05)" }}>
              {section.items.map((item, idx) => (
                <div key={item.href} style={idx > 0 ? { borderTop: "1px solid rgba(169,137,80,0.09)" } : undefined}>
                  <Link href={item.href}
                    className="flex items-center gap-3.5 px-4 py-3.5 transition-colors active:bg-stone-50">
                    <div className="w-[38px] h-[38px] rounded-xl flex items-center justify-center flex-shrink-0 text-[18px]"
                      style={{ background: BG_DARK }}>
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] font-medium leading-tight" style={{ color: BROWN }}>
                        {item.label}
                      </p>
                      <p className="text-[11px] mt-0.5 leading-snug" style={{ color: "rgba(61,50,42,0.36)" }}>
                        {item.desc}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {item.badge && (
                        <span className="text-[9px] tracking-[0.06em] px-2 py-0.5 rounded-md"
                          style={{ background: "rgba(169,137,80,0.11)", color: GOLD,
                          fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
                          {item.badge}
                        </span>
                      )}
                      <span className="text-[18px]" style={{ color: "rgba(169,137,80,0.40)" }}>›</span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ))}

      </div>

      <BottomNav weddingId={weddingId} />
    </div>
  );
}
