"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp, Check } from "lucide-react";

const PHASE_LABELS: Record<string, string> = {
  TWELVE_MONTHS: "12 meses antes",
  SIX_MONTHS: "6 meses antes",
  THREE_MONTHS: "3 meses antes",
  ONE_MONTH: "1 mês antes",
  ONE_WEEK: "1 semana antes",
  DAY_OF: "Dia do casamento",
};

const PRIORITY_LABELS: Record<string, string> = {
  HIGH: "Alta",
  MEDIUM: "Média",
  LOW: "Baixa",
};

const PRIORITY_COLORS: Record<string, string> = {
  HIGH: "#EF4444",
  MEDIUM: "#A98950",
  LOW: "rgba(61,50,42,0.42)",
};

interface TemplateItem {
  id?: string;
  title: string;
  description: string;
  priority: string;
  daysBeforeWedding: number;
}

interface Template {
  id: string;
  name: string;
  description: string;
  phase: string;
  items: TemplateItem[];
}

const emptyItem = (): TemplateItem => ({
  title: "",
  description: "",
  priority: "MEDIUM",
  daysBeforeWedding: -30,
});

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    phase: "ONE_MONTH",
    items: [emptyItem()],
  });

  async function loadTemplates() {
    const res = await fetch("/api/planner/task-templates");
    if (res.ok) setTemplates(await res.json());
    setLoading(false);
  }

  useEffect(() => { loadTemplates(); }, []);

  function addItem() {
    setForm((f) => ({ ...f, items: [...f.items, emptyItem()] }));
  }

  function removeItem(index: number) {
    setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== index) }));
  }

  function updateItem(index: number, field: keyof TemplateItem, value: string | number) {
    setForm((f) => {
      const items = [...f.items];
      items[index] = { ...items[index], [field]: value };
      return { ...f, items };
    });
  }

  async function handleSave() {
    if (!form.name.trim() || form.items.some((i) => !i.title.trim())) return;
    setSaving(true);
    const res = await fetch("/api/planner/task-templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowModal(false);
      setForm({ name: "", description: "", phase: "ONE_MONTH", items: [emptyItem()] });
      setSaveError(false);
      loadTemplates();
    } else {
      setSaveError(true);
    }
    setSaving(false);
  }

  function closeModal() {
    setShowModal(false);
    setSaveError(false);
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/planner/task-templates/${id}`, { method: "DELETE" });
    if (res.ok) {
      setTemplates((t) => t.filter((x) => x.id !== id));
      setConfirmDeleteId(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF6EF] pb-24">
      {/* Header */}
      <div className="px-5 pt-10 pb-6">
        <p className="text-[9px] tracking-[0.28em] uppercase mb-1"
          style={{ color: "rgba(61,50,42,0.36)", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
          Cerimonialista
        </p>
        <h1 className="text-[30px] font-light leading-tight"
          style={{ color: "#3D322A", fontFamily: "'Cormorant Garamond', serif" }}>
          Templates de Tarefas
        </h1>
      </div>

      <div className="px-5 space-y-3">
        {/* New template button */}
        <button
          onClick={() => setShowModal(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-white text-sm transition active:scale-[0.98]"
          style={{ background: "#A98950", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300, letterSpacing: "0.08em" }}>
          <Plus className="w-4 h-4" />
          Novo Template
        </button>

        {/* Template list */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-7 h-7 border-[1.5px] border-t-transparent rounded-full animate-spin"
              style={{ borderColor: "#A98950 transparent #A98950 #A98950" }} />
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm" style={{ color: "rgba(61,50,42,0.42)", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
              Nenhum template criado ainda
            </p>
          </div>
        ) : (
          templates.map((t) => (
            <div key={t.id} className="bg-white rounded-2xl shadow-sm overflow-hidden"
              style={{ border: "1.5px solid rgba(169,137,80,0.16)" }}>
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] truncate"
                    style={{ color: "#3D322A", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
                    {t.name}
                  </p>
                  <p className="text-[11px]" style={{ color: "rgba(61,50,42,0.42)" }}>
                    {PHASE_LABELS[t.phase]} · {t.items.length} itens
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {confirmDeleteId === t.id ? (
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleDelete(t.id)}
                        className="px-2 py-1 text-[10px] rounded-lg text-white"
                        style={{ background: "#EF4444", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
                        Confirmar
                      </button>
                      <button onClick={() => setConfirmDeleteId(null)}
                        className="px-2 py-1 text-[10px] rounded-lg"
                        style={{ border: "1px solid rgba(169,137,80,0.3)", color: "rgba(61,50,42,0.42)" }}>
                        Não
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDeleteId(t.id)} className="p-2 rounded-lg hover:bg-red-50 transition">
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  )}
                  <button onClick={() => setExpandedId(expandedId === t.id ? null : t.id)} className="p-2 rounded-lg hover:bg-gray-50 transition">
                    {expandedId === t.id ? <ChevronUp className="w-4 h-4" style={{ color: "#A98950" }} /> : <ChevronDown className="w-4 h-4" style={{ color: "rgba(61,50,42,0.42)" }} />}
                  </button>
                </div>
              </div>
              {expandedId === t.id && (
                <div className="border-t px-5 pb-4 pt-3 space-y-2" style={{ borderColor: "rgba(169,137,80,0.10)" }}>
                  {t.items.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 py-2">
                      <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                        style={{ background: PRIORITY_COLORS[item.priority] }} />
                      <div>
                        <p className="text-[12px]" style={{ color: "#3D322A", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
                          {item.title}
                        </p>
                        <p className="text-[10px]" style={{ color: "rgba(61,50,42,0.42)" }}>
                          {PRIORITY_LABELS[item.priority]} · {Math.abs(item.daysBeforeWedding)} dias antes
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="bg-white w-full max-w-lg rounded-t-3xl max-h-[90vh] overflow-y-auto p-6 pb-10">
            <h2 className="text-[22px] font-light mb-5" style={{ color: "#3D322A", fontFamily: "'Cormorant Garamond', serif" }}>
              Novo Template
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] block mb-1.5"
                  style={{ color: "rgba(61,50,42,0.42)", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
                  Nome do template
                </label>
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Ex: Checklist 6 meses"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ border: "1.5px solid rgba(169,137,80,0.3)", color: "#3D322A", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }} />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] block mb-1.5"
                  style={{ color: "rgba(61,50,42,0.42)", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
                  Fase
                </label>
                <select value={form.phase} onChange={(e) => setForm((f) => ({ ...f, phase: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ border: "1.5px solid rgba(169,137,80,0.3)", color: "#3D322A", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
                  {Object.entries(PHASE_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>

              {/* Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] uppercase tracking-[0.2em]"
                    style={{ color: "rgba(61,50,42,0.42)", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
                    Itens
                  </label>
                  <button onClick={addItem} className="text-[11px] flex items-center gap-1" style={{ color: "#A98950" }}>
                    <Plus className="w-3 h-3" /> Adicionar
                  </button>
                </div>
                <div className="space-y-3">
                  {form.items.map((item, i) => (
                    <div key={i} className="rounded-xl p-3 space-y-2" style={{ background: "#FAF6EF" }}>
                      <input value={item.title} onChange={(e) => updateItem(i, "title", e.target.value)}
                        placeholder="Título da tarefa"
                        className="w-full px-3 py-2 rounded-lg text-sm outline-none bg-white"
                        style={{ border: "1px solid rgba(169,137,80,0.2)", color: "#3D322A", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }} />
                      <div className="flex gap-2">
                        <select value={item.priority} onChange={(e) => updateItem(i, "priority", e.target.value)}
                          className="flex-1 px-3 py-2 rounded-lg text-xs outline-none bg-white"
                          style={{ border: "1px solid rgba(169,137,80,0.2)", color: "#3D322A" }}>
                          <option value="HIGH">Alta</option>
                          <option value="MEDIUM">Média</option>
                          <option value="LOW">Baixa</option>
                        </select>
                        <input type="number" value={Math.abs(item.daysBeforeWedding)}
                          onChange={(e) => updateItem(i, "daysBeforeWedding", -Math.abs(Number(e.target.value)))}
                          placeholder="dias antes"
                          className="w-28 px-3 py-2 rounded-lg text-xs outline-none bg-white"
                          style={{ border: "1px solid rgba(169,137,80,0.2)", color: "#3D322A" }} />
                        {form.items.length > 1 && (
                          <button onClick={() => removeItem(i)} className="p-2 rounded-lg hover:bg-red-50">
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {saveError && (
              <p className="text-[11px] text-red-500 text-center mt-3">
                Erro ao salvar. Tente novamente.
              </p>
            )}

            <div className="flex gap-3 mt-6">
              <button onClick={closeModal} className="flex-1 py-3 rounded-xl text-sm"
                style={{ border: "1.5px solid rgba(169,137,80,0.3)", color: "#A98950", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-3 rounded-xl text-white text-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
                style={{ background: "#A98950", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
                {saving ? <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
