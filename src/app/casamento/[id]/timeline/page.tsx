"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";

/* ─── Types ─────────────────────────────────────────────────────────── */

type EventStatus = "pending" | "done";
type EventCategory = "cerimonia" | "recepcao" | "transicao" | "logistica";

interface TimelineEvent {
  id: string;
  time: string;
  title: string;
  description?: string | null;
  responsible?: string | null;
  status: EventStatus;
  category: EventCategory;
  order: number;
}

interface WeddingInfo {
  weddingDate?: string | null;
  partnerName1: string;
  partnerName2: string;
}

/* ─── Templates ─────────────────────────────────────────────────────── */

type TemplateEvent = Omit<TimelineEvent, "id">;

const TEMPLATES: Record<string, TemplateEvent[]> = {
  classico: [
    { time: "10:00", title: "Chegada dos fornecedores", description: "Flores, buffet e decoração montando o espaço", responsible: "Cerimonialista", status: "pending", category: "logistica", order: 0 },
    { time: "12:00", title: "Preparativos da noiva", description: "Penteado, maquiagem e traje", responsible: "Noiva + equipe", status: "pending", category: "logistica", order: 1 },
    { time: "14:00", title: "Preparativos do noivo", description: "Traje e fotos antes da cerimônia", responsible: "Noivo", status: "pending", category: "logistica", order: 2 },
    { time: "15:30", title: "Abertura das portas para os convidados", description: "Recepção dos convidados na entrada", responsible: "Equipe de recepção", status: "pending", category: "recepcao", order: 3 },
    { time: "16:00", title: "Cerimônia", description: "Entrada dos padrinhos, noivo e noiva", responsible: "Celebrante", status: "pending", category: "cerimonia", order: 4 },
    { time: "17:00", title: "Sessão de fotos dos noivos", description: "Fotos formais e criativas", responsible: "Fotógrafo", status: "pending", category: "transicao", order: 5 },
    { time: "17:30", title: "Coquetel", description: "Drinks e petiscos para os convidados", responsible: "Buffet", status: "pending", category: "recepcao", order: 6 },
    { time: "19:00", title: "Abertura da festa", description: "Entrada dos noivos na recepção", responsible: "DJ / Banda", status: "pending", category: "recepcao", order: 7 },
    { time: "19:30", title: "Jantar", description: "Serviço de jantar e mesa posta", responsible: "Buffet", status: "pending", category: "recepcao", order: 8 },
    { time: "21:00", title: "Corte do bolo", description: "Momento do bolo com os noivos", responsible: "Noivos + fotógrafo", status: "pending", category: "cerimonia", order: 9 },
    { time: "22:00", title: "Abertura da pista de dança", description: "Primeira música e abertura para todos", responsible: "DJ / Banda", status: "pending", category: "recepcao", order: 10 },
    { time: "00:00", title: "Encerramento", description: "Despedida dos noivos e desmontagem", responsible: "Cerimonialista", status: "pending", category: "logistica", order: 11 },
  ],
  destination: [
    { time: "09:00", title: "Check-in dos convidados no hotel", description: "Recepção e entrega dos kits de boas-vindas", responsible: "Equipe de recepção", status: "pending", category: "logistica", order: 0 },
    { time: "11:00", title: "Passeio ou atividade opcional", description: "Opcional para quem quiser explorar o destino", responsible: "Guia local", status: "pending", category: "logistica", order: 1 },
    { time: "14:00", title: "Preparativos dos noivos", description: "Salão, vestido e traje", responsible: "Equipe de beleza", status: "pending", category: "logistica", order: 2 },
    { time: "16:30", title: "Cerimônia ao ar livre", description: "Cerimônia no local principal do destino", responsible: "Celebrante", status: "pending", category: "cerimonia", order: 3 },
    { time: "17:30", title: "Sessão de fotos na paisagem", description: "Aproveitando o pôr do sol e o cenário único", responsible: "Fotógrafo", status: "pending", category: "transicao", order: 4 },
    { time: "18:00", title: "Coquetel ao ar livre", description: "Aperitivos e drinks com vista", responsible: "Buffet local", status: "pending", category: "recepcao", order: 5 },
    { time: "20:00", title: "Jantar de celebração", description: "Jantar intimista com gastronomia local", responsible: "Restaurante / Buffet", status: "pending", category: "recepcao", order: 6 },
    { time: "22:00", title: "Festa e dança", description: "Música e celebração sob as estrelas", responsible: "DJ", status: "pending", category: "recepcao", order: 7 },
    { time: "00:30", title: "Encerramento e brinde final", description: "Despedida especial dos noivos", responsible: "Noivos", status: "pending", category: "cerimonia", order: 8 },
  ],
  intimo: [
    { time: "14:00", title: "Chegada dos convidados", description: "Recepção calorosa na entrada", responsible: "Noivos", status: "pending", category: "recepcao", order: 0 },
    { time: "14:30", title: "Sessão de fotos prévia", description: "Fotos descontraídas com os convidados", responsible: "Fotógrafo", status: "pending", category: "transicao", order: 1 },
    { time: "15:00", title: "Cerimônia íntima", description: "Troca de votos em ambiente acolhedor", responsible: "Celebrante / Familiar", status: "pending", category: "cerimonia", order: 2 },
    { time: "15:45", title: "Brinde de celebração", description: "Champanhe e palavras dos convidados especiais", responsible: "Todos", status: "pending", category: "cerimonia", order: 3 },
    { time: "16:00", title: "Almoço / Jantar compartilhado", description: "Mesa farta e comida afetiva", responsible: "Buffet / Família", status: "pending", category: "recepcao", order: 4 },
    { time: "17:30", title: "Corte do bolo", description: "Momento doce com os mais próximos", responsible: "Noivos", status: "pending", category: "cerimonia", order: 5 },
    { time: "18:00", title: "Momentos livres", description: "Conversa e celebração espontânea", responsible: "Todos", status: "pending", category: "recepcao", order: 6 },
    { time: "20:00", title: "Encerramento", description: "Despedida afetiva e partida dos noivos", responsible: "Noivos", status: "pending", category: "logistica", order: 7 },
  ],
};

