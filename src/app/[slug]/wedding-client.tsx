"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, FormEvent } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { getTemplate } from "@/lib/identity-kit-templates";
import { track } from "@/lib/analytics";
import PhotoGallery from "@/components/photo-gallery";
import ShareWhatsApp from "@/components/share-whatsapp";

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
      track("rsvp_submitted", { attending: rsvpAttending, plusOne: rsvpCompanion });
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
        {/* Cover image with parallax feel */}
        {wedding.coverImage ? (
          <div className="absolute inset-0">
            <Image src={wedding.coverImage} alt={`${wedding.partnerName1} & ${wedding.partnerName2}`}
              fill className="object-cover opacity-40 scale-105" unoptimized />
            {/* dark gradient overlay at bottom for readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
          </div>
        ) : (
          /* Abstract botanical pattern for no-cover state */
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-[0.07]" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='none' stroke='white' stroke-width='0.5'/%3E%3Ccircle cx='50' cy='50' r='25' fill='none' stroke='white' stroke-width='0.5'/%3E%3Ccircle cx='50' cy='50' r='10' fill='none' stroke='white' stroke-width='0.5'/%3E%3C/svg%3E")`,
              backgroundSize: "80px 80px",
            }} />
            <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-teal/15 rounded-full blur-3xl" />
            <div className="absolute bottom-1/3 left-1/4 w-[400px] h-[400px] bg-copper/10 rounded-full blur-3xl" />
          </div>
        )}

        {/* Fine grain overlay */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
        }} />

        <div className="relative z-10 flex flex-col items-center gap-6 px-5 text-center max-w-3xl mx-auto">
          {/* pre-title */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-body text-xs uppercase tracking-[0.3em] text-white/50"
          >
            Você está convidado
          </motion.p>

          {/* names */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.1, ease: "easeOut" }}
            className="font-heading text-6xl md:text-8xl leading-[1.0]"
          >
            {wedding.partnerName1}
          </motion.h1>

          {/* ampersand with decorative lines */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center gap-4 w-full justify-center"
          >
            <div className="flex-1 max-w-[100px] h-px bg-gradient-to-r from-transparent to-white/30" />
            <span className="font-heading text-4xl md:text-5xl text-copper/90">&amp;</span>
            <div className="flex-1 max-w-[100px] h-px bg-gradient-to-l from-transparent to-white/30" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.4, ease: "easeOut" }}
            className="font-heading text-6xl md:text-8xl leading-[1.0]"
          >
            {wedding.partnerName2}
          </motion.h1>

          {/* date + venue */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="flex flex-col items-center gap-1 mt-2"
          >
            <p className="font-body text-base md:text-lg tracking-widest uppercase text-white/80">
              {formatDatePt(wedding.weddingDate)}
            </p>
            {wedding.venue && (
              <p className="font-body text-sm text-white/50 tracking-wide">
                {wedding.venue}{wedding.city ? ` · ${wedding.city}` : ""}
              </p>
            )}
          </motion.div>

          {/* countdown — glassmorphism cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex gap-3 mt-6"
          >
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
                className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl px-4 py-4 min-w-[70px] flex flex-col items-center shadow-lg"
              >
                <span className="font-heading text-3xl md:text-4xl font-bold leading-none tabular-nums">
                  {String(countdown[key]).padStart(2, "0")}
                </span>
                <span className="font-body text-[10px] uppercase tracking-widest text-white/60 mt-2">
                  {label}
                </span>
              </div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="flex flex-col sm:flex-row gap-3 mt-2"
          >
            <a
              href="#confirmacao"
              className="inline-flex items-center justify-center gap-2 bg-copper text-white font-body font-semibold text-sm px-7 py-3.5 rounded-full hover:bg-copper/90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-copper/30"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Confirmar presença
            </a>
            {gifts.length > 0 && (
              <a
                href="#presentes"
                className="inline-flex items-center justify-center gap-2 backdrop-blur-md bg-white/10 border border-white/20 text-white font-body text-sm px-7 py-3.5 rounded-full hover:bg-white/20 transition-all"
              >
                🎁 Ver lista de presentes
              </a>
            )}
          </motion.div>
        </div>

        {/* scroll arrow */}
        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
          className="absolute bottom-8 z-10"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 text-white/30"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </section>

      {/* ═══════ Compartilhar ═══════ */}
      <div className="wt-bg flex justify-center py-6 px-5 bg-cream">
        <ShareWhatsApp
          message={`Veja o nosso site de casamento: laco.app/${slug}`}
          label="Compartilhar site"
        />
      </div>

      {/* ═══════ 2. NOSSA HISTORIA ═══════ */}
      <section className="wt-bg py-20 px-5 bg-cream">
        <FadeIn className="max-w-2xl mx-auto text-center">
          {/* decorative separator */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-16 h-px bg-gradient-to-r from-transparent to-verde-noite/20" />
            <svg className="w-5 h-5 text-copper/60" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z" />
            </svg>
            <div className="w-16 h-px bg-gradient-to-l from-transparent to-verde-noite/20" />
          </div>

          <h2 className="font-heading text-4xl md:text-5xl text-verde-noite mb-8">Nossa História</h2>
          {wedding.storyText ? (
            <div className="space-y-5 text-left font-body text-verde-noite/75 leading-[1.8] text-[15px]">
              {wedding.storyText.split("\n").filter(Boolean).map((p, i) => (
                <p key={i} className={i === 0 ? "first-letter:text-5xl first-letter:font-heading first-letter:text-copper first-letter:float-left first-letter:mr-2 first-letter:leading-[0.85]" : ""}>{p}</p>
              ))}
            </div>
          ) : (
            <p className="font-body text-verde-noite/40 italic text-center">
              Em breve compartilharemos nossa história...
            </p>
          )}
        </FadeIn>
      </section>

      {/* ═══════ 3. CERIMONIA & FESTA ═══════ */}
      <section className="py-20 px-5 bg-white">
        <FadeIn className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="font-body text-xs uppercase tracking-widest text-copper/70 mb-3">Detalhes do evento</p>
            <h2 className="font-heading text-4xl md:text-5xl text-verde-noite">Cerimônia &amp; Festa</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* ceremony */}
            {wedding.ceremonyVenue && (
              <div className="bg-cream border border-verde-noite/10 rounded-3xl p-8 text-center">
                <div className="w-10 h-10 bg-copper/10 text-copper rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="font-body text-xs uppercase tracking-widest text-copper/70 mb-2">Cerimônia</p>
                <h3 className="font-heading text-2xl text-verde-noite mb-1">{wedding.ceremonyVenue}</h3>
                {wedding.ceremonyAddress && (
                  <p className="font-body text-verde-noite/55 text-sm mb-3">
                    {wedding.ceremonyAddress}
                  </p>
                )}
                <p className="font-body text-verde-noite/75 text-sm mb-5 font-medium">
                  {formatDateTime(wedding.weddingDate)}
                </p>
                {wedding.ceremonyAddress && (
                  <button
                    onClick={() => window.open(mapsUrl(wedding.ceremonyAddress!), "_blank")}
                    className="inline-flex items-center gap-1.5 border border-teal/30 text-teal px-5 py-2 rounded-full text-sm hover:bg-teal hover:text-white transition-all"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Ver no mapa
                  </button>
                )}
              </div>
            )}

            {/* reception / venue */}
            {wedding.venue && (
              <div className="group relative overflow-hidden bg-gradient-to-br from-verde-noite to-teal rounded-3xl p-8 text-center text-white">
                <div className="absolute inset-0 opacity-10 bg-[length:30px_30px]" style={{backgroundImage:"url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='20' cy='20' r='1.5' fill='%23FFFFFF'/%3E%3C/svg%3E\")"}} />
                <div className="relative z-10">
                  <div className="w-10 h-10 bg-white/15 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  </div>
                  <p className="font-body text-xs uppercase tracking-widest text-white/60 mb-2">Festa</p>
                  <h3 className="font-heading text-2xl mb-1 text-white">{wedding.venue}</h3>
                  {wedding.venueAddress && (
                    <p className="font-body text-white/65 text-sm mb-3">
                      {wedding.venueAddress}
                    </p>
                  )}
                  <p className="font-body text-white/80 text-sm mb-5 font-medium">
                    {formatDateTime(wedding.weddingDate)}
                  </p>
                  {wedding.venueAddress && (
                    <button
                      onClick={() => window.open(mapsUrl(wedding.venueAddress!), "_blank")}
                      className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur border border-white/25 text-white px-5 py-2 rounded-full text-sm hover:bg-white/25 transition"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Ver no mapa
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* fallback when no venues */}
            {!wedding.ceremonyVenue && !wedding.venue && (
              <div className="md:col-span-2 text-center py-8">
                <p className="font-body text-verde-noite/50 italic">
                  Informações do local em breve...
                </p>
              </div>
            )}
          </div>
        </FadeIn>
      </section>

      {/* ═══════ 4. RSVP ═══════ */}
      <section id="confirmacao" className="py-20 px-5 bg-cream">
        <FadeIn className="max-w-lg mx-auto">
          <div className="text-center mb-10">
            <p className="font-body text-xs uppercase tracking-widest text-copper/70 mb-3">Sua presença é a nossa alegria</p>
            <h2 className="font-heading text-4xl md:text-5xl text-verde-noite">Confirme sua Presença</h2>
          </div>

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
        <section id="presentes" className="wt-bg py-20 px-5 bg-cream">
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
      <section className="py-20 px-4 bg-white">
        <FadeIn className="max-w-5xl mx-auto">
          <h2 className="font-heading text-4xl text-center mb-12">Galeria</h2>
          <PhotoGallery photos={wedding.photos ?? []} />
        </FadeIn>
      </section>

      {/* ═══════ 7. FOOTER / VIRAL WATERMARK ═══════ */}
      <footer className="bg-verde-noite py-12 px-5">
        <div className="max-w-xl mx-auto text-center space-y-6">
          {/* message */}
          {wedding.message && (
            <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-5 mb-6">
              <p className="font-heading text-xl text-white/90 italic leading-relaxed">
                &ldquo;{wedding.message}&rdquo;
              </p>
              <p className="font-body text-xs text-white/40 mt-3">
                — {wedding.partnerName1} &amp; {wedding.partnerName2}
              </p>
            </div>
          )}

          {/* Viral CTA — powered by Laço */}
          <div className="flex flex-col items-center gap-3">
            <p className="font-body text-xs text-white/35 uppercase tracking-widest">
              Site criado com
            </p>
            <a
              href="/registro"
              className="group inline-flex items-center gap-2.5 bg-white/8 hover:bg-white/15 border border-white/15 rounded-2xl px-6 py-3.5 transition-all"
            >
              <span className="font-logo text-2xl text-white tracking-tight">Laço</span>
              <div className="h-4 w-px bg-white/20" />
              <span className="font-body text-xs text-white/60 group-hover:text-white/80 transition-colors">
                Crie o seu casamento grátis →
              </span>
            </a>
            <p className="font-body text-[10px] text-white/25">
              laco.app · Organize seu casamento com inteligência
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
