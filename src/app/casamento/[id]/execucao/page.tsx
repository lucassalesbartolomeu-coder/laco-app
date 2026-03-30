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

function CheckIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
        { href: `${base}/convidados`, icon: "👥", label: "Lista de Convidados", desc: "Lista A/B/C, categorias, status RSVP e confirmacoes", badge: guestStats.total > 0 ? `${guestStats.total}` : null },
        { href: `${base}/importar`, icon: "📲", label: "Importar Contatos", desc: "Da agenda, CSV, ou manual", badge: null },
      ],
    },
    {
      category: "Financeiro",
      color: "bg-gold",
      items: [
        { href: `${base}/orcamento`, icon: "💰", label: "Orcamento Real", desc: "Custos reais vs estimados, parcelas, pagamentos", badge: null },
        { href: `${base}/presentes`, icon: "🎁", label: "Lista de Presentes", desc: "Presentes recebidos, valores, agradecimentos", badge: null },
      ],
    },
    {
      category: "Fornecedores e Contratos",
      color: "bg-midnight",
      items: [
        { href: `${base}/fornecedores`, icon: "🏢", label: "Meus Fornecedores", desc: "Contratos, orcamentos, status de cada fornecedor", badge: null },
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
      {/* Hero */}
      <div className="bg-gradient-to-br from-gold/90 via-gold to-gold/80 px-5 pt-12 pb-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <CheckIcon className="w-5 h-5 text-white/80" />
            <span className="font-body text-xs text-white/60 uppercase tracking-wider">Gestao e Acompanhamento</span>
          </div>
          <h1 className="font-heading text-3xl text-white mb-2">Organizar</h1>
          <p className="font-body text-sm text-white/70 max-w-md">
            Gerencie convidados, orcamento, fornecedores, contratos e o cronograma do grande dia.
          </p>
        </div>
      </div>

      {/* Quick stats bar */}
      {guestStats.total > 0 && (
        <div className="px-4 -mt-5 relative z-10 mb-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-body text-xs text-gray-400">Confirmacao de presenca</span>
              <span className="font-body text-xs font-semibold text-midnight">{pctConfirmed}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-midnight to-green-400 rounded-full transition-all duration-500"
                style={{ width: `${pctConfirmed}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="font-body text-[10px] text-gray-400">{guestStats.confirmed} confirmados</span>
              <span className="font-body text-[10px] text-gray-400">{guestStats.pending} pendentes</span>
              <span className="font-body text-[10px] text-gray-400">{guestStats.declined} recusados</span>
            </div>
          </div>
        </div>
      )}

      {/* Sections */}
      <div className="px-4 space-y-6" style={{ marginTop: guestStats.total > 0 ? undefined : "-1.25rem" }}>
        {sections.map((section) => (
          <div key={section.category}>
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className={`w-2 h-2 rounded-full ${section.color}`} />
              <h2 className="font-heading text-base text-midnight">{section.category}</h2>
            </div>
            <div className="space-y-2">
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md hover:border-midnight/20 transition-all active:scale-[0.98]"
                >
                  <span className="text-2xl flex-shrink-0">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm font-medium text-midnight">{item.label}</p>
                    <p className="font-body text-xs text-gray-400">{item.desc}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {item.badge && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-body font-semibold bg-midnight/10 text-midnight">
                        {item.badge}
                      </span>
                    )}
                    <ArrowIcon className="w-4 h-4 text-gray-300" />
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
