"use client";

import { useEffect, useState, useCallback } from "react";
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
  { key: "proposta", label: "Proposta" },
  { key: "fechado", label: "Fechado" },
  { key: "perdido", label: "Perdido" },
];

const SOURCES = ["indicacao", "instagram", "site", "whatsapp", "evento", "outro"];

function formatCurrency(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

function daysUntilWedding(iso: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const wedding = new Date(iso);
  wedding.setHours(0, 0, 0, 0);
  return Math.ceil((wedding.getTime() - today.getTime()) / 86_400_000);
}

function urgencyBorder(opp: Opportunity): string {
  if (!opp.weddingDate) return "border-gray-200";
  const days = daysUntilWedding(opp.weddingDate);
  if (days < 7) return "border-red-500";
  if (days < 30) return "border-copper";
  return "border-gray-200";
}

export default function PipelinePage() {
  const { status: authStatus } = useSession();
  const [opps, setOpps] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // New opportunity modal
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formCoupleName, setFormCoupleName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formBudget, setFormBudget] = useState("");
  const [formSource, setFormSource] = useState("indicacao");
  const [formVenue, setFormVenue] = useState("");
  const [formDate, setFormDate] = useState("");

  // Side panel (card detail / move stage)
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);

  // Lost reason modal
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
    if (newStage === "perdido") {
      const opp = opps.find((o) => o.id === oppId);
      if (opp) {
        setLostModal({ oppId, coupleName: opp.coupleName });
        setLostReason("");
      }
      return;
    }
    setMovingTo(newStage);
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

  const filteredOpps = search.trim()
    ? opps.filter((o) => o.coupleName.toLowerCase().includes(search.trim().toLowerCase()))
    : opps;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 pt-6 pb-4 lg:px-8">
        <h1 className="font-heading text-3xl text-verde-noite">Pipeline CRM</h1>
        <div className="flex items-center gap-3 flex-1 justify-end max-w-lg">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-verde-noite/30 pointer-events-none"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="11" cy="11" r="8" />
              <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar casal…"
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl font-body text-sm text-verde-noite focus:border-teal focus:ring-1 focus:ring-teal outline-none transition bg-white"
            />
          </div>
          <button
            onClick={() => {
              resetForm();
              setModalOpen(true);
            }}
            className="shrink-0 px-5 py-2.5 bg-copper text-white rounded-xl font-body text-sm font-medium hover:bg-copper/90 transition"
          >
            Nova oportunidade
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto px-6 pb-6 lg:px-8 flex-1 items-start">
        {STAGES.map((stage) => {
          const stageOpps = filteredOpps.filter((o) => o.stage === stage.key);
          const totalValue = stageOpps.reduce((s, o) => s + (o.estimatedBudget ?? 0), 0);

          return (
            <div key={stage.key} className="min-w-[260px] w-[260px] flex flex-col">
              {/* Column Header */}
              <div className="mb-3 px-1">
                <div className="flex items-center justify-between mb-0.5">
                  <h3 className="font-heading text-sm font-semibold text-verde-noite">
                    {stage.label}
                  </h3>
                  <span className="font-body text-xs text-white bg-teal/80 px-2 py-0.5 rounded-full">
                    {stageOpps.length}
                  </span>
                </div>
                {totalValue > 0 && (
                  <p className="font-body text-[11px] text-teal font-medium">
                    {formatCurrency(totalValue)}
                  </p>
                )}
                <div className="mt-2 h-0.5 bg-gradient-to-r from-teal/60 to-teal/10 rounded-full" />
              </div>

              {/* Cards */}
              <div className="space-y-3 min-h-[120px]">
                {stageOpps.map((opp) => {
                  const border = urgencyBorder(opp);
                  const daysLeft =
                    opp.weddingDate ? daysUntilWedding(opp.weddingDate) : null;
                  const isUrgent = daysLeft !== null && daysLeft < 7;
                  const isWarning = daysLeft !== null && daysLeft >= 7 && daysLeft < 30;

                  return (
                    <button
                      key={opp.id}
                      onClick={() => setSelectedOpp(opp)}
                      className={`w-full text-left bg-white rounded-xl p-4 shadow-card border-l-4 ${border} hover:shadow-card-hover transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-teal/40`}
                    >
                      {/* Couple name */}
                      <p className="font-body text-sm font-semibold text-verde-noite mb-2 truncate">
                        {opp.coupleName}
                      </p>

                      {/* Wedding date */}
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
                          <svg
                            className="w-3 h-3 shrink-0"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <rect x="3" y="4" width="18" height="18" rx="2" />
                            <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
                          </svg>
                          {new Date(opp.weddingDate).toLocaleDateString("pt-BR")}
                          {daysLeft !== null && daysLeft >= 0 && (
                            <span className="ml-1">({daysLeft}d)</span>
                          )}
                        </p>
                      )}

                      {/* Budget */}
                      {opp.estimatedBudget != null && (
                        <p className="font-body text-xs text-teal font-medium mb-2">
                          {formatCurrency(opp.estimatedBudget)}
                        </p>
                      )}

                      {/* Phone */}
                      {opp.contactPhone && (
                        <p className="font-body text-[11px] text-verde-noite/40 truncate">
                          {opp.contactPhone}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Side Panel */}
      {selectedOpp && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={() => setSelectedOpp(null)}
          />
          {/* Panel */}
          <aside className="fixed right-0 top-0 h-full z-50 w-full max-w-sm bg-cream shadow-float flex flex-col animate-slide-up">
            {/* Panel Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-200">
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

            {/* Details */}
            <div className="px-6 py-5 space-y-3 border-b border-gray-200">
              {selectedOpp.weddingDate && (
                <div>
                  <p className="font-body text-[11px] text-verde-noite/40 uppercase tracking-wide mb-0.5">
                    Data do casamento
                  </p>
                  <p className="font-body text-sm text-verde-noite">
                    {new Date(selectedOpp.weddingDate).toLocaleDateString("pt-BR")}
                    {(() => {
                      const d = daysUntilWedding(selectedOpp.weddingDate!);
                      return d >= 0 ? (
                        <span
                          className={`ml-2 text-xs font-medium ${
                            d < 7
                              ? "text-red-500"
                              : d < 30
                              ? "text-copper"
                              : "text-verde-noite/40"
                          }`}
                        >
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
                  <a
                    href={`tel:${selectedOpp.contactPhone}`}
                    className="font-body text-sm text-verde-noite hover:text-teal transition"
                  >
                    {selectedOpp.contactPhone}
                  </a>
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
            </div>

            {/* Stage Picker */}
            <div className="px-6 py-5 flex-1 overflow-y-auto">
              <p className="font-body text-[11px] text-verde-noite/40 uppercase tracking-wide mb-3">
                Mover para etapa
              </p>
              <div className="space-y-2">
                {STAGES.map((stage) => {
                  const isCurrent = selectedOpp.stage === stage.key;
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
                      <span>{stage.label}</span>
                      {isCurrent && (
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {movingTo === stage.key && (
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

      {/* New Opportunity Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
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
                  placeholder="Orçamento"
                  className={inputClass}
                />
              </div>
              <input
                type="text"
                value={formVenue}
                onChange={(e) => setFormVenue(e.target.value)}
                placeholder="Local"
                className={inputClass}
              />
              <select
                value={formSource}
                onChange={(e) => setFormSource(e.target.value)}
                className={`${inputClass} appearance-none`}
              >
                {SOURCES.map((s) => (
                  <option key={s} value={s}>
                    {s}
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

      {/* Lost Reason Modal */}
      {lostModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-scale-in">
            <h2 className="font-heading text-lg text-verde-noite mb-2">Motivo da perda</h2>
            <p className="font-body text-sm text-verde-noite/50 mb-4">
              Por que {lostModal.coupleName} foi perdido?
            </p>
            <select
              value={lostReason}
              onChange={(e) => setLostReason(e.target.value)}
              className={`${inputClass} appearance-none mb-4`}
            >
              <option value="">Selecione</option>
              <option value="preco">Preço</option>
              <option value="escolheu_outro">Escolheu outro</option>
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
