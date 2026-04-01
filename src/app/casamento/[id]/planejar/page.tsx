"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import BottomNav from "@/components/bottom-nav";

/* ─── Icons ─────────────────────────────────────────────────────────── */

function CalcIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
}

function PeopleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}


function SparkleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}

function ArrowIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-midnight border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!session) return null;

  const base = `/casamento/${weddingId}`;

  const tools = [
    {
      href: `${base}/simulador-convidados`,
      icon: <PeopleIcon />,
      color: "bg-midnight",
      title: "Simulador de Convidados",
      desc: "Importe contatos, detecte a cidade pelo DDD e preveja quantos realmente vão comparecer",
      tag: "DDD",
      tagColor: "bg-midnight/10 text-midnight",
    },
    {
      href: `${base}/orcamento-inteligente`,
      icon: <CalcIcon />,
      color: "bg-midnight",
      title: "Simulador de Orçamento",
      desc: "Quiz por fornecedor — descubra quanto vai custar seu casamento com preços reais por região",
      tag: "IA",
      tagColor: "bg-midnight/10 text-midnight",
    },
  ];

  return (
    <div className="min-h-screen bg-ivory pb-24">
      {/* Header with gradient */}
      <div className="bg-gradient-to-br from-midnight via-midnight to-midnight/95 px-5 pt-12 pb-10 relative overflow-hidden">
        {/* Decorative gold blur accent */}
        <div className="absolute top-8 right-0 w-40 h-40 bg-gold/10 rounded-full blur-3xl" />
        {/* Dot pattern */}
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <SparkleIcon className="w-5 h-5 text-gold" />
            <span className="font-body text-[10px] font-medium tracking-[0.2em] uppercase text-gold">Planejamento Inteligente</span>
          </div>
          <h1 className="font-heading text-3xl font-bold text-white mb-2">Planejar</h1>
          <p className="font-body text-sm text-white/70 max-w-md leading-relaxed">
            Simuladores com IA e dados reais do mercado brasileiro. Entenda seus números antes de fechar qualquer contrato.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 -mt-5 relative z-10 pb-4">
        <div className="space-y-3">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="block bg-white rounded-2xl border border-midnight/8 shadow-card p-4 hover:shadow-md hover:border-midnight/15 transition-all duration-150 active:scale-[0.98]"
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl ${tool.color} text-ivory flex items-center justify-center flex-shrink-0 transition-all duration-150`}>
                  {tool.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="font-body font-semibold text-midnight leading-tight">{tool.title}</h3>
                    {tool.tag && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-body font-medium tracking-[0.1em] uppercase ${tool.tagColor}`}>
                        {tool.tag}
                      </span>
                    )}
                  </div>
                  <p className="font-body text-xs text-stone leading-snug">{tool.desc}</p>
                </div>
                <ArrowIcon className="w-5 h-5 text-midnight/20 flex-shrink-0 mt-0.5" />
              </div>
            </Link>
          ))}
        </div>

        {/* How it works */}
        <div className="mt-8 bg-white rounded-2xl border border-midnight/8 shadow-card p-5">
          <h3 className="font-body text-[10px] font-medium tracking-[0.2em] uppercase text-gold mb-4">Como funciona</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-midnight text-ivory flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
              <p className="font-body text-xs text-midnight/70 leading-snug pt-0.5">Responda o <span className="font-semibold text-midnight">quiz por fornecedor</span> — de simples a premium</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-midnight text-ivory flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
              <p className="font-body text-xs text-midnight/70 leading-snug pt-0.5">Importe seus contatos e veja quantos <span className="font-semibold text-midnight">realmente vão</span> pelo DDD</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-gold text-midnight flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
              <p className="font-body text-xs text-midnight/70 leading-snug pt-0.5">Receba um <span className="font-semibold text-midnight">orçamento realista</span> por região</p>
            </div>
          </div>
        </div>
      </div>

      <BottomNav weddingId={weddingId} />
    </div>
  );
}
