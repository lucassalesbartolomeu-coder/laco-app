"use client";

import { useState, useMemo } from "react";

/* ─── Types ─────────────────────────────────────────────────────────── */

export interface GuestEntry {
  id: string;
  name: string;
  phone: string | null;
  rsvpStatus: string;
  guestList?: string;
  whatsappSentAt?: string | null;
}

interface SendResult {
  id: string;
  name: string;
  phone: string | null;
  sent: boolean;
  error?: string;
}

export interface WhatsAppBlastProps {
  weddingId: string;
  /** Todos os convidados disponíveis para seleção. */
  guests: GuestEntry[];
  /** Info do casamento para preencher variáveis na mensagem. */
  weddingInfo?: {
    date?: string | null;
    venue?: string | null;
    slug?: string | null;
  };
  onClose: () => void;
  /** Chamado com os IDs dos convidados que tiveram WhatsApp enviado com sucesso. */
  onSent?: (guestIds: string[]) => void;
}

type FilterTab = "todos" | "pendentes" | "nao_enviados";
type ListFilter = "todos" | "A" | "B" | "C";

const DEFAULT_MESSAGE = `Olá {nome}! 💍

Você está confirmado(a) no nosso casamento?

📅 Data: {data_casamento}
📍 Local: {local}

Para confirmar sua presença, acesse: {link_rsvp}

Qualquer dúvida, é só falar! 💚`;

const STATUS_LABELS: Record<string, string> = {
  confirmado: "Confirmado",
  pendente: "Pendente",
  recusado: "Recusado",
};

const STATUS_COLORS: Record<string, string> = {
  confirmado: "bg-green-100 text-green-700",
  pendente: "bg-amber-100 text-amber-700",
  recusado: "bg-red-100 text-red-700",
};

const VARIABLES = [
  { tag: "{nome}", desc: "Primeiro nome do convidado" },
  { tag: "{data_casamento}", desc: "Data do casamento" },
  { tag: "{local}", desc: "Local do casamento" },
  { tag: "{link_rsvp}", desc: "Link para confirmar presença" },
];

/* ─── Icons ──────────────────────────────────────────────────────────── */

function WhatsAppIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function CloseIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

/* ─── Helpers ────────────────────────────────────────────────────────── */

function formatDatePt(isoOrStr?: string | null): string {
  if (!isoOrStr) return "data a confirmar";
  try {
    const d = new Date(isoOrStr);
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  } catch {
    return "data a confirmar";
  }
}

function buildRsvpLink(slug?: string | null, weddingId?: string): string {
  const base = typeof window !== "undefined" ? window.location.origin : "https://lacocasamentos.com.br";
  if (slug) return `${base}/casamento/${slug}`;
  if (weddingId) return `${base}/casamento/${weddingId}`;
  return `${base}/casamento`;
}

function personalizeMessage(
  template: string,
  guestName: string,
  weddingInfo?: WhatsAppBlastProps["weddingInfo"],
  weddingId?: string,
): string {
  const firstName = guestName.split(" ")[0];
  return template
    .replace(/\{nome\}/gi, firstName)
    .replace(/\{data_casamento\}/gi, formatDatePt(weddingInfo?.date))
    .replace(/\{local\}/gi, weddingInfo?.venue ?? "local a confirmar")
    .replace(/\{link_rsvp\}/gi, buildRsvpLink(weddingInfo?.slug, weddingId));
}

/* ─── Component ──────────────────────────────────────────────────────── */

