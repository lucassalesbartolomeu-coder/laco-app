"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const CATEGORIES = [
  "Fotografia", "Cinematografia", "Buffet", "Bebidas", "Bolo / Doces",
  "Decoração", "Floricultura", "Iluminação / Som", "DJ / Música / Banda",
  "Local / Espaço", "Vestido", "Traje", "Cerimonial", "Convites / Papelaria",
  "Transporte", "Outros",
];

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  cotado:     { label: "Cotado",     color: "bg-amber-50 text-amber-700 border border-amber-200" },
  contratado: { label: "Contratado", color: "bg-green-50 text-green-700 border border-green-200" },
  cancelado:  { label: "Cancelado",  color: "bg-red-50 text-red-500 border border-red-200" },
};

interface Vendor {
  id: string;
  name: string;
  category: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  budget: number | null;
  status: string;
  notes: string | null;
}

interface FormState {
  name: string; category: string; phone: string; email: string;
  website: string; budget: string; status: string; notes: string;
}

const EMPTY: FormState = {
  name: "", category: CATEGORIES[0], phone: "", email: "",
  website: "", budget: "", status: "cotado", notes: "",
};

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

export default function FornecedoresPage() {
  const { id } = useParams<{ id: string }>();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Vendor | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");

  async function load() {
    const res = await fetch(`/api/weddings/${id}/vendors`);
    if (res.ok) setVendors(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, [id]);

  function openNew() {
    setEditing(null); setForm(EMPTY); setShowForm(true);
  }

  function openEdit(v: Vendor) {
    setEditing(v);
    setForm({
      name: v.name, category: v.category,
      phone: v.phone ?? "", email: v.email ?? "",
      website: v.website ?? "",
      budget: v.budget != null ? String(v.budget) : "",
      status: v.status, notes: v.notes ?? "",
    });
    setShowForm(true);
  }

  async function save() {
    if (!form.name.trim()) return;
    setSaving(true);
    const url = editing
      ? `/api/weddings/${id}/vendors/${editing.id}`
      : `/api/weddings/${id}/vendors`;
    const res = await fetch(url, {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, budget: form.budget ? Number(form.budget) : null }),
    });
    if (res.ok) { await load(); setShowForm(false); }
    setSaving(false);
  }

  async function remove(vendorId: string) {
    if (!confirm("Remover este fornecedor?")) return;
    await fetch(`/api/weddings/${id}/vendors/${vendorId}`, { method: "DELETE" });
    setVendors(v => v.filter(x => x.id !== vendorId));
  }

  const filtered = vendors.filter(v => {
    if (filterStatus !== "todos" && v.status !== filterStatus) return false;
    if (search && !v.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Summary totals
  const totalContratado = vendors
    .filter(v => v.status === "contratado")
    .reduce((s, v) => s + (v.budget ?? 0), 0);
  const totalCotado = vendors
    .filter(v => v.status === "cotado")
    .reduce((s, v) => s + (v.budget ?? 0), 0);

  // Group by category (preserving order)
  const groups: Record<string, Vendor[]> = {};
  for (const v of filtered) {
    if (!groups[v.category]) groups[v.category] = [];
    groups[v.category].push(v);
  }

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
            <h1 className="font-heading text-xl font-semibold text-midnight">Fornecedores</h1>
            <p className="font-body text-xs text-midnight/50 mt-0.5">
              {vendors.length} cadastrados · {vendors.filter(v => v.status === "contratado").length} contratados
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

        {/* Summary cards */}
        {vendors.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-midnight rounded-2xl p-4 text-white">
              <p className="font-body text-xs opacity-60 mb-1">Contratado</p>
              <p className="font-body text-xl font-bold">{fmt(totalContratado)}</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl p-4">
              <p className="font-body text-xs text-midnight/50 mb-1">Em cotação</p>
              <p className="font-body text-xl font-bold text-midnight">{fmt(totalCotado)}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar fornecedor..."
            className="flex-1 px-3 py-2 text-sm font-body bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-midnight" />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-sm font-body bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-midnight">
            <option value="todos">Todos</option>
            <option value="cotado">Cotado</option>
            <option value="contratado">Contratado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>

        {/* Empty state */}
        {vendors.length === 0 && (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gold/10 flex items-center justify-center">
              <svg className="w-7 h-7 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p className="font-body text-midnight/50 mb-5">Nenhum fornecedor ainda</p>
            <button onClick={openNew}
              className="px-6 py-2.5 bg-gold text-white rounded-xl font-body text-sm hover:bg-gold/90 transition">
              Adicionar fornecedor
            </button>
          </div>
        )}

        {/* Grouped list */}
        {Object.entries(groups).map(([cat, items]) => (
          <div key={cat}>
            <p className="font-body text-xs font-semibold text-midnight/40 uppercase tracking-widest mb-2 px-1">{cat}</p>
            <div className="space-y-2">
              {items.map(v => {
                const sc = STATUS_CONFIG[v.status] ?? { label: v.status, color: "bg-gray-100 text-gray-600 border border-gray-200" };
                return (
                  <div key={v.id} className="bg-white rounded-2xl border border-gray-100 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <span className="font-body font-semibold text-midnight text-sm">{v.name}</span>
                          <span className={`text-[11px] px-2 py-0.5 rounded-full font-body font-medium ${sc.color}`}>
                            {sc.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1">
                          {v.budget != null && (
                            <span className="font-body text-xs font-semibold text-gold">{fmt(v.budget)}</span>
                          )}
                          {v.phone && (
                            <a href={`tel:${v.phone}`} className="font-body text-xs text-midnight hover:underline">{v.phone}</a>
                          )}
                          {v.email && (
                            <a href={`mailto:${v.email}`} className="font-body text-xs text-midnight hover:underline truncate max-w-[180px]">{v.email}</a>
                          )}
                          {v.website && (
                            <a href={v.website} target="_blank" rel="noopener noreferrer"
                              className="font-body text-xs text-midnight hover:underline">Site ↗</a>
                          )}
                        </div>
                        {v.notes && (
                          <p className="font-body text-xs text-midnight/50 mt-1.5 line-clamp-2">{v.notes}</p>
                        )}
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button onClick={() => openEdit(v)}
                          className="p-1.5 rounded-lg text-midnight/30 hover:text-midnight hover:bg-midnight/5 transition">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={() => remove(v.id)}
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
          <div className="bg-white rounded-3xl w-full max-w-md max-h-[92vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-heading text-lg font-semibold text-midnight">
                  {editing ? "Editar fornecedor" : "Novo fornecedor"}
                </h2>
                <button onClick={() => setShowForm(false)} className="text-midnight/30 hover:text-midnight transition">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block font-body text-xs text-midnight/60 mb-1.5">Nome *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Ex: Studio Luz Fotografia"
                    className="w-full px-3 py-2.5 text-sm font-body border border-gray-200 rounded-xl focus:outline-none focus:border-midnight" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-body text-xs text-midnight/60 mb-1.5">Categoria *</label>
                    <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                      className="w-full px-3 py-2.5 text-sm font-body border border-gray-200 rounded-xl focus:outline-none focus:border-midnight">
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-body text-xs text-midnight/60 mb-1.5">Status</label>
                    <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                      className="w-full px-3 py-2.5 text-sm font-body border border-gray-200 rounded-xl focus:outline-none focus:border-midnight">
                      <option value="cotado">Cotado</option>
                      <option value="contratado">Contratado</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-body text-xs text-midnight/60 mb-1.5">Valor orçado (R$)</label>
                  <input type="number" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
                    placeholder="0"
                    className="w-full px-3 py-2.5 text-sm font-body border border-gray-200 rounded-xl focus:outline-none focus:border-midnight" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-body text-xs text-midnight/60 mb-1.5">Telefone</label>
                    <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="(11) 9..."
                      className="w-full px-3 py-2.5 text-sm font-body border border-gray-200 rounded-xl focus:outline-none focus:border-midnight" />
                  </div>
                  <div>
                    <label className="block font-body text-xs text-midnight/60 mb-1.5">Email</label>
                    <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="email@..."
                      className="w-full px-3 py-2.5 text-sm font-body border border-gray-200 rounded-xl focus:outline-none focus:border-midnight" />
                  </div>
                </div>

                <div>
                  <label className="block font-body text-xs text-midnight/60 mb-1.5">Site / Instagram</label>
                  <input value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                    placeholder="https://..."
                    className="w-full px-3 py-2.5 text-sm font-body border border-gray-200 rounded-xl focus:outline-none focus:border-midnight" />
                </div>

                <div>
                  <label className="block font-body text-xs text-midnight/60 mb-1.5">Observações</label>
                  <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    rows={2} placeholder="Condições, detalhes do contrato..."
                    className="w-full px-3 py-2.5 text-sm font-body border border-gray-200 rounded-xl focus:outline-none focus:border-midnight resize-none" />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2.5 font-body text-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition">
                  Cancelar
                </button>
                <button onClick={save} disabled={saving || !form.name.trim()}
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
