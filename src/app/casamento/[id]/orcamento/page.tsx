"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

// Template: múltiplos itens por categoria, sem preço — noivo só preenche os valores
const TEMPLATE: { category: string; description: string }[] = [
  // Local / Espaço
  { category: "Local / Espaço",         description: "Aluguel do espaço" },
  { category: "Local / Espaço",         description: "Taxa de serviço" },
  { category: "Local / Espaço",         description: "Gerador" },
  // Buffet
  { category: "Buffet",                 description: "Jantar" },
  { category: "Buffet",                 description: "Coquetel / Entrada" },
  { category: "Buffet",                 description: "Mesa de frios" },
  { category: "Buffet",                 description: "Serviço de garçons" },
  // Bebidas
  { category: "Bebidas",                description: "Bebidas alcoólicas" },
  { category: "Bebidas",                description: "Bebidas não alcoólicas" },
  { category: "Bebidas",                description: "Open bar" },
  // Decoração
  { category: "Decoração",              description: "Decoração da cerimônia" },
  { category: "Decoração",              description: "Decoração da festa" },
  { category: "Decoração",              description: "Arranjos de mesa" },
  { category: "Decoração",              description: "Mesa do bolo" },
  // Floricultura
  { category: "Floricultura",           description: "Buquê da noiva" },
  { category: "Floricultura",           description: "Flores da cerimônia" },
  { category: "Floricultura",           description: "Arranjos florais" },
  { category: "Floricultura",           description: "Lapela do noivo" },
  // Fotografia
  { category: "Fotografia",             description: "Fotógrafo" },
  { category: "Fotografia",             description: "Álbum de fotos" },
  { category: "Fotografia",             description: "Making of" },
  // Cinematografia
  { category: "Cinematografia",         description: "Filmagem" },
  { category: "Cinematografia",         description: "Edição / Trailer" },
  { category: "Cinematografia",         description: "Drone" },
  // DJ / Música / Banda
  { category: "DJ / Música / Banda",    description: "DJ" },
  { category: "DJ / Música / Banda",    description: "Banda / Músico" },
  { category: "DJ / Música / Banda",    description: "Cerimônia (música ao vivo)" },
  // Iluminação / Som
  { category: "Iluminação / Som",       description: "Som" },
  { category: "Iluminação / Som",       description: "Iluminação" },
  { category: "Iluminação / Som",       description: "Painel de LED" },
  // Bolo / Doces
  { category: "Bolo / Doces",           description: "Bolo" },
  { category: "Bolo / Doces",           description: "Mesa de doces" },
  { category: "Bolo / Doces",           description: "Bem-casados" },
  // Vestido
  { category: "Vestido",                description: "Vestido de noiva" },
  { category: "Vestido",                description: "Véu e acessórios" },
  { category: "Vestido",                description: "Sapatos da noiva" },
  // Traje
  { category: "Traje",                  description: "Terno / Smoking" },
  { category: "Traje",                  description: "Gravata" },
  { category: "Traje",                  description: "Sapatos do noivo" },
  // Cerimonial / Assessoria
  { category: "Cerimonial / Assessoria", description: "Assessoria completa" },
  { category: "Cerimonial / Assessoria", description: "Dia da noiva" },
  // Convites / Papelaria
  { category: "Convites / Papelaria",   description: "Convites" },
  { category: "Convites / Papelaria",   description: "Save the date" },
  { category: "Convites / Papelaria",   description: "Cardápios / Seating chart" },
  // Maquiagem / Hair
  { category: "Maquiagem / Hair",       description: "Maquiagem da noiva" },
  { category: "Maquiagem / Hair",       description: "Cabelo da noiva" },
  { category: "Maquiagem / Hair",       description: "Madrinhas" },
  // Transporte
  { category: "Transporte",             description: "Carro dos noivos" },
  { category: "Transporte",             description: "Transfer dos convidados" },
  { category: "Transporte",             description: "Estacionamento" },
  // Lua de mel
  { category: "Lua de mel",             description: "Passagens aéreas" },
  { category: "Lua de mel",             description: "Hospedagem" },
  { category: "Lua de mel",             description: "Passeios / Experiências" },
  // Outros
  { category: "Outros",                 description: "Extras / Imprevistos" },
];

