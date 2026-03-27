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
  { key: "lead", label: "Lead", color: "border-gray-300" },
  { key: "contato", label: "Em Contato", color: "border-teal" },
  { key: "proposta", label: "Proposta", color: "border-copper" },
  { key: "fechado", label: "Fechado", color: "border-green-500" },
  { key: "perdido", label: "Perdido", color: "border-red-400" },
];

const SOURCES = ["indicacao", "instagram", "site", "whatsapp", "evento", "outro"];

function formatCurrency(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

function daysSince(iso: string) {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

export default function PipelinePage() {
  const { status: authStatus } = useSession();
  const [opps, setOpps] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [lostModal, setLostModal] = useState<Opportunity | null>(null);
  const [lostReason, setLostReason] = useState("");
  const [dragId, setDragId] = useState<string | null>(null);

  // Form state
  const [formCoupleName, setFormCoupleName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formBudget, setFormBudget] = useState("");
  const [formSource, setFormSource] = useState("indicacao");
  const [formVenue, setFormVenue] = useState("");
  const [formDate, setFormDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchOpps = useCallback(async () => {
    const res = await fetch("/api/planner/opportunities");
    if (res.ok) setOpps(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authStatus === "authenticated") fetchOpps();
  }, [authStatus, fetchOpps]);

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

  function resetForm() {
    setFormCoupleName("");
    setFormPhone("");
    setFormEmail("");
    setFormBudget("");
    setFormSource("indicacao");
    setFormVenue("");
    setFormDate("");
  }

  async function moveToStage(oppId: string, newStage: string) {
    if (newStage === "perdido") {
      const opp = opps.find((o) => o.id === oppId);
      if (opp) {
        setLostModal(opp);
        setLostReason("");
      }
      return;
    }

    const res = await fetch(`/api/planner/opportunities/${oppId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: newStage }),
    });
    if (res.ok) {
      setOpps((prev) => prev.map((o) => (o.id === oppId ? { ...o, stage: newStage } : o)));
    }
  }

  async function confirmLost() {
    if (!lostModal) return;
    const res = await fetch(`/api/planner/opportunities/${lostModal.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: "perdido", lostReason }),
    });
    if (res.ok) {
      setOpps((prev) => prev.map((o) => (o.id === lostModal.id ? { ...o, stage: "perdido", lostReason } : o)));
      setLostModal(null);
    }
  }

  async function deleteOpp(id: string) {
    await fetch(`/api/planner/opportunities/${id}`, { method: "DELETE" });
    setOpps((prev) => prev.filter((o) => o.id !== id));
  }

  if (authStatus === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const inputClass = "w-full px-4 py-2.5 border border-gray-200 rounded-xl font-body text-verde-noite focus:border-teal focus:ring-1 focus:ring-teal outline-none transition";

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-3xl text-verde-noite">Pipeline CRM</h1>
        <button
          onClick={() => { resetForm(); setModalOpen(true); }}
          className="px-5 py-2.5 bg-copper text-white rounded-xl font-body text-sm font-medium hover:bg-copper/90 transition"
        >
          Nova oportunidade
        </button>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const stageOpps = opps.filter((o) => o.stage === stage.key);
          return (
            <div
              key={stage.key}
              className="min-w-[280px] flex-1"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragId) moveToStage(dragId, stage.key);
                setDragId(null);
              }}
            >
              <div className={`flex items-center gap-2 mb-3 pb-2 border-b-2 ${stage.color}`}>
                <h3 className="font-body text-sm font-semibold text-verde-noite">{stage.label}</h3>
                <span className="font-body text-xs text-verde-noite/40 bg-gray-100 px-1.5 py-0.5 rounded-full">
                  {stageOpps.length}
                </span>
              </div>

              <div className="space-y-3 min-h-[200px]">
                {stageOpps.map((opp) => (
                  <div
                    key={opp.id}
                    draggable
                    onDragStart={() => setDragId(opp.id)}
                    className={`bg-white rounded-xl p-4 shadow-sm cursor-grab active:cursor-grabbing border-l-4 ${stage.color} hover:shadow-md transition`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-body text-sm font-semibold text-verde-noite">{opp.coupleName}</h4>
                      <button
                        onClick={() => deleteOpp(opp.id)}
                        className="text-gray-300 hover:text-red-400 transition p-1"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {opp.weddingDate && (
                      <p className="font-body text-xs text-verde-noite/50 mb-1">
                        {new Date(opp.weddingDate).toLocaleDateString("pt-BR")}
                      </p>
                    )}

                    {opp.estimatedBudget && (
                      <p className="font-body text-xs text-teal font-medium mb-2">
                        {formatCurrency(opp.estimatedBudget)}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="font-body text-[10px] px-2 py-0.5 bg-gray-100 text-verde-noite/50 rounded-full">
                        {opp.source}
                      </span>
                      <span className="font-body text-[10px] text-verde-noite/30">
                        {daysSince(opp.updatedAt)}d
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* New Opportunity Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-heading text-xl text-verde-noite mb-5">Nova Oportunidade</h2>
            <div className="space-y-4">
              <input type="text" value={formCoupleName} onChange={(e) => setFormCoupleName(e.target.value)} placeholder="Nome do casal *" className={inputClass} />
              <div className="grid grid-cols-2 gap-3">
                <input type="tel" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} placeholder="Telefone" className={inputClass} />
                <input type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="Email" className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} className={inputClass} />
                <input type="number" value={formBudget} onChange={(e) => setFormBudget(e.target.value)} placeholder="Orcamento" className={inputClass} />
              </div>
              <input type="text" value={formVenue} onChange={(e) => setFormVenue(e.target.value)} placeholder="Local" className={inputClass} />
              <select value={formSource} onChange={(e) => setFormSource(e.target.value)} className={`${inputClass} appearance-none`}>
                {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModalOpen(false)} className="flex-1 py-2.5 border border-gray-300 rounded-xl font-body text-sm text-verde-noite/70 hover:bg-gray-50 transition">Cancelar</button>
              <button onClick={handleCreate} disabled={submitting || !formCoupleName.trim()} className="flex-1 py-2.5 bg-copper text-white rounded-xl font-body text-sm font-medium hover:bg-copper/90 transition disabled:opacity-50">{submitting ? "Salvando..." : "Criar"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Lost Reason Modal */}
      {lostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="font-heading text-lg text-verde-noite mb-2">Motivo da perda</h2>
            <p className="font-body text-sm text-verde-noite/50 mb-4">Por que {lostModal.coupleName} foi perdido?</p>
            <select value={lostReason} onChange={(e) => setLostReason(e.target.value)} className={`${inputClass} appearance-none mb-4`}>
              <option value="">Selecione</option>
              <option value="preco">Preco</option>
              <option value="escolheu_outro">Escolheu outro</option>
              <option value="desistiu">Desistiu do casamento</option>
              <option value="sem_resposta">Sem resposta</option>
              <option value="outro">Outro</option>
            </select>
            <div className="flex gap-3">
              <button onClick={() => setLostModal(null)} className="flex-1 py-2.5 border border-gray-300 rounded-xl font-body text-sm text-verde-noite/70 hover:bg-gray-50 transition">Cancelar</button>
              <button onClick={confirmLost} disabled={!lostReason} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-body text-sm font-medium hover:bg-red-600 transition disabled:opacity-50">Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
