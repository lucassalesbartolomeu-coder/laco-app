"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const GOLD    = "#A98950";
const BROWN   = "#3D322A";
const CREME   = "#FAF6EF";
const BG_DARK = "#F0E8DA";

const CATEGORIES = [
  "Fotografia", "Cinematografia", "Buffet", "Bebidas", "Bolo / Doces",
  "Decoração", "Floricultura", "Iluminação / Som", "DJ / Música / Banda",
  "Local / Espaço", "Vestido", "Traje", "Cerimonial", "Convites / Papelaria",
  "Transporte", "Outros",
];

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  cotado:     { label: "Cotado",     bg: "rgba(169,137,80,0.08)",  color: GOLD },
  contratado: { label: "Contratado", bg: "rgba(34,197,94,0.10)",   color: "#16a34a" },
  cancelado:  { label: "Cancelado",  bg: "rgba(239,68,68,0.08)",   color: "#dc2626" },
};

const CONTRACT_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  NONE:    { label: "Sem contrato",       color: "rgba(61,50,42,0.35)", dot: "—" },
  PENDING: { label: "Contrato pendente",  color: GOLD,                  dot: "○" },
  SIGNED:  { label: "Contrato assinado",  color: "#22C55E",             dot: "●" },
};

const CONTRACT_CYCLE: Record<string, string> = { NONE: "PENDING", PENDING: "SIGNED", SIGNED: "NONE" };