const CATEGORIES = [...new Set(TEMPLATE.map(t => t.category))];

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
  actualCost: "", paidAmount: "", paidBy: "", dueDate: "", status: "pendente", notes: "",
};

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const fmtShort = (v: number) =>
  new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

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
  const [coupleName1, setCoupleName1] = useState("");
  const [coupleName2, setCoupleName2] = useState("");
  const autoLoadedRef = useRef(false);

  // Inline editing state: { id, value }
  const [inlineId, setInlineId] = useState<string | null>(null);
  const [inlineVal, setInlineVal] = useState("");

  async function loadSummary() {
    const sRes = await fetch(`/api/weddings/${id}/budget/summary`);
    if (sRes.ok) setSummary(await sRes.json());
  }

  async function loadItems() {
    const iRes = await fetch(`/api/weddings/${id}/budget`);
    if (iRes.ok) return await iRes.json() as BudgetItem[];
    return [] as BudgetItem[];
  }

  async function loadTemplate(silent = false) {
    setLoadingTemplate(true);
    try {
      await Promise.all(
        TEMPLATE.map(t =>
          fetch(`/api/weddings/${id}/budget`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              category: t.category,
              description: t.description,
              estimatedCost: 0,
              paidAmount: 0,
              status: "pendente",
            }),
          })
        )
      );
      const fetched = await loadItems();
      setItems(fetched);
      await loadSummary();
      if (!silent) toast.success("Itens base carregados com preços sugeridos!");
    } catch {
      if (!silent) toast.error("Erro ao carregar itens base.");
    }
    setLoadingTemplate(false);
  }

  async function load() {
    const [wRes] = await Promise.all([fetch(`/api/weddings/${id}`)]);
    const fetched = await loadItems();
    setItems(fetched);
    await loadSummary();
    if (wRes.ok) {
      const w = await wRes.json();
      setCoupleName1(w.partnerName1 ?? "");
      setCoupleName2(w.partnerName2 ?? "");
    }
    setLoading(false);
    if (fetched.length === 0 && !autoLoadedRef.current) {
      autoLoadedRef.current = true;
      await loadTemplate(true);
    }
  }

  useEffect(() => { load(); }, [id]);

  // Inline save — just estimatedCost for now (most-needed field)
  async function saveInline(item: BudgetItem) {
    const val = Number(inlineVal) || 0;
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, estimatedCost: val } : i));
    setInlineId(null);
    await fetch(`/api/weddings/${id}/budget/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...item, estimatedCost: val }),
    });
    await loadSummary();
  }

  function openInline(item: BudgetItem) {
    setInlineId(item.id);
    setInlineVal(String(Math.round(item.estimatedCost)));
  }

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
      paidAmount: item.paidAmount > 0 ? String(Math.round(item.paidAmount)) : "",
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
        paidAmount: form.paidAmount ? Number(form.paidAmount) : 0,
        dueDate: form.dueDate || null,
      }),
    });
    if (res.ok) {
      const fetched = await loadItems();
      setItems(fetched);
      await loadSummary();
      setShowForm(false);
      toast.success(editing ? "Item atualizado!" : "Item adicionado!");
    } else {
      toast.error("Erro ao salvar item.");
    }
    setSaving(false);
  }

  async function remove(itemId: string) {
    const res = await fetch(`/api/weddings/${id}/budget/${itemId}`, { method: "DELETE" });
    if (res.ok) {
      setItems(prev => prev.filter(i => i.id !== itemId));
      await loadSummary();
    }
  }

  async function togglePaid(item: BudgetItem) {
    const newStatus = item.status === "pago" ? "pendente" : "pago";
    const newPaid = newStatus === "pago" ? (item.actualCost ?? item.estimatedCost) : 0;
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: newStatus, paidAmount: newPaid } : i));
    await fetch(`/api/weddings/${id}/budget/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...item, status: newStatus, paidAmount: newPaid }),
    });
    await loadSummary();
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

  const payerChips = [
    ...(coupleName1 ? [coupleName1] : []),
    ...(coupleName2 ? [coupleName2] : []),
    "Juntos", "Família",
  ];

  if (loading || loadingTemplate) return (
    <div className="min-h-screen bg-fog flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 border-2 border-midnight border-t-transparent rounded-full animate-spin" />
      {loadingTemplate && (
        <p className="font-body text-sm text-midnight/50">Preparando seu orçamento...</p>
      )}
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
              {summary && summary.totalEstimated > 0 && ` · ${fmt(summary.totalEstimated)}`}
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

      <div className="max-w-3xl mx-auto px-4 py-5 space-y-5 pb-28">

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
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="font-body text-xs text-midnight/50">Pago do estimado</span>
                <span className="font-body text-xs font-semibold text-midnight">{progressPct}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-midnight to-midnight/70 rounded-full transition-all duration-700"
                  style={{ width: `${progressPct}%` }} />
              </div>
            </div>
          </div>
        )}

        {/* Category filter */}
        {orderedCats.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4">
            <button onClick={() => setFilterCat("todas")}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-body font-medium transition ${
                filterCat === "todas" ? "bg-midnight text-white" : "bg-white border border-gray-200 text-midnight/60"
              }`}>
              Todas
            </button>
            {orderedCats.map(c => (
              <button key={c} onClick={() => setFilterCat(c)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-body font-medium transition ${
                  filterCat === c ? "bg-midnight text-white" : "bg-white border border-gray-200 text-midnight/60"
                }`}>
                {c}
              </button>
            ))}
          </div>
        )}

        {/* Inline edit hint */}
        {items.length > 0 && (
          <p className="font-body text-xs text-midnight/35 text-center">
            Toque em qualquer valor para editar · Toque no ✓ para marcar como pago
          </p>
        )}

        {/* Items grouped by category */}
        {Object.entries(groups).map(([cat, catItems]) => {
          const catTotal = catItems.reduce((s, i) => s + i.estimatedCost, 0);
          return (
            <div key={cat}>
              <div className="flex items-center justify-between mb-2 px-1">
                <p className="font-body text-xs font-semibold text-midnight/40 uppercase tracking-widest">{cat}</p>
                <p className="font-body text-xs text-midnight/40">{fmt(catTotal)}</p>
              </div>
              <div className="space-y-2">
                {catItems.map(item => {
                  const sc = STATUS_CONFIG[item.status] ?? { label: item.status, dot: "bg-gray-400" };
                  const cost = item.actualCost ?? item.estimatedCost;
                  const paidPct = cost > 0 ? Math.min(100, Math.round((item.paidAmount / cost) * 100)) : 0;
                  const isEditing = inlineId === item.id;

                  return (
                    <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-4">
                      <div className="flex items-center gap-3">
                        {/* Paid toggle */}
                        <button onClick={() => togglePaid(item)}
                          className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition ${
                            item.status === "pago" ? "bg-green-400 border-green-400" : "border-gray-300 hover:border-midnight"
                          }`}>
                          {item.status === "pago" && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>

                        {/* Description */}
                        <div className="flex-1 min-w-0">
                          <p className={`font-body text-sm font-medium leading-tight ${item.status === "pago" ? "text-midnight/40 line-through" : "text-midnight"}`}>
                            {item.description !== item.category ? item.description : item.category}
                          </p>
                          {item.paidAmount > 0 && (
                            <p className="font-body text-xs text-green-600 mt-0.5">
                              Pago: {fmt(item.paidAmount)}{item.paidBy ? ` · ${item.paidBy}` : ""}
                            </p>
                          )}
                          {item.dueDate && (
                            <p className="font-body text-xs text-midnight/35 mt-0.5">
                              Vence {new Date(item.dueDate).toLocaleDateString("pt-BR")}
                            </p>
                          )}
                        </div>

                        {/* Inline editable price */}
                        <div className="flex-shrink-0 text-right">
                          {isEditing ? (
                            <div className="flex items-center gap-1">
                              <span className="font-body text-xs text-midnight/40">R$</span>
                              <input
                                autoFocus
                                type="text"
                                inputMode="numeric"
                                value={numDisplay(inlineVal)}
                                onChange={e => setInlineVal(numChange(e.target.value))}
                                onBlur={() => saveInline(item)}
                                onKeyDown={e => {
                                  if (e.key === "Enter") saveInline(item);
                                  if (e.key === "Escape") setInlineId(null);
                                }}
                                className="w-24 text-right text-base font-bold text-midnight border-b-2 border-midnight focus:outline-none bg-transparent"
                              />
                            </div>
                          ) : (
                            <button
                              onClick={() => openInline(item)}
                              className="group text-right"
                            >
                              <p className={`font-body text-base font-bold group-hover:text-gold transition-colors ${item.status === "pago" ? "text-midnight/30" : "text-midnight"}`}>
                                {item.estimatedCost > 0 ? `R$ ${fmtShort(item.estimatedCost)}` : (
                                  <span className="text-midnight/25 text-sm font-normal">toque p/ definir</span>
                                )}
                              </p>
                              {item.actualCost != null && item.actualCost !== item.estimatedCost && (
                                <p className="font-body text-xs text-midnight/40">real: {fmt(item.actualCost)}</p>
                              )}
                            </button>
                          )}
                        </div>

                        {/* More / edit button */}
                        <button onClick={() => openEdit(item)}
                          className="flex-shrink-0 p-1.5 rounded-lg text-midnight/20 hover:text-midnight hover:bg-midnight/5 transition">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </div>

                      {/* Progress bar */}
                      {paidPct > 0 && paidPct < 100 && (
                        <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-green-400 rounded-full" style={{ width: `${paidPct}%` }} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Add buttons */}
        {items.length > 0 && (
          <div className="flex gap-3">
            <button onClick={openNew}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 rounded-2xl font-body text-sm text-midnight hover:border-midnight/30 transition">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Adicionar item
            </button>
            <button onClick={() => { setForm({ ...EMPTY, category: "Outros" }); setEditing(null); setShowForm(true); }}
              className="flex items-center gap-1.5 px-4 py-3 bg-white border border-gray-200 rounded-2xl font-body text-sm text-midnight/60 hover:border-midnight/30 transition">
              + Outros custos
            </button>
          </div>
        )}
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
                    <option value="Outros">Outros</option>
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

                {/* Pagamento */}
                <div className="bg-green-50/60 rounded-2xl p-3.5 space-y-3">
                  <p className="font-body text-xs font-semibold text-green-700">Pagamento</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-body text-xs text-midnight/60 mb-1.5">Valor pago</label>
                      <input type="text" inputMode="numeric" value={numDisplay(form.paidAmount)}
                        onChange={e => setForm(f => ({ ...f, paidAmount: numChange(e.target.value) }))}
                        placeholder="0"
                        className="w-full px-3 py-2.5 text-base font-body border border-gray-200 rounded-xl focus:outline-none focus:border-midnight bg-white" />
                    </div>
                    <div>
                      <label className="block font-body text-xs text-midnight/60 mb-1.5">Vencimento</label>
                      <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                        className="w-full px-3 py-2.5 text-base font-body border border-gray-200 rounded-xl focus:outline-none focus:border-midnight bg-white" />
                    </div>
                  </div>
                  <div>
                    <label className="block font-body text-xs text-midnight/60 mb-1.5">Quem pagou</label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {payerChips.map(name => (
                        <button key={name} type="button"
                          onClick={() => setForm(f => ({ ...f, paidBy: f.paidBy === name ? "" : name }))}
                          className={`px-2.5 py-1 rounded-lg text-xs font-body transition ${
                            form.paidBy === name ? "bg-midnight text-white" : "bg-white border border-gray-200 text-midnight/60 hover:border-midnight/40"
                          }`}>
                          {name}
                        </button>
                      ))}
                    </div>
                    <input value={form.paidBy} onChange={e => setForm(f => ({ ...f, paidBy: e.target.value }))}
                      placeholder="Ou digite: cartão Itaú, ambos..."
                      className="w-full px-3 py-2.5 text-base font-body border border-gray-200 rounded-xl focus:outline-none focus:border-midnight bg-white" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-body text-xs text-midnight/60 mb-1.5">Status</label>
                    <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                      className="w-full px-3 py-2.5 text-base font-body border border-gray-200 rounded-xl focus:outline-none focus:border-midnight">
                      <option value="pendente">Pendente</option>
                      <option value="pago">Pago</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    {form.paidAmount && Number(form.paidAmount) > 0 && (
                      <button type="button"
                        onClick={() => setForm(f => ({ ...f, status: "pago" }))}
                        className="w-full px-3 py-2.5 text-xs font-body border border-green-200 text-green-700 rounded-xl hover:bg-green-50 transition">
                        Marcar como pago
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block font-body text-xs text-midnight/60 mb-1.5">Observações</label>
                  <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    rows={2} placeholder="Parcelas, condições, notas..."
                    className="w-full px-3 py-2.5 text-base font-body border border-gray-200 rounded-xl focus:outline-none focus:border-midnight resize-none" />
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

              {/* Delete option when editing */}
              {editing && (
                <button onClick={() => { remove(editing.id); setShowForm(false); }}
                  className="w-full mt-3 py-2 font-body text-xs text-red-400 hover:text-red-600 transition">
                  Remover item
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
