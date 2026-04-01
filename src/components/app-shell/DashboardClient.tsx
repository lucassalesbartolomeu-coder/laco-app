"use client";
// ─── Dashboard (Início) ───────────────────────────────────────────────────────
// Recria o dashboard com o mesmo phone-shell da Aba Design.
// Visual: countdown ring, stats de convidados, quick-actions.

import { motion } from "framer-motion";
import { PhoneShell } from "./PhoneShell";
import { AppHeader } from "./AppHeader";
import { AppBottomNav } from "./AppBottomNav";

// ── Countdown Ring ────────────────────────────────────────────────────────────
function CountdownRing({ days, accent }: { days: number; accent: string }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, days / 365));
  const dash = circ * pct;

  return (
    <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
      <svg viewBox="0 0 88 88" className="h-24 w-24 -rotate-90">
        <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(169,137,80,0.15)" strokeWidth="6" />
        <circle
          cx="44" cy="44" r={r} fill="none"
          stroke={accent} strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{ transition: "stroke-dasharray 1s ease" }}
        />
      </svg>
      <div className="absolute text-center">
        <p
          className="text-[22px] font-light leading-none"
          style={{ fontFamily: "'Josefin Sans', sans-serif", color: accent }}
        >
          {days}
        </p>
        <p
          className="mt-0.5 text-[8px] font-light tracking-[0.18em] uppercase"
          style={{ fontFamily: "'Josefin Sans', sans-serif", color: "rgba(61,50,42,0.45)" }}
        >
          dias
        </p>
      </div>
    </div>
  );
}

// ── Stat pill ─────────────────────────────────────────────────────────────────
function StatPill({
  value, label, accent,
}: { value: string | number; label: string; accent: string }) {
  return (
    <div
      className="flex flex-col items-center rounded-2xl border px-4 py-3"
      style={{ borderColor: `${accent}22`, background: `${accent}08` }}
    >
      <p
        className="text-[22px] font-light leading-none"
        style={{ fontFamily: "'Josefin Sans', sans-serif", color: accent }}
      >
        {value}
      </p>
      <p
        className="mt-1 text-[9px] font-light tracking-[0.14em] uppercase"
        style={{ fontFamily: "'Josefin Sans', sans-serif", color: "rgba(61,50,42,0.45)" }}
      >
        {label}
      </p>
    </div>
  );
}

