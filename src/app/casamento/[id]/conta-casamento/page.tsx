"use client";

import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import BottomNav from "@/components/bottom-nav";
import { useToast } from "@/hooks/use-toast";

interface WeddingEvent {
  id: string;
  name: string;
  date: string | null;
  venue: string | null;
  notes: string | null;
}

interface FormState {
  name: string;
  date: string;
  venue: string;
  notes: string;
}

const EMPTY: FormState = { name: "", date: "", venue: "", notes: "" };

const EVENT_PRESETS = ["Cerimônia civil", "Cerimônia religiosa", "Festa / Recepção", "Chá de panela", "Despedida de solteiro(a)"];

export default function ContaCasamentoPage() {
  const params = useParams();
  const weddingId = params?.id as string;
  const { data: session, status } = useSession();
  const toast = useToast();

  const [events, setEvents] = useState<WeddingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch(`/api/weddings/${weddingId}/events`);
    if (res.ok) setEvents(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, [weddingId]);

  async function save() {
    if (!form.name.trim()) return;
    setSaving(true);
    const res = await fetch(`/api/weddings/${weddingId}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      await load();
      setShowForm(false);
      setForm(EMPTY);
      toast.success("Evento adicionado!");
    } else {
      toast.error("Erro ao salvar evento.");
    }
    setSaving(false);
  }

  async function remove(eventId: string) {
    const res = await fetch(`/api/weddings/${weddingId}/events/${eventId}`, { method: "DELETE" });
    if (res.ok) {
      await load();
      toast.success("Evento removido.");
    } else {
      toast.error("Erro ao remover evento.");
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAF6EF" }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#A98950", borderTopColor: "transparent" }} />
      </div>
    );
  }

  if (!session) return null;

  const GOLD = "#A98950";
  const BROWN = "#3D322A";
  const CREME = "#FAF6EF";

  return (
    <div className="min-h-screen pb-24" style={{ background: CREME }}>
      {/* Light header */}
      <div style={{ background: CREME }} className="px-5 pt-10 pb-6">
        <div className="flex items-start justify-between">
          <div>
            <p style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "10px", letterSpacing: "0.15em", color: GOLD, textTransform: "uppercase" as const, fontWeight: 500 }}>
              Configurações
            </p>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "28px", color: BROWN, lineHeight: 1.2, marginTop: "4px" }}>
              Conta do Casamento
            </h1>
            <p style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "12px", color: "rgba(61,50,42,0.5)", marginTop: "6px", letterSpacing: "0.02em" }}>
              Dados e configurações do seu casamento
            </p>
          </div>
          <button
            onClick={() => { setForm(EMPTY); setShowForm(true); }}
            className="flex items-center gap-1.5 px-4 py-2 bg-gold text-white rounded-xl font-body text-sm font-medium hover:bg-gold/90 transition flex-shrink-0 mt-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Evento
          </button>
        </div>
      </div>

      {/* Ornamental divider */}
      <div className="flex items-center gap-2.5 px-5 py-2">
        <div style={{ flex: 1, height: "1px", background: "rgba(169,137,80,0.25)" }} />
        <div style={{ width: "5px", height: "5px", background: GOLD, transform: "rotate(45deg)", opacity: 0.7 }} />
        <div style={{ flex: 1, height: "1px", background: "rgba(169,137,80,0.25)" }} />
      </div>

      <div className="max-w-3xl mx-auto px-4 py-4 space-y-5">
        {/* Events section */}
        <div>
          <p className="font-body text-xs font-semibold text-midnight/40 uppercase tracking-widest mb-3 px-1">
            Eventos do casamento
          </p>

          {events.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center" style={{ border: "1.5px solid rgba(169,137,80,0.35)" }}>
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-midnight/5 flex items-center justify-center">
                <svg className="w-6 h-6 text-midnight/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="font-body text-sm text-midnight/50 mb-1">Nenhum evento cadastrado</p>
              <p className="font-body text-xs text-midnight/30 mb-5">Adicione cerimônia civil, religiosa, festa e mais</p>
              <button
                onClick={() => { setForm(EMPTY); setShowForm(true); }}
                className="px-6 py-2.5 bg-midnight text-white rounded-xl font-body text-sm hover:bg-midnight/90 transition"
              >
                Adicionar primeiro evento
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map(ev => (
                <div key={ev.id} className="bg-white rounded-2xl p-4" style={{ border: "1.5px solid rgba(169,137,80,0.35)" }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-sm font-semibold text-midnight">{ev.name}</p>
                      {ev.date && (
                        <p className="font-body text-xs text-midnight/50 mt-0.5">
                          {new Date(ev.date).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                        </p>
                      )}
                      {ev.venue && (
                        <p className="font-body text-xs text-midnight/40 mt-0.5">{ev.venue}</p>
                      )}
                      {ev.notes && (
                        <p className="font-body text-xs text-midnight/30 mt-1 line-clamp-2">{ev.notes}</p>
                      )}
                    </div>
                    <button
                      onClick={() => remove(ev.id)}
                      className="p-1.5 rounded-lg text-midnight/30 hover:text-red-400 hover:bg-red-50 transition flex-shrink-0"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={() => { setForm(EMPTY); setShowForm(true); }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-dashed border-gray-200 rounded-2xl font-body text-sm text-midnight/50 hover:border-midnight/30 hover:text-midnight transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Adicionar evento
              </button>
            </div>
          )}
        </div>

        {/* Conta digital coming soon */}
        <div>
          <p className="font-body text-xs font-semibold text-midnight/40 uppercase tracking-widest mb-3 px-1">
            Conta digital Laço
          </p>
          <div className="bg-white rounded-3xl p-5" style={{ border: "1.5px solid rgba(169,137,80,0.35)" }}>
            <div className="flex items-start gap-3 mb-4">
              <span className="inline-block font-body text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full bg-gold/10 text-gold flex-shrink-0">
                Em breve
              </span>
            </div>
            <p className="font-body text-sm text-midnight/70 leading-relaxed mb-4">
              Conta compartilhada para centralizar todos os gastos do casamento e receber presentes em Pix.
            </p>
            <a
              href="https://wa.me/5511999999999?text=Quero%20ser%20avisado%20quando%20a%20Conta%20Digital%20La%C3%A7o%20lan%C3%A7ar"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 bg-gold/10 text-gold font-body text-sm font-medium rounded-xl hover:bg-gold/20 transition"
            >
              💬 Me avise quando lançar
            </a>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setShowForm(false)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto pb-safe"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-heading text-lg font-semibold text-midnight">Novo evento</h2>
                <button onClick={() => setShowForm(false)} className="text-midnight/30 hover:text-midnight transition">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Presets */}
              <div className="flex flex-wrap gap-2 mb-4">
                {EVENT_PRESETS.map(p => (
                  <button
                    key={p}
                    onClick={() => setForm(f => ({ ...f, name: p }))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-body transition ${
                      form.name === p ? "bg-midnight text-white" : "bg-gray-100 text-midnight/60 hover:bg-gray-200"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block font-body text-xs text-midnight/60 mb-1.5">Nome do evento *</label>
                  <input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Ex: Cerimônia civil"
                    className="w-full px-3 py-2.5 text-base font-body border border-gray-200 rounded-xl focus:outline-none focus:border-midnight"
                  />
                </div>

                <div>
                  <label className="block font-body text-xs text-midnight/60 mb-1.5">Data</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full px-3 py-2.5 text-base font-body border border-gray-200 rounded-xl focus:outline-none focus:border-midnight"
                  />
                </div>

                <div>
                  <label className="block font-body text-xs text-midnight/60 mb-1.5">Local</label>
                  <input
                    value={form.venue}
                    onChange={e => setForm(f => ({ ...f, venue: e.target.value }))}
                    placeholder="Ex: Igreja São Paulo, Salão Aurora"
                    className="w-full px-3 py-2.5 text-base font-body border border-gray-200 rounded-xl focus:outline-none focus:border-midnight"
                  />
                </div>

                <div>
                  <label className="block font-body text-xs text-midnight/60 mb-1.5">Observações</label>
                  <textarea
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    rows={2}
                    placeholder="Horário, dress code, etc."
                    className="w-full px-3 py-2.5 text-base font-body border border-gray-200 rounded-xl focus:outline-none focus:border-midnight resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2.5 font-body text-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={save}
                  disabled={saving || !form.name.trim()}
                  className="flex-1 px-4 py-2.5 font-body text-sm bg-gold text-white rounded-xl hover:bg-gold/90 disabled:opacity-50 transition"
                >
                  {saving ? "Salvando..." : "Adicionar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav weddingId={weddingId} />
    </div>
  );
}
