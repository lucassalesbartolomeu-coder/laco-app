"use client";
// ─── Planejar ─────────────────────────────────────────────────────────────────
// Ferramentas de planejamento com o phone-shell padrão da Aba Design.
// Visual: grid de tool cards com badge, ilustrações e CTAs claros.

import { motion } from "framer-motion";
import { PhoneShell } from "./PhoneShell";
import { AppHeader } from "./AppHeader";
import { AppBottomNav } from "./AppBottomNav";

const ACCENT = "#6B7C5E"; // Verde Botânico — identidade da aba Planejar

// ── Tool Card ─────────────────────────────────────────────────────────────────
interface ToolCardProps {
  icon: string;
  title: string;
  desc: string;
  tag?: string;
  tagType?: "ai" | "new" | "beta";
  href: string;
  highlight?: boolean;
}

function ToolCard({ icon, title, desc, tag, tagType = "ai", href, highlight }: ToolCardProps) {
  const tagColors = {
    ai:   { bg: `${ACCENT}18`, text: ACCENT },
    new:  { bg: "rgba(181,112,79,0.12)", text: "#B5704F" },
    beta: { bg: "rgba(139,123,165,0.12)", text: "#8B7BA5" },
  };
  const tc = tagColors[tagType];

  return (
    <motion.a
      href={href}
      whileTap={{ scale: 0.97 }}
      className="relative flex items-start gap-3.5 overflow-hidden rounded-2xl border bg-white px-5 py-4 shadow-sm transition-shadow hover:shadow-md"
      style={{
        borderColor: highlight ? `${ACCENT}55` : "rgba(0,0,0,0.07)",
        textDecoration: "none",
      }}
    >
      {highlight && (
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ background: ACCENT }}
        />
      )}
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] text-xl"
        style={{ background: `${ACCENT}15` }}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex items-center gap-2">
          <p
            className="text-[12.5px] font-light tracking-[0.04em]"
            style={{ fontFamily: "'Josefin Sans', sans-serif", color: "#3D322A" }}
          >
            {title}
          </p>
          {tag && (
            <span
              className="rounded-md px-1.5 py-0.5 text-[8px] font-light tracking-[0.1em] uppercase"
              style={{ fontFamily: "'Josefin Sans', sans-serif", background: tc.bg, color: tc.text }}
            >
              {tag}
            </span>
          )}
        </div>
        <p className="text-[11px] leading-snug" style={{ color: "rgba(61,50,42,0.45)" }}>
          {desc}
        </p>
      </div>
      <span style={{ color: ACCENT, fontSize: 18, opacity: 0.45 }}>›</span>
    </motion.a>
  );
}

// ── Budget Summary Bar ────────────────────────────────────────────────────────
function BudgetBar({ spent, total }: { spent: number; total: number }) {
  const pct = total > 0 ? Math.min(100, Math.round((spent / total) * 100)) : 0;
  const fmt = (n: number) =>
    n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

  return (
    <div
      className="mx-5 mb-4 rounded-2xl border p-4"
      style={{ borderColor: `${ACCENT}22`, background: `${ACCENT}06` }}
    >
      <div className="mb-2 flex items-center justify-between">
        <p
          className="text-[9.5px] font-light tracking-[0.22em] uppercase"
          style={{ fontFamily: "'Josefin Sans', sans-serif", color: "rgba(61,50,42,0.45)" }}
        >
          Orçamento total
        </p>
        <p
          className="text-[11px] font-light"
          style={{ fontFamily: "'Josefin Sans', sans-serif", color: "#3D322A" }}
        >
          {fmt(spent)} <span style={{ color: "rgba(61,50,42,0.35)" }}>/ {fmt(total)}</span>
        </p>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/8">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: ACCENT }}
        />
      </div>
      <p
        className="mt-1.5 text-right text-[9px]"
        style={{ color: "rgba(61,50,42,0.38)" }}
      >
        {pct}% comprometido
      </p>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
interface PlanejarClientProps {
  weddingId?: string;
  budgetSpent?: number;
  budgetTotal?: number;
}

export default function PlanejarClient({
  weddingId = "demo",
  budgetSpent = 48000,
  budgetTotal = 120000,
}: PlanejarClientProps) {
  const base = `/casamento/${weddingId}`;

  const tools: ToolCardProps[] = [
    {
      icon: "👥",
      title: "Simulador de Convidados",
      desc: "Detecte cidade pelo DDD e preveja presença real",
      tag: "DDD",
      tagType: "ai",
      href: `${base}/simulador-convidados`,
      highlight: true,
    },
    {
      icon: "🧮",
      title: "Simulador de Orçamento",
      desc: "Preços reais por região — descubra o custo do seu casamento",
      tag: "IA",
      tagType: "ai",
      href: `${base}/orcamento-inteligente`,
    },
    {
      icon: "📅",
      title: "Timeline",
      desc: "Linha do tempo com tarefas e marcos até o grande dia",
      href: `${base}/timeline`,
    },
    {
      icon: "🏢",
      title: "Fornecedores",
      desc: "Gerencie cotações, contratos e pagamentos",
      href: `${base}/fornecedores`,
    },
    {
      icon: "📊",
      title: "Orçamento Detalhado",
      desc: "Controle por categoria — buffet, foto, flores e mais",
      href: `${base}/orcamento`,
    },
    {
      icon: "✈️",
      title: "Lua de Mel",
      desc: "Planejamento da viagem com lista de destinos e roteiro",
      tag: "Novo",
      tagType: "new",
      href: `${base}/lua-de-mel`,
    },
  ];

  const stagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
  };
  const item = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  };

  return (
    <PhoneShell>
      <AppHeader title="Planejar" accent={ACCENT} />

      <div className="overflow-y-auto" style={{ maxHeight: "calc(844px - 44px - 80px)" }}>
        <div className="pb-6">

          {/* ── Hero label ── */}
          <div className="px-5 pt-5 pb-4">
            <p
              className="mb-1 text-[9.5px] font-light tracking-[0.3em] uppercase"
              style={{ fontFamily: "'Josefin Sans', sans-serif", color: "rgba(61,50,42,0.38)" }}
            >
              Ferramentas
            </p>
            <h2
              className="font-['Cormorant_Garamond'] text-[26px] font-light leading-tight"
              style={{ color: "#3D322A" }}
            >
              Planeje cada detalhe
            </h2>
            <p className="mt-1 text-[12.5px] leading-relaxed" style={{ color: "rgba(61,50,42,0.55)" }}>
              Simuladores inteligentes e ferramentas para o dia perfeito.
            </p>
          </div>

          {/* ── Budget bar ── */}
          <BudgetBar spent={budgetSpent} total={budgetTotal} />

          {/* ── Tool cards ── */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-2.5 px-5"
          >
            {tools.map((t) => (
              <motion.div key={t.title} variants={item}>
                <ToolCard {...t} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      <AppBottomNav active="planejar" accent={ACCENT} weddingId={weddingId} />
    </PhoneShell>
  );
}