// ── Quick Action Card ─────────────────────────────────────────────────────────
function QuickCard({
  icon, title, desc, href, accent,
}: { icon: string; title: string; desc: string; href: string; accent: string }) {
  return (
    <motion.a
      href={href}
      whileTap={{ scale: 0.97 }}
      className="flex items-center gap-3.5 rounded-2xl border border-black/8 bg-white px-5 py-4 shadow-sm transition-shadow hover:shadow-md"
      style={{ textDecoration: "none" }}
    >
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] text-xl"
        style={{ background: `${accent}18` }}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p
          className="mb-0.5 text-[12px] font-light tracking-[0.06em]"
          style={{ fontFamily: "'Josefin Sans', sans-serif", color: "#3D322A" }}
        >
          {title}
        </p>
        <p className="text-[11px] leading-snug" style={{ color: "rgba(61,50,42,0.45)" }}>
          {desc}
        </p>
      </div>
      <span style={{ color: accent, fontSize: 18, opacity: 0.5 }}>›</span>
    </motion.a>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
interface DashboardClientProps {
  weddingId?: string;
  partnerName1?: string;
  partnerName2?: string;
  daysUntil?: number;
  guestTotal?: number;
  guestConfirmed?: number;
}

export default function DashboardClient({
  weddingId = "demo",
  partnerName1 = "Antônia",
  partnerName2 = "Bruno",
  daysUntil = 129,
  guestTotal = 180,
  guestConfirmed = 62,
}: DashboardClientProps) {
  const ACCENT = "#A98950";
  const base = `/casamento/${weddingId}`;
  const pctConfirmed = guestTotal > 0 ? Math.round((guestConfirmed / guestTotal) * 100) : 0;

  const quickActions = [
    { icon: "👥", title: "Convidados",   desc: `${guestConfirmed} de ${guestTotal} confirmados`,    href: `${base}/convidados` },
    { icon: "📋", title: "Timeline",      desc: "Sua linha do tempo do casamento",                   href: `${base}/timeline` },
    { icon: "💰", title: "Orçamento",     desc: "Controle seus gastos e fornecedores",               href: `${base}/orcamento` },
    { icon: "🎨", title: "Meu Design",    desc: "Identidade visual, site e papelaria",               href: `${base}/meu-site` },
    { icon: "🎁", title: "Lista de Presentes", desc: "Gerencie os presentes e Pix",                 href: `${base}/presentes` },
    { icon: "📄", title: "Contratos",     desc: "Contratos assinados com fornecedores",              href: `${base}/contratos` },
  ];

  return (
    <PhoneShell>
      {/* Header */}
      <AppHeader title="Início" accent={ACCENT} />

      {/* Scrollable content */}
      <div className="overflow-y-auto" style={{ maxHeight: "calc(844px - 44px - 80px)" }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="pb-6"
        >
          {/* ── Hero card — countdown + names ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mx-5 mt-4 overflow-hidden rounded-3xl"
            style={{
              background: `linear-gradient(135deg, #A98950 0%, #C4A76C 60%, #D4B87C 100%)`,
            }}
          >
            <div className="flex items-center justify-between p-5">
              <div>
                <p
                  className="mb-1 text-[9px] font-light tracking-[0.28em] uppercase text-white/70"
                  style={{ fontFamily: "'Josefin Sans', sans-serif" }}
                >
                  Seu grande dia
                </p>
                <h1
                  className="text-[24px] font-light italic leading-tight text-white"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {partnerName1} &amp; {partnerName2}
                </h1>
                <p
                  className="mt-2 text-[9.5px] font-light tracking-[0.15em] uppercase text-white/60"
                  style={{ fontFamily: "'Josefin Sans', sans-serif" }}
                >
                  Vale dos Desejos · Areal, RJ
                </p>
              </div>
              <CountdownRing days={daysUntil} accent="white" />
            </div>

            {/* Progress bar convidados */}
            <div className="border-t border-white/15 px-5 pb-4 pt-3">
              <div className="mb-1.5 flex items-center justify-between">
                <p
                  className="text-[9px] font-light tracking-[0.15em] uppercase text-white/60"
                  style={{ fontFamily: "'Josefin Sans', sans-serif" }}
                >
                  Confirmações
                </p>
                <p
                  className="text-[9px] font-light text-white/80"
                  style={{ fontFamily: "'Josefin Sans', sans-serif" }}
                >
                  {guestConfirmed}/{guestTotal} ({pctConfirmed}%)
                </p>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-white transition-all duration-700"
                  style={{ width: `${pctConfirmed}%` }}
                />
              </div>
            </div>
          </motion.div>

          {/* ── Stats row ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="mt-4 grid grid-cols-3 gap-2.5 px-5"
          >
            <StatPill value={daysUntil} label="Dias" accent={ACCENT} />
            <StatPill value={guestTotal} label="Convidados" accent={ACCENT} />
            <StatPill value={`${pctConfirmed}%`} label="Confirmados" accent={ACCENT} />
          </motion.div>

          {/* ── Quick actions ── */}
          <div className="mt-5 px-5">
            <p
              className="mb-3 text-[9.5px] font-light tracking-[0.3em] uppercase"
              style={{ fontFamily: "'Josefin Sans', sans-serif", color: "rgba(61,50,42,0.38)" }}
            >
              Acesso rápido
            </p>
            <div className="flex flex-col gap-2.5">
              {quickActions.map((a, i) => (
                <motion.div
                  key={a.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: 0.12 + i * 0.05 }}
                >
                  <QuickCard {...a} accent={ACCENT} />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Nav */}
      <AppBottomNav active="inicio" accent={ACCENT} weddingId={weddingId} />
    </PhoneShell>
  );
}
