"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import BottomNav from "@/components/bottom-nav";

/* ─── Types ─────────────────────────────────────────────────────────── */

interface GuestStats {
  total: number;
  confirmed: number;
  pending: number;
  declined: number;
}

/* ─── Icons ─────────────────────────────────────────────────────────── */

function ArrowIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}


function CheckCircleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m7 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────── */

export default function ExecucaoPage() {
  const params = useParams();
  const weddingId = params.id as string;
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
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-midnight border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!session) return null;

  const base = `/casamento/${weddingId}`;
  const pctConfirmed = guestStats.total > 0 ? Math.round((guestStats.confirmed / guestStats.total) * 100) : 0;

  const sections = [
    {
      category: "Convidados",
      color: "bg-midnight",
      items: [
        { href: `${base}/convidados`, icon: "👥", label: "Lista de Convidados", desc: "Lista A/B/C, categorias, status RSVP e confirmações", badge: guestStats.total > 0 ? `${guestStats.total}` : null },
        { href: `${base}/whatsapp-confirmacao`, icon: "💌", label: "Enviar Convite / Save the Date", desc: "Disparo com 1 clique para os grupos que você definir", badge: null },
      ],
    },
    {
      category: "Financeiro",
      color: "bg-gold",
      items: [
        { href: `${base}/orcamento`, icon: "💰", label: "Orçamento Real", desc: "Custos reais vs estimados, parcelas, pagamentos", badge: null },
        { href: `${base}/presentes`, icon: "🎁", label: "Lista de Presentes", desc: "Presentes recebidos, valores, agradecimentos", badge: null },
      ],
    },
    {
      category: "Fornecedores e Contratos",
      color: "bg-midnight",
      items: [
        { href: `${base}/fornecedores`, icon: "🏢", label: "Meus Fornecedores", desc: "Contratos, orçamentos, status de cada fornecedor", badge: null },
        { href: `${base}/contratos`, icon: "📝", label: "Contratos", desc: "Contratos digitais com assinatura dupla", badge: null },
      ],
    },
    {
      category: "Dia D",
      color: "bg-midnight",
      items: [
        { href: `${base}/timeline`, icon: "🗓️", label: "Timeline do Dia", desc: "Cronograma completo do grande dia, passo a passo", badge: null },
      ],
    },
    {
      category: "Lua de Mel",
      color: "bg-gold",
      items: [
        { href: `${base}/lua-de-mel`, icon: "✈️", label: "Planejar Lua de Mel", desc: "Destinos, pacotes e dicas para a viagem dos sonhos", badge: null },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-ivory pb-24">
      {/* Header with gradient */}
      <div className="bg-gradient-to-br from-midnight via-midnight to-midnight/95 px-5 pt-12 pb-10 relative overflow-hidden">
        {/* Decorative gold blur accent */}
        <div className="absolute top-8 right-0 w-40 h-40 bg-gold/10 rounded-full blur-3xl" />
        {/* Dot pattern */}
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircleIcon className="w-5 h-5 text-gold" />
            <span className="font-body text-[10px] font-medium tracking-[0.2em] uppercase text-gold">Gestão e Acompanhamento</span>
          </div>
          <h1 className="font-heading text-3xl font-bold text-white mb-2">Organizar</h1>
          <p className="font-body text-sm text-white/70 max-w-md leading-relaxed">
            Gerencie convidados, orçamento, fornecedores, contratos e o cronograma do grande dia.
          </p>
        </div>
      </div>

      {/* Quick stats bar */}
      {guestStats.total > 0 && (
        <div className="px-4 -mt-5 relative z-10 mb-6">
          <div className="bg-white rounded-2xl border border-midnight/8 shadow-card p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-body text-[10px] font-medium tracking-[0.1em] uppercase text-gold">Confirmação de presença</span>
              <span className="font-body text-sm font-semibold text-midnight">{pctConfirmed}%</span>
            </div>
            <div className="w-full h-3 bg-fog rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-gold to-champagne rounded-full transition-all duration-500"
                style={{ width: `${pctConfirmed}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="font-body text-[10px] text-stone">{guestStats.confirmed} confirmados</span>
              <span className="font-body text-[10px] text-stone">{guestStats.pending} pendentes</span>
              <span className="font-body text-[10px] text-stone">{guestStats.declined} recusados</span>
            </div>
          </div>
        </div>
      )}

      {/* Sections */}
      <div className="px-4 space-y-7 pb-4" style={{ marginTop: guestStats.total > 0 ? undefined : "-1.25rem" }}>
        {sections.map((section) => (
          <div key={section.category}>
            <h2 className="font-body text-[10px] font-medium tracking-[0.2em] uppercase text-gold mb-3 px-1">
              {section.category}
            </h2>
            <div className="space-y-2">
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-4 bg-white rounded-2xl border border-midnight/8 shadow-card p-4 hover:shadow-md hover:border-midnight/15 transition-all duration-150 active:scale-[0.98]"
                >
                  <span className="text-2xl flex-shrink-0">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm font-semibold text-midnight">{item.label}</p>
                    <p className="font-body text-xs text-stone leading-snug">{item.desc}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {item.badge && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-body font-semibold bg-midnight/10 text-midnight">
                        {item.badge}
                      </span>
                    )}
                    <ArrowIcon className="w-5 h-5 text-midnight/20" />
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
