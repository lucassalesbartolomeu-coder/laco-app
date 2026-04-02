"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import BottomNav from "@/components/bottom-nav";

// ── Design tokens ─────────────────────────────────────────────────
const GOLD   = "#A98950";
const BROWN  = "#3D322A";
const CREME  = "#FAF6EF";
const BG_DARK = "#F0E8DA";

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

      {/* ── Header ── */}
      <div className="px-5 pt-10 pb-6">
        <p className="text-[9px] tracking-[0.28em] uppercase mb-1"
          style={{ color: "rgba(61,50,42,0.36)", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
          Simuladores Inteligentes
        </p>
        <h1 className="text-[30px] font-light leading-tight mb-1"
          style={{ color: BROWN, fontFamily: "'Cormorant Garamond', serif" }}>
          Planejar
        </h1>
        <p className="text-[12px] leading-relaxed" style={{ color: "rgba(61,50,42,0.58)" }}>
          Dados reais do mercado brasileiro — saiba seus números antes de fechar qualquer contrato.
        </p>
      </div>

      {/* ── Ornamental divider ── */}
      <div className="flex items-center gap-2.5 mx-5 mb-5">
        <div className="flex-1 h-px" style={{ background: "rgba(169,137,80,0.16)" }} />
        <div className="w-[5px] h-[5px] rotate-45 opacity-55 flex-shrink-0" style={{ background: GOLD }} />
        <div className="flex-1 h-px" style={{ background: "rgba(169,137,80,0.16)" }} />
      </div>

      <div className="px-5 space-y-5 pb-4">

        {/* ── Ferramentas section label ── */}
        <div>
          <p className="text-[9.5px] tracking-[0.3em] uppercase pb-2.5"
            style={{ color: GOLD, fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
            Ferramentas
          </p>

          {/* Entry cards */}
          <div className="space-y-2.5">
            {tools.map((tool) => (
              <Link key={tool.href} href={tool.href}
                className="flex items-center gap-3.5 rounded-2xl px-[18px] py-4 transition-all active:scale-[0.98]"
                style={{ background: "white", border: "1.5px solid rgba(169,137,80,0.16)", boxShadow: "0 1px 6px rgba(61,50,42,0.05)" }}>
                <div className="w-[42px] h-[42px] rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: BG_DARK, color: GOLD }}>
                  {tool.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-[12px] tracking-[0.06em]"
                      style={{ fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300, color: BROWN }}>
                      {tool.title}
                    </p>
                    <span className="text-[8.5px] tracking-[0.08em] uppercase px-2 py-0.5 rounded-md"
                      style={{ background: "rgba(169,137,80,0.11)", color: GOLD,
                      fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
                      {tool.tag}
                    </span>
                  </div>
                  <p className="text-[11px] leading-snug" style={{ color: "rgba(61,50,42,0.36)" }}>
                    {tool.desc}
                  </p>
                </div>
                <span className="text-[18px] flex-shrink-0" style={{ color: "rgba(169,137,80,0.40)" }}>›</span>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Como funciona ── */}
        <div>
          <p className="text-[9.5px] tracking-[0.3em] uppercase pb-2.5"
            style={{ color: GOLD, fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
            Como funciona
          </p>
          <div className="rounded-2xl p-[18px_18px_20px]"
            style={{ background: "white", border: "1.5px solid rgba(169,137,80,0.16)", boxShadow: "0 1px 6px rgba(61,50,42,0.05)" }}>
            <div className="flex flex-col gap-3.5">
              {[
                { n: "1", text: "Responda o quiz por fornecedor — de simples a premium", gold: false },
                { n: "2", text: "Importe seus contatos e veja quantos realmente vão pelo DDD", gold: false },
                { n: "3", text: "Receba um orçamento realista com preços reais por região", gold: true },
              ].map((step) => (
                <div key={step.n} className="flex items-start gap-3">
                  <span className="w-[22px] h-[22px] rounded-full text-[10px] flex items-center justify-center flex-shrink-0"
                    style={step.gold
                      ? { background: GOLD, color: "white", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }
                      : { background: BG_DARK, color: "rgba(61,50,42,0.58)", fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300 }}>
                    {step.n}
                  </span>
                  <p className="text-[12px] leading-relaxed pt-0.5" style={{ color: "rgba(61,50,42,0.58)" }}>
                    {step.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      <BottomNav weddingId={weddingId} />
    </div>
  );
}
