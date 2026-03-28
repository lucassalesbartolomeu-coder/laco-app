"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { simulateAttendance } from "@/lib/attendance-simulator";

// ─── Types ───────────────────────────────────────────────────

interface Guest {
  id: string;
  name: string;
  phone: string | null;
  category: string | null;
  rsvpStatus: string;
  whatsappSentAt: string | null;
}

interface Wedding {
  id: string;
  partnerName1: string;
  partnerName2: string;
  weddingDate: string | null;
  city: string | null;
  state: string | null;
  estimatedGuests: number | null;
}

interface WhatsappStats {
  configured: boolean;
  stats: {
    total: number;
    sent: number;
    confirmed: number;
    declined: number;
    maybe: number;
    pending: number;
    withPhone: number;
  };
}

// ─── Donut Chart ─────────────────────────────────────────────

function DonutChart({
  confirmed,
  declined,
  maybe,
  pending,
}: {
  confirmed: number;
  declined: number;
  maybe: number;
  pending: number;
}) {
  const total = confirmed + declined + maybe + pending;
  if (total === 0) {
    return (
      <div className="w-36 h-36 rounded-full border-8 border-gray-100 flex items-center justify-center">
        <span className="font-body text-xs text-verde-noite/30">Sem dados</span>
      </div>
    );
  }

  const r = 54;
  const circ = 2 * Math.PI * r;

  const cLen = (confirmed / total) * circ;
  const dLen = (declined / total) * circ;
  const mLen = (maybe / total) * circ;
  const pLen = (pending / total) * circ;

  // offsets: each segment starts where previous ended
  const cOff = 0;
  const dOff = -(cLen);
  const mOff = -(cLen + dLen);
  const pOff = -(cLen + dLen + mLen);

  return (
    <div className="relative">
      <svg viewBox="0 0 128 128" className="w-36 h-36 -rotate-90">
        {/* bg track */}
        <circle cx="64" cy="64" r={r} fill="none" stroke="#f3f4f6" strokeWidth="16" />
        {/* pending */}
        {pLen > 0 && (
          <circle cx="64" cy="64" r={r} fill="none" stroke="#fcd34d" strokeWidth="16"
            strokeDasharray={`${pLen} ${circ - pLen}`} strokeDashoffset={pOff} strokeLinecap="butt" />
        )}
        {/* maybe */}
        {mLen > 0 && (
          <circle cx="64" cy="64" r={r} fill="none" stroke="#93c5fd" strokeWidth="16"
            strokeDasharray={`${mLen} ${circ - mLen}`} strokeDashoffset={mOff} strokeLinecap="butt" />
        )}
        {/* declined */}
        {dLen > 0 && (
          <circle cx="64" cy="64" r={r} fill="none" stroke="#fca5a5" strokeWidth="16"
            strokeDasharray={`${dLen} ${circ - dLen}`} strokeDashoffset={dOff} strokeLinecap="butt" />
        )}
        {/* confirmed */}
        {cLen > 0 && (
          <circle cx="64" cy="64" r={r} fill="none" stroke="#4ade80" strokeWidth="16"
            strokeDasharray={`${cLen} ${circ - cLen}`} strokeDashoffset={cOff} strokeLinecap="butt" />
        )}
      </svg>
      {/* center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
        <span className="font-heading text-2xl text-verde-noite font-bold">
          {total > 0 ? Math.round((confirmed / total) * 100) : 0}%
        </span>
        <span className="font-body text-xs text-verde-noite/40">confirmados</span>
      </div>
    </div>
  );
}

// ─── Animated Counter ─────────────────────────────────────────

function Counter({ value, label, color }: { value: number; label: string; color: string }) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);

  useEffect(() => {
    const from = prev.current;
    const to = value;
    prev.current = value;
    if (from === to) return;

    const steps = 20;
    const interval = 600 / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      setDisplay(Math.round(from + ((to - from) * step) / steps));
      if (step >= steps) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="flex flex-col items-center">
      <span className={`font-heading text-4xl font-bold ${color}`}>{display}</span>
      <span className="font-body text-xs text-verde-noite/50 mt-0.5">{label}</span>
    </div>
  );
}

// ─── Status badge ─────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    confirmado: "bg-green-100 text-green-700",
    recusado: "bg-red-100 text-red-600",
    talvez: "bg-blue-100 text-blue-600",
    pendente: "bg-amber-100 text-amber-700",
  };
  const labels: Record<string, string> = {
    confirmado: "Confirmado",
    recusado: "Recusou",
    talvez: "Talvez",
    pendente: "Pendente",
  };
  const cls = map[status] ?? "bg-gray-100 text-gray-500";
  return (
    <span className={`font-body text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${cls}`}>
      {labels[status] ?? status}
    </span>
  );
}

// ─── WhatsApp Not Configured Panel ───────────────────────────

function WhatsappSetupPanel() {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-6">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-heading text-lg text-verde-noite mb-1">WhatsApp Business</h3>
          <p className="font-body text-sm text-verde-noite/60 mb-4">
            Configure as variáveis de ambiente para enviar convites diretamente pelo WhatsApp.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 font-mono text-xs space-y-1.5">
            <p className="text-verde-noite/70"><span className="text-copper">WHATSAPP_API_URL</span>=https://api.z-api.io/instances/<span className="text-teal">SEU_ID</span>/token/<span className="text-teal">SEU_TOKEN</span></p>
            <p className="text-verde-noite/70"><span className="text-copper">WHATSAPP_API_TOKEN</span>=<span className="text-teal">seu-client-token</span></p>
            <p className="text-verde-noite/70"><span className="text-copper">WHATSAPP_INSTANCE_ID</span>=<span className="text-teal">sua-instancia</span></p>
          </div>
          <p className="font-body text-xs text-verde-noite/40 mt-3">
            Webhook de resposta: <span className="font-mono">https://seu-dominio/api/webhooks/whatsapp</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────

export default function ConfirmacoesPage() {
  const { status } = useSession();
  const router = useRouter();
  const params = useParams();
  const weddingId = params.id as string;

  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [waStats, setWaStats] = useState<WhatsappStats | null>(null);
  const [loading, setLoading] = useState(true);

  // filters
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [search, setSearch] = useState("");

  // send state
  const [sending, setSending] = useState<"invite" | "reminder" | null>(null);
  const [sendResult, setSendResult] = useState<{ sent: number; failed: number } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const loadData = useCallback(async () => {
    try {
      const [wRes, gRes, waRes] = await Promise.all([
        fetch(`/api/weddings/${weddingId}`),
        fetch(`/api/weddings/${weddingId}/guests`),
        fetch(`/api/weddings/${weddingId}/whatsapp`),
      ]);

      if (wRes.ok) setWedding(await wRes.json());
      if (gRes.ok) {
        const gData = await gRes.json();
        setGuests(Array.isArray(gData) ? gData : gData.guests ?? []);
      }
      if (waRes.ok) setWaStats(await waRes.json());
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [weddingId]);

  useEffect(() => {
    if (status === "authenticated") loadData();
  }, [status, loadData]);

  // Poll every 15s for real-time updates
  useEffect(() => {
    if (status !== "authenticated") return;
    const id = setInterval(loadData, 15000);
    return () => clearInterval(id);
  }, [status, loadData]);

  async function handleSend(action: "invite" | "reminder") {
    setSending(action);
    setSendResult(null);
    try {
      const res = await fetch(`/api/weddings/${weddingId}/whatsapp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      setSendResult({ sent: data.sent ?? 0, failed: data.failed ?? 0 });
      await loadData();
    } catch {
      // silent
    } finally {
      setSending(null);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-off-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Derived stats ──
  const total = guests.length;
  const confirmed = guests.filter((g) => g.rsvpStatus === "confirmado").length;
  const declined = guests.filter((g) => g.rsvpStatus === "recusado").length;
  const maybe = guests.filter((g) => g.rsvpStatus === "talvez").length;
  const pending = total - confirmed - declined - maybe;

  // Attendance estimate (for pending guests only)
  const pendingGuests = guests
    .filter((g) => g.rsvpStatus === "pendente")
    .map((g) => ({ city: undefined, state: undefined, category: g.category ?? undefined }));

  const simulation =
    wedding?.weddingDate && pendingGuests.length > 0
      ? simulateAttendance(pendingGuests, {
          city: wedding.city ?? "",
          state: wedding.state ?? "",
          weddingDate: wedding.weddingDate,
          style: undefined,
        })
      : null;

  const estimatedTotal = confirmed + (simulation?.totalExpected ?? 0);

  // ── Filtered guests ──
  const filteredGuests = guests.filter((g) => {
    if (filterStatus !== "all" && g.rsvpStatus !== filterStatus) return false;
    if (filterCategory !== "all" && g.category !== filterCategory) return false;
    if (search && !g.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const categories = [...new Set(guests.map((g) => g.category).filter(Boolean))] as string[];

  const coupleName = wedding
    ? `${wedding.partnerName1} & ${wedding.partnerName2}`
    : "Casal";

  const pendingWithPhone = guests.filter(
    (g) => g.rsvpStatus === "pendente" && g.phone && !g.whatsappSentAt
  ).length;
  const pendingSentNoReply = guests.filter(
    (g) => g.rsvpStatus === "pendente" && g.phone && g.whatsappSentAt
  ).length;

  return (
    <div className="min-h-screen bg-off-white pb-16">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-verde-noite/50 hover:text-verde-noite transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="font-heading text-xl text-verde-noite">Confirmações</h1>
              {wedding && (
                <p className="font-body text-xs text-verde-noite/40">{coupleName}</p>
              )}
            </div>
          </div>
          {/* Live indicator */}
          <div className="flex items-center gap-1.5 text-xs font-body text-teal">
            <div className="w-1.5 h-1.5 bg-teal rounded-full animate-pulse" />
            Ao vivo
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">

        {/* ── Stats row ── */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <DonutChart confirmed={confirmed} declined={declined} maybe={maybe} pending={pending} />

            <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
              <Counter value={confirmed} label="Confirmados" color="text-green-500" />
              <Counter value={pending} label="Pendentes" color="text-amber-500" />
              <Counter value={declined} label="Recusaram" color="text-red-400" />
              <Counter value={total} label="Total" color="text-verde-noite" />
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-100">
            {[
              { color: "bg-green-400", label: "Confirmados" },
              { color: "bg-red-300", label: "Recusados" },
              { color: "bg-blue-300", label: "Talvez" },
              { color: "bg-amber-300", label: "Pendentes" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                <span className="font-body text-xs text-verde-noite/50">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Estimate ── */}
        {simulation && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-teal/5 border border-teal/15 rounded-2xl px-5 py-4 flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-teal/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            </div>
            <div>
              <p className="font-body text-sm text-verde-noite">
                Com base nas confirmações, estimamos{" "}
                <strong className="text-teal">
                  {simulation.confidenceRange.min + confirmed}–{simulation.confidenceRange.max + confirmed}
                </strong>{" "}
                presentes.
              </p>
              <p className="font-body text-xs text-verde-noite/40 mt-0.5">
                {confirmed} já confirmados + ~{simulation.totalExpected} dos {pendingGuests.length} pendentes
              </p>
            </div>
          </motion.div>
        )}

        {/* ── WhatsApp Panel ── */}
        <section>
          <h2 className="font-heading text-xl text-verde-noite mb-3">Envio por WhatsApp</h2>

          {waStats?.configured === false ? (
            <WhatsappSetupPanel />
          ) : (
            <div className="bg-white rounded-2xl p-6 shadow-sm space-y-5">
              {/* Send result feedback */}
              {sendResult && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 font-body text-sm text-green-700"
                >
                  ✓ {sendResult.sent} enviados
                  {sendResult.failed > 0 && `, ${sendResult.failed} falharam`}
                </motion.div>
              )}

              {/* Sent stats */}
              {waStats && (
                <div className="flex flex-wrap gap-4">
                  {[
                    { label: "Enviados", value: waStats.stats.sent, color: "text-teal" },
                    { label: "Responderam", value: waStats.stats.confirmed + waStats.stats.declined + waStats.stats.maybe, color: "text-verde-noite" },
                    { label: "Sem telefone", value: waStats.stats.total - waStats.stats.withPhone, color: "text-verde-noite/40" },
                  ].map((item) => (
                    <div key={item.label} className="text-center">
                      <p className={`font-heading text-2xl font-bold ${item.color}`}>{item.value}</p>
                      <p className="font-body text-xs text-verde-noite/40">{item.label}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handleSend("invite")}
                  disabled={!!sending || pendingWithPhone === 0}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white font-body font-medium py-2.5 px-4 rounded-xl hover:bg-green-600 transition disabled:opacity-40 text-sm"
                >
                  {sending === "invite" ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  )}
                  Enviar convites ({pendingWithPhone})
                </button>

                <button
                  onClick={() => handleSend("reminder")}
                  disabled={!!sending || pendingSentNoReply === 0}
                  className="flex-1 flex items-center justify-center gap-2 border border-green-500 text-green-600 font-body font-medium py-2.5 px-4 rounded-xl hover:bg-green-50 transition disabled:opacity-40 text-sm"
                >
                  {sending === "reminder" ? (
                    <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                  )}
                  Enviar lembrete ({pendingSentNoReply})
                </button>
              </div>

              <p className="font-body text-xs text-verde-noite/30">
                Envio com intervalo de 1 segundo entre mensagens para evitar bloqueios.
              </p>
            </div>
          )}
        </section>

        {/* ── Guest list ── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-heading text-xl text-verde-noite">Lista de Convidados</h2>
            <span className="font-body text-xs text-verde-noite/40">
              {filteredGuests.length} de {total}
            </span>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <input
              type="text"
              placeholder="Buscar por nome..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-teal/30"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-teal/30"
            >
              <option value="all">Todos os status</option>
              <option value="confirmado">Confirmados</option>
              <option value="pendente">Pendentes</option>
              <option value="recusado">Recusaram</option>
              <option value="talvez">Talvez</option>
            </select>
            {categories.length > 0 && (
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-teal/30"
              >
                <option value="all">Todas as categorias</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c.replace(/_/g, " ")}</option>
                ))}
              </select>
            )}
          </div>

          {/* Guest rows */}
          <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100 overflow-hidden">
            {filteredGuests.length === 0 ? (
              <div className="py-10 text-center font-body text-sm text-verde-noite/40">
                Nenhum convidado encontrado.
              </div>
            ) : (
              filteredGuests.map((g) => (
                <div key={g.id} className="px-4 py-3 flex items-center gap-3">
                  {/* Status indicator */}
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    g.rsvpStatus === "confirmado" ? "bg-green-400" :
                    g.rsvpStatus === "recusado" ? "bg-red-400" :
                    g.rsvpStatus === "talvez" ? "bg-blue-400" : "bg-amber-400"
                  }`} />

                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm text-verde-noite font-medium truncate">{g.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {g.category && (
                        <span className="font-body text-[10px] text-verde-noite/40 capitalize">
                          {g.category.replace(/_/g, " ")}
                        </span>
                      )}
                      {g.phone ? (
                        <span className="font-body text-[10px] text-verde-noite/30">{g.phone}</span>
                      ) : (
                        <span className="font-body text-[10px] text-red-400/70">sem telefone</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {g.whatsappSentAt && (
                      <svg className="w-3.5 h-3.5 text-green-500" viewBox="0 0 24 24" fill="currentColor" aria-label="Convite enviado">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                    )}
                    <StatusBadge status={g.rsvpStatus} />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* ── Estimate detail ── */}
        {simulation && (
          <section className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-heading text-xl text-verde-noite mb-4">Estimativa de Presença</h2>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-off-white rounded-xl">
                <p className="font-heading text-2xl text-verde-noite font-bold">{confirmed}</p>
                <p className="font-body text-xs text-verde-noite/50">Confirmados</p>
              </div>
              <div className="text-center p-3 bg-off-white rounded-xl">
                <p className="font-heading text-2xl text-teal font-bold">~{simulation.totalExpected}</p>
                <p className="font-body text-xs text-verde-noite/50">Pendentes (est.)</p>
              </div>
              <div className="text-center p-3 bg-copper/10 rounded-xl">
                <p className="font-heading text-2xl text-copper font-bold">{estimatedTotal}</p>
                <p className="font-body text-xs text-verde-noite/50">Total estimado</p>
              </div>
            </div>
            <p className="font-body text-xs text-verde-noite/40">
              Faixa de confiança: {simulation.confidenceRange.min + confirmed}–{simulation.confidenceRange.max + confirmed} presentes.
              A estimativa considera distância, categoria e dia da semana.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}