export default function WhatsAppBlast({
  weddingId,
  guests,
  weddingInfo,
  onClose,
  onSent,
}: WhatsAppBlastProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [filterTab, setFilterTab] = useState<FilterTab>("todos");
  const [listFilter, setListFilter] = useState<ListFilter>("todos");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [sending, setSending] = useState(false);
  const [sendingProgress, setSendingProgress] = useState(0);
  const [sendingTotal, setSendingTotal] = useState(0);
  const [results, setResults] = useState<SendResult[]>([]);

  /* ── Filtered guest lists ─────────────────────────────────────────── */

  const filteredGuests = useMemo(() => {
    let list = guests;

    // Filtro por lista (A/B/C)
    if (listFilter !== "todos") {
      list = list.filter((g) => (g.guestList || "A") === listFilter);
    }

    // Filtro por status/envio
    if (filterTab === "pendentes") list = list.filter((g) => g.rsvpStatus === "pendente");
    if (filterTab === "nao_enviados") list = list.filter((g) => !g.whatsappSentAt);

    return list;
  }, [guests, filterTab, listFilter]);

  const selectableGuests = useMemo(
    () => filteredGuests.filter((g) => g.phone),
    [filteredGuests]
  );

  const allSelected =
    selectableGuests.length > 0 &&
    selectableGuests.every((g) => selectedIds.has(g.id));

  const selectedCount = selectedIds.size;

  /* ── Selection helpers ────────────────────────────────────────────── */

  function toggleSelectAll() {
    if (allSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        selectableGuests.forEach((g) => next.delete(g.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        selectableGuests.forEach((g) => next.add(g.id));
        return next;
      });
    }
  }

  function selectByList(list: "A" | "B" | "C") {
    const ids = guests.filter((g) => (g.guestList || "A") === list && g.phone).map((g) => g.id);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      return next;
    });
    setListFilter(list);
  }

  function toggleGuest(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  /* ── Insert variable ─────────────────────────────────────────────── */

  function insertVariable(tag: string) {
    setMessage((prev) => prev + tag);
  }

  /* ── Send ─────────────────────────────────────────────────────────── */

  async function handleSend() {
    if (!selectedCount || sending) return;
    setSending(true);
    setSendingProgress(0);
    setSendingTotal(selectedCount);

    try {
      // Envia em lotes para ter feedback de progresso
      const allIds = Array.from(selectedIds);
      const batchSize = 5;
      const allResults: SendResult[] = [];

      for (let i = 0; i < allIds.length; i += batchSize) {
        const batch = allIds.slice(i, i + batchSize);
        setSendingProgress(i);

        const res = await fetch(`/api/weddings/${weddingId}/whatsapp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "send",
            guestIds: batch,
            message,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          allResults.push(...(data.results ?? []));
        }
      }

      setSendingProgress(allIds.length);
      setResults(allResults);

      // Notifica a página com os IDs enviados com sucesso
      const sentIds = allResults.filter((r) => r.sent).map((r) => r.id);
      if (sentIds.length > 0 && onSent) {
        onSent(sentIds);
      }

      setStep(3);
    } catch (err) {
      console.error("Erro ao enviar WhatsApp blast:", err);
    } finally {
      setSending(false);
    }
  }

  /* ── Preview ──────────────────────────────────────────────────────── */

  const previewGuest = guests.find((g) => selectedIds.has(g.id) && g.phone);
  const previewName = previewGuest?.name ?? "Convidado";
  const previewMessage = personalizeMessage(message, previewName, weddingInfo, weddingId);

  /* ── Counts ──────────────────────────────────────────────────────── */
  const sentOk = results.filter((r) => r.sent).length;
  const sentFail = results.filter((r) => !r.sent && r.phone).length;

  const listACnt = guests.filter((g) => (g.guestList || "A") === "A" && g.phone).length;
  const listBCnt = guests.filter((g) => g.guestList === "B" && g.phone).length;

  /* ── Render ────────────────────────────────────────────────────────── */

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4 py-6">
      {/* backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* modal card */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col z-10">
        {/* header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center flex-shrink-0">
              <WhatsAppIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-heading text-lg text-midnight leading-tight">WhatsApp em Massa</h2>
              <p className="font-body text-xs text-gray-400">
                {step === 1 && "Passo 1 de 3 — Selecionar convidados"}
                {step === 2 && "Passo 2 de 3 — Compor mensagem"}
                {step === 3 && "Passo 3 de 3 — Resultado"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          >
            <CloseIcon />
          </button>
        </div>

        {/* progress bar */}
        <div className="h-1 bg-gray-100 flex-shrink-0">
          <div
            className="h-full bg-green-500 transition-all duration-300"
            style={{ width: step === 1 ? "33%" : step === 2 ? "66%" : "100%" }}
          />
        </div>

        {/* ── Step 1 — Select guests ─────────────────────────────────── */}
        {step === 1 && (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {/* Quick select by list */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => selectByList("A")}
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-200 hover:border-midnight hover:bg-midnight/5 transition text-left"
                >
                  <p className="font-body text-xs font-semibold text-midnight">👑 Lista A</p>
                  <p className="font-body text-[11px] text-gray-400">{listACnt} com telefone</p>
                </button>
                <button
                  onClick={() => selectByList("B")}
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-200 hover:border-amber-400 hover:bg-amber-50 transition text-left"
                >
                  <p className="font-body text-xs font-semibold text-amber-600">🔄 Lista B</p>
                  <p className="font-body text-[11px] text-gray-400">{listBCnt} com telefone</p>
                </button>
                <button
                  onClick={() => {
                    setListFilter("todos");
                    setSelectedIds(new Set(guests.filter((g) => g.phone).map((g) => g.id)));
                  }}
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition text-left"
                >
                  <p className="font-body text-xs font-semibold text-gray-600">Todos</p>
                  <p className="font-body text-[11px] text-gray-400">{guests.filter((g) => g.phone).length} total</p>
                </button>
              </div>

              {/* Filter tabs */}
              <div className="flex gap-1 mb-3 bg-gray-100 p-1 rounded-xl">
                {(
                  [
                    { key: "todos", label: "Todos" },
                    { key: "pendentes", label: "Pendentes" },
                    { key: "nao_enviados", label: "Não enviados" },
                  ] as { key: FilterTab; label: string }[]
                ).map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setFilterTab(key)}
                    className={`flex-1 px-3 py-1.5 rounded-lg font-body text-sm font-medium transition ${
                      filterTab === key
                        ? "bg-white text-midnight shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Lista por lista A/B/C */}
              <div className="flex gap-1 mb-4 bg-gray-50 p-1 rounded-xl border border-gray-100">
                {(["todos", "A", "B", "C"] as ListFilter[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => setListFilter(l)}
                    className={`flex-1 px-2 py-1 rounded-lg font-body text-xs font-medium transition ${
                      listFilter === l
                        ? "bg-white text-midnight shadow-sm"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {l === "todos" ? "Todas" : `Lista ${l}`}
                  </button>
                ))}
              </div>

              {/* Select all */}
              <label className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 cursor-pointer mb-2 border border-gray-100">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 accent-green-600 rounded"
                />
                <span className="font-body text-sm font-semibold text-midnight flex-1">
                  Selecionar todos visíveis
                </span>
                <span className="font-body text-xs text-gray-400">
                  {selectableGuests.length} com telefone
                </span>
              </label>

              {/* Guest list */}
              <div className="space-y-0.5">
                {filteredGuests.length === 0 && (
                  <p className="font-body text-sm text-gray-400 text-center py-6">
                    Nenhum convidado encontrado com esse filtro.
                  </p>
                )}
                {filteredGuests.map((guest) => {
                  const hasPhone = !!guest.phone;
                  const isSelected = selectedIds.has(guest.id);
                  const wasSent = !!guest.whatsappSentAt;
                  return (
                    <label
                      key={guest.id}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition ${
                        hasPhone
                          ? "hover:bg-gray-50 cursor-pointer"
                          : "opacity-40 cursor-default"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => hasPhone && toggleGuest(guest.id)}
                        disabled={!hasPhone}
                        className="w-4 h-4 accent-green-600 rounded flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-body text-sm font-medium text-midnight truncate">
                            {guest.name}
                          </p>
                          {wasSent && (
                            <span
                              className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-body font-semibold bg-green-100 text-green-700 flex-shrink-0"
                              title={`Enviado em ${new Date(guest.whatsappSentAt!).toLocaleDateString("pt-BR")}`}
                            >
                              ✓ Enviado
                            </span>
                          )}
                        </div>
                        <p className="font-body text-xs text-gray-400 truncate">
                          {guest.phone || "Sem telefone"}
                          {guest.guestList && guest.guestList !== "A" && (
                            <span className="ml-1.5 text-[10px] font-semibold text-gray-300">Lista {guest.guestList}</span>
                          )}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-body font-medium flex-shrink-0 ${
                          STATUS_COLORS[guest.rsvpStatus] ?? "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {STATUS_LABELS[guest.rsvpStatus] ?? guest.rsvpStatus}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0">
              <div className="flex items-center justify-between">
                <span className="font-body text-sm text-gray-500">
                  {selectedCount > 0
                    ? `${selectedCount} convidado${selectedCount !== 1 ? "s" : ""} selecionado${selectedCount !== 1 ? "s" : ""}`
                    : "Nenhum selecionado"}
                </span>
                <button
                  onClick={() => setStep(2)}
                  disabled={selectedCount === 0}
                  className="px-5 py-2.5 bg-green-600 text-white rounded-xl font-body font-medium text-sm hover:bg-green-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Próximo →
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── Step 2 — Compose message ───────────────────────────────── */}
        {step === 2 && (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {/* Variáveis disponíveis */}
              <div>
                <p className="font-body text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Variáveis disponíveis
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {VARIABLES.map(({ tag, desc }) => (
                    <button
                      key={tag}
                      onClick={() => insertVariable(tag)}
                      title={desc}
                      className="px-2.5 py-1 rounded-lg bg-midnight/10 text-midnight font-body text-xs font-medium hover:bg-midnight/20 transition"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Textarea */}
              <div>
                <label className="block font-body text-sm font-medium text-midnight mb-2">
                  Mensagem
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl font-body text-sm text-midnight bg-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none resize-none transition"
                />
                <div className="flex items-center justify-between mt-1">
                  <p className="font-body text-xs text-gray-400">
                    Clique nas variáveis acima para inserir na mensagem
                  </p>
                  <span className="font-body text-xs text-gray-400">{message.length} caracteres</span>
                </div>
              </div>

              {/* Preview */}
              <div>
                <p className="font-body text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Preview — {previewName}
                </p>
                <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
                  <div className="bg-white rounded-xl px-4 py-3 shadow-sm inline-block max-w-full">
                    <p className="font-body text-sm text-gray-800 whitespace-pre-wrap break-words">
                      {previewMessage}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Barra de progresso durante envio */}
            {sending && (
              <div className="px-6 pb-2 flex-shrink-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-body text-xs text-gray-500">
                    Preparando {Math.min(sendingProgress + 5, sendingTotal)} de {sendingTotal}...
                  </p>
                  <p className="font-body text-xs text-midnight font-medium">
                    {sendingTotal > 0 ? Math.round((Math.min(sendingProgress + 5, sendingTotal) / sendingTotal) * 100) : 0}%
                  </p>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all duration-500 rounded-full"
                    style={{
                      width: sendingTotal > 0
                        ? `${Math.round((Math.min(sendingProgress + 5, sendingTotal) / sendingTotal) * 100)}%`
                        : "0%",
                    }}
                  />
                </div>
              </div>
            )}

            <div className="px-6 py-4 border-t border-gray-100 flex items-center gap-3 flex-shrink-0">
              <button
                onClick={() => setStep(1)}
                disabled={sending}
                className="px-5 py-2.5 border border-gray-300 text-gray-600 rounded-xl font-body font-medium text-sm hover:bg-gray-50 transition disabled:opacity-40"
              >
                ← Voltar
              </button>
              <button
                onClick={handleSend}
                disabled={!message.trim() || sending}
                className="flex-1 px-5 py-2.5 bg-green-600 text-white rounded-xl font-body font-medium text-sm hover:bg-green-700 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {sending ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Enviando...
                  </>
                ) : (
                  <>
                    <WhatsAppIcon className="w-4 h-4" />
                    Enviar para {selectedCount} convidado{selectedCount !== 1 ? "s" : ""}
                  </>
                )}
              </button>
            </div>
          </>
        )}

        {/* ── Step 3 — Result ────────────────────────────────────────── */}
        {step === 3 && (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {/* Summary */}
              <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-5 py-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center flex-shrink-0 text-lg">
                  ✓
                </div>
                <div>
                  <p className="font-heading text-lg text-midnight">
                    {sentOk} mensagem{sentOk !== 1 ? "s" : ""} enviada{sentOk !== 1 ? "s" : ""}
                  </p>
                  {sentFail > 0 && (
                    <p className="font-body text-xs text-red-500 mt-0.5">
                      {sentFail} falha{sentFail !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </div>

              {/* Per-guest result list */}
              <div className="space-y-1">
                {results.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50"
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        r.sent ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500"
                      }`}
                    >
                      {r.sent ? "✓" : "✗"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-sm font-medium text-midnight truncate">{r.name}</p>
                      <p className="font-body text-xs text-gray-400 truncate">
                        {r.phone ?? "Sem telefone"}
                      </p>
                    </div>
                    <span
                      className={`font-body text-xs font-medium flex-shrink-0 ${
                        r.sent ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {r.sent ? "Enviado" : r.phone ? "Falhou" : "Sem telefone"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0">
              <button
                onClick={onClose}
                className="w-full px-5 py-2.5 bg-midnight text-white rounded-xl font-body font-medium text-sm hover:bg-midnight/90 transition"
              >
                Fechar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
