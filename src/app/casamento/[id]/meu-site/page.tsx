"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import BottomNav from "@/components/bottom-nav";

/* ─── Icons ─────────────────────────────────────────────────────────── */

function GlobeIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
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

function LockIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────── */

export default function MeuSitePage() {
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

  /* Sections: Site do Casamento + Identidade Visual (papelaria) */
  const siteFeatures = [
    { icon: "🏠", label: "Home", desc: "Nomes, data, local, RSVP" },
    { icon: "👗", label: "Dress Code", desc: "Traje, dicas, fotos inspiracao" },
    { icon: "🗺️", label: "Concierge", desc: "Mapa ilustrado, hospedagem, transporte" },
    { icon: "✉️", label: "RSVP", desc: "Confirmacao online integrada com lista" },
    { icon: "🎁", label: "Lista de Presentes", desc: "Link direto para sua lista" },
  ];

  const identityItems = [
    { icon: "🎨", label: "Brasao / Monograma", desc: "Iniciais do casal em selo circular", available: true },
    { icon: "🖼️", label: "Aquarela do Local", desc: "Ilustracao do local da cerimonia", available: false },
    { icon: "📜", label: "Convite Digital", desc: "Convite interativo com animacoes", available: false },
    { icon: "🍽️", label: "Menu de Drinks", desc: "Cardapio ilustrado em aquarela", available: false },
    { icon: "💧", label: "Lagrimas de Alegria", desc: "Tag personalizada para lencinhos", available: false },
    { icon: "📖", label: "Manual dos Padrinhos", desc: "Guia completo para padrinhos e daminhas", available: false },
    { icon: "📰", label: "Jornal dos Noivos", desc: "Jornal personalizado com historia do casal", available: false },
    { icon: "🏷️", label: "Papelaria do Dia", desc: "Menu, tag de agradecimento, place cards", available: false },
    { icon: "📱", label: "Save the Date", desc: "Digital animado para WhatsApp", available: false },
    { icon: "🐾", label: "Aquarela do Pet", desc: "Inclua seu pet na identidade visual", available: false },
  ];

  return (
    <div className="min-h-screen bg-ivory pb-24">
      {/* Hero */}
      <div className="bg-gradient-to-br from-midnight via-midnight/95 to-midnight/80 px-5 pt-12 pb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gold/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-midnight/20 rounded-full blur-2xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <GlobeIcon className="w-5 h-5 text-gold" />
            <span className="font-body text-xs text-white/60 uppercase tracking-wider">Site + Identidade</span>
          </div>
          <h1 className="font-heading text-3xl text-white mb-2">Design</h1>
          <p className="font-body text-sm text-white/70 max-w-md">
            Crie um site de casamento no nivel dos melhores designers do Brasil, e uma identidade visual completa com aquarelas, convites e papelaria.
          </p>
        </div>
      </div>

      <div className="px-4 -mt-5 relative z-10 space-y-4 pb-6">

        {/* ── 1. Identidade Visual com IA ───────────────────────────── */}
        <Link
          href={`${base}/identity-kit`}
          className="block bg-white rounded-2xl shadow-sm border border-gold/20 overflow-hidden hover:shadow-md hover:border-gold/40 transition-all active:scale-[0.98]"
        >
          <div className="bg-gradient-to-r from-gold/10 to-champagne/30 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gold flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div>
                <p className="font-body text-sm font-semibold text-midnight">Identidade Visual com IA</p>
                <p className="font-body text-xs text-midnight/50">Paleta, tipografia e imagens geradas pela IA</p>
              </div>
            </div>
            <ArrowIcon className="w-5 h-5 text-gold flex-shrink-0" />
          </div>
          <div className="px-5 py-3 flex items-center gap-4 border-t border-gold/10">
            <span className="font-body text-xs text-midnight/50">Alimenta automaticamente →</span>
            <span className="px-2 py-0.5 rounded-full bg-midnight/8 text-midnight text-[10px] font-body font-medium">Convite digital</span>
            <span className="px-2 py-0.5 rounded-full bg-midnight/8 text-midnight text-[10px] font-body font-medium">Site</span>
          </div>
        </Link>

        {/* ── 2. Papelaria ──────────────────────────────────────────── */}
        <div>
          <p className="font-body text-[10px] font-medium tracking-[0.2em] uppercase text-gold mb-3 px-1">Papelaria</p>
          <div className="space-y-2">
            {identityItems.map((item) => (
              <div key={item.label}>
                {item.available ? (
                  <Link
                    href={`${base}/identity-kit`}
                    className="flex items-center gap-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md hover:border-midnight/20 transition-all active:scale-[0.98]"
                  >
                    <span className="text-2xl flex-shrink-0">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-sm font-medium text-midnight">{item.label}</p>
                      <p className="font-body text-xs text-gray-400">{item.desc}</p>
                    </div>
                    <ArrowIcon className="w-4 h-4 text-gray-300 flex-shrink-0" />
                  </Link>
                ) : (
                  <div className="flex items-center gap-4 bg-white/60 rounded-2xl border border-gray-100/50 p-4 opacity-60">
                    <span className="text-2xl flex-shrink-0 grayscale">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-sm font-medium text-midnight">{item.label}</p>
                      <p className="font-body text-xs text-gray-400">{item.desc}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <LockIcon className="w-3.5 h-3.5 text-gray-300" />
                      <span className="font-body text-[10px] text-gray-400">Em breve</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── 3. Site do Casamento ──────────────────────────────────── */}
        <div>
          <p className="font-body text-[10px] font-medium tracking-[0.2em] uppercase text-gold mb-3 px-1">Site do Casal</p>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-heading text-xl text-midnight">Site do Casamento</h2>
                  <p className="font-body text-xs text-gray-400 mt-0.5">Nível antoniaebruno.com — gerado pelo Laço</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-body font-semibold bg-amber-100 text-amber-700">Em breve</span>
              </div>
            </div>
            <div className="p-5 bg-gradient-to-b from-[#F5F0E8] to-[#EDE6DA]">
              <div className="bg-white/80 rounded-xl p-6 text-center border border-[#D4C5A9]/30">
                <p className="font-body text-[10px] text-[#B8860B] uppercase tracking-[0.3em] mb-3">08 de Agosto de 2026</p>
                <h3 className="font-heading text-2xl text-[#8B7355] mb-1" style={{ letterSpacing: "0.15em" }}>ANToNIA & BRUNO</h3>
                <div className="w-12 h-[1px] bg-[#D4C5A9] mx-auto my-3" />
                <p className="font-body text-xs text-[#A0936E]">Vale dos Desejos &middot; Areal, RJ</p>
                <div className="mt-4 inline-flex px-4 py-2 border border-[#B8860B]/30 rounded-lg">
                  <span className="font-body text-xs text-[#B8860B] uppercase tracking-wider">RSVP</span>
                </div>
              </div>
            </div>
            <div className="p-5 pt-3">
              <p className="font-body text-xs text-gray-400 mb-3">Seções incluídas:</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {siteFeatures.map((f) => (
                  <div key={f.label} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5">
                    <span className="text-base">{f.icon}</span>
                    <div>
                      <p className="font-body text-xs font-medium text-midnight">{f.label}</p>
                      <p className="font-body text-[10px] text-gray-400">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <BottomNav weddingId={weddingId} />
    </div>
  );
}
