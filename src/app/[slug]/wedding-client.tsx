"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, FormEvent } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { getTemplate } from "@/lib/identity-kit-templates";

/* ─── Types ─── */
interface WeddingTheme {
  templateId?: string;
  palette?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
    text?: string;
    muted?: string;
    hero?: string;
    heroBorder?: string;
  };
  fonts?: {
    heading?: string;
    body?: string;
  };
}

interface WeddingPhoto {
  id: string;
  url: string;
  caption?: string | null;
  sortOrder: number;
}

interface Wedding {
  id: string;
  partnerName1: string;
  partnerName2: string;
  weddingDate: string;
  storyText?: string;
  venue?: string;
  venueAddress?: string;
  ceremonyVenue?: string;
  ceremonyAddress?: string;
  city?: string;
  state?: string;
  style?: string;
  coverImage?: string | null;
  message?: string | null;
  theme?: WeddingTheme;
  photos?: WeddingPhoto[];
}

/* ─── Theme helpers ─── */
function resolveTheme(wedding: Wedding): WeddingTheme {
  if (wedding.theme?.palette) return wedding.theme;
  const t = getTemplate(wedding.style);
  return {
    templateId: t.id,
    palette: {
      primary: t.colors.primary,
      secondary: t.colors.secondary,
      accent: t.colors.accent,
      background: t.colors.background,
      text: t.colors.text,
      muted: t.colors.muted,
      hero: t.colors.hero,
      heroBorder: t.colors.heroBorder,
    },
    fonts: { heading: t.fonts.heading, body: t.fonts.body },
  };
}

function ThemeInjector({ theme }: { theme: WeddingTheme }) {
  const p = theme.palette ?? {};
  const primary = p.primary ?? "#2C6B5E";
  const accent = p.accent ?? "#C4734F";
  const background = p.background ?? "#F5F3EF";
  const hero = p.hero ?? "#1A3A33";
  const heroBorder = p.heroBorder ?? accent;
  const text = p.text ?? "#1A1A1A";
  const headingFont = theme.fonts?.heading ?? "Cormorant Garamond";
  const bodyFont = theme.fonts?.body ?? "Inter";

  useEffect(() => {
    // Inject Google Fonts
    const urls = new Set<string>();
    const template = getTemplate(theme.templateId);
    if (template.fonts.headingGoogleUrl) urls.add(template.fonts.headingGoogleUrl);
    if (template.fonts.bodyGoogleUrl) urls.add(template.fonts.bodyGoogleUrl);

    const links: HTMLLinkElement[] = [];
    urls.forEach((url) => {
      if (!url) return;
      const existing = document.querySelector(`link[href="${url}"]`);
      if (existing) return;
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = url;
      document.head.appendChild(link);
      links.push(link);
    });
    return () => links.forEach((l) => l.remove());
  }, [theme.templateId]);

  return (
    <style>{`
      .wt .wt-hero { background-color: ${hero} !important; }
      .wt .wt-hero-border { border-color: ${heroBorder} !important; color: ${heroBorder} !important; }
      .wt .wt-bg { background-color: ${background} !important; }
      .wt .wt-text { color: ${text} !important; }
      .wt .wt-primary { color: ${primary} !important; }
      .wt .wt-primary-border { border-color: ${primary} !important; }
      .wt .wt-primary-bg { background-color: ${primary} !important; }
      .wt .wt-accent { color: ${accent} !important; }
      .wt .wt-accent-bg { background-color: ${accent} !important; }
      .wt .font-heading { font-family: "${headingFont}", serif !important; }
      .wt .font-body { font-family: "${bodyFont}", sans-serif !important; }
    `}</style>
  );
}

interface Gift {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  url?: string;
  status: "available" | "reserved" | "purchased";
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
  if (s === "available") return "Disponivel";
  if (s === "reserved") return "Reservado";
  return "Presenteado";
}

