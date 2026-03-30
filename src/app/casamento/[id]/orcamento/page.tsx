"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = [
  "Local / Espaço", "Buffet", "Bebidas", "Decoração", "Floricultura",
  "Fotografia", "Cinematografia", "DJ / Música / Banda", "Iluminação / Som",
  "Bolo / Doces", "Vestido", "Traje", "Cerimonial / Assessoria",
  "Convites / Papelaria", "Maquiagem / Hair", "Transporte",
  "Lua de mel", "Outros",
];

interface BudgetItem {
  id: string;
  category: string;
  description: string;
  estimatedCost: number;
  actualCost: number | null;
  paidAmount: number;
  paidBy: string | null;
  dueDate: string | null;
  status: string;
  notes: string | null;
}

interface Summary {
  totalEstimated: number;
  totalActual: number;
  totalPaid: number;
  totalPending: number;
}

interface FormState {
  category: string; description: string; estimatedCost: string;
  actualCost: string; paidAmount: string; paidBy: string;
  dueDate: string; status: string; notes: string;
}

const EMPTY: FormState = {
  category: CATEGORIES[0], description: "", estimatedCost: "",
  actualCost: "", paidAmount: "0", paidBy: "", dueDate: "", status: "pendente", notes: "",
};

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

// Input display helpers — store digits only, display with BR dots
const numDisplay = (v: string) => {
  if (!v) return "";
  const digits = v.replace(/\D/g, "");
  return digits ? Number(digits).toLocaleString("pt-BR") : "";
};
const numChange = (raw: string) => raw.replace(/\D/g, "");

const STATUS_CONFIG: Record<string, { label: string; dot: string }> = {
  pendente:   { label: "Pendente",  dot: "bg-amber-400" },
  pago:       { label: "Pago",      dot: "bg-green-400" },
  cancelado:  { label: "Cancelado", dot: "bg-red-400" },
};

