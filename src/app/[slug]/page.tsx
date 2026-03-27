"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, FormEvent } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

/* ─── Types ─── */
interface Wedding {
  id: string;
  partner1Name: string;
  partner2Name: string;
  date: string;
  storyText?: string;
  ceremonyVenue?: string;
  ceremonyAddress?: string;
  receptionVenue?: string;
  receptionAddress?: string;
}

interface Gift {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  url?: string;
  status: "AVAILABLE" | "RESERVED" | "PURCHASED";
}

/* ─── Helpers ─── */
const MONTHS_PT = [
  "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function formatDatePt(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()} de ${MONTHS_PT[d.getMonth()]} de ${d.getFullYear()}`;
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  const date = formatDatePt(iso);
  const time = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return `${date} as ${time}`;
}

function timeUntil(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1000),
  };
}

function mapsUrl(address: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

function statusLabel(s: Gift["status"]) {
  if (s === "AVAILABLE") return "Disponivel";
  if (s === "RESERVED") return "Reservado";
  return "Presenteado";
}

function statusColor(s: Gift["status"]) {
  if (s === "AVAILABLE") return "bg-teal/20 text-teal";
  if (s === "RESERVED") return "bg-copper/20 text-copper";
  return "bg-gray-200 text-gray-500";
}

/* ─── Fade-in wrapper ─── */
function FadeIn({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Page ─── */
export default function WeddingPublicPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  /* countdown */
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  /* rsvp form */
  const [rsvpName, setRsvpName] = useState("");
  const [rsvpAttending, setRsvpAttending] = useState<"yes" | "no">("yes");
  const [rsvpCompanion, setRsvpCompanion] = useState(false);
  const [rsvpCompanionName, setRsvpCompanionName] = useState("");
  const [rsvpDietary, setRsvpDietary] = useState("");
  const [rsvpSubmitting, setRsvpSubmitting] = useState(false);
  const [rsvpSuccess, setRsvpSuccess] = useState(false);
  const [rsvpError, setRsvpError] = useState("");

  /* ── Fetch data ── */
  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const [wRes, gRes] = await Promise.all([
          fetch(`/api/public/wedding/${slug}`),
          fetch(`/api/public/wedding/${slug}/gifts`),
        ]);
        if (!wRes.ok) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        const wData = await wRes.json();
        setWedding(wData);
        if (gRes.ok) {
          const gData = await gRes.json();
          setGifts(Array.isArray(gData) ? gData : gData.gifts ?? []);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  /* ── Countdown timer ── */
  useEffect(() => {
    if (!wedding?.date) return;
    setCountdown(timeUntil(wedding.date));
    const id = setInterval(() => setCountdown(timeUntil(wedding.date)), 1000);
    return () => clearInterval(id);
  }, [wedding?.date]);

  /* ── RSVP submit ── */
  async function handleRsvp(e: FormEvent) {
    e.preventDefault();
    if (!wedding) return;
    setRsvpSubmitting(true);
    setRsvpError("");
    try {
      const res = await fetch(`/api/weddings/${wedding.id}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: rsvpName,
          attending: rsvpAttending === "yes",
          hasCompanion: rsvpCompanion,
          companionName: rsvpCompanion ? rsvpCompanionName : undefined,
          dietaryRestrictions: rsvpDietary || undefined,
        }),
      });
      if (!res.ok) throw new Error("Erro ao enviar confirmacao");
      setRsvpSuccess(true);
    } catch (err: unknown) {
      setRsvpError(err instanceof Error ? err.message : "Erro ao enviar confirmacao");
    } finally {
      setRsvpSubmitting(false);
    }
  }

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F3EF]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-teal border-t-transparent animate-spin" />
          <p className="font-body text-verde-noite/60">Carregando...</p>
        </div>
      </div>
    );
  }

  /* ── 404 ── */
  if (notFound || !wedding) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F3EF] gap-6">
        <h1 className="font-heading text-4xl text-verde-noite">Casamento nao encontrado</h1>
        <p className="font-body text-verde-noite/60">
          O link pode estar incorreto ou o casamento ainda nao foi publicado.
        </p>
        <a href="/" className="font-body text-copper hover:underline">
          Voltar ao inicio
        </a>
      </div>
    );
  }

  const topGifts = gifts.slice(0, 8);

  /* ─────────────────── RENDER ─────────────────── */
  return (
    <main className="scroll-smooth font-body text-verde-noite">
      {/* ═══════ 1. HERO ═══════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center bg-verde-noite text-white overflow-hidden">
        {/* radial gradient overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(44,107,94,0.35)_0%,transparent_70%)] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center gap-8 px-4 text-center">
          {/* names */}
          <h1 className="font-heading text-5xl md:text-7xl leading-tight">
            {wedding.partner1Name}
            <span className="block text-copper text-3xl md:text-5xl my-2">&amp;</span>
            {wedding.partner2Name}
          </h1>

          {/* date */}
          <p className="font-body text-lg md:text-xl tracking-widest uppercase text-white/80">
            {formatDatePt(wedding.date)}
          </p>

          {/* countdown */}
          <div className="flex gap-4 mt-4">
            {(
              [
                ["days", "Dias"],
                ["hours", "Horas"],
                ["minutes", "Min"],
                ["seconds", "Seg"],
              ] as const
            ).map(([key, label]) => (
              <div
                key={key}
                className="bg-white/10 rounded-xl p-4 min-w-[72px] flex flex-col items-center"
              >
                <span className="font-heading text-3xl md:text-4xl font-bold">
                  {countdown[key]}
                </span>
                <span className="text-xs uppercase tracking-wider text-white/70 mt-1">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* scroll arrow */}
        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
          className="absolute bottom-10 z-10"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8 text-white/50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </section>

      {/* ═══════ 2. NOSSA HISTORIA ═══════ */}
      <section className="py-20 px-4 bg-[#F5F3EF]">
        <FadeIn className="max-w-3xl mx-auto text-center">
          <h2 className="font-heading text-4xl mb-10">Nossa Historia</h2>
          {wedding.storyText ? (
            <div className="space-y-4 text-left font-body text-verde-noite/80 leading-relaxed">
              {wedding.storyText.split("\n").filter(Boolean).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          ) : (
            <p className="font-body text-verde-noite/50 italic">
              Em breve compartilharemos nossa historia...
            </p>
          )}
        </FadeIn>
      </section>

      {/* ═══════ 3. CERIMONIA & FESTA ═══════ */}
      <section className="py-20 px-4 bg-white">
        <FadeIn className="max-w-4xl mx-auto">
          <h2 className="font-heading text-4xl text-center mb-12">Cerimonia &amp; Festa</h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* ceremony */}
            {wedding.ceremonyVenue && (
              <div className="border border-verde-noite/10 rounded-2xl p-8 text-center">
                <h3 className="font-heading text-2xl mb-2">Cerimonia</h3>
                <p className="font-body font-semibold text-lg mb-1">{wedding.ceremonyVenue}</p>
                {wedding.ceremonyAddress && (
                  <p className="font-body text-verde-noite/60 text-sm mb-3">
                    {wedding.ceremonyAddress}
                  </p>
                )}
                <p className="font-body text-verde-noite/80 text-sm mb-5">
                  {formatDateTime(wedding.date)}
                </p>
                {wedding.ceremonyAddress && (
                  <button
                    onClick={() => window.open(mapsUrl(wedding.ceremonyAddress!), "_blank")}
                    className="inline-block rounded-full border border-teal text-teal px-6 py-2 text-sm hover:bg-teal hover:text-white transition-colors"
                  >
                    Ver no mapa
                  </button>
                )}
              </div>
            )}

            {/* reception */}
            {wedding.receptionVenue && (
              <div className="border border-verde-noite/10 rounded-2xl p-8 text-center">
                <h3 className="font-heading text-2xl mb-2">Festa</h3>
                <p className="font-body font-semibold text-lg mb-1">{wedding.receptionVenue}</p>
                {wedding.receptionAddress && (
                  <p className="font-body text-verde-noite/60 text-sm mb-3">
                    {wedding.receptionAddress}
                  </p>
                )}
                <p className="font-body text-verde-noite/80 text-sm mb-5">
                  {formatDateTime(wedding.date)}
                </p>
                {wedding.receptionAddress && (
                  <button
                    onClick={() => window.open(mapsUrl(wedding.receptionAddress!), "_blank")}
                    className="inline-block rounded-full border border-teal text-teal px-6 py-2 text-sm hover:bg-teal hover:text-white transition-colors"
                  >
                    Ver no mapa
                  </button>
                )}
              </div>
            )}

            {/* fallback when no venues */}
            {!wedding.ceremonyVenue && !wedding.receptionVenue && (
              <div className="md:col-span-2 text-center py-8">
                <p className="font-body text-verde-noite/50 italic">
                  Informacoes do local em breve...
                </p>
              </div>
            )}
          </div>
        </FadeIn>
      </section>

      {/* ═══════ 4. RSVP ═══════ */}
      <section className="py-20 px-4 bg-off-white">
        <FadeIn className="max-w-xl mx-auto">
          <h2 className="font-heading text-4xl text-center mb-10">Confirme sua Presenca</h2>

          {rsvpSuccess ? (
            <div className="text-center bg-teal/10 rounded-2xl p-10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-14 h-14 text-teal mx-auto mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <p className="font-heading text-2xl mb-2">Obrigado, {rsvpName}!</p>
              <p className="font-body text-verde-noite/70">
                Sua confirmacao foi registrada com sucesso.
              </p>
            </div>
          ) : (
            <form onSubmit={handleRsvp} className="space-y-6">
              {/* name */}
              <div>
                <label className="block font-body text-sm mb-1">Nome completo *</label>
                <input
                  type="text"
                  required
                  value={rsvpName}
                  onChange={(e) => setRsvpName(e.target.value)}
                  className="w-full border border-verde-noite/20 rounded-lg px-4 py-3 font-body focus:outline-none focus:ring-2 focus:ring-teal/40"
                  placeholder="Seu nome"
                />
              </div>

              {/* attending */}
              <div className="space-y-2">
                <label className="block font-body text-sm mb-1">Voce ira ao casamento?</label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="attending"
                    checked={rsvpAttending === "yes"}
                    onChange={() => setRsvpAttending("yes")}
                    className="accent-teal w-4 h-4"
                  />
                  <span className="font-body">Irei com prazer</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="attending"
                    checked={rsvpAttending === "no"}
                    onChange={() => setRsvpAttending("no")}
                    className="accent-teal w-4 h-4"
                  />
                  <span className="font-body">Infelizmente nao poderei</span>
                </label>
              </div>

              {/* companion */}
              {rsvpAttending === "yes" && (
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rsvpCompanion}
                      onChange={(e) => setRsvpCompanion(e.target.checked)}
                      className="accent-teal w-4 h-4"
                    />
                    <span className="font-body">Levarei acompanhante</span>
                  </label>
                  {rsvpCompanion && (
                    <input
                      type="text"
                      value={rsvpCompanionName}
                      onChange={(e) => setRsvpCompanionName(e.target.value)}
                      className="w-full border border-verde-noite/20 rounded-lg px-4 py-3 font-body focus:outline-none focus:ring-2 focus:ring-teal/40"
                      placeholder="Nome do acompanhante"
                    />
                  )}
                </div>
              )}

              {/* dietary */}
              <div>
                <label className="block font-body text-sm mb-1">
                  Restricoes alimentares (opcional)
                </label>
                <textarea
                  value={rsvpDietary}
                  onChange={(e) => setRsvpDietary(e.target.value)}
                  rows={3}
                  className="w-full border border-verde-noite/20 rounded-lg px-4 py-3 font-body focus:outline-none focus:ring-2 focus:ring-teal/40 resize-none"
                  placeholder="Vegetariano, intolerancia a lactose, etc."
                />
              </div>

              {/* error */}
              {rsvpError && (
                <p className="text-red-600 font-body text-sm">{rsvpError}</p>
              )}

              {/* submit */}
              <button
                type="submit"
                disabled={rsvpSubmitting}
                className="w-full bg-copper text-white font-body font-semibold py-3 rounded-lg hover:bg-copper/90 transition-colors disabled:opacity-50"
              >
                {rsvpSubmitting ? "Enviando..." : "Confirmar presenca"}
              </button>
            </form>
          )}
        </FadeIn>
      </section>

      {/* ═══════ 5. PRESENTES ═══════ */}
      {topGifts.length > 0 && (
        <section className="py-20 px-4 bg-[#F5F3EF]">
          <FadeIn className="max-w-5xl mx-auto">
            <h2 className="font-heading text-4xl text-center mb-12">Lista de Presentes</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {topGifts.map((gift) => (
                <div
                  key={gift.id}
                  className="bg-white rounded-xl p-4 flex flex-col items-center text-center shadow-sm"
                >
                  {gift.imageUrl && (
                    <Image
                      src={gift.imageUrl}
                      alt={gift.name}
                      width={200}
                      height={128}
                      className="w-full h-32 object-contain rounded-lg mb-3"
                      unoptimized
                    />
                  )}
                  <h3 className="font-body font-semibold text-sm leading-tight mb-1 line-clamp-2">
                    {gift.name}
                  </h3>
                  <p className="font-body text-copper font-bold text-sm mb-2">
                    R$ {gift.price.toFixed(2).replace(".", ",")}
                  </p>
                  <span
                    className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full mb-3 ${statusColor(gift.status)}`}
                  >
                    {statusLabel(gift.status)}
                  </span>
                  {gift.status === "AVAILABLE" && gift.url && (
                    <a
                      href={gift.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto text-xs font-body text-teal hover:underline"
                    >
                      Quero presentear
                    </a>
                  )}
                </div>
              ))}
            </div>

            <div className="text-center mt-10">
              <a
                href={`/${slug}/presentes`}
                className="inline-block border border-teal text-teal rounded-full px-8 py-3 font-body text-sm hover:bg-teal hover:text-white transition-colors"
              >
                Ver lista completa
              </a>
            </div>
          </FadeIn>
        </section>
      )}

      {/* ═══════ 6. FOOTER ═══════ */}
      <footer className="bg-verde-noite text-white py-8">
        <div className="text-center space-y-2">
          <p className="font-body text-sm text-white/70">Feito com amor pelo Laco</p>
          <a href="/" className="font-body text-xs text-white/40 hover:text-white/70 transition-colors">
            laco.app
          </a>
        </div>
      </footer>
    </main>
  );
}
