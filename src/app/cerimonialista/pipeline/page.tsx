"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";

interface Opportunity {
  id: string;
  coupleName: string;
  contactPhone: string | null;
  contactEmail: string | null;
  weddingDate: string | null;
  venue: string | null;
  estimatedBudget: number | null;
  source: string;
  stage: string;
  notes: string | null;
  lostReason: string | null;
  commissionEstimate: number | null;
  createdAt: string;
  updatedAt: string;
}

const STAGES = [
  { key: "lead", label: "Lead" },
  { key: "qualificado", label: "Qualificado" },
  { key: "proposta", label: "Proposta Enviada" },
  { key: "fechado", label: "Fechado" },
  { key: "perdido", label: "Perdido" },
];

const STAGE_BORDER: Record<string, string> = {
  lead: "border-gray-300",
  qualificado: "border-teal",
  proposta: "border-copper",
  fechado: "border-green-500",
  perdido: "border-red-300",
};

const STAGE_ACCENT: Record<string, string> = {
  lead: "from-gray-300/80 to-gray-300/10",
  qualificado: "from-teal/60 to-teal/10",
  proposta: "from-copper/60 to-copper/10",
  fechado: "from-green-500/60 to-green-500/10",
  perdido: "from-red-300/80 to-red-300/10",
};

const STAGE_BADGE: Record<string, string> = {
  lead: "bg-gray-200 text-gray-600",
  qualificado: "bg-teal/10 text-teal",
  proposta: "bg-copper/10 text-copper",
  fechado: "bg-green-100 text-green-700",
  perdido: "bg-red-100 text-red-500",
};

const STAGE_DOT: Record<string, string> = {
  lead: "bg-gray-300",
  qualificado: "bg-teal",
  proposta: "bg-copper",
  fechado: "bg-green-500",
  perdido: "bg-red-300",
};

const SOURCE_LABEL: Record<string, string> = {
  indicacao: "Indicação",
  instagram: "Instagram",
  site: "Site",
  whatsapp: "WhatsApp",
  evento: "Evento",
  outro: "Outro",
};