export default function OrcamentoPage() {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<BudgetItem | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [filterCat, setFilterCat] = useState("todas");
  const [loadingTemplate, setLoadingTemplate] = useState(false);

  async function loadTemplate() {
    setLoadingTemplate(true);
    try {
      await Promise.all(
        CATEGORIES.map(cat =>
          fetch(`/api/weddings/${id}/budget`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ category: cat, description: cat, estimatedCost: 0, paidAmount: 0, status: "pendente" }),
          })
        )
      );
      await load();
      toast.success("Todos os itens base adicionados! Edite os valores.");
    } catch {
      toast.error("Erro ao carregar itens base.");
    }
    setLoadingTemplate(false);
  }

  async function load() {
    const [iRes, sRes] = await Promise.all([
      fetch(`/api/weddings/${id}/budget`),
      fetch(`/api/weddings/${id}/budget/summary`),
    ]);
    if (iRes.ok) setItems(await iRes.json());
    if (sRes.ok) setSummary(await sRes.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, [id]);

  function openNew() {
    setEditing(null); setForm(EMPTY); setShowForm(true);
  }

  function openEdit(item: BudgetItem) {
    setEditing(item);
    setForm({
      category: item.category,
      description: item.description,
      estimatedCost: String(Math.round(item.estimatedCost)),
      actualCost: item.actualCost != null ? String(Math.round(item.actualCost)) : "",
      paidAmount: String(Math.round(item.paidAmount)),
      paidBy: item.paidBy ?? "",
      dueDate: item.dueDate ? item.dueDate.slice(0, 10) : "",
      status: item.status,
      notes: item.notes ?? "",
    });
    setShowForm(true);
  }

  async function save() {
    if (!form.description.trim() || !form.estimatedCost) return;
    setSaving(true);
    const url = editing
      ? `/api/weddings/${id}/budget/${editing.id}`
      : `/api/weddings/${id}/budget`;
    const res = await fetch(url, {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        estimatedCost: Number(form.estimatedCost),
        actualCost: form.actualCost ? Number(form.actualCost) : null,
        paidAmount: Number(form.paidAmount) || 0,
        dueDate: form.dueDate || null,
      }),
    });
    if (res.ok) {
      await load();
      setShowForm(false);
      toast.success(editing ? "Item atualizado com sucesso!" : "Item adicionado ao orçamento!");
    } else {
      toast.error("Erro ao salvar item. Tente novamente.");
    }
    setSaving(false);
  }

  async function remove(itemId: string) {
    const res = await fetch(`/api/weddings/${id}/budget/${itemId}`, { method: "DELETE" });
    if (res.ok) {
      await load();
      toast.success("Item removido do orçamento.");
    } else {
      toast.error("Erro ao remover item.");
    }
  }

  async function togglePaid(item: BudgetItem) {
    const newStatus = item.status === "pago" ? "pendente" : "pago";
    const newPaid = newStatus === "pago" ? (item.actualCost ?? item.estimatedCost) : 0;
    await fetch(`/api/weddings/${id}/budget/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...item, status: newStatus, paidAmount: newPaid }),
    });
    await load();
  }

  const cats = [...new Set(items.map(i => i.category))].filter(c => CATEGORIES.includes(c));
  const otherCats = [...new Set(items.map(i => i.category))].filter(c => !CATEGORIES.includes(c));
  const orderedCats = [...CATEGORIES.filter(c => cats.includes(c)), ...otherCats];

  const filtered = filterCat === "todas" ? items : items.filter(i => i.category === filterCat);

  const groups: Record<string, BudgetItem[]> = {};
  for (const item of filtered) {
    if (!groups[item.category]) groups[item.category] = [];
    groups[item.category].push(item);
  }

  const progressPct = summary && summary.totalEstimated > 0
    ? Math.min(100, Math.round((summary.totalPaid / summary.totalEstimated) * 100))
    : 0;

  if (loading) return (
    <div className="min-h-screen bg-fog flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-midnight border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-fog">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-xl font-semibold text-midnight">Orçamento</h1>
            <p className="font-body text-xs text-midnight/50 mt-0.5">
              {items.length} {items.length === 1 ? "item" : "itens"}
            </p>
          </div>
          <button onClick={openNew}
            className="flex items-center gap-1.5 px-4 py-2 bg-gold text-white rounded-xl font-body text-sm font-medium hover:bg-gold/90 transition">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Novo
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">

        {/* Summary */}
        {summary && items.length > 0 && (
          <div className="bg-white rounded-3xl border border-gray-100 p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="font-body text-xs text-midnight/50 mb-0.5">Estimado</p>
                <p className="font-body text-lg font-bold text-midnight">{fmt(summary.totalEstimated)}</p>
              </div>
              <div>
                <p className="font-body text-xs text-midnight/50 mb-0.5">Realizado</p>
                <p className="font-body text-lg font-bold text-midnight">{fmt(summary.totalActual)}</p>
              </div>
              <div>
                <p className="font-body text-xs text-midnight/50 mb-0.5">Pago</p>
                <p className="font-body text-lg font-bold text-green-600">{fmt(summary.totalPaid)}</p>
              </div>
              <div>
                <p className="font-body text-xs text-midnight/50 mb-0.5">A pagar</p>
                <p className="font-body text-lg font-bold text-gold">{fmt(summary.totalPending)}</p>
              </div>
            </div>
            {/* Progress bar */}
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="font-body text-xs text-midnight/50">Pago do estimado</span>
                <span className="font-body text-xs font-semibold text-midnight">{progressPct}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-midnight to-midnight/70 rounded-full transition-all duration-700"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Category filter */}
        {orderedCats.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setFilterCat("todas")}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-body font-medium transition ${
                filterCat === "todas" ? "bg-midnight text-white" : "bg-white border border-gray-200 text-midnight/60"
              }`}
            >
              Todas
            </button>
            {orderedCats.map(c => (
              <button key={c}
                onClick={() => setFilterCat(c)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-body font-medium transition ${
                  filterCat === c ? "bg-midnight text-white" : "bg-white border border-gray-200 text-midnight/60"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {/* Empty state */}
        {items.length === 0 && (
          <div className="bg-white rounded-3xl border border-gray-100 p-8 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-midnight/10 flex items-center justify-center">
              <svg className="w-7 h-7 text-midnight" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="font-body text-midnight/50 mb-2">Nenhum item no orçamento ainda</p>
            <p className="font-body text-xs text-midnight/30 mb-6">Comece do zero ou carregue todos os {CATEGORIES.length} itens de casamento de uma vez</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => loadTemplate()} disabled={loadingTemplate}
                className="px-6 py-3 bg-midnight text-white rounded-xl font-body text-sm hover:bg-midnight/90 transition disabled:opacity-50">
                {loadingTemplate ? "Carregando..." : `✦ Carregar ${CATEGORIES.length} itens base`}
              </button>
              <button onClick={openNew}
                className="px-6 py-2.5 border border-gray-200 text-midnight rounded-xl font-body text-sm hover:bg-gray-50 transition">
                Adicionar item manualmente
              </button>
            </div>
          </div>
        )}

        {/* Add more button — always visible when items exist */}
        {items.length > 0 && (
          <div className="flex gap-3">
            <button onClick={openNew}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 rounded-2xl font-body text-sm text-midnight hover:border-midnight/30 transition">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Adicionar item
            </button>
            <button onClick={openNew}
              className="flex items-center gap-1.5 px-4 py-3 bg-white border border-gray-200 rounded-2xl font-body text-sm text-midnight/60 hover:border-midnight/30 transition">
              + Outros custos
            </button>
          </div>
        )}

        {/* Items grouped by category */}
        {Object.entries(groups).map(([cat, catItems]) => (
          <div key={cat}>
            <div className="flex items-center justify-between mb-2 px-1">
              <p className="font-body text-xs font-semibold text-midnight/40 uppercase tracking-widest">{cat}</p>
              <p className="font-body text-xs text-midnight/40">
                {fmt(catItems.reduce((s, i) => s + i.estimatedCost, 0))}
              </p>
            </div>
            <div className="space-y-2">
              {catItems.map(item => {
                const sc = STATUS_CONFIG[item.status] ?? { label: item.status, dot: "bg-gray-400" };
                const cost = item.actualCost ?? item.estimatedCost;
                const paidPct = cost > 0 ? Math.min(100, Math.round((item.paidAmount / cost) * 100)) : 0;
                return (
                  <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-4">
                    <div className="flex items-start gap-3">
                      {/* Paid toggle */}
                      <button
                        onClick={() => togglePaid(item)}
                        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition ${
                          item.status === "pago"
                            ? "bg-green-400 border-green-400"
                            : "border-gray-300 hover:border-midnight"
                        }`}
                      >
                        {item.status === "pago" && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`font-body text-sm font-medium ${item.status === "pago" ? "text-midnight/40 line-through" : "text-midnight"}`}>
                            {item.description}
                          </span>
                          <div className="flex items-center gap-1">
                            <div className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                            <span className="font-body text-[11px] text-midnight/50">{sc.label}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-0.5">
                          <span className="font-body text-xs text-midnight/60">
                            Estimado: <span className="font-semibold">{fmt(item.estimatedCost)}</span>
                          </span>
                          {item.actualCost != null && item.actualCost !== item.estimatedCost && (
                            <span className="font-body text-xs text-midnight/60">
                              Real: <span className="font-semibold">{fmt(item.actualCost)}</span>
                            </span>
                          )}
                          {item.paidAmount > 0 && (
                            <span className="font-body text-xs text-green-600">
                              Pago: <span className="font-semibold">{fmt(item.paidAmount)}</span>
                            </span>
                          )}
                          {item.dueDate && (
                            <span className="font-body text-xs text-midnight/40">
                              Vence: {new Date(item.dueDate).toLocaleDateString("pt-BR")}
                            </span>
                          )}
                        </div>

                        {/* Mini progress for partially paid */}
                        {paidPct > 0 && paidPct < 100 && (
                          <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-midnight rounded-full" style={{ width: `${paidPct}%` }} />
                          </div>
                        )}

                        {item.notes && (
                          <p className="font-body text-xs text-midnight/40 mt-1.5 line-clamp-1">{item.notes}</p>
                        )}
                      </div>

                      <div className="flex gap-1 flex-shrink-0">
                        <button onClick={() => openEdit(item)}
                          className="p-1.5 rounded-lg text-midnight/30 hover:text-midnight hover:bg-midnight/5 transition">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={() => remove(item.id)}
                          className="p-1.5 rounded-lg text-midnight/30 hover:text-red-400 hover:bg-red-50 transition">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-3xl w-full max-w-md max-h-[92vh] overflow-y-auto pb-safe"
            onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-heading text-lg font-semibold text-midnight">
                  {editing ? "Editar item" : "Novo item"}
                </h2>
                <button onClick={() => setShowForm(false)} className="text-midnight/30 hover:text-midnight transition">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block font-body text-xs text-midnight/60 mb-1.5">Categoria *</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full px-3 py-2.5 text-base font-body border border-gray-200 rounded-xl focus:outline-none focus:border-midnight">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block font-body text-xs text-midnight/60 mb-1.5">Descrição *</label>
                  <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Ex: Buffet para 200 pessoas"
                    className="w-full px-3 py-2.5 text-base font-body border border-gray-200 rounded-xl focus:outline-none focus:border-midnight" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-body text-xs text-midnight/60 mb-1.5">Valor estimado *</label>
                    <input type="text" inputMode="numeric" value={numDisplay(form.estimatedCost)}
                      onChange={e => setForm(f => ({ ...f, estimatedCost: numChange(e.target.value) }))}
                      placeholder="0"
                      className="w-full px-3 py-2.5 text-base font-body border border-gray-200 rounded-xl focus:outline-none focus:border-midnight" />
                  </div>
                  <div>
                    <label className="block font-body text-xs text-midnight/60 mb-1.5">Valor real</label>
                    <input type="text" inputMode="numeric" value={numDisplay(form.actualCost)}
                      onChange={e => setForm(f => ({ ...f, actualCost: numChange(e.target.value) }))}
                      placeholder="0"
                      className="w-full px-3 py-2.5 text-base font-body border border-gray-200 rounded-xl focus:outline-none focus:border-midnight" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-body text-xs text-midnight/60 mb-1.5">Valor pago</label>
                    <input type="text" inputMode="numeric" value={numDisplay(form.paidAmount)}
                      onChange={e => setForm(f => ({ ...f, paidAmount: numChange(e.target.value) }))}
                      placeholder="0"
                      className="w-full px-3 py-2.5 text-base font-body border border-gray-200 rounded-xl focus:outline-none focus:border-midnight" />
                  </div>
                  <div>
                    <label className="block font-body text-xs text-midnight/60 mb-1.5">Vencimento</label>
                    <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                      className="w-full px-3 py-2.5 text-base font-body border border-gray-200 rounded-xl focus:outline-none focus:border-midnight" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-body text-xs text-midnight/60 mb-1.5">Quem pagou</label>
                    <input value={form.paidBy} onChange={e => setForm(f => ({ ...f, paidBy: e.target.value }))}
                      placeholder="Ex: noiva, cartão Itaú"
                      className="w-full px-3 py-2.5 text-base font-body border border-gray-200 rounded-xl focus:outline-none focus:border-midnight" />
                  </div>
                  <div>
                    <label className="block font-body text-xs text-midnight/60 mb-1.5">Status</label>
                    <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                      className="w-full px-3 py-2.5 text-base font-body border border-gray-200 rounded-xl focus:outline-none focus:border-midnight">
                      <option value="pendente">Pendente</option>
                      <option value="pago">Pago</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-body text-xs text-midnight/60 mb-1.5">Observações</label>
                  <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    rows={2} placeholder="Parcelas, condições..."
                    className="w-full px-3 py-2.5 text-sm font-body border border-gray-200 rounded-xl focus:outline-none focus:border-midnight resize-none" />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2.5 font-body text-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition">
                  Cancelar
                </button>
                <button onClick={save} disabled={saving || !form.description.trim() || !form.estimatedCost}
                  className="flex-1 px-4 py-2.5 font-body text-sm bg-gold text-white rounded-xl hover:bg-gold/90 disabled:opacity-50 transition">
                  {saving ? "Salvando..." : editing ? "Salvar" : "Adicionar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
