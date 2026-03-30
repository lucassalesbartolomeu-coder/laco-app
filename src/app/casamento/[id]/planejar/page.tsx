"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import BottomNav from "@/components/bottom-nav";

/* ─── Icons ─────────────────────────────────────────────────────────── */

function CalcIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
}

function PeopleIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function VendorIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
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
  const weddingId = params.id as string;
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
      href: `${base}/orcamento-inteligente`,
      icon: <CalcIcon />,
      color: "bg-midnight",
      title: "Simulador de Orçamento",
      desc: "Quiz por fornecedor — descubra quanto vai custar seu casamento com preços reais por região",
      tag: "IA",
      tagColor: "bg-midnight/10 text-midnight",
    },
    {
      href: `${base}/simulador-convidados`,
      icon: <PeopleIcon />,
      color: "bg-gold",
      title: "Simulador de Convidados",
      desc: "Importe contatos, detecte a cidade pelo DDD e preveja quantos realmente vao comparecer",
      tag: "DDD",
      tagColor: "bg-gold/10 text-gold",
    },
    {
      href: `${base}/fornecedores`,
      icon: <VendorIcon />,
      color: "bg-midnight",
      title: "Catalogo de Fornecedores",
      desc: "Fornecedores classificados por essencialidade: Essencial, Muito Recomendado, Legal Ter, Adicional",
      tag: null,
      tagColor: "",
    },
  ];

  return (
    <div className="min-h-screen bg-ivory pb-24">
      {/* Hero */}
      <div className="bg-gradient-to-br from-midnight via-midnight to-midnight/90 px-5 pt-12 pb-10 relative overflow-hidden">
        {/* Decorative dots */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <SparkleIcon className="w-5 h-5 text-gold" />
            <span className="font-body text-xs text-white/60 uppercase tracking-wider">Planejamento Inteligente</span>
          </div>
          <h1 className="font-heading text-3xl text-white mb-2">Planejar</h1>
          <p className="font-body text-sm text-white/70 max-w-md">
            Simuladores com IA e dados reais do mercado brasileiro. Entenda seus numeros antes de fechar qualquer contrato.
          </p>
        </div>
      </div>

      {/* Tools grid */}
      <div className="px-4 -mt-5 relative z-10">
        <div className="space-y-4">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="block bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-midnight/20 transition-all active:scale-[0.98]"
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl ${tool.color} text-white flex items-center justify-center flex-shrink-0`}>
                  {tool.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-heading text-lg text-midnight">{tool.title}</h3>
                    {tool.tag && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-body font-semibold ${tool.tagColor}`}>
                        {tool.tag}
                      </span>
                    )}
                  </div>
                  <p className="font-body text-sm text-gray-500 leading-relaxed">{tool.desc}</p>
                </div>
                <ArrowIcon className="w-5 h-5 text-gray-300 flex-shrink-0 mt-1" />
              </div>
            </Link>
          ))}
        </div>

        {/* Insight card */}
        <div className="mt-6 bg-gradient-to-r from-midnight/5 to-gold/5 border border-midnight/10 rounded-2xl p-5">
          <h3 className="font-heading text-base text-midnight mb-2">Como funciona?</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-midnight text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
              <p className="font-body text-sm text-gray-600">Responda o <strong>quiz por fornecedor</strong> — de &ldquo;quero algo simples&rdquo; a &ldquo;quero o que a blogueira teve&rdquo;</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-midnight text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
              <p className="font-body text-sm text-gray-600">Importe seus contatos e veja quantos <strong>realmente vao</strong> pelo DDD e distancia</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-gold text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
              <p className="font-body text-sm text-gray-600">Receba um <strong>orçamento realista</strong> baseado na sua região (SP, RJ, MG, Interior)</p>
            </div>
          </div>
        </div>
      </div>

      <BottomNav weddingId={weddingId} />
    </div>
  );
}