const SOURCES = ["indicacao", "instagram", "site", "whatsapp", "evento", "outro"];

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function formatCurrency(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

function formatWeddingDate(iso: string): string {
  const d = new Date(iso);
  const day = d.getUTCDate();
  const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const year = d.getUTCFullYear();
  return `${day} ${monthNames[d.getUTCMonth()]} ${year}`;
}

function daysUntilWedding(iso: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const wedding = new Date(iso);
  wedding.setHours(0, 0, 0, 0);
  return Math.ceil((wedding.getTime() - today.getTime()) / 86_400_000);
}

function cardBorderColor(opp: Opportunity): string {
  if (opp.weddingDate) {
    const days = daysUntilWedding(opp.weddingDate);
    if (days < 7) return "border-red-500";
    if (days < 30) return "border-copper";
  }
  return STAGE_BORDER[opp.stage] ?? "border-gray-200";
}

function whatsappLink(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}`;
}

function getWeddingMonth(iso: string): number {
  return new Date(iso).getUTCMonth();
}

function budgetBand(budget: number | null): string {
  if (budget === null) return "none";
  if (budget < 30000) return "lt30";
  if (budget < 60000) return "30to60";
  return "gt60";
}

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current shrink-0">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export default function PipelinePage() {
  const { status: authStatus } = useSession();
  const [opps, setOpps] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterMonth, setFilterMonth] = useState<string>("all");
  const [filterBudget, setFilterBudget] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>(STAGES[0].key);

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formCoupleName, setFormCoupleName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formBudget, setFormBudget] = useState("");
  const [formSource, setFormSource] = useState("indicacao");
  const [formVenue, setFormVenue] = useState("");
  const [formDate, setFormDate] = useState("");

  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const [lostModal, setLostModal] = useState<{ oppId: string; coupleName: string } | null>(null);
  const [lostReason, setLostReason] = useState("");
  const [movingTo, setMovingTo] = useState<string | null>(null);

  const fetchOpps = useCallback(async () => {
    const res = await fetch("/api/planner/opportunities");
    if (res.ok) setOpps(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authStatus === "authenticated") fetchOpps();
  }, [authStatus, fetchOpps]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdownId(null);
      }
    }
    if (openDropdownId) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [openDropdownId]);

  function resetForm() {
    setFormCoupleName("");
    setFormPhone("");
    setFormEmail("");
    setFormBudget("");
    setFormSource("indicacao");
    setFormVenue("");
    setFormDate("");
  }

  async function handleCreate() {
    if (!formCoupleName.trim()) return;
    setSubmitting(true);
    const res = await fetch("/api/planner/opportunities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        coupleName: formCoupleName.trim(),
        contactPhone: formPhone || undefined,
        contactEmail: formEmail || undefined,
        estimatedBudget: formBudget ? Number(formBudget) : undefined,
        source: formSource,
        venue: formVenue || undefined,
        weddingDate: formDate || undefined,
      }),
    });
    if (res.ok) {
      const newOpp = await res.json();
      setOpps((prev) => [newOpp, ...prev]);
      setModalOpen(false);
      resetForm();
    }
    setSubmitting(false);
  }

  async function moveToStage(oppId: string, newStage: string) {
    setOpenDropdownId(null);
    if (newStage === "perdido") {
      const opp = opps.find((o) => o.id === oppId);
      if (opp) {
        setLostModal({ oppId, coupleName: opp.coupleName });
        setLostReason("");
      }
      return;
    }
    setMovingTo(oppId + ":" + newStage);
    const res = await fetch(`/api/planner/opportunities/${oppId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: newStage }),
    });
    if (res.ok) {
      setOpps((prev) => prev.map((o) => (o.id === oppId ? { ...o, stage: newStage } : o)));
      setSelectedOpp((prev) => (prev?.id === oppId ? { ...prev, stage: newStage } : prev));
    }
    setMovingTo(null);
  }

  async function confirmLost() {
    if (!lostModal) return;
    const res = await fetch(`/api/planner/opportunities/${lostModal.oppId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: "perdido", lostReason }),
    });
    if (res.ok) {
      setOpps((prev) =>
        prev.map((o) =>
          o.id === lostModal.oppId ? { ...o, stage: "perdido", lostReason } : o
        )
      );
      setSelectedOpp((prev) =>
        prev?.id === lostModal.oppId ? { ...prev, stage: "perdido", lostReason } : prev
      );
      setLostModal(null);
    }
  }

  if (authStatus === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const inputClass =
    "w-full px-4 py-2.5 border border-gray-200 rounded-xl font-body text-verde-noite focus:border-teal focus:ring-1 focus:ring-teal outline-none transition bg-white";

  const filteredOpps = opps.filter((o) => {
    if (search.trim() && !o.coupleName.toLowerCase().includes(search.trim().toLowerCase())) return false;
    if (filterMonth !== "all") {
      if (!o.weddingDate) return false;
      if (getWeddingMonth(o.weddingDate) !== Number(filterMonth)) return false;
    }
    if (filterBudget !== "all") {
      if (budgetBand(o.estimatedBudget) !== filterBudget) return false;
    }
    return true;
  });

  function renderCard(opp: Opportunity) {
    const borderColor = cardBorderColor(opp);
    const daysLeft = opp.weddingDate ? daysUntilWedding(opp.weddingDate) : null;
    const isUrgent = daysLeft !== null && daysLeft < 7;
    const isWarning = daysLeft !== null && daysLeft >= 7 && daysLeft < 30;
    const isDropdownOpen = openDropdownId === opp.id;
    const isMoveLoading = movingTo?.startsWith(opp.id + ":");

    return (
      <div
        key={opp.id}
        className={`relative bg-white rounded-xl shadow-card border-l-4 ${borderColor} hover:shadow-card-hover transition-all duration-150`}
      >
        <button
          onClick={() => setSelectedOpp(opp)}
          className="w-full text-left px-3 pt-3 pb-2 focus:outline-none focus:ring-2 focus:ring-teal/30 rounded-xl"
        >
          <p className="font-heading text-sm font-semibold text-verde-noite mb-1.5 truncate pr-1">
            {opp.coupleName}
          </p>

          {opp.weddingDate && (
            <p
              className={`font-body text-xs mb-1 flex items-center gap-1 ${
                isUrgent
                  ? "text-red-500 font-semibold"
                  : isWarning
                  ? "text-copper font-medium"
                  : "text-verde-noite/50"
              }`}
            >
              <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
              </svg>
              {formatWeddingDate(opp.weddingDate)}
              {daysLeft !== null && daysLeft >= 0 && (
                <span className="ml-0.5">({daysLeft}d)</span>
              )}
            </p>
          )}

          {opp.estimatedBudget != null && (
            <p className="font-body text-xs text-teal font-medium mb-2">
              {formatCurrency(opp.estimatedBudget)}
            </p>
          )}

          <div className="flex items-center justify-between">
            <span className="inline-block font-body text-[10px] px-2 py-0.5 rounded-full bg-verde-noite/6 text-verde-noite/50 border border-verde-noite/8">
              {SOURCE_LABEL[opp.source] ?? opp.source}
            </span>
            {opp.contactPhone && (
              <a
                href={whatsappLink(opp.contactPhone)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-[10px] text-green-600 hover:text-green-700 transition font-body font-medium"
                title={`WhatsApp: ${opp.contactPhone}`}
              >
                <WhatsAppIcon />
                WA
              </a>
            )}
          </div>
        </button>

        <div className="flex items-center justify-end px-3 pb-2.5 pt-0.5 border-t border-gray-100 mt-1 relative">
          {isMoveLoading ? (
            <div className="w-3.5 h-3.5 border-2 border-teal border-t-transparent rounded-full animate-spin mr-1" />
          ) : (
            <div className="relative" ref={isDropdownOpen ? dropdownRef : null}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDropdownId(isDropdownOpen ? null : opp.id);
                }}
                className="flex items-center gap-1 font-body text-[11px] text-verde-noite/50 hover:text-teal transition px-2 py-1 rounded-lg hover:bg-teal/5"
                aria-label="Mover para outra etapa"
              >
                Mover
                <svg
                  className={`w-3 h-3 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="absolute bottom-full right-0 mb-1.5 bg-white rounded-xl shadow-float border border-gray-100 py-1 min-w-[160px] z-30 animate-scale-in">
                  {STAGES.filter((s) => s.key !== opp.stage).map((s) => (
                    <button
                      key={s.key}
                      onClick={(e) => {
                        e.stopPropagation();
                        moveToStage(opp.id, s.key);
                      }}
                      className="w-full text-left px-4 py-2 font-body text-xs text-verde-noite hover:bg-cream hover:text-teal transition flex items-center gap-2"
                    >
                      <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${STAGE_DOT[s.key]}`} />
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderColumn(stage: typeof STAGES[number]) {
    const stageOpps = filteredOpps.filter((o) => o.stage === stage.key);
    const totalValue = stageOpps.reduce((s, o) => s + (o.estimatedBudget ?? 0), 0);

    return (
      <div
        key={stage.key}
        className="min-w-[280px] max-w-[300px] w-[290px] shrink-0 flex flex-col bg-cream rounded-2xl shadow-sm"
      >
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-heading text-sm font-semibold text-verde-noite">{stage.label}</h3>
            <span className={`font-body text-xs px-2 py-0.5 rounded-full font-medium ${STAGE_BADGE[stage.key]}`}>
              {stageOpps.length}
            </span>
          </div>
          <p className="font-body text-[11px] text-verde-noite/50">
            {stageOpps.length === 1 ? "1 oportunidade" : `${stageOpps.length} oportunidades`}
            {totalValue > 0 && (
              <span className="text-teal font-medium">
                {" · "}
                {formatCurrency(totalValue)}
              </span>
            )}
          </p>
          <div className={`mt-2 h-0.5 bg-gradient-to-r ${STAGE_ACCENT[stage.key]} rounded-full`} />
        </div>

        <div className="px-3 pb-4 space-y-2.5 min-h-[80px] flex-1 overflow-y-auto max-h-[calc(100vh-260px)]">
          {stageOpps.length === 0 ? (
            <div className="py-6 text-center">
              <p className="font-body text-xs text-verde-noite/25">Nenhuma oportunidade</p>
            </div>
          ) : (
            stageOpps.map((opp) => renderCard(opp))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-off-white min-h-screen">

      {/* Cabeçalho */}
      <div className="px-4 pt-5 pb-3 lg:px-8 lg:pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h1 className="font-heading text-2xl lg:text-3xl text-verde-noite">Pipeline CRM</h1>
          <button
            onClick={() => { resetForm(); setModalOpen(true); }}
            className="shrink-0 px-4 py-2.5 bg-copper text-white rounded-xl font-body text-sm font-medium hover:bg-copper/90 transition"
          >
            + Nova oportunidade
          </button>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[160px] flex-1 max-w-xs">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-verde-noite/30 pointer-events-none"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
            >
              <circle cx="11" cy="11" r="8" />
              <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar casal…"
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl font-body text-sm text-verde-noite focus:border-teal focus:ring-1 focus:ring-teal outline-none transition bg-white"
            />
          </div>

          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl font-body text-sm text-verde-noite bg-white focus:border-teal focus:ring-1 focus:ring-teal outline-none transition appearance-none cursor-pointer"
          >
            <option value="all">Todos os meses</option>
            {MONTHS.map((m, i) => (
              <option key={i} value={String(i)}>{m}</option>
            ))}
          </select>

          <select
            value={filterBudget}
            onChange={(e) => setFilterBudget(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl font-body text-sm text-verde-noite bg-white focus:border-teal focus:ring-1 focus:ring-teal outline-none transition appearance-none cursor-pointer"
          >
            <option value="all">Todos os orçamentos</option>
            <option value="lt30">Até R$ 30.000</option>
            <option value="30to60">R$ 30.000 – R$ 60.000</option>
            <option value="gt60">Acima de R$ 60.000</option>
          </select>
        </div>
      </div>

      {/* Mobile: Tabs de etapas */}
      <div className="lg:hidden border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="flex overflow-x-auto px-4 gap-0.5 py-1" style={{ scrollbarWidth: "none" }}>
          {STAGES.map((stage) => {
            const count = filteredOpps.filter((o) => o.stage === stage.key).length;
            const isActive = activeTab === stage.key;
            return (
              <button
                key={stage.key}
                onClick={() => setActiveTab(stage.key)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-t-lg font-body text-xs font-medium transition whitespace-nowrap border-b-2 ${
                  isActive
                    ? "border-teal text-teal bg-teal/5"
                    : "border-transparent text-verde-noite/50 hover:text-verde-noite hover:bg-gray-50"
                }`}
              >
                {stage.label}
                {count > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                      isActive ? "bg-teal text-white" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop: colunas lado a lado */}
      <div className="hidden lg:flex gap-4 overflow-x-auto px-8 pb-8 flex-1 items-start pt-4">
        {STAGES.map((stage) => renderColumn(stage))}
      </div>

      {/* Mobile: coluna da tab ativa */}
      <div className="lg:hidden px-4 pb-8 pt-4 flex-1">
        {STAGES.filter((s) => s.key === activeTab).map((stage) => {
          const stageOpps = filteredOpps.filter((o) => o.stage === stage.key);
          const totalValue = stageOpps.reduce((s, o) => s + (o.estimatedBudget ?? 0), 0);
          return (
            <div key={stage.key}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="font-heading text-lg text-verde-noite">{stage.label}</h2>
                  <p className="font-body text-xs text-verde-noite/50">
                    {stageOpps.length === 1 ? "1 oportunidade" : `${stageOpps.length} oportunidades`}
                    {totalValue > 0 && (
                      <span className="text-teal font-medium">
                        {" · "}
                        {formatCurrency(totalValue)}
                      </span>
                    )}
                  </p>
                </div>
                <span className={`font-body text-xs px-2.5 py-1 rounded-full font-semibold ${STAGE_BADGE[stage.key]}`}>
                  {stageOpps.length}
                </span>
              </div>

              {stageOpps.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="font-body text-sm text-verde-noite/30">Nenhuma oportunidade nesta etapa</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stageOpps.map((opp) => renderCard(opp))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Painel lateral / bottom sheet de detalhes */}
      {selectedOpp && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={() => setSelectedOpp(null)}
          />
          <aside className="fixed z-50 bg-cream shadow-float flex flex-col bottom-0 left-0 right-0 max-h-[90vh] rounded-t-2xl overflow-y-auto lg:bottom-auto lg:right-0 lg:top-0 lg:left-auto lg:h-full lg:w-full lg:max-w-sm lg:max-h-none lg:rounded-none lg:rounded-l-2xl animate-slide-up">
            <div className="lg:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            <div className="flex items-center justify-between px-6 pt-4 pb-4 border-b border-gray-200">
              <h2 className="font-heading text-lg text-verde-noite truncate pr-4">
                {selectedOpp.coupleName}
              </h2>
              <button
                onClick={() => setSelectedOpp(null)}
                className="shrink-0 p-1.5 rounded-lg hover:bg-gray-100 text-verde-noite/40 hover:text-verde-noite transition"
                aria-label="Fechar painel"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 pt-4 pb-2">
              <span className={`inline-block font-body text-xs px-3 py-1 rounded-full font-medium ${STAGE_BADGE[selectedOpp.stage]}`}>
                {STAGES.find((s) => s.key === selectedOpp.stage)?.label ?? selectedOpp.stage}
              </span>
            </div>

            <div className="px-6 py-4 space-y-3 border-b border-gray-200">
              {selectedOpp.weddingDate && (
                <div>
                  <p className="font-body text-[11px] text-verde-noite/40 uppercase tracking-wide mb-0.5">
                    Data do casamento
                  </p>
                  <p className="font-body text-sm text-verde-noite">
                    {formatWeddingDate(selectedOpp.weddingDate)}
                    {(() => {
                      const d = daysUntilWedding(selectedOpp.weddingDate!);
                      return d >= 0 ? (
                        <span className={`ml-2 text-xs font-medium ${d < 7 ? "text-red-500" : d < 30 ? "text-copper" : "text-verde-noite/40"}`}>
                          {d === 0 ? "Hoje!" : `em ${d} dias`}
                        </span>
                      ) : null;
                    })()}
                  </p>
                </div>
              )}

              {selectedOpp.estimatedBudget != null && (
                <div>
                  <p className="font-body text-[11px] text-verde-noite/40 uppercase tracking-wide mb-0.5">
                    Orçamento estimado
                  </p>
                  <p className="font-body text-sm font-semibold text-teal">
                    {formatCurrency(selectedOpp.estimatedBudget)}
                  </p>
                </div>
              )}

              {selectedOpp.contactPhone && (
                <div>
                  <p className="font-body text-[11px] text-verde-noite/40 uppercase tracking-wide mb-0.5">
                    Telefone
                  </p>
                  <div className="flex items-center gap-3">
                    <a
                      href={`tel:${selectedOpp.contactPhone}`}
                      className="font-body text-sm text-verde-noite hover:text-teal transition"
                    >
                      {selectedOpp.contactPhone}
                    </a>
                    <a
                      href={whatsappLink(selectedOpp.contactPhone)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 transition font-body font-medium px-2.5 py-1 bg-green-50 rounded-lg"
                    >
                      <WhatsAppIcon />
                      WhatsApp
                    </a>
                  </div>
                </div>
              )}

              {selectedOpp.contactEmail && (
                <div>
                  <p className="font-body text-[11px] text-verde-noite/40 uppercase tracking-wide mb-0.5">
                    Email
                  </p>
                  <a
                    href={`mailto:${selectedOpp.contactEmail}`}
                    className="font-body text-sm text-verde-noite hover:text-teal transition truncate block"
                  >
                    {selectedOpp.contactEmail}
                  </a>
                </div>
              )}

              {selectedOpp.venue && (
                <div>
                  <p className="font-body text-[11px] text-verde-noite/40 uppercase tracking-wide mb-0.5">
                    Local
                  </p>
                  <p className="font-body text-sm text-verde-noite">{selectedOpp.venue}</p>
                </div>
              )}

              {selectedOpp.source && (
                <div>
                  <p className="font-body text-[11px] text-verde-noite/40 uppercase tracking-wide mb-0.5">
                    Origem
                  </p>
                  <p className="font-body text-sm text-verde-noite">
                    {SOURCE_LABEL[selectedOpp.source] ?? selectedOpp.source}
                  </p>
                </div>
              )}

              {selectedOpp.notes && (
                <div>
                  <p className="font-body text-[11px] text-verde-noite/40 uppercase tracking-wide mb-0.5">
                    Notas
                  </p>
                  <p className="font-body text-sm text-verde-noite/70 leading-relaxed">
                    {selectedOpp.notes}
                  </p>
                </div>
              )}

              {selectedOpp.stage === "perdido" && selectedOpp.lostReason && (
                <div>
                  <p className="font-body text-[11px] text-verde-noite/40 uppercase tracking-wide mb-0.5">
                    Motivo da perda
                  </p>
                  <p className="font-body text-sm text-red-400">{selectedOpp.lostReason}</p>
                </div>
              )}
            </div>

            <div className="px-6 py-5">
              <p className="font-body text-[11px] text-verde-noite/40 uppercase tracking-wide mb-3">
                Mover para etapa
              </p>
              <div className="space-y-2">
                {STAGES.map((stage) => {
                  const isCurrent = selectedOpp.stage === stage.key;
                  const isLoadingStage = movingTo?.startsWith(selectedOpp.id + ":" + stage.key);
                  return (
                    <button
                      key={stage.key}
                      disabled={isCurrent || movingTo !== null}
                      onClick={() => moveToStage(selectedOpp.id, stage.key)}
                      className={`w-full px-4 py-3 rounded-xl font-body text-sm font-medium text-left transition flex items-center justify-between ${
                        isCurrent
                          ? "bg-teal text-white cursor-default"
                          : "bg-white text-verde-noite border border-gray-200 hover:border-teal hover:text-teal"
                      } disabled:opacity-60`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${STAGE_DOT[stage.key]}`} />
                        <span>{stage.label}</span>
                      </div>
                      {isCurrent && (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {isLoadingStage && (
                        <div className="w-4 h-4 border-2 border-teal border-t-transparent rounded-full animate-spin" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>
        </>
      )}

      {/* Modal: Nova Oportunidade */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-0 sm:px-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-md p-6 animate-slide-up sm:animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sm:hidden flex justify-center mb-4">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>
            <h2 className="font-heading text-xl text-verde-noite mb-5">Nova Oportunidade</h2>
            <div className="space-y-4">
              <input
                type="text"
                value={formCoupleName}
                onChange={(e) => setFormCoupleName(e.target.value)}
                placeholder="Nome do casal *"
                className={inputClass}
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="tel"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="Telefone"
                  className={inputClass}
                />
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="Email"
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className={inputClass}
                />
                <input
                  type="number"
                  value={formBudget}
                  onChange={(e) => setFormBudget(e.target.value)}
                  placeholder="Orçamento (R$)"
                  className={inputClass}
                />
              </div>
              <input
                type="text"
                value={formVenue}
                onChange={(e) => setFormVenue(e.target.value)}
                placeholder="Local do evento"
                className={inputClass}
              />
              <select
                value={formSource}
                onChange={(e) => setFormSource(e.target.value)}
                className={`${inputClass} appearance-none`}
              >
                {SOURCES.map((s) => (
                  <option key={s} value={s}>
                    {SOURCE_LABEL[s] ?? s}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 py-2.5 border border-gray-300 rounded-xl font-body text-sm text-verde-noite/70 hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={submitting || !formCoupleName.trim()}
                className="flex-1 py-2.5 bg-copper text-white rounded-xl font-body text-sm font-medium hover:bg-copper/90 transition disabled:opacity-50"
              >
                {submitting ? "Salvando..." : "Criar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Motivo da Perda */}
      {lostModal && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 px-0 sm:px-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-sm p-6 animate-slide-up sm:animate-scale-in">
            <div className="sm:hidden flex justify-center mb-4">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>
            <h2 className="font-heading text-lg text-verde-noite mb-2">Motivo da perda</h2>
            <p className="font-body text-sm text-verde-noite/50 mb-4">
              Por que {lostModal.coupleName} foi perdido?
            </p>
            <select
              value={lostReason}
              onChange={(e) => setLostReason(e.target.value)}
              className={`${inputClass} appearance-none mb-4`}
            >
              <option value="">Selecione o motivo</option>
              <option value="preco">Preço</option>
              <option value="escolheu_outro">Escolheu outro profissional</option>
              <option value="desistiu">Desistiu do casamento</option>
              <option value="sem_resposta">Sem resposta</option>
              <option value="outro">Outro</option>
            </select>
            <div className="flex gap-3">
              <button
                onClick={() => setLostModal(null)}
                className="flex-1 py-2.5 border border-gray-300 rounded-xl font-body text-sm text-verde-noite/70 hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmLost}
                disabled={!lostReason}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-body text-sm font-medium hover:bg-red-600 transition disabled:opacity-50"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
