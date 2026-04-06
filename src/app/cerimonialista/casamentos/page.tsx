"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import PlannerBottomNav from "@/components/planner-bottom-nav";

/* ─── Types ──────────────────────────────────────────────────────────── */

interface WeddingAssignment {
  assignmentId: string;
  role: string;
  status: string; // "ativo" | "concluido" | "cancelado"
  wedding: {
    id: string;
    partnerName1: string;
    partnerName2: string;
    weddingDate: string | null;
    venue: string | null;
    city: string | null;
    state: string | null;
    estimatedBudget: number | null;
  };
}

type FilterTab = "todos" | "ativos" | "concluidos";

/* ─── Helpers ────────────────────────────────────────────────────────── */

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function daysUntil(iso: string) {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
}

function statusBar(status: string) {
  switch (status) {
    case "ativo":     return "bg-green-500";
    case "concluido": return "bg-gray-400";
    case "cancelado": return "bg-red-500";
    default:          return "bg-gray-300";
  }
}

function statusBadge(status: string) {
  switch (status) {
    case "ativo":
      return { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-400", label: "Ativo" };
    case "concluido":
      return { bg: "bg-gray-50", text: "text-gray-500", dot: "bg-gray-300", label: "Concluído" };
    case "cancelado":
      return { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-400", label: "Cancelado" };
    default:
      return { bg: "bg-gray-50", text: "text-gray-500", dot: "bg-gray-300", label: status };
  }
}

/* ─── Icons ──────────────────────────────────────────────────────────── */

function PeopleIcon() {
  return (
    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <line x1="9" y1="12" x2="15" y2="12" />
      <line x1="9" y1="16" x2="13" y2="16" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

function HeartRingsIcon() {
  return (
    <svg className="w-16 h-16 text-midnight/20" fill="none" viewBox="0 0 64 64" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="22" cy="32" r="14" />
      <circle cx="42" cy="32" r="14" />
      <path d="M32 24c0-4.418 3.582-8 8-8s8 3.582 8 8c0 5-8 14-8 14s-8-9-8-14z" fill="currentColor" fillOpacity={0.12} />
      <path d="M24 24c0-4.418-3.582-8-8-8s-8 3.582-8 8c0 5 8 14 8 14s8-9 8-14z" fill="currentColor" fillOpacity={0.12} />
    </svg>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────── */

export default function CasamentosPage() {
  const { data: session, status: authStatus } = useSession();
  const [weddings, setWeddings] = useState<WeddingAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>("todos");

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    fetch("/api/planner/weddings")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setWeddings(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [authStatus]);

  /* ── Guards ─────────────────────────────────────────────────────────── */

  if (authStatus === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAF6EF" }}>
        <div className="w-7 h-7 border-[1.5px] border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "#A98950 transparent #A98950 #A98950" }} />
      </div>
    );
  }

  if (!session) return null;

  /* ── Filter logic ────────────────────────────────────────────────────── */

  const filtered = weddings.filter((w) => {
    if (activeTab === "ativos")    return w.status === "ativo";
    if (activeTab === "concluidos") return w.status === "concluido";
    return true;
  });

  const activeCount = weddings.filter((w) => w.status === "ativo").length;

  /* ── Tabs ────────────────────────────────────────────────────────────── */

  const TABS: { key: FilterTab; label: string }[] = [
    { key: "todos",      label: "Todos" },
    { key: "ativos",     label: "Ativos" },
    { key: "concluidos", label: "Concluídos" },
  ];

  /* ── Render ──────────────────────────────────────────────────────────── */

  return (
    <div style={{ background: "#FAF6EF" }} className="min-h-screen">

      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="px-5 pt-10 pb-4">
        <p className="text-[9px] tracking-[0.28em] uppercase mb-1"
          style={{ color: "rgba(61,50,42,0.36)", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
          Gestão
        </p>
        <h1 className="text-[30px] font-light leading-tight mb-1"
          style={{ color: "#3D322A", fontFamily: "'Cormorant Garamond', serif" }}>
          Casamentos
        </h1>
        <p className="text-[12px] leading-relaxed" style={{ color: "rgba(61,50,42,0.58)" }}>
          Todos os casamentos sob sua gestão
        </p>
      </div>
      <div className="flex items-center gap-2.5 mx-5 mb-6">
        <div className="flex-1 h-px" style={{ background: "rgba(169,137,80,0.16)" }} />
        <div className="w-[5px] h-[5px] rotate-45 opacity-55 flex-shrink-0" style={{ background: "#A98950" }} />
        <div className="flex-1 h-px" style={{ background: "rgba(169,137,80,0.16)" }} />
      </div>

      {/* ── Filter tabs ───────────────────────────────────────────────── */}
      <div className="px-4 mt-4 flex gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-1.5 rounded-full font-body text-sm font-medium transition-all duration-150 ${
              activeTab === tab.key
                ? "bg-midnight text-white shadow-sm"
                : "bg-white text-midnight/60 hover:text-midnight"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Cards list ────────────────────────────────────────────────── */}
      <div className="px-4 mt-4 space-y-3 pb-24">
        {filtered.length === 0 ? (
          /* ── Empty state ──────────────────────────────────────────── */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <HeartRingsIcon />
            <h2 className="font-heading text-xl text-midnight mt-5 mb-2">
              Nenhum casamento ainda
            </h2>
            <p className="font-body text-sm text-midnight/50 max-w-xs">
              Quando um casal aceitar o seu convite, aparecerá aqui.
            </p>
          </div>
        ) : (
          filtered.map((item) => {
            const { wedding } = item;
            const badge = statusBadge(item.status);
            const bar   = statusBar(item.status);
            const days  = wedding.weddingDate ? daysUntil(wedding.weddingDate) : null;
            const isFuture = days !== null && days > 0;

            return (
              <div
                key={item.assignmentId}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex"
              >
                {/* Left color bar */}
                <div className={`w-1 shrink-0 ${bar}`} />

                {/* Content */}
                <div className="flex-1 p-4 min-w-0">

                  {/* Couple name + status badge */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h2 className="font-heading text-lg text-midnight leading-snug">
                      {wedding.partnerName1} &amp; {wedding.partnerName2}
                    </h2>
                    <span
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-body font-medium shrink-0 ${badge.bg} ${badge.text}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                      {badge.label}
                    </span>
                  </div>

                  {/* Date + countdown */}
                  {wedding.weddingDate && (
                    <div className="flex items-center gap-2 mb-1.5">
                      <svg className="w-3.5 h-3.5 text-midnight/30 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      <span className="font-body text-sm text-midnight/60">
                        {formatDate(wedding.weddingDate)}
                      </span>
                      {isFuture && (
                        <span
                          className={`font-body text-xs font-semibold ${
                            days! <= 90 ? "text-gold" : "text-midnight/40"
                          }`}
                        >
                          {days} dias
                        </span>
                      )}
                    </div>
                  )}

                  {/* Venue / location */}
                  {(wedding.venue || wedding.city) && (
                    <p className="font-body text-xs text-midnight/50 mb-3 truncate">
                      {wedding.venue || ""}
                      {wedding.city
                        ? `${wedding.venue ? " · " : ""}${wedding.city}${wedding.state ? `/${wedding.state}` : ""}`
                        : ""}
                    </p>
                  )}

                  {/* Quick action buttons */}
                  <div className="flex items-center gap-2 flex-wrap mt-3 pt-3 border-t border-gray-100">
                    {/* Convidados */}
                    <Link
                      href={`/cerimonialista/casamento/${wedding.id}`}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-midnight/30 text-midnight text-xs font-body font-medium hover:bg-midnight/5 transition"
                    >
                      <PeopleIcon />
                      Convidados
                    </Link>

                    {/* Questionário */}
                    <Link
                      href={`/cerimonialista/casamento/${wedding.id}`}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gold/30 text-gold text-xs font-body font-medium hover:bg-gold/5 transition"
                    >
                      <ClipboardIcon />
                      Questionário
                    </Link>

                    {/* WhatsApp */}
                    <a
                      href="https://wa.me/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-green-200 text-green-600 text-xs font-body font-medium hover:bg-green-50 transition"
                    >
                      <WhatsAppIcon />
                      WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <PlannerBottomNav />
    </div>
  );
}