interface VendorDocument {
  id: string;
  name: string;
  url: string;
  size: number | null;
  createdAt: string;
}

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
  contractStatus: "NONE" | "PENDING" | "SIGNED";
  documents: VendorDocument[];
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
  const params = useParams();
  const weddingId = params?.id as string;
  const { status } = useSession();
  const toast = useToast();

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Vendor | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingUploadVendorIdRef = useRef<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/weddings/${weddingId}/vendors`);
    if (res.ok) setVendors(await res.json());
    setLoading(false);
  }, [weddingId]);

  useEffect(() => {
    if (status === "authenticated") load();
  }, [status, load]);

  function openNew() { setEditing(null); setForm(EMPTY); setShowForm(true); }

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
      ? `/api/weddings/${weddingId}/vendors/${editing.id}`
      : `/api/weddings/${weddingId}/vendors`;
    const res = await fetch(url, {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, budget: form.budget ? Number(form.budget) : null }),
    });
    if (res.ok) {
      await load();
      setShowForm(false);
    } else {
      toast.error("Erro ao salvar fornecedor. Tente novamente.");
    }
    setSaving(false);
  }

  async function remove(vendorId: string) {
    const res = await fetch(`/api/weddings/${weddingId}/vendors/${vendorId}`, { method: "DELETE" });
    if (res.ok) setVendors(v => v.filter(x => x.id !== vendorId));
    setConfirmDeleteId(null);
  }

  async function cycleContractStatus(vendor: Vendor) {
    const next = CONTRACT_CYCLE[vendor.contractStatus] as Vendor["contractStatus"];
    const res = await fetch(`/api/weddings/${weddingId}/vendors/${vendor.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contractStatus: next }),
    });
    if (res.ok) {
      setVendors(v => v.map(x => x.id === vendor.id ? { ...x, contractStatus: next } : x));
    }
  }

  function triggerUpload(vendorId: string) {
    pendingUploadVendorIdRef.current = vendorId;
    fileInputRef.current?.click();
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const vendorId = pendingUploadVendorIdRef.current;
    if (!file || !vendorId) return;
    e.target.value = "";
    pendingUploadVendorIdRef.current = null;

    if (file.size > 10 * 1024 * 1024) {
      toast.warning("O arquivo deve ter no máximo 10 MB.");
      return;
    }

    setUploadingFor(vendorId);
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(
      `/api/weddings/${weddingId}/vendors/${vendorId}/documents`,
      { method: "POST", body: formData }
    );

    if (res.ok) {
      const doc: VendorDocument = await res.json();
      setVendors(v => v.map(x =>
        x.id === vendorId
          ? { ...x, documents: [...x.documents, doc] }
          : x
      ));
    }
    setUploadingFor(null);
  }

  async function deleteDocument(vendorId: string, docId: string) {
    const res = await fetch(
      `/api/weddings/${weddingId}/vendors/${vendorId}/documents/${docId}`,
      { method: "DELETE" }
    );
    if (res.ok) {
      setVendors(v => v.map(x =>
        x.id === vendorId
          ? { ...x, documents: x.documents.filter(d => d.id !== docId) }
          : x
      ));
    }
  }

  const filtered = vendors.filter(v => {
    if (filterStatus !== "todos" && v.status !== filterStatus) return false;
    if (search && !v.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalContratado = vendors
    .filter(v => v.status === "contratado")
    .reduce((s, v) => s + (v.budget ?? 0), 0);
  const totalCotado = vendors
    .filter(v => v.status === "cotado")
    .reduce((s, v) => s + (v.budget ?? 0), 0);

  const groups: Record<string, Vendor[]> = {};
  for (const v of filtered) {
    if (!groups[v.category]) groups[v.category] = [];
    groups[v.category].push(v);
  }
  const orderedGroupKeys = CATEGORIES.filter(c => groups[c]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: CREME }}>
        <div className="w-7 h-7 border-[1.5px] border-t-transparent rounded-full animate-spin"
          style={{ borderColor: `${GOLD} transparent ${GOLD} ${GOLD}` }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: CREME }}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={handleFileSelected}
      />

      {/* Header */}
      <div className="px-5 pt-10 pb-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[9px] tracking-[0.28em] uppercase mb-1"
              style={{ color: "rgba(61,50,42,0.36)", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
              Orçamento & Contratos
            </p>
            <h1 className="text-[30px] font-light leading-tight"
              style={{ color: BROWN, fontFamily: "'Cormorant Garamond', serif" }}>
              Fornecedores
            </h1>
          </div>
          <button onClick={openNew}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-sm mt-2 flex-shrink-0"
            style={{ background: GOLD, fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
            <Plus className="w-4 h-4" />
            Novo
          </button>
        </div>
      </div>

      {/* Ornamental divider */}
      <div className="flex items-center gap-2.5 mx-5 mb-5">
        <div className="flex-1 h-px" style={{ background: "rgba(169,137,80,0.16)" }} />
        <div className="w-[5px] h-[5px] rotate-45 opacity-55 flex-shrink-0" style={{ background: GOLD }} />
        <div className="flex-1 h-px" style={{ background: "rgba(169,137,80,0.16)" }} />
      </div>

      <div className="px-5 space-y-5 pb-4">

        {/* Summary cards */}
        {vendors.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl p-4 text-white"
              style={{ background: BROWN }}>
              <p className="text-xs mb-1" style={{ opacity: 0.6, fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>Contratado</p>
              <p className="text-xl font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{fmt(totalContratado)}</p>
            </div>
            <div className="rounded-2xl p-4"
              style={{ background: "white", border: "1.5px solid rgba(169,137,80,0.20)" }}>
              <p className="text-xs mb-1" style={{ color: "rgba(61,50,42,0.50)", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>Em cotação</p>
              <p className="text-xl font-light" style={{ color: BROWN, fontFamily: "'Cormorant Garamond', serif" }}>{fmt(totalCotado)}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar fornecedor..."
            className="flex-1 px-3 py-2 text-sm outline-none rounded-xl"
            style={{ border: "1.5px solid rgba(169,137,80,0.20)", color: BROWN, background: "white", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}
          />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-sm outline-none rounded-xl"
            style={{ border: "1.5px solid rgba(169,137,80,0.20)", color: BROWN, background: "white", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
            <option value="todos">Todos</option>
            <option value="cotado">Cotado</option>
            <option value="contratado">Contratado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>

        {/* Empty state */}
        {vendors.length === 0 && (
          <div className="rounded-2xl p-12 text-center"
            style={{ background: "white", border: "1.5px solid rgba(169,137,80,0.16)" }}>
            <p className="text-sm mb-5" style={{ color: "rgba(61,50,42,0.42)", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
              Nenhum fornecedor ainda
            </p>
            <button onClick={openNew}
              className="px-6 py-2.5 rounded-xl text-white text-sm"
              style={{ background: GOLD, fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
              Adicionar fornecedor
            </button>
          </div>
        )}

        {/* Grouped list */}
        {orderedGroupKeys.map(cat => (
          <div key={cat}>
            <p className="text-[9.5px] tracking-[0.3em] uppercase pb-2.5"
              style={{ color: GOLD, fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
              {cat}
            </p>
            <div className="space-y-3">
              {groups[cat].map(v => {
                const sc = STATUS_CONFIG[v.status] ?? { label: v.status, bg: BG_DARK, color: BROWN };
                const cc = CONTRACT_CONFIG[v.contractStatus] ?? CONTRACT_CONFIG["NONE"];
                return (
                  <div key={v.id} className="rounded-2xl p-4"
                    style={{ background: "white", border: "1.5px solid rgba(169,137,80,0.16)", boxShadow: "0 1px 6px rgba(61,50,42,0.04)" }}>

                    {/* Vendor header row */}
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <span className="text-[13px] font-medium" style={{ color: BROWN }}>{v.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full"
                            style={{ background: sc.bg, color: sc.color, fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
                            {sc.label}
                          </span>
                        </div>
                        {v.budget != null && (
                          <p className="text-[12px] font-medium mb-1" style={{ color: GOLD }}>
                            {fmt(v.budget)}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                          {v.phone && (
                            <a href={`tel:${v.phone}`} className="text-[11px]" style={{ color: "rgba(61,50,42,0.50)" }}>{v.phone}</a>
                          )}
                          {v.email && (
                            <a href={`mailto:${v.email}`} className="text-[11px] truncate max-w-[180px]" style={{ color: "rgba(61,50,42,0.50)" }}>{v.email}</a>
                          )}
                          {v.website && (
                            <a href={v.website} target="_blank" rel="noopener noreferrer"
                              className="text-[11px]" style={{ color: GOLD }}>Site ↗</a>
                          )}
                        </div>
                        {v.notes && (
                          <p className="text-[11px] mt-1.5 line-clamp-2" style={{ color: "rgba(61,50,42,0.42)" }}>{v.notes}</p>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-1 flex-shrink-0 items-center">
                        {confirmDeleteId === v.id ? (
                          <>
                            <button onClick={() => remove(v.id)}
                              className="px-2 py-1 rounded-lg text-xs text-white"
                              style={{ background: "#ef4444", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
                              Remover
                            </button>
                            <button onClick={() => setConfirmDeleteId(null)}
                              className="px-2 py-1 rounded-lg text-xs"
                              style={{ color: "rgba(61,50,42,0.42)", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
                              Não
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => openEdit(v)}
                              className="p-1.5 rounded-lg transition-colors"
                              style={{ color: "rgba(61,50,42,0.30)" }}>
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => setConfirmDeleteId(v.id)}
                              className="p-1.5 rounded-lg transition-colors"
                              style={{ color: "rgba(61,50,42,0.30)" }}>
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="mt-3 mb-3 h-px" style={{ background: "rgba(169,137,80,0.09)" }} />

                    {/* Contract status toggle */}
                    <button
                      onClick={() => cycleContractStatus(v)}
                      className="flex items-center gap-1.5 mb-3 transition-opacity hover:opacity-70"
                    >
                      <span className="text-[12px]" style={{ color: cc.color }}>{cc.dot}</span>
                      <span className="text-[10px]" style={{ color: cc.color, fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
                        {cc.label}
                      </span>
                    </button>

                    {/* Documents */}
                    {v.documents.length > 0 && (
                      <div className="space-y-1.5 mb-3">
                        {v.documents.map(doc => (
                          <div key={doc.id} className="flex items-center gap-2">
                            <a href={doc.url} target="_blank" rel="noopener noreferrer"
                              className="flex-1 flex items-center gap-1.5 min-w-0">
                              <span className="text-[13px] flex-shrink-0">📄</span>
                              <span className="text-[11px] truncate" style={{ color: GOLD, fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
                                {doc.name}
                              </span>
                            </a>
                            <button
                              onClick={() => deleteDocument(v.id, doc.id)}
                              className="flex-shrink-0 text-[11px] transition-opacity hover:opacity-70"
                              style={{ color: "rgba(61,50,42,0.35)" }}>
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => triggerUpload(v.id)}
                      disabled={uploadingFor === v.id}
                      className="flex items-center gap-1.5 text-[10px] disabled:opacity-50"
                      style={{ color: "rgba(61,50,42,0.42)", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
                      {uploadingFor === v.id ? (
                        <>
                          <div className="w-3 h-3 border border-t-transparent rounded-full animate-spin flex-shrink-0"
                            style={{ borderColor: `${GOLD} transparent ${GOLD} ${GOLD}` }} />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <span>+</span>
                          Adicionar documento
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.4)" }}
          onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-3xl w-full max-w-md max-h-[92vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[22px] font-light" style={{ color: BROWN, fontFamily: "'Cormorant Garamond', serif" }}>
                  {editing ? "Editar fornecedor" : "Novo fornecedor"}
                </h2>
                <button onClick={() => setShowForm(false)} style={{ color: "rgba(61,50,42,0.30)" }}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: "rgba(61,50,42,0.50)", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
                    Nome *
                  </label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Ex: Studio Luz Fotografia"
                    className="w-full px-3 py-2.5 text-sm outline-none rounded-xl"
                    style={{ border: "1.5px solid rgba(169,137,80,0.25)", color: BROWN }} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs mb-1.5" style={{ color: "rgba(61,50,42,0.50)", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>Categoria *</label>
                    <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                      className="w-full px-3 py-2.5 text-sm outline-none rounded-xl"
                      style={{ border: "1.5px solid rgba(169,137,80,0.25)", color: BROWN }}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs mb-1.5" style={{ color: "rgba(61,50,42,0.50)", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>Status</label>
                    <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                      className="w-full px-3 py-2.5 text-sm outline-none rounded-xl"
                      style={{ border: "1.5px solid rgba(169,137,80,0.25)", color: BROWN }}>
                      <option value="cotado">Cotado</option>
                      <option value="contratado">Contratado</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs mb-1.5" style={{ color: "rgba(61,50,42,0.50)", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>Valor orçado (R$)</label>
                  <input type="number" min="0" step="0.01" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
                    placeholder="0"
                    className="w-full px-3 py-2.5 text-sm outline-none rounded-xl"
                    style={{ border: "1.5px solid rgba(169,137,80,0.25)", color: BROWN }} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs mb-1.5" style={{ color: "rgba(61,50,42,0.50)", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>Telefone</label>
                    <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="(11) 9..."
                      className="w-full px-3 py-2.5 text-sm outline-none rounded-xl"
                      style={{ border: "1.5px solid rgba(169,137,80,0.25)", color: BROWN }} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1.5" style={{ color: "rgba(61,50,42,0.50)", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>Email</label>
                    <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="email@..."
                      className="w-full px-3 py-2.5 text-sm outline-none rounded-xl"
                      style={{ border: "1.5px solid rgba(169,137,80,0.25)", color: BROWN }} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs mb-1.5" style={{ color: "rgba(61,50,42,0.50)", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>Site / Instagram</label>
                  <input value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                    placeholder="https://..."
                    className="w-full px-3 py-2.5 text-sm outline-none rounded-xl"
                    style={{ border: "1.5px solid rgba(169,137,80,0.25)", color: BROWN }} />
                </div>

                <div>
                  <label className="block text-xs mb-1.5" style={{ color: "rgba(61,50,42,0.50)", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>Observações</label>
                  <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    rows={2} placeholder="Condições, detalhes..."
                    className="w-full px-3 py-2.5 text-sm outline-none rounded-xl resize-none"
                    style={{ border: "1.5px solid rgba(169,137,80,0.25)", color: BROWN }} />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowForm(false)}
                  className="flex-1 py-3 rounded-xl text-sm"
                  style={{ border: "1.5px solid rgba(169,137,80,0.25)", color: GOLD, fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
                  Cancelar
                </button>
                <button onClick={save} disabled={saving || !form.name.trim()}
                  className="flex-1 py-3 rounded-xl text-sm text-white disabled:opacity-50"
                  style={{ background: GOLD, fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
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