function statusColor(s: Gift["status"]) {
  if (s === "available") return "bg-teal/20 text-teal";
  if (s === "reserved") return "bg-copper/20 text-copper";
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
export default function WeddingClientPage({ initialSlug }: { initialSlug?: string }) {
  const params = useParams();
  const slug = initialSlug ?? (params.slug as string);

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
    if (!wedding?.weddingDate) return;
    setCountdown(timeUntil(wedding.weddingDate));
    const id = setInterval(() => setCountdown(timeUntil(wedding.weddingDate)), 1000);
    return () => clearInterval(id);
  }, [wedding?.weddingDate]);

  /* ── RSVP submit ── */
  async function handleRsvp(e: FormEvent) {
    e.preventDefault();
    if (!wedding) return;
    setRsvpSubmitting(true);
    setRsvpError("");
    try {
      const res = await fetch(`/api/public/wedding/${slug}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: rsvpName,
          status: rsvpAttending === "yes" ? "confirmado" : "recusado",
          plusOne: rsvpCompanion,
          companionName: rsvpCompanion ? rsvpCompanionName : undefined,
          dietaryRestriction: rsvpDietary || undefined,
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
      <div className="min-h-screen flex items-center justify-center bg-cream">
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-cream gap-6">
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
  const theme = resolveTheme(wedding);

  /* ─────────────────── RENDER ─────────────────── */
  return (
    <main className="wt scroll-smooth font-body text-verde-noite">
      <ThemeInjector theme={theme} />

      {/* ═══════ 1. HERO ═══════ */}
      <section className="wt-hero relative min-h-screen flex flex-col items-center justify-center bg-verde-noite text-white overflow-hidden">
        {/* Cover image */}
        {wedding.coverImage && (
          <div className="absolute inset-0">
            <Image src={wedding.coverImage} alt={`${wedding.partnerName1} & ${wedding.partnerName2}`}
              fill className="object-cover opacity-30" unoptimized />
          </div>
        )}
        {/* radial gradient overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center gap-8 px-4 text-center">
          {/* names */}
          <h1 className="font-heading text-5xl md:text-7xl leading-tight">
            {wedding.partnerName1}
            <span className="wt-hero-border block text-copper text-3xl md:text-5xl my-2">&amp;</span>
            {wedding.partnerName2}
          </h1>

          {/* date */}
          <p className="font-body text-lg md:text-xl tracking-widest uppercase text-white/80">
            {formatDatePt(wedding.weddingDate)}
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
      <section className="wt-bg py-20 px-4 bg-cream">
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
                  {formatDateTime(wedding.weddingDate)}
                </p>
                {wedding.ceremonyAddress && (
                  <button
                    onClick={() => window.open(mapsUrl(wedding.ceremonyAddress!), "_blank")}
                    className="wt-primary wt-primary-border inline-block rounded-full border border-teal text-teal px-6 py-2 text-sm hover:bg-teal hover:text-white transition-colors"
                  >
                    Ver no mapa
                  </button>
                )}
              </div>
            )}

            {/* reception / venue */}
            {wedding.venue && (
              <div className="border border-verde-noite/10 rounded-2xl p-8 text-center">
                <h3 className="font-heading text-2xl mb-2">Festa</h3>
                <p className="font-body font-semibold text-lg mb-1">{wedding.venue}</p>
                {wedding.venueAddress && (
                  <p className="font-body text-verde-noite/60 text-sm mb-3">
                    {wedding.venueAddress}
                  </p>
                )}
                <p className="font-body text-verde-noite/80 text-sm mb-5">
                  {formatDateTime(wedding.weddingDate)}
                </p>
                {wedding.venueAddress && (
                  <button
                    onClick={() => window.open(mapsUrl(wedding.venueAddress!), "_blank")}
                    className="wt-primary wt-primary-border inline-block rounded-full border border-teal text-teal px-6 py-2 text-sm hover:bg-teal hover:text-white transition-colors"
                  >
                    Ver no mapa
                  </button>
                )}
              </div>
            )}

            {/* fallback when no venues */}
            {!wedding.ceremonyVenue && !wedding.venue && (
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
              <p className="font-body text-verde-noite/70 mb-6">
                Sua confirmacao foi registrada com sucesso.
              </p>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Confirmei minha presença no casamento de ${wedding.partnerName1} & ${wedding.partnerName2}! Confirme a sua também: ${typeof window !== "undefined" ? window.location.href : ""}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-500 text-white rounded-xl font-body text-sm font-medium hover:bg-green-600 transition"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Compartilhar no WhatsApp
              </a>
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
                className="wt-accent-bg w-full bg-copper text-white font-body font-semibold py-3 rounded-lg hover:bg-copper/90 transition-colors disabled:opacity-50"
              >
                {rsvpSubmitting ? "Enviando..." : "Confirmar presenca"}
              </button>
            </form>
          )}
        </FadeIn>
      </section>

      {/* ═══════ 5. PRESENTES ═══════ */}
      {topGifts.length > 0 && (
        <section className="wt-bg py-20 px-4 bg-cream">
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
                  {gift.status === "available" && gift.url && (
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
                className="wt-primary wt-primary-border inline-block border border-teal text-teal rounded-full px-8 py-3 font-body text-sm hover:bg-teal hover:text-white transition-colors"
              >
                Ver lista completa
              </a>
            </div>
          </FadeIn>
        </section>
      )}

      {/* ═══════ 6. GALERIA ═══════ */}
      {wedding.photos && wedding.photos.length > 0 && (
        <section className="py-20 px-4 bg-white">
          <FadeIn className="max-w-5xl mx-auto">
            <h2 className="font-heading text-4xl text-center mb-12">Galeria</h2>
            <div className="columns-2 md:columns-3 gap-3 space-y-3">
              {wedding.photos.map((photo) => (
                <div key={photo.id} className="break-inside-avoid rounded-xl overflow-hidden relative group">
                  <Image
                    src={photo.url}
                    alt={photo.caption ?? "Foto do casamento"}
                    width={600}
                    height={400}
                    className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized
                  />
                  {photo.caption && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="font-body text-xs text-white">{photo.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </FadeIn>
        </section>
      )}

      {/* ═══════ 7. FOOTER ═══════ */}
      <footer className="wt-hero bg-verde-noite text-white py-8">
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
