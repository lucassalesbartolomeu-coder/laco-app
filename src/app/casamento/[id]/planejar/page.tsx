"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import BottomNav from "@/components/bottom-nav";

// ── Design tokens ─────────────────────────────────────────────────
const GOLD  = "#A98950";
const BROWN = "#3D322A";
const CREME = "#FAF6EF";

/* ─── Icons ─────────────────────────────────────────────────────────── */

function CalcIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
}

function PeopleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: GOLD }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg className="w-4 h-4 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
      style={{ color: "rgba(169,137,80,0.40)" }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────── */

export default function PlanejarPage() {
  const params = useParams();
  const weddingId = params?.id as string;
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: CREME }}>
        <div className="w-7 h-7 border-[1.5px] border-t-transparent rounded-full animate-spin"
          style={{ borderColor: `${GOLD} transparent ${GOLD} ${GOLD}` }} />
      </div>
    );
  }
  if (!session) return null;

  const base = `/casamento/${weddingId}`;

  const tools = [
    {
      href: `${base}/simulador-convidados`,
      icon: <PeopleIcon />,
      title: "Simulador de Convidados",
      desc: "Importe contatos, detecte a cidade pelo DDD e preveja quantos realmente vão comparecer",
      tag: "DDD",
    },
    {
      href: `${base}/orcamento-inteligente`,
      icon: <CalcIcon />,
      title: "Simulador de Orçamento",
      desc: "Quiz por fornecedor — descubra quanto vai custar seu casamento com preços reais por região",
      tag: "IA",
    },
  ];

  return (
    <div className="min-h-screen pb-24" style={{ background: CREME }}>

      {/* ── Hero header ── */}
      <div className="relative overflow-hidden px-5 pt-12 pb-10"
        style={{ background: `linear-gradient(135deg, ${BROWN} 0%, #2A2019 100%)` }}>
        <div className="absolute top-4 right-0 w-48 h-48 rounded-full blur-3xl pointer-events-none"
          style={{ background: "rgba(169,137,80,0.18)" }} />
        <div className="absolute -bottom-4 left-0 w-32 h-32 rounded-full blur-3xl pointer-events-none"
          style={{ background: "rgba(169,137,80,0.10)" }} />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <SparkleIcon />
            <span className="text-[9px] tracking-[0.26em] uppercase"
              style={{ color: GOLD, fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
              Planejamento Inteligente
            </span>
          </div>
          <h1 className="text-4xl font-light text-white mb-2 leading-tight"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Planejar
          </h1>
          <p className="text-sm leading-relaxed max-w-md"
            style={{ color: "rgba(255,255,255,0.62)" }}>
            Simuladores com dados reais do mercado brasileiro — entenda seus números antes de fechar qualquer contrato.
          </p>
        </div>
      </div>

      {/* ── Tool cards ── */}
      <div className="px-4 -mt-4 relative z-10 pb-4 space-y-3">
        {tools.map((tool) => (
          <Link key={tool.href} href={tool.href}
            className="flex items-start gap-4 rounded-2xl p-4 transition-all active:scale-[0.98]"
            style={{ background: "white", border: "1px solid rgba(169,137,80,0.14)", boxShadow: "0 2px 12px rgba(61,50,42,0.07)" }}>

            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(169,137,80,0.10)", color: GOLD }}>
              {tool.icon}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-sm leading-tight" style={{ color: BROWN }}>{tool.title}</h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] tracking-[0.1em] uppercase"
                  style={{
                    background: "rgba(169,137,80,0.10)",
                    color: GOLD,
                    fontFamily: "'Josefin Sans', sans-serif",
                    fontWeight: 300,
                  }}>
                  {tool.tag}
                </span>
              </div>
              <p className="text-xs leading-snug" style={{ color: "rgba(61,50,42,0.55)" }}>
                {tool.desc}
              </p>
            </div>

            <ArrowIcon />
          </Link>
        ))}

        {/* ── How it works ── */}
        <div className="rounded-2xl p-5 mt-2"
          style={{ background: "white", border: "1px solid rgba(169,137,80,0.14)", boxShadow: "0 1px 6px rgba(61,50,42,0.05)" }}>
          <p className="text-[9.5px] tracking-[0.28em] uppercase mb-4"
            style={{ color: GOLD, fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
            Como funciona
          </p>
          <div className="space-y-4">
            {([
              { n: "1", text: "Responda o quiz por fornecedor — de simples a premium" },
              { n: "2", text: "Importe seus contatos e veja quantos realmente vão pelo DDD" },
              { n: "3", text: "Receba um orçamento realista por região", gold: true },
            ] as { n: string; text: string; gold?: boolean }[]).map((step) => (
              <div key={step.n} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full text-xs font-semibold flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={step.gold
                    ? { background: GOLD, color: "white" }
                    : { background: "rgba(61,50,42,0.08)", color: BROWN }}>
                  {step.n}
                </span>
                <p className="text-xs leading-snug pt-0.5" style={{ color: "rgba(61,50,42,0.62)" }}>
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav weddingId={weddingId} />
    </div>
  );
}
