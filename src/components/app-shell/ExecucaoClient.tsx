"use client";
// ─── Execução (Organizar) ─────────────────────────────────────────────────────
// Aba de execução com o phone-shell padrão.
// Visual: seções agrupadas com badge de status + stats de convidados no topo.

import { motion } from "framer-motion";
import { PhoneShell } from "./PhoneShell";
import { AppHeader } from "./AppHeader";
import { AppBottomNav } from "./AppBottomNav";

const ACCENT = "#B5704F"; // Terracota Poético — identidade da aba Execução

// ── Guest Donut ───────────────────────────────────────────────────────────────
function GuestDonut({
  confirmed, pending, declined, total,
}: { confirmed: number; pending: number; declined: number; total: number }) {
  const pct = total > 0 ? Math.round((confirmed / total) * 100) : 0;
  const r = 30;
  const circ = 2 * Math.PI * r;

  return (
    <div
      className="mx-5 mb-4 flex items-center gap-5 rounded-2xl border p-4"
      style={{ borderColor: `${ACCENT}22`, background: `${ACCENT}06` }}
    >
      {/* Mini donut */}
      <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
        <svg viewBox="0 0 68 68" className="h-16 w-16 -rotate-90">
          <circle cx="34" cy="34" r={r} fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth="7" />
          <circle
            cx="34" cy="34" r={r} fill="none"
            stroke={ACCENT} strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${circ * pct / 100} ${circ}`}
          />
        </svg>
        <div className="absolute text-center">
          <p
            className="text-[14px] font-light leading-none"
            style={{ fontFamily: "'Josefin Sans', sans-serif", color: ACCENT }}
          >
            {pct}%
          </p>
        </div>
      </div>

      {/* Breakdown */}
      <div className="flex flex-1 flex-col gap-1.5">
        {[
          { label: "Confirmados", value: confirmed, color: "#6B7C5E" },
          { label: "Aguardando",  value: pending,   color: "#B5704F" },
          { label: "Declinaram",  value: declined,  color: "rgba(61,50,42,0.3)" },
        ].map((s) => (
          <div key={s.label} className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />
              <span
                className="text-[10.5px] font-light"
                style={{ fontFamily: "'Josefin Sans', sans-serif", color: "rgba(61,50,42,0.55)" }}
              >
                {s.label}
              </span>
            </div>
            <span
              className="text-[11px] font-light"
              style={{ fontFamily: "'Josefin Sans', sans-serif", color: "#3D322A" }}
            >
              {s.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────
interface SectionItem {
  icon: string;
  label: string;
  desc: string;
  href: string;
  badge?: string | null;
  badgeType?: "ok" | "warn" | "info";
}

function Section({ title, items }: { title: string; items: SectionItem[] }) {
  const badgeStyle = {
    ok:   { bg: "rgba(107,124,94,0.12)",  text: "#6B7C5E" },
    warn: { bg: `${ACCENT}18`,             text: ACCENT },
    info: { bg: "rgba(169,137,80,0.12)",   text: "#A98950" },
  };

  return (
    <div className="mb-4">
      <p
        className="mb-2 px-5 text-[9.5px] font-light tracking-[0.28em] uppercase"
        style={{ fontFamily: "'Josefin Sans', sans-serif", color: "rgba(61,50,42,0.38)" }}
      >
        {title}
      </p>
      <div className="flex flex-col gap-2 px-5">
        {items.map((item) => {
          const bs = item.badgeType ? badgeStyle[item.badgeType] : badgeStyle.info;
          return (
            <motion.a
              key={item.label}
              href={item.href}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3.5 rounded-2xl border border-black/7 bg-white px-5 py-3.5 shadow-sm transition-shadow hover:shadow-md"
              style={{ textDecoration: "none" }}
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] text-lg"
                style={{ background: `${ACCENT}12` }}
              >
                {item.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className="text-[12px] font-light tracking-[0.04em]"
                  style={{ fontFamily: "'Josefin Sans', sans-serif", color: "#3D322A" }}
                >
                  {item.label}
                </p>
                <p className="text-[10.5px] leading-snug" style={{ color: "rgba(61,50,42,0.42)" }}>
                  {item.desc}
                </p>
              </div>
              {item.badge && (
                <span
                  className="shrink-0 rounded-lg px-2 py-0.5 text-[8.5px] font-light tracking-[0.08em] uppercase"
                  style={{ fontFamily: "'Josefin Sans', sans-serif", background: bs.bg, color: bs.text }}
                >
                  {item.badge}
                </span>
              )}
              {!item.badge && (
                <span style={{ color: ACCENT, fontSize: 18, opacity: 0.4 }}>›</span>
              )}
            </motion.a>
          );
        })}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
interface ExecucaoClientProps {
  weddingId?: string;
  guestConfirmed?: number;
  guestPending?: number;
  guestDeclined?: number;
  guestTotal?: number;
}

export default function ExecucaoClient({
  weddingId = "demo",
  guestConfirmed = 62,
  guestPending = 98,
  guestDeclined = 20,
  guestTotal = 180,
}: ExecucaoClientProps) {
  const base = `/casamento/${weddingId}`;

  const sections = [
    {
      title: "Convidados",
      items: [
        { icon: "👥", label: "Lista de Convidados",         desc: "Lista A/B/C, categorias e status RSVP",             href: `${base}/convidados`,            badge: `${guestTotal}`, badgeType: "info" as const },
        { icon: "💌", label: "Enviar Convite / Save the Date", desc: "Disparo com 1 clique para seus grupos",           href: `${base}/whatsapp-confirmacao`,  badge: null },
        { icon: "✅", label: "Confirmações",                 desc: `${guestConfirmed} confirmados · ${guestPending} aguardando`, href: `${base}/confirmacoes`, badge: `${guestPending} pend.`, badgeType: "warn" as const },
      ],
    },
    {
      title: "Financeiro",
      items: [
        { icon: "💰", label: "Orçamento",   desc: "Controle de gastos por categoria",      href: `${base}/orcamento`,  badge: null },
        { icon: "📄", label: "Contratos",   desc: "Contratos com fornecedores assinados",  href: `${base}/contratos`,  badge: null },
        { icon: "🎁", label: "Presentes",   desc: "Lista de presentes e Pix integrado",    href: `${base}/presentes`,  badge: "Novo", badgeType: "ok" as const },
      ],
    },
    {
      title: "Logística",
      items: [
        { icon: "📅", label: "Timeline",     desc: "Cronograma até o grande dia",          href: `${base}/timeline`,   badge: null },
        { icon: "🏢", label: "Fornecedores", desc: "Buffet, foto, flores e mais",          href: `${base}/fornecedores`, badge: null },
        { icon: "✈️", label: "Lua de Mel",   desc: "Planejamento da viagem",               href: `${base}/lua-de-mel`, badge: null },
      ],
    },
  ];

  return (
    <PhoneShell>
      <AppHeader title="Organizar" accent={ACCENT} />

      <div className="overflow-y-auto" style={{ maxHeight: "calc(844px - 44px - 80px)" }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="pb-6"
        >
          {/* Header text */}
          <div className="px-5 pt-5 pb-4">
            <p
              className="mb-1 text-[9.5px] font-light tracking-[0.3em] uppercase"
              style={{ fontFamily: "'Josefin Sans', sans-serif", color: "rgba(61,50,42,0.38)" }}
            >
              Execução
            </p>
            <h2
              className="font-['Cormorant_Garamond'] text-[26px] font-light leading-tight"
              style={{ color: "#3D322A" }}
            >
              Tudo sob controle
            </h2>
          </div>

          {/* Guest donut */}
          <GuestDonut
            confirmed={guestConfirmed}
            pending={guestPending}
            declined={guestDeclined}
            total={guestTotal}
          />

          {/* Sections */}
          {sections.map((s) => (
            <Section key={s.title} title={s.title} items={s.items} />
          ))}
        </motion.div>
      </div>

      <AppBottomNav active="organizar" accent={ACCENT} weddingId={weddingId} />
    </PhoneShell>
  );
}