/* ─── Cores por categoria ────────────────────────────────────────────── */

const CATEGORY_COLORS: Record<EventCategory, { dot: string; badge: string; border: string }> = {
  cerimonia:  { dot: "bg-gold",      badge: "bg-gold/10 text-gold",           border: "border-gold/30" },
  recepcao:   { dot: "bg-midnight",        badge: "bg-midnight/10 text-midnight",               border: "border-midnight/30" },
  transicao:  { dot: "bg-gray-400",    badge: "bg-gray-100 text-gray-500",          border: "border-gray-300" },
  logistica:  { dot: "bg-midnight", badge: "bg-midnight/10 text-midnight", border: "border-midnight/30" },
};

const CATEGORY_LABELS: Record<EventCategory, string> = {
  cerimonia: "Cerimônia",
  recepcao:  "Recepção",
  transicao: "Transição",
  logistica: "Logística",
};

/* ─── Icons ─────────────────────────────────────────────────────────── */

function PlusIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

/* ─── Modal de adição/edição ─────────────────────────────────────────── */

interface ModalProps {
  initial?: Partial<TimelineEvent>;
  onClose: () => void;
  onSave: (data: Omit<TimelineEvent, "id">) => Promise<void>;
}

function EventModal({ initial, onClose, onSave }: ModalProps) {
  const [time, setTime] = useState(initial?.time ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [responsible, setResponsible] = useState(initial?.responsible ?? "");
  const [category, setCategory] = useState<EventCategory>(initial?.category ?? "cerimonia");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!time || !title) return;
    setSaving(true);
    await onSave({
      time,
      title,
      description: description || null,
      responsible: responsible || null,
      category,
      status: initial?.status ?? "pending",
      order: initial?.order ?? 0,
    });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto pb-safe">
        {/* Handle bar mobile */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-heading text-xl text-midnight">
              {initial?.id ? "Editar evento" : "Novo evento"}
            </h2>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400">
              <XIcon />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-body text-xs font-medium text-gray-500 mb-1.5">Horário *</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 font-body text-sm text-midnight focus:outline-none focus:ring-2 focus:ring-midnight/30 focus:border-midnight"
                />
              </div>
              <div>
                <label className="block font-body text-xs font-medium text-gray-500 mb-1.5">Categoria</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as EventCategory)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 font-body text-sm text-midnight focus:outline-none focus:ring-2 focus:ring-midnight/30 focus:border-midnight bg-white"
                >
                  {(Object.keys(CATEGORY_LABELS) as EventCategory[]).map((cat) => (
                    <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-body text-xs font-medium text-gray-500 mb-1.5">Título *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ex: Entrada da noiva"
                required
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 font-body text-sm text-midnight placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-midnight/30 focus:border-midnight"
              />
            </div>

            <div>
              <label className="block font-body text-xs font-medium text-gray-500 mb-1.5">Responsável</label>
              <input
                type="text"
                value={responsible}
                onChange={(e) => setResponsible(e.target.value)}
                placeholder="ex: Cerimonialista"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 font-body text-sm text-midnight placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-midnight/30 focus:border-midnight"
              />
            </div>

            <div>
              <label className="block font-body text-xs font-medium text-gray-500 mb-1.5">Descrição</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detalhes do evento..."
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 font-body text-sm text-midnight placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-midnight/30 focus:border-midnight resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={saving || !time || !title}
              className="w-full bg-midnight text-white font-body text-sm font-semibold py-3 rounded-xl hover:bg-midnight/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Salvando..." : initial?.id ? "Salvar alterações" : "Adicionar evento"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ─── Componente do item de timeline ─────────────────────────────────── */

interface EventItemProps {
  event: TimelineEvent;
  isNext: boolean;
  isLast: boolean;
  onToggle: (id: string, current: EventStatus) => void;
  onEdit: (event: TimelineEvent) => void;
  onDelete: (id: string) => void;
}

function EventItem({ event, isNext, isLast, onToggle, onEdit, onDelete }: EventItemProps) {
  const colors = CATEGORY_COLORS[event.category];
  const isDone = event.status === "done";
  const [showDelete, setShowDelete] = useState(false);

  return (
    <div className="flex gap-3 group">
      {/* Coluna do horário */}
      <div className="w-12 flex-shrink-0 flex flex-col items-center pt-0.5">
        <span className={`font-body text-xs font-semibold leading-tight text-center ${isDone ? "text-gray-300" : "text-midnight"}`}>
          {event.time}
        </span>
      </div>

      {/* Linha vertical + ponto */}
      <div className="flex flex-col items-center flex-shrink-0 mt-0.5">
        <div
          className={`w-3 h-3 rounded-full flex-shrink-0 transition-all ${
            isDone
              ? "bg-gray-200"
              : isNext
              ? `${colors.dot} animate-pulse shadow-md`
              : colors.dot
          }`}
        />
        {!isLast && (
          <div className={`w-px flex-1 mt-1 min-h-[40px] ${isDone ? "bg-gray-100" : "bg-gray-200"}`} />
        )}
      </div>

      {/* Conteúdo do evento */}
      <div
        className={`flex-1 mb-4 rounded-2xl border p-3.5 transition-all ${
          isDone
            ? "bg-gray-50 border-gray-100 opacity-60"
            : isNext
            ? `bg-white ${colors.border} shadow-sm border`
            : "bg-white border-gray-100"
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span
                className={`px-2 py-0.5 rounded-full font-body text-[10px] font-semibold ${colors.badge}`}
              >
                {CATEGORY_LABELS[event.category]}
              </span>
              {isNext && !isDone && (
                <span className="px-2 py-0.5 rounded-full font-body text-[10px] font-semibold bg-amber-50 text-amber-600">
                  próximo
                </span>
              )}
            </div>
            <p className={`font-body text-sm font-semibold leading-tight ${isDone ? "line-through text-gray-400" : "text-midnight"}`}>
              {event.title}
            </p>
            {event.description && (
              <p className={`font-body text-xs mt-0.5 leading-relaxed ${isDone ? "text-gray-300" : "text-gray-400"}`}>
                {event.description}
              </p>
            )}
            {event.responsible && (
              <p className={`font-body text-xs mt-1 ${isDone ? "text-gray-300" : "text-gray-400"}`}>
                <span className="font-medium">Responsável:</span> {event.responsible}
              </p>
            )}
          </div>

          {/* Ações */}
          <div className="flex items-start gap-1.5 flex-shrink-0">
            {showDelete ? (
              <>
                <button
                  onClick={() => { onDelete(event.id); setShowDelete(false); }}
                  className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                  title="Confirmar exclusão"
                >
                  <TrashIcon />
                </button>
                <button
                  onClick={() => setShowDelete(false)}
                  className="p-1.5 rounded-lg bg-gray-100 text-gray-400 hover:bg-gray-200 transition-colors"
                >
                  <XIcon />
                </button>
              </>
            ) : (
              <>
                {/* Checkbox de feito */}
                <button
                  onClick={() => onToggle(event.id, event.status)}
                  className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    isDone
                      ? "bg-midnight border-midnight"
                      : "border-gray-300 hover:border-midnight"
                  }`}
                  title={isDone ? "Marcar como pendente" : "Marcar como feito"}
                >
                  {isDone && (
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                {/* Editar */}
                <button
                  onClick={() => onEdit(event)}
                  className="p-1 rounded-lg text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
                  title="Editar"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                {/* Deletar */}
                <button
                  onClick={() => setShowDelete(true)}
                  className="p-1 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                  title="Remover"
                >
                  <TrashIcon />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────── */

export default function TimelinePage() {
  const params = useParams();
  const weddingId = params.id as string;
  const { data: session, status: authStatus } = useSession();

  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [wedding, setWedding] = useState<WeddingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  const [templateLoading, setTemplateLoading] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  const fetchData = useCallback(async () => {
    try {
      const [eventsRes, weddingRes] = await Promise.all([
        fetch(`/api/weddings/${weddingId}/timeline`),
        fetch(`/api/weddings/${weddingId}`),
      ]);
      if (eventsRes.ok) setEvents(await eventsRes.json());
      if (weddingRes.ok) setWedding(await weddingRes.json());
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [weddingId]);

  useEffect(() => {
    if (authStatus === "authenticated" && !fetchedRef.current) {
      fetchedRef.current = true;
      fetchData();
    }
  }, [authStatus, fetchData]);

  // Próximo evento pendente
  const nextEventId = events.find((e) => e.status === "pending")?.id ?? null;

  // Progresso
  const total = events.length;
  const done = events.filter((e) => e.status === "done").length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  /* ── Handlers ── */

  const handleToggle = async (id: string, current: EventStatus) => {
    const newStatus: EventStatus = current === "done" ? "pending" : "done";
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e)));
    try {
      await fetch(`/api/weddings/${weddingId}/timeline/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch {
      // reverte em caso de erro
      setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, status: current } : e)));
    }
  };

  const handleDelete = async (id: string) => {
    const backup = events.find((e) => e.id === id);
    setEvents((prev) => prev.filter((e) => e.id !== id));
    try {
      const res = await fetch(`/api/weddings/${weddingId}/timeline/${id}`, { method: "DELETE" });
      if (!res.ok && backup) setEvents((prev) => [...prev, backup].sort((a, b) => a.order - b.order));
    } catch {
      if (backup) setEvents((prev) => [...prev, backup].sort((a, b) => a.order - b.order));
    }
  };

  const handleSaveNew = async (data: Omit<TimelineEvent, "id">) => {
    const res = await fetch(`/api/weddings/${weddingId}/timeline`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const created: TimelineEvent = await res.json();
      setEvents((prev) => [...prev, created].sort((a, b) => {
        if (a.order !== b.order) return a.order - b.order;
        return a.time.localeCompare(b.time);
      }));
    }
    setModalOpen(false);
  };

  const handleSaveEdit = async (data: Omit<TimelineEvent, "id">) => {
    if (!editingEvent) return;
    const res = await fetch(`/api/weddings/${weddingId}/timeline/${editingEvent.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const updated: TimelineEvent = await res.json();
      setEvents((prev) => prev.map((e) => (e.id === editingEvent.id ? updated : e)));
    }
    setEditingEvent(null);
  };

  const handleUseTemplate = async (templateKey: string) => {
    const templateEvents = TEMPLATES[templateKey];
    if (!templateEvents) return;

    if (events.length > 0) {
      const confirmed = window.confirm(
        "Isso substituirá a timeline atual. Deseja continuar?"
      );
      if (!confirmed) return;

      // Deleta todos os eventos atuais
      await Promise.all(
        events.map((e) =>
          fetch(`/api/weddings/${weddingId}/timeline/${e.id}`, { method: "DELETE" })
        )
      );
    }

    setTemplateLoading(templateKey);
    const created: TimelineEvent[] = [];
    for (const tpl of templateEvents) {
      const res = await fetch(`/api/weddings/${weddingId}/timeline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tpl),
      });
      if (res.ok) created.push(await res.json());
    }
    setEvents(created);
    setTemplateLoading(null);
  };

  /* ── Render ── */

  if (authStatus === "loading" || loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-midnight border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) return null;

  const formattedDate = wedding?.weddingDate
    ? new Date(wedding.weddingDate).toLocaleDateString("pt-BR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="min-h-screen bg-ivory">
      {/* Header */}
      <div className="bg-gradient-to-br from-midnight via-midnight to-midnight/80 px-5 pt-12 pb-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <CalendarIcon />
            <span className="font-body text-xs text-white/60 uppercase tracking-wider">Dia D</span>
          </div>
          <h1 className="font-heading text-3xl text-white mb-1">Timeline do Dia</h1>
          {formattedDate && (
            <p className="font-body text-sm text-white/60">{formattedDate}</p>
          )}
          {wedding && (
            <p className="font-body text-sm text-white/50 mt-0.5">
              {wedding.partnerName1} &amp; {wedding.partnerName2}
            </p>
          )}
        </div>
      </div>

      {/* Barra de progresso */}
      {total > 0 && (
        <div className="px-4 -mt-5 relative z-10 mb-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-body text-xs text-gray-400">Progresso do dia</span>
              <span className="font-body text-xs font-semibold text-midnight">{done}/{total} concluídos</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-midnight to-green-400 rounded-full transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
            {pct === 100 && (
              <p className="font-body text-xs text-midnight mt-2 text-center font-semibold">
                🎊 Parabéns! Todos os momentos foram concluídos!
              </p>
            )}
          </div>
        </div>
      )}

      {/* Templates */}
      {events.length === 0 && (
        <div className="px-4 mt-4 mb-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <p className="font-body text-sm font-semibold text-midnight mb-1">Usar um template</p>
            <p className="font-body text-xs text-gray-400 mb-3">
              Comece rapidamente com eventos pré-definidos para o seu estilo de casamento.
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: "classico",   label: "Casamento\nclássico",   emoji: "💍" },
                { key: "destination", label: "Destination\nWedding",  emoji: "✈️" },
                { key: "intimo",     label: "Casamento\níntimo",      emoji: "🌿" },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => handleUseTemplate(t.key)}
                  disabled={templateLoading !== null}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-gray-200 hover:border-midnight/40 hover:bg-midnight/5 transition-all active:scale-[0.97] disabled:opacity-50"
                >
                  <span className="text-xl">{t.emoji}</span>
                  <span className="font-body text-[11px] text-center text-gray-600 leading-tight whitespace-pre-line">
                    {templateLoading === t.key ? "Criando..." : t.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Botão de template quando já há eventos */}
      {events.length > 0 && (
        <div className="px-4 mt-4 mb-1">
          <details className="group">
            <summary className="list-none flex items-center gap-2 cursor-pointer">
              <span className="font-body text-xs text-gray-400 hover:text-gray-600 transition-colors">
                Usar template pré-definido
              </span>
              <svg className="w-3 h-3 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {[
                { key: "classico",    label: "Clássico",    emoji: "💍" },
                { key: "destination", label: "Destination", emoji: "✈️" },
                { key: "intimo",      label: "Íntimo",      emoji: "🌿" },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => handleUseTemplate(t.key)}
                  disabled={templateLoading !== null}
                  className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl border border-gray-200 hover:border-midnight/40 hover:bg-midnight/5 transition-all text-left disabled:opacity-50"
                >
                  <span className="text-base">{t.emoji}</span>
                  <span className="font-body text-xs text-gray-600">{t.label}</span>
                </button>
              ))}
            </div>
          </details>
        </div>
      )}

      {/* Lista de eventos */}
      <div className="px-4 pt-4 pb-28">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-midnight/5 flex items-center justify-center mb-4">
              <CalendarIcon />
            </div>
            <p className="font-body text-sm text-gray-400 mb-1">Nenhum evento ainda</p>
            <p className="font-body text-xs text-gray-300">
              Use um template ou adicione eventos manualmente com o botão +
            </p>
          </div>
        ) : (
          <div>
            {/* Legenda de categorias */}
            <div className="flex flex-wrap gap-2 mb-5">
              {(Object.keys(CATEGORY_LABELS) as EventCategory[]).map((cat) => (
                <span key={cat} className={`flex items-center gap-1 px-2 py-0.5 rounded-full font-body text-[10px] font-semibold ${CATEGORY_COLORS[cat].badge}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${CATEGORY_COLORS[cat].dot}`} />
                  {CATEGORY_LABELS[cat]}
                </span>
              ))}
            </div>

            {/* Timeline */}
            <div>
              {events.map((event, idx) => (
                <EventItem
                  key={event.id}
                  event={event}
                  isNext={event.id === nextEventId}
                  isLast={idx === events.length - 1}
                  onToggle={handleToggle}
                  onEdit={(e) => setEditingEvent(e)}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FAB — botão "+" flutuante */}
      <button
        onClick={() => setModalOpen(true)}
        className="fixed bottom-24 right-5 z-40 w-14 h-14 bg-midnight text-white rounded-full shadow-lg hover:bg-midnight/90 active:scale-95 transition-all flex items-center justify-center"
        title="Adicionar evento"
      >
        <PlusIcon />
      </button>

      {/* Modais */}
      {modalOpen && (
        <EventModal
          onClose={() => setModalOpen(false)}
          onSave={handleSaveNew}
        />
      )}
      {editingEvent && (
        <EventModal
          initial={editingEvent}
          onClose={() => setEditingEvent(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}
